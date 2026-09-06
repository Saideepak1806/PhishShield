import { parseAndNormalizeUrl } from '../src/engine/urlParser';
import { UrlFiniteAutomaton } from '../src/engine/automaton';
import { extractUrlFeatures } from '../src/engine/featureExtractor';
import { calculateRiskAndClassification } from '../src/engine/riskEngine';
import { Module1Result, Module2Result } from '../src/types';

export function testRiskScoring() {
  console.log('--- Running Risk Scoring Tests ---');

  const components = parseAndNormalizeUrl('http://192.0.2.10/login');
  const automaton = new UrlFiniteAutomaton();
  const autoRes = automaton.run(components);
  const features = extractUrlFeatures(components);

  const m1: Module1Result = {
    components,
    automaton: autoRes,
    features,
    status: autoRes.status,
  };

  const m2: Module2Result = {
    validation: {
      dnsResolved: true,
      ipAddress: '192.0.2.10',
      isPrivateIp: false,
      isHttps: false,
      tlsValid: false,
      redirectCount: 0,
      redirectChain: ['http://192.0.2.10/login'],
      fetchTimeMs: 120,
      accessible: true,
      content: {
        title: 'Login Page',
        metaDescription: '',
        hasForms: true,
        formCount: 1,
        hasPasswordFields: true,
        passwordFieldCount: 1,
        hasUsernameEmailFields: true,
        hasPaymentFields: false,
        hasOtpFields: false,
        iframeCount: 0,
        externalScriptCount: 0,
        totalLinksCount: 2,
        sameDomainLinksCount: 1,
        externalLinksCount: 1,
        externalLinkRatio: 0.5,
        detectedBrandKeywords: ['paypal'],
        mismatchedHyperlinks: [],
      },
    },
    brand: {
      detectedBrand: 'PayPal',
      officialDomains: ['paypal.com'],
      claimedHostname: '192.0.2.10',
      relationship: 'MISMATCH',
      confidence: 90,
      warning: 'Brand Mismatch: PayPal on IP 192.0.2.10',
    },
    status: 'SUSPICIOUS',
  };

  const m3 = calculateRiskAndClassification(m1, m2);

  console.assert(m3.riskScore >= 75, `Expected PHISHING score >= 75, got ${m3.riskScore}`);
  console.assert(m3.threatLevel === 'PHISHING', `Expected PHISHING, got ${m3.threatLevel}`);

  console.log('✓ Risk scoring test passed. Score:', m3.riskScore, 'Level:', m3.threatLevel);
}
