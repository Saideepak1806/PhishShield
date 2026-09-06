import { AutomatonResult, AutomatonState, AutomatonTransition, UrlComponents } from '../types';

export const SUSPICIOUS_KEYWORDS = [
  'login', 'signin', 'verify', 'verification', 'secure', 'account',
  'update', 'confirm', 'password', 'credential', 'wallet', 'bank',
  'payment', 'billing', 'authentication', 'unlock', 'suspended',
  'support', 'security', 'service', 'admin', 'portal', 'validation'
];

export const SENSITIVE_PATHS = [
  '/login', '/signin', '/verify', '/auth', '/admin', '/wp-admin',
  '/account/update', '/security', '/bank', '/checkout', '/pay'
];

export interface InputToken {
  category: string;
  value: string;
  description: string;
}

/**
 * Deterministic Finite Automaton (DFA) for Structural URL Pattern Recognition
 * States Q = { q0..q9 }
 * Initial state q0
 * Accepting clean states F_clean = { q8_ACCEPT_CLEAN }
 * Accepting suspicious states F_suspicious = { q6_SUSPICIOUS_PATTERN, q7_HIGH_RISK_PATTERN, q9_ACCEPT_SUSPICIOUS }
 */
export class UrlFiniteAutomaton {
  private currentState: AutomatonState = 'q0_START';
  private trace: AutomatonTransition[] = [];
  private detectedPatterns: Set<string> = new Set();
  private stepCounter = 1;

  private recordTransition(
    token: InputToken,
    nextState: AutomatonState,
    reason: string
  ) {
    this.trace.push({
      step: this.stepCounter++,
      currentState: this.currentState,
      inputToken: token.value,
      tokenCategory: token.category,
      nextState,
      reason,
    });
    this.currentState = nextState;
  }

  public run(components: UrlComponents): AutomatonResult {
    this.currentState = 'q0_START';
    this.trace = [];
    this.detectedPatterns.clear();
    this.stepCounter = 1;

    // Tokenize URL into input sequence
    const tokens = this.tokenize(components);

    for (const token of tokens) {
      this.evaluateToken(token, components);
    }

    // Final state determination
    const finalState: string = this.currentState;
    let status: 'CLEAN' | 'SUSPICIOUS' | 'HIGH_RISK' = 'CLEAN';
    if (finalState === 'q7_HIGH_RISK_PATTERN') {
      status = 'HIGH_RISK';
    } else if (
      finalState === 'q6_SUSPICIOUS_PATTERN' ||
      finalState === 'q9_ACCEPT_SUSPICIOUS'
    ) {
      status = 'SUSPICIOUS';
    }

    const statesVisited = Array.from(new Set(this.trace.map(t => t.nextState)));

    // Assemble patterns including baseline structural checks
    const patterns: string[] = [];
    if (components.protocol === 'https') {
      patterns.push('✓ HTTPS detected');
    } else {
      patterns.push('⚠ Unencrypted HTTP protocol');
    }

    if (!components.hasIpAddress) {
      patterns.push('✓ Valid URL structure');
    }

    // Add detected suspicious items with ⚠ symbol
    this.detectedPatterns.forEach(pat => {
      patterns.push(`⚠ ${pat}`);
    });

    return {
      accepted: true,
      finalState: this.currentState,
      status,
      detectedPatterns: patterns,
      trace: this.trace,
      statesVisited,
    };
  }

  private tokenize(c: UrlComponents): InputToken[] {
    const tokens: InputToken[] = [];

    // Protocol Token
    tokens.push({
      category: 'PROTOCOL',
      value: c.protocol,
      description: `Protocol identified: ${c.protocol.toUpperCase()}`
    });

    // Hostname / IP Token
    if (c.hasIpAddress) {
      tokens.push({
        category: 'IP_HOSTNAME',
        value: c.hostname,
        description: `Direct IP address used as hostname: ${c.hostname}`
      });
    } else {
      tokens.push({
        category: 'DOMAIN',
        value: c.hostname,
        description: `Standard hostname: ${c.hostname}`
      });
    }

    // Subdomains Token
    if (c.subdomains.length > 2) {
      tokens.push({
        category: 'EXCESSIVE_SUBDOMAINS',
        value: c.subdomains.join('.'),
        description: `Excessive subdomains (${c.subdomains.length}): ${c.subdomains.join('.')}`
      });
    }

    // Symbol Tokens
    if (c.hasAtSymbol) {
      tokens.push({
        category: 'AT_SYMBOL',
        value: '@',
        description: 'User-info `@` symbol detected in URL structure'
      });
    }

    if (c.hasPercentEncoding) {
      tokens.push({
        category: 'PERCENT_ENCODING',
        value: '%',
        description: 'Percent-encoded characters found in URL'
      });
    }

    if (c.hasPunycode) {
      tokens.push({
        category: 'PUNYCODE',
        value: 'xn--',
        description: 'IDN Punycode prefix found in hostname'
      });
    }

    // Hyphens token
    const hyphenCount = (c.hostname.match(/-/g) || []).length;
    if (hyphenCount >= 2) {
      tokens.push({
        category: 'EXCESSIVE_HYPHENS',
        value: `${hyphenCount} hyphens`,
        description: `Excessive hyphens in hostname (${hyphenCount})`
      });
    }

    // Keyword tokens
    const foundKeywords = SUSPICIOUS_KEYWORDS.filter(kw =>
      c.rawUrl.toLowerCase().includes(kw)
    );
    if (foundKeywords.length > 0) {
      tokens.push({
        category: 'SUSPICIOUS_KEYWORD',
        value: foundKeywords.join(','),
        description: `Suspicious keywords found: ${foundKeywords.join(', ')}`
      });
    }

    // Sensitive Path Token
    const matchedPath = SENSITIVE_PATHS.find(p => c.path.toLowerCase().startsWith(p));
    if (matchedPath) {
      tokens.push({
        category: 'SENSITIVE_PATH',
        value: matchedPath,
        description: `Authentication/sensitive path segment: ${matchedPath}`
      });
    }

    // Structural Length Token
    if (c.rawUrl.length > 75) {
      tokens.push({
        category: 'ABNORMAL_LENGTH',
        value: `${c.rawUrl.length} chars`,
        description: `Excessive URL length (${c.rawUrl.length} characters)`
      });
    }

    // End Token
    tokens.push({
      category: 'END',
      value: 'EOF',
      description: 'End of input token stream'
    });

    return tokens;
  }

  private evaluateToken(token: InputToken, c: UrlComponents) {
    const fromState = this.currentState;

    switch (fromState) {
      case 'q0_START':
        if (token.category === 'PROTOCOL') {
          const next = token.value === 'https' ? 'q1_PROTOCOL' : 'q1_PROTOCOL';
          this.recordTransition(token, next, `Protocol transition from START`);
        }
        break;

      case 'q1_PROTOCOL':
        if (token.category === 'IP_HOSTNAME') {
          this.detectedPatterns.add('IP Address used instead of Domain');
          this.recordTransition(token, 'q7_HIGH_RISK_PATTERN', 'Direct IP host is a high-risk phishing indicator');
        } else if (token.category === 'AT_SYMBOL') {
          this.detectedPatterns.add('@ Symbol present in URL');
          this.recordTransition(token, 'q7_HIGH_RISK_PATTERN', 'At symbol in URL attempts credential/redirect trickery');
        } else if (token.category === 'DOMAIN') {
          this.recordTransition(token, 'q2_HOSTNAME', 'Valid hostname structure parsed');
        }
        break;

      case 'q2_HOSTNAME':
        if (token.category === 'AT_SYMBOL') {
          this.detectedPatterns.add('@ Symbol present in URL');
          this.recordTransition(token, 'q7_HIGH_RISK_PATTERN', 'At symbol in URL attempts credential/redirect trickery');
        } else if (token.category === 'EXCESSIVE_SUBDOMAINS') {
          this.detectedPatterns.add(`Excessive subdomains (${c.subdomains.length})`);
          this.recordTransition(token, 'q3_SUBDOMAIN_EVAL', 'Deep subdomain nesting evaluated');
        } else if (token.category === 'PUNYCODE') {
          this.detectedPatterns.add('IDN Punycode domain');
          this.recordTransition(token, 'q6_SUSPICIOUS_PATTERN', 'Punycode domain may hide homograph attacks');
        } else if (token.category === 'EXCESSIVE_HYPHENS') {
          this.detectedPatterns.add(`Excessive hyphens in hostname (${token.value})`);
          this.recordTransition(token, 'q6_SUSPICIOUS_PATTERN', 'Excessive hyphenation used to mimic brand names');
        } else if (token.category === 'SUSPICIOUS_KEYWORD') {
          this.detectedPatterns.add(`Suspicious keywords: ${token.value}`);
          this.recordTransition(token, 'q4_KEYWORD_EVAL', 'Suspicious security/auth keywords present in URL');
        } else if (token.category === 'SENSITIVE_PATH') {
          this.detectedPatterns.add(`Sensitive path: ${token.value}`);
          this.recordTransition(token, 'q5_PATH_EVAL', 'Credential/login target path segment');
        } else if (token.category === 'END') {
          this.recordTransition(token, 'q8_ACCEPT_CLEAN', 'Clean URL structure verified');
        } else {
          this.recordTransition(token, 'q2_HOSTNAME', `Processing token ${token.category}`);
        }
        break;

      case 'q3_SUBDOMAIN_EVAL':
        if (token.category === 'SUSPICIOUS_KEYWORD') {
          this.detectedPatterns.add(`Suspicious keyword with multi-subdomains: ${token.value}`);
          this.recordTransition(token, 'q7_HIGH_RISK_PATTERN', 'Combined excessive subdomains and security keywords');
        } else if (token.category === 'SENSITIVE_PATH') {
          this.detectedPatterns.add(`Subdomain spoofing with sensitive path ${token.value}`);
          this.recordTransition(token, 'q6_SUSPICIOUS_PATTERN', 'Deep subdomains pointing to auth path');
        } else if (token.category === 'END') {
          this.recordTransition(token, 'q6_SUSPICIOUS_PATTERN', 'Excessive subdomains elevated risk state');
        }
        break;

      case 'q4_KEYWORD_EVAL':
        if (token.category === 'SENSITIVE_PATH') {
          this.detectedPatterns.add(`Multiple security keywords in path and domain`);
          this.recordTransition(token, 'q6_SUSPICIOUS_PATTERN', 'Accumulated security/login keywords');
        } else if (token.category === 'ABNORMAL_LENGTH') {
          this.detectedPatterns.add('Excessive URL length with suspicious keywords');
          this.recordTransition(token, 'q6_SUSPICIOUS_PATTERN', 'Obfuscated long URL with target keywords');
        } else if (token.category === 'END') {
          this.recordTransition(token, 'q9_ACCEPT_SUSPICIOUS', 'URL parsed with suspicious keyword flags');
        }
        break;

      case 'q5_PATH_EVAL':
        if (token.category === 'PERCENT_ENCODING') {
          this.detectedPatterns.add('Obfuscated path encoding');
          this.recordTransition(token, 'q6_SUSPICIOUS_PATTERN', 'Percent encoding in sensitive path');
        } else if (token.category === 'END') {
          this.recordTransition(token, 'q9_ACCEPT_SUSPICIOUS', 'Sensitive path accepted with review flag');
        }
        break;

      case 'q6_SUSPICIOUS_PATTERN':
        if (token.category === 'AT_SYMBOL' || token.category === 'IP_HOSTNAME') {
          this.recordTransition(token, 'q7_HIGH_RISK_PATTERN', 'Multiple compounding suspicious factors escalated to High Risk');
        } else if (token.category === 'END') {
          this.recordTransition(token, 'q9_ACCEPT_SUSPICIOUS', 'Accepting in suspicious state');
        } else {
          this.recordTransition(token, 'q6_SUSPICIOUS_PATTERN', `Processing token ${token.category}`);
        }
        break;

      case 'q7_HIGH_RISK_PATTERN':
        if (token.category === 'END') {
          this.recordTransition(token, 'q7_HIGH_RISK_PATTERN', 'Accepting in high risk state');
        } else {
          this.recordTransition(token, 'q7_HIGH_RISK_PATTERN', `Processing token ${token.category}`);
        }
        break;

      case 'q8_ACCEPT_CLEAN':
      case 'q9_ACCEPT_SUSPICIOUS':
        // Terminal state sink
        break;
    }
  }
}
