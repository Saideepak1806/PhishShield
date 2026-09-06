import { UrlComponents, UrlFeatures } from '../types';
import { SUSPICIOUS_KEYWORDS } from './automaton';

/**
 * Extracts measurable numerical and boolean features from a parsed URL.
 */
export function extractUrlFeatures(c: UrlComponents): UrlFeatures {
  const urlLength = c.rawUrl.length;
  const hostnameLength = c.hostname.length;
  const pathLength = c.path.length;
  const queryLength = c.query.length;
  const subdomainCount = c.subdomains.length;

  // Counts of specific characters
  const specialCharsRegex = /[-_.~!*'();:@&=+$,/?%#\[\]]/g;
  const specialCharacterCount = (c.rawUrl.match(specialCharsRegex) || []).length;
  const digitCount = (c.rawUrl.match(/[0-9]/g) || []).length;
  const hyphenCount = (c.rawUrl.match(/-/g) || []).length;
  const dotCount = (c.rawUrl.match(/\./g) || []).length;
  const slashCount = (c.rawUrl.match(/\//g) || []).length;

  const hasHttps = c.protocol === 'https';

  // Keyword extraction
  const lowerUrl = c.rawUrl.toLowerCase();
  const suspiciousKeywordMatches = SUSPICIOUS_KEYWORDS.filter(kw =>
    lowerUrl.includes(kw)
  );
  const suspiciousKeywordCount = suspiciousKeywordMatches.length;

  const pathDepth = c.pathSegments.length;
  const queryParameterCount = Object.keys(c.queryParams).length;

  return {
    urlLength,
    hostnameLength,
    pathLength,
    queryLength,
    subdomainCount,
    specialCharacterCount,
    digitCount,
    hyphenCount,
    dotCount,
    slashCount,
    hasIpAddress: c.hasIpAddress,
    hasHttps,
    hasAtSymbol: c.hasAtSymbol,
    hasPercentEncoding: c.hasPercentEncoding,
    hasPunycode: c.hasPunycode,
    suspiciousKeywordCount,
    suspiciousKeywordMatches,
    hasPort: c.hasPort,
    pathDepth,
    queryParameterCount,
  };
}
