import { BrandAnalysisResult } from '../types';

export interface BrandInfo {
  name: string;
  keywords: string[];
  officialDomains: string[];
}

export const BRAND_DICTIONARY: BrandInfo[] = [
  {
    name: 'PayPal',
    keywords: ['paypal', 'pay pal'],
    officialDomains: ['paypal.com', 'paypal.me', 'paypal-community.com'],
  },
  {
    name: 'Google',
    keywords: ['google', 'gmail', 'google account', 'google drive'],
    officialDomains: ['google.com', 'gmail.com', 'google.co.uk', 'youtube.com', 'gstatic.com'],
  },
  {
    name: 'Microsoft',
    keywords: ['microsoft', 'outlook', 'office365', 'office 365', 'onedrive', 'azure'],
    officialDomains: ['microsoft.com', 'outlook.com', 'office.com', 'live.com', 'azure.com'],
  },
  {
    name: 'Amazon',
    keywords: ['amazon', 'amazon prime', 'aws'],
    officialDomains: ['amazon.com', 'amazon.co.uk', 'aws.amazon.com', 'media-amazon.com'],
  },
  {
    name: 'Apple',
    keywords: ['apple', 'icloud', 'apple id'],
    officialDomains: ['apple.com', 'icloud.com'],
  },
  {
    name: 'Netflix',
    keywords: ['netflix'],
    officialDomains: ['netflix.com'],
  },
  {
    name: 'Facebook',
    keywords: ['facebook', 'meta'],
    officialDomains: ['facebook.com', 'meta.com', 'fb.com'],
  },
  {
    name: 'Instagram',
    keywords: ['instagram'],
    officialDomains: ['instagram.com'],
  },
  {
    name: 'Bank of America',
    keywords: ['bank of america', 'bofa'],
    officialDomains: ['bankofamerica.com', 'bofa.com'],
  },
  {
    name: 'Chase',
    keywords: ['chase', 'jpmorgan'],
    officialDomains: ['chase.com', 'jpmorganchase.com'],
  },
  {
    name: 'Coinbase',
    keywords: ['coinbase'],
    officialDomains: ['coinbase.com'],
  },
  {
    name: 'Binance',
    keywords: ['binance'],
    officialDomains: ['binance.com', 'binance.us'],
  },
  {
    name: 'Stripe',
    keywords: ['stripe'],
    officialDomains: ['stripe.com'],
  },
];

/**
 * Analyzes webpage title, metadata, and URL to detect brand claims and verify domain legitimacy.
 */
export function analyzeBrandDomainMatch(
  hostname: string,
  pageTitle: string,
  metaText: string,
  urlRaw: string
): BrandAnalysisResult {
  const cleanHost = hostname.toLowerCase();
  const fullText = `${pageTitle} ${metaText} ${urlRaw}`.toLowerCase();

  let matchedBrand: BrandInfo | null = null;

  for (const brand of BRAND_DICTIONARY) {
    const matched = brand.keywords.some(kw => fullText.includes(kw));
    if (matched) {
      matchedBrand = brand;
      break;
    }
  }

  if (!matchedBrand) {
    return {
      detectedBrand: null,
      officialDomains: [],
      claimedHostname: cleanHost,
      relationship: 'NOT_APPLICABLE',
      confidence: 0,
    };
  }

  // Check if current hostname ends with or equals any official domain
  const isOfficialDomain = matchedBrand.officialDomains.some(offDomain => {
    return cleanHost === offDomain || cleanHost.endsWith('.' + offDomain);
  });

  if (isOfficialDomain) {
    return {
      detectedBrand: matchedBrand.name,
      officialDomains: matchedBrand.officialDomains,
      claimedHostname: cleanHost,
      relationship: 'MATCH',
      confidence: 95,
    };
  } else {
    return {
      detectedBrand: matchedBrand.name,
      officialDomains: matchedBrand.officialDomains,
      claimedHostname: cleanHost,
      relationship: 'MISMATCH',
      confidence: 90,
      warning: `Page indicates brand '${matchedBrand.name}', but domain '${cleanHost}' is NOT an official domain (${matchedBrand.officialDomains.join(', ')})`,
    };
  }
}
