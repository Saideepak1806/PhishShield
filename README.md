# PhishShield: Phishing URL Detection & Website Validation System Using Finite Automata

PhishShield is an academic and production-grade cybersecurity application that combines **Formal Language Theory (Deterministic Finite Automata)** with **Live Domain & Website Validation** and an **Explainable Evidence-Based Risk Scoring Engine** to analyze URLs for phishing threats.

---

## 1. Problem Statement

Phishing attacks remain one of the most widespread vectors for credential theft and identity compromise. Traditional blacklists suffer from zero-day lag, while opaque machine learning models often lack zero-shot explainability. Furthermore, modern phishing campaigns register short-lived domains, employ character obfuscation (Punycode, `@` symbol trickery, excessive subdomains), and host realistic login forms targeting major brands (PayPal, Google, Microsoft, Chase, Bank of America, Coinbase).

---

## 2. Proposed Solution

**PhishShield** addresses these challenges through a three-tier sequential pipeline:

1. **Module 1 (Finite Automata Engine):** Evaluates lexical and structural URL tokens in $O(N)$ linear time using a formal Deterministic Finite Automaton (DFA) state machine.
2. **Module 2 (Website Validation & Content Inspection):** Conducts safe server-side HTTP/HTTPS fetching with **Strict SSRF Protection**, inspecting DNS resolution, TLS certificates, HTTP redirect chains, login form fields, and brand/domain mismatches.
3. **Module 3 (Explainable Risk Engine & Threat Classifier):** Calculates a transparent 0–100 risk score with itemized weighted evidence contributions, classifying URLs as `SAFE`, `SUSPICIOUS`, `HIGH RISK`, `PHISHING`, or `UNAVAILABLE`.

---

## 3. System Architecture

```text
USER / DASHBOARD
      │
      ▼
Enter Target URL
      │
      ▼
URL Normalization & Tokenization
      │
      ▼
┌────────────────────────────────────────────────────────┐
│ MODULE 1: Finite Automata URL Analysis                 │
│ • Deterministic State Machine (q0 → q1 → q2 → ... → q9)│
│ • Lexical Feature Extraction (Length, IP, Keywords)    │
│ • Full Automaton Trace Logging                         │
└────────────────────────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────────────────────┐
│ MODULE 2: Live Website & Content Inspection            │
│ • SSRF Protection Guard (DNS Lookup & IP Check)        │
│ • HTTPS / TLS Connection Verification                  │
│ • Manual Redirect Chain Tracking (Up to 5 Hops)        │
│ • Static HTML Parsing (Forms, Passwords, Payment/OTP)  │
│ • Brand / Domain Mismatch Analysis (Official Mappings) │
└────────────────────────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────────────────────┐
│ MODULE 3: Evidence Aggregation & Threat Classifier     │
│ • Itemized Score Contributions (+/- Weight Points)     │
│ • Transparent Risk Score (0 - 100)                     │
│ • Threat Level (SAFE | SUSPICIOUS | HIGH RISK | PHISH) │
│ • Security Alert Banner & Recommendation Generator     │
└────────────────────────────────────────────────────────┘
      │
      ▼
SQLite Database Persistence & Interactive Dashboard (Recharts + Scan Logs)
```

---

## 4. Formal Finite Automata (DFA) Specification

The academic core of Module 1 is defined as a formal 5-tuple $M = (Q, \Sigma, \delta, q_0, F)$:

### States ($Q$)
- $q_0$ (`q0_START`): Initial state.
- $q_1$ (`q1_PROTOCOL`): Protocol validated (`http` / `https`).
- $q_2$ (`q2_HOSTNAME`): Valid domain hostname parsed.
- $q_3$ (`q3_SUBDOMAIN_EVAL`): Subdomain nesting analysis ($>2$ subdomains).
- $q_4$ (`q4_KEYWORD_EVAL`): Target authentication/security keyword state.
- $q_5$ (`q5_PATH_EVAL`): Sensitive target path segment (`/login`, `/verify`, `/account`).
- $q_6$ (`q6_SUSPICIOUS_PATTERN`): Accumulated suspicious lexical patterns.
- $q_7$ (`q7_HIGH_RISK_PATTERN`): Critical threat pattern state (IP host, `@` symbol trickery).
- $q_8$ (`q8_ACCEPT_CLEAN`): Terminal clean state.
- $q_9$ (`q9_ACCEPT_SUSPICIOUS`): Terminal suspicious state.

### Input Alphabet Tokens ($\Sigma$)
`PROTOCOL_HTTP`, `PROTOCOL_HTTPS`, `DOMAIN`, `IP_HOSTNAME`, `EXCESSIVE_SUBDOMAINS`, `AT_SYMBOL`, `PERCENT_ENCODING`, `PUNYCODE`, `SUSPICIOUS_KEYWORD`, `SENSITIVE_PATH`, `ABNORMAL_LENGTH`, `EOF`

---

## 5. Module 2: Website Validation & SSRF Guard

- **SSRF Protection:** Resolves domain to IP address and validates against private ranges (`127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254`, `::1`, `.local`, `.internal`). Private targets are safely blocked before HTTP connection is attempted.
- **Safe Fetching:** Enforces strict 5-second timeout, 1MB response limit, manual redirect handling up to 5 hops, and safe user-agent string.
- **Credential Collection Detection:** Identifies `<input type="password">`, username/email inputs, credit card/CVV fields, and OTP inputs.
- **Brand / Domain Mismatch Engine:** Configurable dictionary mapping major brands (PayPal, Google, Microsoft, Amazon, Apple, Netflix, Chase, Bank of America, Coinbase, Binance) to official domains. Generates a critical warning when page title/content claims a brand on an unverified domain.

---

## 6. Module 3: Risk Engine & Scoring Rules

Normalized Score Range: **0 to 100**

### Scoring Weights:
- **Direct IP Hostname:** +25 points
- **At Symbol (@) in URL:** +25 points
- **High-Risk Automaton State (q7):** +25 points
- **Brand Domain Mismatch:** +30 points
- **Credential Collection Form (Password input):** +20 points
- **Deceptive Hyperlink Text Mismatch:** +20 points
- **Punycode IDN Host:** +15 points
- **Multiple Redirect Hops (>1 redirect):** +5 to +15 points
- **Suspicious Keywords in URL:** +5 points per match (cap +20)
- **Excessive Subdomains (>2):** +5 points per extra level
- **Insecure HTTP (No Encryption):** +10 points
- **Verified Official Brand Domain:** -10 points (Clean factor)
- **HTTPS Encrypted Connection:** -5 points (Clean factor)
- **Valid DNS Resolution:** -5 points (Clean factor)

### Classification Thresholds:
- `0 – 24`: **SAFE**
- `25 – 49`: **SUSPICIOUS**
- `50 – 74`: **HIGH RISK**
- `75 – 100`: **PHISHING**
- `Inaccessible Site`: **UNAVAILABLE** (URL pattern analysis remains active)

---

## 7. Limitations & Security Disclaimer

1. **HTTPS Presence:** HTTPS encryption confirms data transport privacy, but does NOT guarantee website legitimacy. Modern phishing sites frequently use free SSL certificates.
2. **Dynamic / JS-Rendered Phishing:** Static HTML inspection does not execute dynamic JavaScript payloads.
3. **Inaccessible Targets:** If a phishing server goes offline, live content analysis cannot be completed, but Module 1 URL pattern analysis still flags structural anomalies.
4. **Disclaimer:** PhishShield is a defensive cybersecurity research prototype. Classifications should be treated as automated threat indicators, not absolute legal or safety guarantees.

---

## 8. Installation & Setup Instructions

### Prerequisites
- Node.js v18+ or Node.js v20+
- npm or bun

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Unit Test Suite
To run tests for the Finite Automata engine, feature extraction, and risk scoring model:
```bash
npm run test
```

### Step 3: Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### Step 4: Build for Production
```bash
npm run build
npm start
```

---

## 9. API Endpoints

- `POST /api/scan`: Submits a URL for full 3-module analysis.
- `POST /api/scan-demo`: Runs synthetic demo scans.
- `GET /api/scans`: Retrieves scan history log with optional `threatLevel` filter.
- `GET /api/scans/:id`: Retrieves complete deep audit details for a specific scan ID.
- `GET /api/dashboard/stats`: Returns aggregated stats and real chart datasets.
- `GET /api/health`: Engine health status.
