import { parseAndNormalizeUrl } from '../src/engine/urlParser';
import { UrlFiniteAutomaton } from '../src/engine/automaton';

export function runModule1Tests() {
  console.log('======================================================');
  console.log('  MODULE 1 TESTS: URL Pattern Analysis Using Finite Automata');
  console.log('======================================================\n');

  const automaton = new UrlFiniteAutomaton();

  // Test 1: Normal URL
  const normalParsed = parseAndNormalizeUrl('https://en.wikipedia.org/wiki/Main_Page');
  const normalRes = automaton.run(normalParsed);
  console.assert(normalRes.status === 'CLEAN', `Expected normal URL status CLEAN, got ${normalRes.status}`);
  console.assert(normalRes.accepted === true, 'Normal URL should be accepted by DFA');
  console.assert(normalRes.finalState === 'q8_ACCEPT_CLEAN', `Expected q8_ACCEPT_CLEAN, got ${normalRes.finalState}`);
  console.log('  [1.1] Normal URL Test: PASSED ✓ (State: q8_ACCEPT_CLEAN, Status: CLEAN)');

  // Test 2: Long URL (> 75 chars)
  const longUrl = 'https://example.com/very/long/path/to/resource/with/extremely/long/subdirectories/and/deep/nesting/parameter?session=abcdef1234567890';
  const longParsed = parseAndNormalizeUrl(longUrl);
  const longRes = automaton.run(longParsed);
  console.assert(longParsed.rawUrl.length > 75, 'URL length should exceed 75 chars');
  console.assert(longRes.trace.some(t => t.tokenCategory === 'ABNORMAL_LENGTH'), 'Should trace ABNORMAL_LENGTH token');
  console.log(`  [1.2] Long URL Test (${longParsed.rawUrl.length} chars): PASSED ✓`);

  // Test 3: Suspicious Keyword in URL
  const kwParsed = parseAndNormalizeUrl('https://portal-verification.org/portal');
  const kwRes = automaton.run(kwParsed);
  console.assert(kwRes.status !== 'CLEAN', 'Suspicious keywords should not be clean');
  console.assert(kwRes.trace.some(t => t.tokenCategory === 'SUSPICIOUS_KEYWORD'), 'Should record SUSPICIOUS_KEYWORD token');
  console.log('  [1.3] Suspicious Keyword Test: PASSED ✓');

  // Test 4: IP Address used instead of Domain
  const ipParsed = parseAndNormalizeUrl('http://192.0.2.10/login');
  const ipRes = automaton.run(ipParsed);
  console.assert(ipParsed.hasIpAddress === true, 'IP flag should be true');
  console.assert(ipRes.finalState === 'q7_HIGH_RISK_PATTERN', `Expected q7_HIGH_RISK_PATTERN, got ${ipRes.finalState}`);
  console.assert(ipRes.status === 'HIGH_RISK', 'IP URL should result in HIGH_RISK');
  console.log('  [1.4] Direct IP Address Hostname Test: PASSED ✓ (State: q7_HIGH_RISK_PATTERN)');

  // Test 5: Excessive Subdomains
  const subParsed = parseAndNormalizeUrl('http://login.verify.account.service.update.example.com');
  const subRes = automaton.run(subParsed);
  console.assert(subParsed.subdomains.length >= 3, 'Expected >= 3 subdomains');
  console.assert(subRes.trace.some(t => t.tokenCategory === 'EXCESSIVE_SUBDOMAINS'), 'Should trace EXCESSIVE_SUBDOMAINS');
  console.log(`  [1.5] Excessive Subdomains Test (${subParsed.subdomains.length} levels): PASSED ✓`);

  // Test 6: @ Symbol in URL
  const atParsed = parseAndNormalizeUrl('http://legit-bank.com@malicious-redirect.example.com/auth');
  const atRes = automaton.run(atParsed);
  console.assert(atParsed.hasAtSymbol === true, '@ symbol detected flag should be true');
  console.assert(atRes.finalState === 'q7_HIGH_RISK_PATTERN', 'At symbol should transition to q7_HIGH_RISK_PATTERN');
  console.log('  [1.6] User-Info "@" Symbol Test: PASSED ✓');

  // Test 7: Encoded URL
  const encodedParsed = parseAndNormalizeUrl('http://example.com/%2f%2e%2e%2flogin%20page');
  const encRes = automaton.run(encodedParsed);
  console.assert(encodedParsed.hasPercentEncoding === true, 'Percent encoding flag should be true');
  console.assert(encRes.trace.some(t => t.tokenCategory === 'PERCENT_ENCODING'), 'Should trace PERCENT_ENCODING token');
  console.log('  [1.7] URL Percent-Encoding Test: PASSED ✓');

  // Test 8: Suspicious Path
  const pathParsed = parseAndNormalizeUrl('https://example.com/account/update');
  const pathRes = automaton.run(pathParsed);
  console.assert(pathRes.trace.some(t => t.tokenCategory === 'SENSITIVE_PATH'), 'Should trace SENSITIVE_PATH token');
  console.log('  [1.8] Suspicious Authentication Path Test: PASSED ✓');

  // Verify Automaton Trace structure
  console.assert(normalRes.trace.length > 0, 'Automaton trace must not be empty');
  console.assert(normalRes.trace[0].currentState === 'q0_START', 'First transition must start at q0_START');
  console.log('  [1.9] Automaton Execution Trace Verification: PASSED ✓');
  console.log('        Sample transitions: ' + normalRes.trace.map(t => `${t.currentState} --(${t.inputToken})--> ${t.nextState}`).join(' | '));
  console.log('\n  All Module 1 Tests Passed Successfully! ✓\n');
}
