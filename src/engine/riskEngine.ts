import {
  Module1Result,
  Module2Result,
  Module3Result,
  RiskContribution,
  ThreatLevel,
} from '../types';

/**
 * Transparent Evidence-Based Risk Scoring Engine
 */
export function calculateRiskAndClassification(
  m1: Module1Result,
  m2: Module2Result
): Module3Result {
  const contributions: RiskContribution[] = [];
  const primaryReasons: string[] = [];
  const positiveFactors: string[] = [];

  let rawScore = 0;

  // ----------------------------------------------------
  // MODULE 1: URL Structural & Automaton Contributions
  // ----------------------------------------------------

  // 1. Automaton Status
  if (m1.automaton.finalState === 'q7_HIGH_RISK_PATTERN') {
    rawScore += 25;
    contributions.push({
      id: 'm1_automaton_high_risk',
      category: 'URL Pattern Automaton',
      indicator: 'High-Risk Automaton State (q7)',
      description: 'Automaton reached high-risk accepting state due to severe URL anomalies.',
      severity: 'CRITICAL',
      points: 25,
      module: 'MODULE_1',
    });
    primaryReasons.push('Automaton detected high-risk structural pattern');
  } else if (
    m1.automaton.finalState === 'q6_SUSPICIOUS_PATTERN' ||
    m1.automaton.finalState === 'q9_ACCEPT_SUSPICIOUS'
  ) {
    rawScore += 15;
    contributions.push({
      id: 'm1_automaton_suspicious',
      category: 'URL Pattern Automaton',
      indicator: 'Suspicious Automaton State',
      description: 'Automaton detected suspicious tokens in host or path.',
      severity: 'HIGH',
      points: 15,
      module: 'MODULE_1',
    });
    primaryReasons.push('Automaton identified suspicious lexical tokens');
  }

  // 2. IP Host
  if (m1.features.hasIpAddress) {
    rawScore += 25;
    contributions.push({
      id: 'm1_ip_hostname',
      category: 'URL Structure',
      indicator: 'Direct IP Address Hostname',
      description: 'URL uses raw IP address instead of registered domain name.',
      severity: 'CRITICAL',
      points: 25,
      module: 'MODULE_1',
    });
    primaryReasons.push('Direct IP address used as hostname');
  }

  // 3. User-Info At Symbol (@)
  if (cIsAtSymbol(m1)) {
    rawScore += 25;
    contributions.push({
      id: 'm1_at_symbol',
      category: 'URL Structure',
      indicator: '@ Symbol in URL',
      description: 'URL contains "@" symbol, often used to obscure real destination host.',
      severity: 'HIGH',
      points: 25,
      module: 'MODULE_1',
    });
    primaryReasons.push('@ symbol in URL structure');
  }

  // 4. Subdomains
  if (m1.features.subdomainCount > 2) {
    const pts = Math.min(15, (m1.features.subdomainCount - 2) * 5);
    rawScore += pts;
    contributions.push({
      id: 'm1_subdomains',
      category: 'Domain Structure',
      indicator: `Excessive Subdomains (${m1.features.subdomainCount})`,
      description: `Domain has ${m1.features.subdomainCount} subdomain levels, common in domain spoofing.`,
      severity: 'MEDIUM',
      points: pts,
      module: 'MODULE_1',
    });
    primaryReasons.push(`Excessive subdomain nesting (${m1.features.subdomainCount} levels)`);
  }

  // 5. Suspicious Keywords in URL
  if (m1.features.suspiciousKeywordCount > 0) {
    const pts = Math.min(20, m1.features.suspiciousKeywordCount * 5);
    rawScore += pts;
    contributions.push({
      id: 'm1_keywords',
      category: 'Lexical Features',
      indicator: `Suspicious Keywords (${m1.features.suspiciousKeywordMatches.join(', ')})`,
      description: `URL contains targeted authentication/security keywords.`,
      severity: 'MEDIUM',
      points: pts,
      module: 'MODULE_1',
    });
    primaryReasons.push(`Suspicious keywords present: ${m1.features.suspiciousKeywordMatches.slice(0, 3).join(', ')}`);
  }

  // 6. Punycode
  if (m1.features.hasPunycode) {
    rawScore += 15;
    contributions.push({
      id: 'm1_punycode',
      category: 'Domain Encoding',
      indicator: 'Punycode IDN Domain',
      description: 'Host uses Punycode encoding, potential internationalized homograph attack.',
      severity: 'HIGH',
      points: 15,
      module: 'MODULE_1',
    });
    primaryReasons.push('IDN Punycode encoding detected');
  }

  // ----------------------------------------------------
  // MODULE 2: Website & Domain Validation Contributions
  // ----------------------------------------------------

  const val = m2.validation;
  const brand = m2.brand;

  if (val.accessible) {
    // DNS & HTTPS Positive Factors
    if (val.dnsResolved) {
      rawScore -= 5;
      contributions.push({
        id: 'm2_dns_ok',
        category: 'Domain Validation',
        indicator: 'DNS Resolution Verified',
        description: 'Domain resolves to valid public IP address.',
        severity: 'INFO',
        points: -5,
        module: 'MODULE_2',
      });
      positiveFactors.push('DNS resolved successfully to valid IP');
    }

    if (val.isHttps && val.tlsValid) {
      rawScore -= 5;
      contributions.push({
        id: 'm2_https_ok',
        category: 'Security Transport',
        indicator: 'HTTPS/TLS Active',
        description: 'Connection uses encrypted HTTPS protocol.',
        severity: 'INFO',
        points: -5,
        module: 'MODULE_2',
      });
      positiveFactors.push('HTTPS encryption active and valid');
    } else if (!val.isHttps) {
      rawScore += 10;
      contributions.push({
        id: 'm2_http_unencrypted',
        category: 'Security Transport',
        indicator: 'Insecure HTTP Protocol',
        description: 'Website lacks SSL/TLS encryption.',
        severity: 'MEDIUM',
        points: 10,
        module: 'MODULE_2',
      });
      primaryReasons.push('Insecure unencrypted HTTP connection');
    }

    // Redirect Chain
    if (val.redirectCount > 1) {
      const pts = Math.min(15, val.redirectCount * 5);
      rawScore += pts;
      contributions.push({
        id: 'm2_redirects',
        category: 'Redirect Chain',
        indicator: `Multiple HTTP Redirects (${val.redirectCount})`,
        description: `Website redirected ${val.redirectCount} times before landing on destination.`,
        severity: 'MEDIUM',
        points: pts,
        module: 'MODULE_2',
      });
      primaryReasons.push(`Complex redirect chain (${val.redirectCount} redirects)`);
    }

    // HTML Content Analysis
    if (val.content) {
      const c = val.content;

      if (c.hasPasswordFields) {
        rawScore += 20;
        contributions.push({
          id: 'm2_password_form',
          category: 'Credential Inspection',
          indicator: `Password Collection Form (${c.passwordFieldCount} input fields)`,
          description: 'Webpage contains password input fields.',
          severity: 'HIGH',
          points: 20,
          module: 'MODULE_2',
        });
        primaryReasons.push('Credential/password collection forms detected on page');
      }

      if (c.hasPaymentFields || c.hasOtpFields) {
        rawScore += 15;
        contributions.push({
          id: 'm2_payment_otp',
          category: 'Sensitive Inputs',
          indicator: 'Financial/OTP Form Detected',
          description: 'Page requests credit card, CVV, or OTP verification code.',
          severity: 'HIGH',
          points: 15,
          module: 'MODULE_2',
        });
        primaryReasons.push('Payment or OTP input fields detected');
      }

      if (c.mismatchedHyperlinks.length > 0) {
        rawScore += 20;
        contributions.push({
          id: 'm2_mismatched_links',
          category: 'Content Integrity',
          indicator: `Deceptive Hyperlinks (${c.mismatchedHyperlinks.length} found)`,
          description: 'Visible link text displays a brand domain, but points to a different external URL.',
          severity: 'CRITICAL',
          points: 20,
          module: 'MODULE_2',
        });
        primaryReasons.push('Deceptive hyperlinks with mismatched anchor text');
      }

      if (c.externalLinkRatio > 0.6 && c.totalLinksCount > 3) {
        rawScore += 10;
        contributions.push({
          id: 'm2_external_links',
          category: 'Link Analysis',
          indicator: `High External Link Ratio (${Math.round(c.externalLinkRatio * 100)}%)`,
          description: 'Majority of links on the page point to external domains.',
          severity: 'LOW',
          points: 10,
          module: 'MODULE_2',
        });
      }
    }

    // Brand Domain Relationship
    if (brand.relationship === 'MATCH') {
      rawScore -= 10;
      contributions.push({
        id: 'm2_brand_match',
        category: 'Brand Verification',
        indicator: `Official ${brand.detectedBrand} Domain Verified`,
        description: `Domain belongs to verified official domains list for ${brand.detectedBrand}.`,
        severity: 'INFO',
        points: -10,
        module: 'MODULE_2',
      });
      positiveFactors.push(`Verified official domain for ${brand.detectedBrand}`);
    } else if (brand.relationship === 'MISMATCH') {
      rawScore += 30;
      contributions.push({
        id: 'm2_brand_mismatch',
        category: 'Brand Verification',
        indicator: `Brand Mismatch Warning (${brand.detectedBrand})`,
        description: brand.warning || `Page claims brand '${brand.detectedBrand}', but domain is NOT official.`,
        severity: 'CRITICAL',
        points: 30,
        module: 'MODULE_2',
      });
      primaryReasons.push(`Brand mismatch: Page presents ${brand.detectedBrand} branding on an unofficial domain`);
    }

  } else {
    // Inaccessible website handling
    contributions.push({
      id: 'm2_inaccessible',
      category: 'Website Reachability',
      indicator: 'Site Inaccessible or Blocked',
      description: val.error || 'Could not validate website content directly.',
      severity: 'MEDIUM',
      points: 10,
      module: 'MODULE_2',
    });
    primaryReasons.push('Website could not be safely reached for live content analysis');
  }

  // ----------------------------------------------------
  // Final Score Normalization & Classification
  // ----------------------------------------------------

  const finalRiskScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  let threatLevel: ThreatLevel = 'SAFE';

  if (finalRiskScore >= 75) {
    threatLevel = 'PHISHING';
  } else if (finalRiskScore >= 50) {
    threatLevel = 'HIGH_RISK';
  } else if (finalRiskScore >= 25) {
    threatLevel = 'SUSPICIOUS';
  } else {
    threatLevel = 'SAFE';
  }

  // Alert Messages & Summaries
  const alertMessage = generateAlertMessage(threatLevel, finalRiskScore, primaryReasons, val.accessible);

  return {
    riskScore: finalRiskScore,
    threatLevel,
    primaryReasons: primaryReasons.length > 0 ? primaryReasons : ['No suspicious indicators detected.'],
    positiveFactors: positiveFactors.length > 0 ? positiveFactors : ['Standard URL parameters'],
    contributions,
    alertMessage,
  };
}

function cIsAtSymbol(m1: Module1Result): boolean {
  return m1.components.hasAtSymbol;
}

function generateAlertMessage(
  level: ThreatLevel,
  score: number,
  reasons: string[],
  accessible: boolean
): { title: string; level: ThreatLevel; recommendation: string; summary: string } {
  switch (level) {
    case 'PHISHING':
      return {
        title: '🚨 PHISHING WEBSITE DETECTED',
        level,
        recommendation: `DO NOT:\n• Enter your password\n• Enter OTPs\n• Enter card/banking details\n• Upload personal documents\n• Make payments\n\nRecommended Action:\nClose the website and access the organization through its official website or trusted application.`,
        summary: `Multiple phishing indicators found. DO NOT ENTER PERSONAL INFORMATION (Risk Score: ${score}/100).`,
      };
    case 'HIGH_RISK':
      return {
        title: '🚨 HIGH RISK',
        level,
        recommendation: `Do not enter personal information. Do not enter passwords or OTPs. Avoid making payments. Verify the website through an official source before continuing.`,
        summary: `Multiple high-risk indicators detected (Risk Score: ${score}/100).`,
      };
    case 'SUSPICIOUS':
      return {
        title: '⚠️ SUSPICIOUS WEBSITE',
        level,
        recommendation: `Verify the website address before continuing. Do not enter passwords, OTPs, banking information, or other sensitive personal information unless you are certain the website is legitimate.`,
        summary: `Some suspicious indicators found (Risk Score: ${score}/100).`,
      };
    case 'SAFE':
    default:
      return {
        title: '✓ NO MAJOR THREATS FOUND',
        level,
        recommendation: `You may continue, but avoid entering sensitive information unless you trust the website.`,
        summary: accessible
          ? `No major phishing indicators detected (Risk Score: ${score}/100).`
          : `Website could not be validated. URL analysis from Module 1 is still available (Risk Score: ${score}/100).`,
      };
  }
}
