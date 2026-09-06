import * as cheerio from 'cheerio';
import { UrlComponents, DomainValidationResult, HtmlContentAnalysis } from '../types';
import { validateTargetIpAndHostname } from './ssrf';
import { analyzeBrandDomainMatch } from './brandAnalyzer';

const FETCH_TIMEOUT_MS = 5000;
const MAX_REDIRECTS = 5;
const MAX_BODY_BYTES = 1024 * 1024; // 1 MB limit

/**
 * Perform Module 2 Domain & Content Inspection with SSRF Guard
 */
export async function analyzeWebsiteAndDomain(
  components: UrlComponents,
  isDemo = false
): Promise<{
  validation: DomainValidationResult;
  brand: ReturnType<typeof analyzeBrandDomainMatch>;
  status: 'VALIDATED' | 'SUSPICIOUS' | 'UNAVAILABLE';
}> {
  const startTime = Date.now();
  const redirectChain: string[] = [components.normalizedUrl];
  let currentUrlStr = components.normalizedUrl;

  // Check if simulated academic demo fixture
  if (isDemo || components.hostname.endsWith('.test') || components.hostname.endsWith('.example')) {
    const isHttps = components.protocol === 'https';
    const brandResult = analyzeBrandDomainMatch(
      components.hostname,
      'Account Verification',
      'PayPal Secure Security Center',
      components.rawUrl
    );

    const validation: DomainValidationResult = {
      dnsResolved: true,
      ipAddress: '198.51.100.42',
      isPrivateIp: false,
      isHttps,
      tlsValid: isHttps,
      httpStatusCode: 200,
      redirectCount: 1,
      redirectChain: [components.normalizedUrl, `${components.protocol}://${components.hostname}/verify`],
      finalUrl: `${components.protocol}://${components.hostname}/verify`,
      fetchTimeMs: 78,
      accessible: true,
      content: {
        title: 'Account Verification',
        metaDescription: 'Please verify your credentials and security details.',
        hasForms: true,
        formCount: 1,
        hasPasswordFields: true,
        passwordFieldCount: 1,
        hasUsernameEmailFields: true,
        hasPaymentFields: true,
        hasOtpFields: true,
        iframeCount: 0,
        externalScriptCount: 1,
        totalLinksCount: 12,
        sameDomainLinksCount: 5,
        externalLinksCount: 7,
        externalLinkRatio: 0.58,
        detectedBrandKeywords: ['paypal'],
        mismatchedHyperlinks: [
          {
            visibleText: 'https://paypal.com',
            actualHref: 'http://example-security-login.test/phish',
            suspicious: true,
          },
        ],
      },
    };

    return {
      validation,
      brand: brandResult,
      status: 'SUSPICIOUS',
    };
  }

  // Initial SSRF Check
  const ssrfCheck = await validateTargetIpAndHostname(components.hostname);
  if (!ssrfCheck.safe) {
    const brandResult = analyzeBrandDomainMatch(components.hostname, '', '', components.rawUrl);
    return {
      validation: {
        dnsResolved: false,
        isPrivateIp: ssrfCheck.reason?.includes('Reserved/Private') || false,
        isHttps: components.protocol === 'https',
        tlsValid: false,
        redirectCount: 0,
        redirectChain,
        fetchTimeMs: Date.now() - startTime,
        error: ssrfCheck.reason || 'Blocked by SSRF Protection',
        accessible: false,
      },
      brand: brandResult,
      status: 'UNAVAILABLE',
    };
  }

  let finalUrlStr = currentUrlStr;
  let httpStatusCode: number | undefined;
  let htmlBody = '';
  let lastIp = ssrfCheck.ip;
  let isHttps = components.protocol === 'https';

  // Manual redirect follower with SSRF re-check
  try {
    let redirectsCount = 0;

    while (redirectsCount <= MAX_REDIRECTS) {
      const parsedCurr = new URL(currentUrlStr);
      isHttps = parsedCurr.protocol === 'https';

      // Verify SSRF on redirect step if host changed
      const hostCheck = await validateTargetIpAndHostname(parsedCurr.hostname);
      if (!hostCheck.safe) {
        throw new Error(`Redirect target blocked by SSRF: ${hostCheck.reason}`);
      }
      lastIp = hostCheck.ip;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const response = await fetch(currentUrlStr, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PhishShield-SecurityScanner/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
        redirect: 'manual', // Manual tracking
      });

      clearTimeout(timeoutId);
      httpStatusCode = response.status;

      // Handle redirect status codes
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) break;

        const nextUrl = new URL(location, currentUrlStr).toString();
        redirectsCount++;
        redirectChain.push(nextUrl);
        currentUrlStr = nextUrl;
        finalUrlStr = nextUrl;

        if (redirectsCount > MAX_REDIRECTS) {
          throw new Error(`Exceeded maximum redirects limit (${MAX_REDIRECTS})`);
        }
        continue;
      }

      // Read response body if HTML
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html') || contentType.includes('application/xhtml+xml') || contentType === '') {
        const buffer = await response.arrayBuffer();
        const slice = buffer.slice(0, MAX_BODY_BYTES);
        const decoder = new TextDecoder('utf-8');
        htmlBody = decoder.decode(slice);
      }

      break;
    }

    // Inspect Content if fetched
    let contentAnalysis: HtmlContentAnalysis | undefined;
    if (htmlBody) {
      contentAnalysis = inspectHtmlContent(htmlBody, new URL(finalUrlStr));
    }

    const title = contentAnalysis?.title || '';
    const metaDesc = contentAnalysis?.metaDescription || '';
    const brandResult = analyzeBrandDomainMatch(
      new URL(finalUrlStr).hostname,
      title,
      metaDesc,
      components.rawUrl
    );

    const validation: DomainValidationResult = {
      dnsResolved: true,
      ipAddress: lastIp,
      isPrivateIp: false,
      isHttps,
      tlsValid: isHttps,
      httpStatusCode,
      redirectCount: redirectChain.length - 1,
      redirectChain,
      finalUrl: finalUrlStr,
      fetchTimeMs: Date.now() - startTime,
      accessible: true,
      content: contentAnalysis,
    };

    const isSuspicious =
      (contentAnalysis && (contentAnalysis.hasPasswordFields || contentAnalysis.mismatchedHyperlinks.length > 0)) ||
      brandResult.relationship === 'MISMATCH' ||
      redirectChain.length > 2;

    return {
      validation,
      brand: brandResult,
      status: isSuspicious ? 'SUSPICIOUS' : 'VALIDATED',
    };

  } catch (err: any) {
    const brandResult = analyzeBrandDomainMatch(components.hostname, '', '', components.rawUrl);
    return {
      validation: {
        dnsResolved: !!lastIp,
        ipAddress: lastIp,
        isPrivateIp: false,
        isHttps,
        tlsValid: isHttps,
        redirectCount: redirectChain.length - 1,
        redirectChain,
        fetchTimeMs: Date.now() - startTime,
        error: err.message || 'Connection or timeout error while reaching site',
        accessible: false,
      },
      brand: brandResult,
      status: 'UNAVAILABLE',
    };
  }
}

/**
 * Static HTML Parsing using Cheerio
 */
function inspectHtmlContent(html: string, currentUrl: URL): HtmlContentAnalysis {
  const $ = cheerio.load(html);

  const title = $('title').text().trim() || $('h1').first().text().trim() || '';
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    '';

  const forms = $('form');
  const formCount = forms.length;
  const hasForms = formCount > 0;

  // Check inputs inside forms or page
  const inputs = $('input');
  let hasPasswordFields = false;
  let passwordFieldCount = 0;
  let hasUsernameEmailFields = false;
  let hasPaymentFields = false;
  let hasOtpFields = false;

  inputs.each((_, elem) => {
    const type = ($(elem).attr('type') || '').toLowerCase();
    const name = ($(elem).attr('name') || '').toLowerCase();
    const id = ($(elem).attr('id') || '').toLowerCase();
    const placeholder = ($(elem).attr('placeholder') || '').toLowerCase();
    const combined = `${type} ${name} ${id} ${placeholder}`;

    if (type === 'password' || name.includes('pass') || name.includes('pwd')) {
      hasPasswordFields = true;
      passwordFieldCount++;
    }

    if (
      type === 'email' ||
      combined.includes('user') ||
      combined.includes('email') ||
      combined.includes('login')
    ) {
      hasUsernameEmailFields = true;
    }

    if (
      combined.includes('card') ||
      combined.includes('cvv') ||
      combined.includes('exp') ||
      combined.includes('payment')
    ) {
      hasPaymentFields = true;
    }

    if (
      combined.includes('otp') ||
      combined.includes('pin') ||
      combined.includes('2fa') ||
      combined.includes('code')
    ) {
      hasOtpFields = true;
    }
  });

  const iframeCount = $('iframe').length;
  const externalScriptCount = $('script[src]').filter((_, elem) => {
    const src = $(elem).attr('src') || '';
    return src.startsWith('http://') || src.startsWith('https://');
  }).length;

  // Link Analysis
  const pageHost = currentUrl.hostname.toLowerCase();
  let totalLinksCount = 0;
  let sameDomainLinksCount = 0;
  let externalLinksCount = 0;
  const mismatchedHyperlinks: Array<{
    visibleText: string;
    actualHref: string;
    suspicious: boolean;
  }> = [];

  $('a[href]').each((_, elem) => {
    const href = $(elem).attr('href')?.trim() || '';
    const visibleText = $(elem).text().trim();

    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

    totalLinksCount++;
    try {
      const linkUrl = new URL(href, currentUrl.origin);
      const linkHost = linkUrl.hostname.toLowerCase();

      if (linkHost === pageHost || linkHost.endsWith('.' + pageHost)) {
        sameDomainLinksCount++;
      } else {
        externalLinksCount++;

        // Detect misleading hyperlink text (e.g. text says paypal.com, href points to evil.com)
        const textLooksLikeDomain = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(visibleText);
        if (textLooksLikeDomain && !visibleText.toLowerCase().includes(linkHost)) {
          mismatchedHyperlinks.push({
            visibleText,
            actualHref: href,
            suspicious: true,
          });
        }
      }
    } catch (e) {
      // Ignore invalid hrefs
    }
  });

  const externalLinkRatio =
    totalLinksCount > 0 ? Number((externalLinksCount / totalLinksCount).toFixed(2)) : 0;

  // Detect brand keywords in title/content
  const detectedBrandKeywords: string[] = [];
  const bodyText = $('body').text().toLowerCase();
  ['paypal', 'google', 'microsoft', 'amazon', 'apple', 'netflix', 'chase', 'bank'].forEach(kw => {
    if (title.toLowerCase().includes(kw) || bodyText.includes(kw)) {
      detectedBrandKeywords.push(kw);
    }
  });

  return {
    title,
    metaDescription,
    hasForms,
    formCount,
    hasPasswordFields,
    passwordFieldCount,
    hasUsernameEmailFields,
    hasPaymentFields,
    hasOtpFields,
    iframeCount,
    externalScriptCount,
    totalLinksCount,
    sameDomainLinksCount,
    externalLinksCount,
    externalLinkRatio,
    detectedBrandKeywords,
    mismatchedHyperlinks,
  };
}
