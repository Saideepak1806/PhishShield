/**
 * PhishShield Core Type Definitions
 */

export type ThreatLevel = 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK' | 'PHISHING' | 'UNAVAILABLE';

export interface UrlComponents {
  rawUrl: string;
  normalizedUrl: string;
  protocol: string;
  hostname: string;
  port: string;
  subdomains: string[];
  mainDomain: string;
  tld: string;
  path: string;
  pathSegments: string[];
  query: string;
  queryParams: Record<string, string>;
  fragment: string;
  hasIpAddress: boolean;
  hasAtSymbol: boolean;
  hasPercentEncoding: boolean;
  hasPunycode: boolean;
  hasPort: boolean;
}

export type AutomatonState = 
  | 'q0_START'
  | 'q1_PROTOCOL'
  | 'q2_HOSTNAME'
  | 'q3_SUBDOMAIN_EVAL'
  | 'q4_KEYWORD_EVAL'
  | 'q5_PATH_EVAL'
  | 'q6_SUSPICIOUS_PATTERN'
  | 'q7_HIGH_RISK_PATTERN'
  | 'q8_ACCEPT_CLEAN'
  | 'q9_ACCEPT_SUSPICIOUS';

export interface AutomatonTransition {
  step: number;
  currentState: AutomatonState;
  inputToken: string;
  tokenCategory: string;
  nextState: AutomatonState;
  reason: string;
}

export interface AutomatonResult {
  accepted: boolean;
  finalState: AutomatonState;
  status: 'CLEAN' | 'SUSPICIOUS' | 'HIGH_RISK';
  detectedPatterns: string[];
  trace: AutomatonTransition[];
  statesVisited: AutomatonState[];
}

export interface UrlFeatures {
  urlLength: number;
  hostnameLength: number;
  pathLength: number;
  queryLength: number;
  subdomainCount: number;
  specialCharacterCount: number;
  digitCount: number;
  hyphenCount: number;
  dotCount: number;
  slashCount: number;
  hasIpAddress: boolean;
  hasHttps: boolean;
  hasAtSymbol: boolean;
  hasPercentEncoding: boolean;
  hasPunycode: boolean;
  suspiciousKeywordCount: number;
  suspiciousKeywordMatches: string[];
  hasPort: boolean;
  pathDepth: number;
  queryParameterCount: number;
}

export interface Module1Result {
  components: UrlComponents;
  automaton: AutomatonResult;
  features: UrlFeatures;
  status: 'CLEAN' | 'SUSPICIOUS' | 'HIGH_RISK';
}

export interface HtmlContentAnalysis {
  title: string;
  metaDescription: string;
  hasForms: boolean;
  formCount: number;
  hasPasswordFields: boolean;
  passwordFieldCount: number;
  hasUsernameEmailFields: boolean;
  hasPaymentFields: boolean;
  hasOtpFields: boolean;
  iframeCount: number;
  externalScriptCount: number;
  totalLinksCount: number;
  sameDomainLinksCount: number;
  externalLinksCount: number;
  externalLinkRatio: number;
  detectedBrandKeywords: string[];
  mismatchedHyperlinks: Array<{
    visibleText: string;
    actualHref: string;
    suspicious: boolean;
  }>;
}

export interface DomainValidationResult {
  dnsResolved: boolean;
  ipAddress?: string;
  isPrivateIp: boolean;
  isHttps: boolean;
  tlsValid: boolean;
  httpStatusCode?: number;
  redirectCount: number;
  redirectChain: string[];
  finalUrl?: string;
  fetchTimeMs: number;
  error?: string;
  accessible: boolean;
  content?: HtmlContentAnalysis;
}

export interface BrandAnalysisResult {
  detectedBrand: string | null;
  officialDomains: string[];
  claimedHostname: string;
  relationship: 'MATCH' | 'MISMATCH' | 'UNKNOWN' | 'NOT_APPLICABLE';
  confidence: number;
  warning?: string;
}

export interface Module2Result {
  validation: DomainValidationResult;
  brand: BrandAnalysisResult;
  status: 'VALIDATED' | 'SUSPICIOUS' | 'UNAVAILABLE';
}

export interface RiskContribution {
  id: string;
  category: string;
  indicator: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'INFO';
  points: number; // positive adds risk, negative reduces risk
  module: 'MODULE_1' | 'MODULE_2' | 'MODULE_3';
}

export interface Module3Result {
  riskScore: number; // 0 to 100
  threatLevel: ThreatLevel;
  primaryReasons: string[];
  positiveFactors: string[];
  contributions: RiskContribution[];
  alertMessage: {
    title: string;
    level: ThreatLevel;
    recommendation: string;
    summary: string;
  };
}

export interface ScanResult {
  id: string;
  timestamp: string;
  rawUrl: string;
  normalizedUrl: string;
  finalUrl: string;
  riskScore: number;
  threatLevel: ThreatLevel;
  isDemo: boolean;
  module1: Module1Result;
  module2: Module2Result;
  module3: Module3Result;
  summaryReason: string;
}

export interface DashboardStats {
  totalScans: number;
  threatDistribution: {
    SAFE: number;
    SUSPICIOUS: number;
    HIGH_RISK: number;
    PHISHING: number;
    UNAVAILABLE: number;
  };
  averageRiskScore: number;
  topIndicators: Array<{ name: string; count: number }>;
  moduleThreatCounts: {
    module1Flags: number;
    module2Flags: number;
  };
  recentScans: Array<{
    id: string;
    timestamp: string;
    rawUrl: string;
    riskScore: number;
    threatLevel: ThreatLevel;
    keyFinding: string;
  }>;
}
