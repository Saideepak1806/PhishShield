import { parseAndNormalizeUrl } from '../src/engine/urlParser';
import { extractUrlFeatures } from '../src/engine/featureExtractor';

export function testFeatureExtractor() {
  console.log('--- Running Feature Extractor Tests ---');

  const parsed = parseAndNormalizeUrl('http://paypal.security.update.account-verify.test/login');
  const features = extractUrlFeatures(parsed);

  console.assert(features.subdomainCount === 3, `Expected 3 subdomains, got ${features.subdomainCount}`);
  console.assert(features.suspiciousKeywordCount >= 3, `Expected at least 3 suspicious keywords, got ${features.suspiciousKeywordCount}`);
  console.assert(features.hasHttps === false, 'Expected HTTP (false)');

  console.log('✓ Feature extractor test passed.');
  console.log('Extracted features:', features);
}
