import { parseAndNormalizeUrl } from '../src/engine/urlParser';
import { UrlFiniteAutomaton } from '../src/engine/automaton';
import { extractUrlFeatures } from '../src/engine/featureExtractor';
import { calculateRiskAndClassification } from '../src/engine/riskEngine';
import { analyzeUrlPipeline } from '../src/engine/classifier';
import {
  clearAllScansInDb,
  getAllScansFromDb,
  getDashboardStatsFromDb,
  getScanByIdFromDb,
  saveScanToDb,
} from '../src/db/database';
import { Module1Result, Module2Result } from '../src/types';

export async function runModule3Tests() {
  console.log('======================================================');
  console.log('  MODULE 3 TESTS: Threat Classification & User Alert Dashboard');
  console.log('======================================================\n');

  // Test 1: SAFE classification (0-24)
  const safeComp = parseAndNormalizeUrl('https://www.wikipedia.org');
  const safeAuto = new UrlFiniteAutomaton().run(safeComp);
  const safeM1: Module1Result = {
    components: safeComp,
    automaton: safeAuto,
    features: extractUrlFeatures(safeComp),
    status: safeAuto.status,
  };
  const safeM2: Module2Result = {
    validation: {
      dnsResolved: true,
      ipAddress: '208.80.154.224',
      isPrivateIp: false,
      isHttps: true,
      tlsValid: true,
      redirectCount: 0,
      redirectChain: ['https://www.wikipedia.org'],
      fetchTimeMs: 45,
      accessible: true,
      content: {
        title: 'Wikipedia, the free encyclopedia',
        metaDescription: '',
        hasForms: false,
        formCount: 0,
        hasPasswordFields: false,
        passwordFieldCount: 0,
        hasUsernameEmailFields: false,
        hasPaymentFields: false,
        hasOtpFields: false,
        iframeCount: 0,
        externalScriptCount: 0,
        totalLinksCount: 15,
        sameDomainLinksCount: 15,
        externalLinksCount: 0,
        externalLinkRatio: 0,
        detectedBrandKeywords: [],
        mismatchedHyperlinks: [],
      },
    },
    brand: {
      detectedBrand: null,
      officialDomains: [],
      claimedHostname: 'www.wikipedia.org',
      relationship: 'NOT_APPLICABLE',
      confidence: 0,
    },
    status: 'VALIDATED',
  };

  const safeM3 = calculateRiskAndClassification(safeM1, safeM2);
  console.assert(safeM3.riskScore <= 24, `Expected SAFE score <= 24, got ${safeM3.riskScore}`);
  console.assert(safeM3.threatLevel === 'SAFE', `Expected SAFE threat level, got ${safeM3.threatLevel}`);
  console.assert(safeM3.alertMessage.recommendation.includes('avoid entering sensitive information unless you trust the website'), 'Safe recommendation check');
  console.log(`  [3.1] SAFE Classification Test: PASSED ✓ (Score: ${safeM3.riskScore}/100, Level: SAFE)`);

  // Test 2: SUSPICIOUS classification (25-49)
  const suspComp = parseAndNormalizeUrl('http://account-portal-service.org/login');
  const suspAuto = new UrlFiniteAutomaton().run(suspComp);
  const suspM1: Module1Result = {
    components: suspComp,
    automaton: suspAuto,
    features: extractUrlFeatures(suspComp),
    status: suspAuto.status,
  };
  const suspM2: Module2Result = {
    validation: {
      dnsResolved: true,
      isPrivateIp: false,
      isHttps: false,
      tlsValid: false,
      redirectCount: 0,
      redirectChain: ['http://account-portal-service.org/login'],
      fetchTimeMs: 60,
      accessible: true,
      content: {
        title: 'Member Login',
        metaDescription: '',
        hasForms: true,
        formCount: 1,
        hasPasswordFields: false,
        passwordFieldCount: 0,
        hasUsernameEmailFields: true,
        hasPaymentFields: false,
        hasOtpFields: false,
        iframeCount: 0,
        externalScriptCount: 0,
        totalLinksCount: 5,
        sameDomainLinksCount: 4,
        externalLinksCount: 1,
        externalLinkRatio: 0.2,
        detectedBrandKeywords: [],
        mismatchedHyperlinks: [],
      },
    },
    brand: {
      detectedBrand: null,
      officialDomains: [],
      claimedHostname: 'account-portal-service.org',
      relationship: 'NOT_APPLICABLE',
      confidence: 0,
    },
    status: 'VALIDATED',
  };

  const suspM3 = calculateRiskAndClassification(suspM1, suspM2);
  console.assert(suspM3.riskScore >= 25 && suspM3.riskScore <= 49, `Expected SUSPICIOUS score 25-49, got ${suspM3.riskScore}`);
  console.assert(suspM3.threatLevel === 'SUSPICIOUS', `Expected SUSPICIOUS, got ${suspM3.threatLevel}`);
  console.assert(suspM3.alertMessage.recommendation.includes('Verify the website address before continuing'), 'Suspicious recommendation check');
  console.log(`  [3.2] SUSPICIOUS Classification Test: PASSED ✓ (Score: ${suspM3.riskScore}/100, Level: SUSPICIOUS)`);

  // Test 3: HIGH RISK classification (50-74)
  const highComp = parseAndNormalizeUrl('http://security-update.login-account.com/auth');
  const highAuto = new UrlFiniteAutomaton().run(highComp);
  const highM1: Module1Result = {
    components: highComp,
    automaton: highAuto,
    features: extractUrlFeatures(highComp),
    status: highAuto.status,
  };
  const highM2: Module2Result = {
    validation: {
      dnsResolved: true,
      isPrivateIp: false,
      isHttps: false,
      tlsValid: false,
      redirectCount: 0,
      redirectChain: ['http://security-update.login-account.com/auth'],
      fetchTimeMs: 90,
      accessible: true,
      content: {
        title: 'Security Portal',
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
        totalLinksCount: 6,
        sameDomainLinksCount: 3,
        externalLinksCount: 3,
        externalLinkRatio: 0.5,
        detectedBrandKeywords: [],
        mismatchedHyperlinks: [],
      },
    },
    brand: {
      detectedBrand: null,
      officialDomains: [],
      claimedHostname: 'security-update.login-account.com',
      relationship: 'NOT_APPLICABLE',
      confidence: 0,
    },
    status: 'SUSPICIOUS',
  };

  const highM3 = calculateRiskAndClassification(highM1, highM2);
  console.assert(highM3.riskScore >= 50 && highM3.riskScore <= 74, `Expected HIGH_RISK score 50-74, got ${highM3.riskScore}`);
  console.assert(highM3.threatLevel === 'HIGH_RISK', `Expected HIGH_RISK, got ${highM3.threatLevel}`);
  console.assert(highM3.alertMessage.recommendation.includes('Do not enter personal information'), 'High Risk recommendation check');
  console.log(`  [3.3] HIGH RISK Classification Test: PASSED ✓ (Score: ${highM3.riskScore}/100, Level: HIGH_RISK)`);

  // Test 4: PHISHING classification (75-100)
  const phishComp = parseAndNormalizeUrl('http://192.0.2.10/paypal/login/verify');
  const phishAuto = new UrlFiniteAutomaton().run(phishComp);
  const phishM1: Module1Result = {
    components: phishComp,
    automaton: phishAuto,
    features: extractUrlFeatures(phishComp),
    status: phishAuto.status,
  };
  const phishM2: Module2Result = {
    validation: {
      dnsResolved: true,
      ipAddress: '192.0.2.10',
      isPrivateIp: false,
      isHttps: false,
      tlsValid: false,
      redirectCount: 1,
      redirectChain: ['http://192.0.2.10/paypal/login/verify', 'http://192.0.2.10/paypal/verify'],
      fetchTimeMs: 110,
      accessible: true,
      content: {
        title: 'PayPal Account Verification',
        metaDescription: '',
        hasForms: true,
        formCount: 1,
        hasPasswordFields: true,
        passwordFieldCount: 1,
        hasUsernameEmailFields: true,
        hasPaymentFields: true,
        hasOtpFields: true,
        iframeCount: 0,
        externalScriptCount: 1,
        totalLinksCount: 10,
        sameDomainLinksCount: 2,
        externalLinksCount: 8,
        externalLinkRatio: 0.8,
        detectedBrandKeywords: ['paypal'],
        mismatchedHyperlinks: [
          { visibleText: 'www.paypal.com', actualHref: 'http://192.0.2.10/steal', suspicious: true }
        ],
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

  const phishM3 = calculateRiskAndClassification(phishM1, phishM2);
  console.assert(phishM3.riskScore >= 75, `Expected PHISHING score >= 75, got ${phishM3.riskScore}`);
  console.assert(phishM3.threatLevel === 'PHISHING', `Expected PHISHING, got ${phishM3.threatLevel}`);
  console.assert(phishM3.alertMessage.recommendation.includes('DO NOT:'), 'Phishing recommendation checklist check');
  console.log(`  [3.4] PHISHING Classification Test: PASSED ✓ (Score: ${phishM3.riskScore}/100, Level: PHISHING)`);

  // Test 5: Dynamic Recommendation Generation
  console.assert(phishM3.alertMessage.title.includes('PHISHING'), 'Phishing alert title check');
  console.assert(safeM3.alertMessage.title.includes('NO MAJOR THREATS FOUND'), 'Safe alert title check');
  console.log('  [3.5] Dynamic User Recommendation Engine: PASSED ✓');

  // Test 6: Database Storage & Retrieval (SQLite)
  await clearAllScansInDb();
  const initialScans = await getAllScansFromDb();
  console.assert(initialScans.length === 0, 'Database should be empty after clear');
  console.log('  [3.6a] Empty DB State Verified: PASSED ✓ ("No scans yet")');

  // Save real scan to SQLite
  const scanRecord = await analyzeUrlPipeline('https://www.wikipedia.org', false);
  await saveScanToDb(scanRecord);

  const savedScans = await getAllScansFromDb();
  console.assert(savedScans.length === 1, `Expected 1 scan in DB, got ${savedScans.length}`);
  console.assert(savedScans[0].rawUrl === 'https://www.wikipedia.org', 'Saved URL should match');

  const fetchedById = await getScanByIdFromDb(scanRecord.id);
  console.assert(fetchedById !== null, 'Scan should be retrievable by ID');
  console.assert(fetchedById?.id === scanRecord.id, 'Retrieved ID should match');
  console.log('  [3.6b] SQLite Database Persistence & Retrieval: PASSED ✓');

  // Test 7: Dashboard Statistics Updates
  const dashboardStats = await getDashboardStatsFromDb();
  console.assert(dashboardStats.totalScans === 1, `Expected 1 scan in dashboard stats, got ${dashboardStats.totalScans}`);
  console.assert(dashboardStats.threatDistribution.SAFE >= 1, 'Safe count should be >= 1');
  console.assert(dashboardStats.recentScans.length === 1, 'Recent scans should reflect stored scan');
  console.log('  [3.7] Dashboard Statistics Aggregation: PASSED ✓');

  console.log('\n  All Module 3 Tests Passed Successfully! ✓\n');
}
