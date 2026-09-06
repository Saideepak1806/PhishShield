import { UrlComponents } from '../types';

/**
 * Normalizes and extracts detailed components from a raw URL.
 */
export function parseAndNormalizeUrl(rawInput: string): UrlComponents {
  let input = rawInput.trim();
  
  // Add scheme if missing default to http or https
  if (!/^https?:\/\//i.test(input)) {
    input = 'http://' + input;
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch (err) {
    // Attempt fallback parsing if URL constructor throws
    const match = input.match(/^(https?:\/\/)?([^/?:#]+)(:[0-9]+)?([^?#]*)?(\?[^#]*)?(#.*)?$/i);
    if (!match) {
      throw new Error(`Invalid URL format: ${rawInput}`);
    }
    const host = match[2] || 'invalid';
    parsed = new URL(`http://${host}`);
  }

  const protocol = parsed.protocol.replace(':', '').toLowerCase();
  const hostname = parsed.hostname.toLowerCase();
  const port = parsed.port;
  const path = parsed.pathname || '/';
  const query = parsed.search || '';
  const fragment = parsed.hash || '';

  // Extract path segments
  const pathSegments = path.split('/').filter(Boolean);

  // Extract query parameters
  const queryParams: Record<string, string> = {};
  parsed.searchParams.forEach((val, key) => {
    queryParams[key] = val;
  });

  // Check hostname characteristics
  const isIpV4 = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
  const isIpV6 = /^\[?[0-9a-fA-F:]+\]?$/.test(hostname) && hostname.includes(':');
  const hasIpAddress = isIpV4 || isIpV6;

  // Split hostname into subdomains, main domain, TLD
  let subdomains: string[] = [];
  let mainDomain = hostname;
  let tld = '';

  if (!hasIpAddress) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      tld = parts[parts.length - 1];
      mainDomain = parts[parts.length - 2] + '.' + tld;
      subdomains = parts.slice(0, parts.length - 2);
    } else if (parts.length === 1) {
      mainDomain = parts[0];
    }
  }

  const hasAtSymbol = rawInput.includes('@');
  const hasPercentEncoding = /%[0-9a-fA-F]{2}/.test(rawInput);
  const hasPunycode = hostname.includes('xn--');
  const hasPort = port.length > 0;

  // Normalized URL
  const normalizedUrl = `${protocol}://${hostname}${hasPort ? ':' + port : ''}${path}${query}${fragment}`;

  return {
    rawUrl: rawInput,
    normalizedUrl,
    protocol,
    hostname,
    port,
    subdomains,
    mainDomain,
    tld,
    path,
    pathSegments,
    query,
    queryParams,
    fragment,
    hasIpAddress,
    hasAtSymbol,
    hasPercentEncoding,
    hasPunycode,
    hasPort,
  };
}
