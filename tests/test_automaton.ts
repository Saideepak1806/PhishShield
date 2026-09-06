import { parseAndNormalizeUrl } from '../src/engine/urlParser';
import { UrlFiniteAutomaton } from '../src/engine/automaton';

export function testAutomaton() {
  console.log('--- Running Automaton Tests ---');

  const automaton = new UrlFiniteAutomaton();

  // Test 1: Normal clean URL
  const cleanUrl = parseAndNormalizeUrl('https://www.wikipedia.org');
  const cleanRes = automaton.run(cleanUrl);
  console.assert(cleanRes.status === 'CLEAN', `Expected CLEAN, got ${cleanRes.status}`);
  console.assert(cleanRes.accepted === true, 'Automaton should accept clean URL');
  console.log('✓ Clean URL automaton test passed.');

  // Test 2: IP host URL
  const ipUrl = parseAndNormalizeUrl('http://192.0.2.10/login');
  const ipRes = automaton.run(ipUrl);
  console.assert(ipRes.finalState === 'q7_HIGH_RISK_PATTERN', `Expected q7_HIGH_RISK_PATTERN, got ${ipRes.finalState}`);
  console.assert(ipRes.detectedPatterns.includes('IP Address used instead of Domain'), 'Expected IP pattern detected');
  console.log('✓ IP address automaton test passed.');

  // Test 3: @ Symbol URL
  const atUrl = parseAndNormalizeUrl('http://example.com@evil.example/login');
  const atRes = automaton.run(atUrl);
  console.assert(atRes.finalState === 'q7_HIGH_RISK_PATTERN', `Expected q7_HIGH_RISK_PATTERN, got ${atRes.finalState}`);
  console.log('✓ @ symbol automaton test passed.');

  console.log('--- Automaton Trace Example ---');
  console.table(ipRes.trace);
}
