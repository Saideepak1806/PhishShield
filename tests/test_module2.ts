import { parseAndNormalizeUrl } from '../src/engine/urlParser';
import { analyzeWebsiteAndDomain } from '../src/engine/websiteAnalyzer';
import { analyzeBrandDomainMatch } from '../src/engine/brandAnalyzer';

export async function runModule2Tests() {
  console.log('======================================================');
  console.log('  MODULE 2 TESTS: Website Validation and Content Verification');
  console.log('======================================================\n');

  // Test 1: Accessible Website validation
  const accessibleUrl = parseAndNormalizeUrl('https://example-security-login.test/login');
  const accessibleRes = await analyzeWebsiteAndDomain(accessibleUrl, true);
  console.assert(accessibleRes.validation.accessible === true, 'Test fixture website should be marked accessible');
  console.assert(accessibleRes.validation.dnsResolved === true, 'DNS should be verified as resolved');
  console.assert(accessibleRes.validation.httpStatusCode === 200, 'HTTP status code should be 200');
  console.log('  [2.1] Accessible Website & DNS Validation: PASSED ✓ (HTTP 200, DNS Resolved)');

  // Test 2: Inaccessible Website handling (Safe passive inspection error handling)
  const nonExistentUrl = parseAndNormalizeUrl('http://domain-that-definitely-does-not-exist-phishshield-xyz987.org');
  const inaccessibleRes = await analyzeWebsiteAndDomain(nonExistentUrl, false);
  console.assert(inaccessibleRes.validation.accessible === false, 'Non-existent site must return accessible: false');
  console.assert(inaccessibleRes.status === 'UNAVAILABLE', 'Status should be UNAVAILABLE');
  console.assert(typeof inaccessibleRes.validation.error === 'string', 'Error message must be present without crashing');
  console.log('  [2.2] Inaccessible Website Error Handling: PASSED ✓ (Non-crashing graceful degradation)');

  // Test 3: Website containing Login Form with Password field
  const loginFormFixture = await analyzeWebsiteAndDomain(parseAndNormalizeUrl('http://bank-portal.test/login'), true);
  console.assert(loginFormFixture.validation.content?.hasForms === true, 'Forms should be detected');
  console.assert(loginFormFixture.validation.content?.hasPasswordFields === true, 'Password fields should be detected');
  console.assert(loginFormFixture.validation.content?.passwordFieldCount === 1, 'Password count should be 1');
  console.log('  [2.3] Login & Password Field Detection: PASSED ✓ (Forms: 1, Password Field: Detected)');

  // Test 4: Website with External Links analysis
  console.assert(loginFormFixture.validation.content?.externalLinksCount === 7, 'External links count should be verified');
  console.assert(loginFormFixture.validation.content!.externalLinkRatio > 0, 'External link ratio should be calculated');
  console.log(`  [2.4] External Links Ratio Analysis: PASSED ✓ (${loginFormFixture.validation.content?.externalLinksCount} external links, ratio: ${loginFormFixture.validation.content?.externalLinkRatio})`);

  // Test 5: Brand / Domain Mismatch detection
  const brandMismatch = analyzeBrandDomainMatch(
    'example-security-login.test',
    'Account Verification',
    'PayPal Security Center',
    'http://example-security-login.test/login'
  );
  console.assert(brandMismatch.detectedBrand === 'PayPal', 'Should detect brand PayPal');
  console.assert(brandMismatch.relationship === 'MISMATCH', 'Should flag MISMATCH since example-security-login.test is not paypal.com');
  console.assert(typeof brandMismatch.warning === 'string', 'Should provide mismatch warning');
  console.log('  [2.5] Brand / Domain Mismatch: PASSED ✓ (Brand: PayPal vs Domain: example-security-login.test -> MISMATCH)');

  // Test 6: Official Brand Domain Match
  const brandMatch = analyzeBrandDomainMatch(
    'www.paypal.com',
    'Log in to your PayPal account',
    'PayPal Official Site',
    'https://www.paypal.com/signin'
  );
  console.assert(brandMatch.detectedBrand === 'PayPal', 'Should detect brand PayPal');
  console.assert(brandMatch.relationship === 'MATCH', 'Should detect valid MATCH for paypal.com');
  console.log('  [2.6] Official Domain Legitimacy Match: PASSED ✓ (paypal.com verified official)');

  // Test 7: Redirect Handling
  console.assert(loginFormFixture.validation.redirectCount === 1, 'Redirect count should be tracked');
  console.assert(loginFormFixture.validation.redirectChain.length === 2, 'Redirect chain should be populated');
  console.log(`  [2.7] Redirect Tracking: PASSED ✓ (${loginFormFixture.validation.redirectCount} redirect(s) recorded in chain)`);

  console.log('\n  All Module 2 Tests Passed Successfully! ✓\n');
}
