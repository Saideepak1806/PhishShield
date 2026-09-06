import initSqlJs, { Database } from 'sql.js';
import { DashboardStats, ScanResult, ThreatLevel } from '../types';
import fs from 'fs';
import path from 'path';

let db: Database | null = null;
const DB_FILE_PATH = path.join(process.cwd(), 'phishshield.sqlite');

/**
 * Initializes SQLite database using sql.js and creates schema & demo data if empty.
 */
export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  // Load existing database file if present
  if (fs.existsSync(DB_FILE_PATH)) {
    const fileBuffer = fs.readFileSync(DB_FILE_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      raw_url TEXT NOT NULL,
      normalized_url TEXT NOT NULL,
      final_url TEXT NOT NULL,
      risk_score INTEGER NOT NULL,
      threat_level TEXT NOT NULL,
      is_demo INTEGER NOT NULL,
      summary_reason TEXT NOT NULL,
      raw_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS url_analysis (
      scan_id TEXT PRIMARY KEY,
      url_length INTEGER,
      hostname_length INTEGER,
      subdomain_count INTEGER,
      special_char_count INTEGER,
      digit_count INTEGER,
      has_ip INTEGER,
      has_https INTEGER,
      has_at INTEGER,
      has_punycode INTEGER,
      suspicious_keyword_count INTEGER,
      automaton_final_state TEXT,
      automaton_status TEXT,
      FOREIGN KEY(scan_id) REFERENCES scans(id)
    );

    CREATE TABLE IF NOT EXISTS website_analysis (
      scan_id TEXT PRIMARY KEY,
      dns_resolved INTEGER,
      is_https INTEGER,
      redirect_count INTEGER,
      page_title TEXT,
      has_password_fields INTEGER,
      has_payment_fields INTEGER,
      detected_brand TEXT,
      brand_relationship TEXT,
      accessible INTEGER,
      FOREIGN KEY(scan_id) REFERENCES scans(id)
    );

    CREATE TABLE IF NOT EXISTS indicators (
      id TEXT PRIMARY KEY,
      scan_id TEXT NOT NULL,
      module TEXT NOT NULL,
      category TEXT NOT NULL,
      indicator TEXT NOT NULL,
      severity TEXT NOT NULL,
      points INTEGER NOT NULL,
      description TEXT NOT NULL,
      FOREIGN KEY(scan_id) REFERENCES scans(id)
    );
  `);

  persistDatabase();
  return db;
}

/**
 * Clears all stored scans in SQLite database for a fresh prototype reset
 */
export async function clearAllScansInDb(): Promise<void> {
  const database = await initDatabase();
  database.exec(`
    DELETE FROM indicators;
    DELETE FROM website_analysis;
    DELETE FROM url_analysis;
    DELETE FROM scans;
  `);
  persistDatabase();
}

function persistDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE_PATH, buffer);
  } catch (err) {
    console.error('Failed to persist SQLite database to disk:', err);
  }
}

/**
 * Saves a new scan result to SQLite database
 */
export async function saveScanToDb(scan: ScanResult): Promise<void> {
  const database = await initDatabase();

  const stmt = database.prepare(`
    INSERT OR REPLACE INTO scans (
      id, timestamp, raw_url, normalized_url, final_url, risk_score, threat_level, is_demo, summary_reason, raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  stmt.run([
    scan.id,
    scan.timestamp,
    scan.rawUrl,
    scan.normalizedUrl,
    scan.finalUrl,
    scan.riskScore,
    scan.threatLevel,
    scan.isDemo ? 1 : 0,
    scan.summaryReason,
    JSON.stringify(scan),
  ]);
  stmt.free();

  // Insert url_analysis
  const m1 = scan.module1;
  const urlStmt = database.prepare(`
    INSERT OR REPLACE INTO url_analysis (
      scan_id, url_length, hostname_length, subdomain_count, special_char_count, digit_count,
      has_ip, has_https, has_at, has_punycode, suspicious_keyword_count, automaton_final_state, automaton_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);
  urlStmt.run([
    scan.id,
    m1.features.urlLength,
    m1.features.hostnameLength,
    m1.features.subdomainCount,
    m1.features.specialCharacterCount,
    m1.features.digitCount,
    m1.features.hasIpAddress ? 1 : 0,
    m1.features.hasHttps ? 1 : 0,
    m1.features.hasAtSymbol ? 1 : 0,
    m1.features.hasPunycode ? 1 : 0,
    m1.features.suspiciousKeywordCount,
    m1.automaton.finalState,
    m1.automaton.status,
  ]);
  urlStmt.free();

  // Insert website_analysis
  const m2 = scan.module2;
  const webStmt = database.prepare(`
    INSERT OR REPLACE INTO website_analysis (
      scan_id, dns_resolved, is_https, redirect_count, page_title,
      has_password_fields, has_payment_fields, detected_brand, brand_relationship, accessible
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);
  webStmt.run([
    scan.id,
    m2.validation.dnsResolved ? 1 : 0,
    m2.validation.isHttps ? 1 : 0,
    m2.validation.redirectCount,
    m2.validation.content?.title || '',
    m2.validation.content?.hasPasswordFields ? 1 : 0,
    m2.validation.content?.hasPaymentFields ? 1 : 0,
    m2.brand.detectedBrand || '',
    m2.brand.relationship,
    m2.validation.accessible ? 1 : 0,
  ]);
  webStmt.free();

  // Insert indicators
  for (const c of scan.module3.contributions) {
    const indStmt = database.prepare(`
      INSERT OR REPLACE INTO indicators (
        id, scan_id, module, category, indicator, severity, points, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `);
    indStmt.run([
      `${scan.id}_${c.id}`,
      scan.id,
      c.module,
      c.category,
      c.indicator,
      c.severity,
      c.points,
      c.description,
    ]);
    indStmt.free();
  }

  persistDatabase();
}

/**
 * Retrieves scan list from SQLite database
 */
export async function getAllScansFromDb(filterThreat?: string): Promise<ScanResult[]> {
  const database = await initDatabase();
  let query = 'SELECT raw_json FROM scans ORDER BY timestamp DESC LIMIT 100';
  let params: any[] = [];

  if (filterThreat && filterThreat !== 'ALL') {
    query = 'SELECT raw_json FROM scans WHERE threat_level = ? ORDER BY timestamp DESC LIMIT 100';
    params = [filterThreat];
  }

  const res = database.exec(query, params);
  if (!res || res.length === 0) return [];

  const scans: ScanResult[] = [];
  for (const row of res[0].values) {
    try {
      const scanObj = JSON.parse(row[0] as string);
      scans.push(scanObj);
    } catch (e) {
      // Ignore corrupted row
    }
  }

  return scans;
}

/**
 * Retrieves a single scan by ID
 */
export async function getScanByIdFromDb(id: string): Promise<ScanResult | null> {
  const database = await initDatabase();
  const res = database.exec('SELECT raw_json FROM scans WHERE id = ?', [id]);
  if (!res || res.length === 0 || res[0].values.length === 0) return null;

  try {
    return JSON.parse(res[0].values[0][0] as string);
  } catch (e) {
    return null;
  }
}

/**
 * Returns aggregated statistics for the Dashboard analytics
 */
export async function getDashboardStatsFromDb(): Promise<DashboardStats> {
  const database = await initDatabase();
  const allScans = await getAllScansFromDb();

  const threatDistribution: Record<ThreatLevel, number> = {
    SAFE: 0,
    SUSPICIOUS: 0,
    HIGH_RISK: 0,
    PHISHING: 0,
    UNAVAILABLE: 0,
  };

  let totalRiskScoreSum = 0;
  let module1Flags = 0;
  let module2Flags = 0;
  const indicatorCounts: Record<string, number> = {};

  for (const s of allScans) {
    threatDistribution[s.threatLevel] = (threatDistribution[s.threatLevel] || 0) + 1;
    totalRiskScoreSum += s.riskScore;

    if (s.module1.automaton.status !== 'CLEAN') {
      module1Flags++;
    }
    if (s.module2.brand.relationship === 'MISMATCH' || s.module2.validation.content?.hasPasswordFields) {
      module2Flags++;
    }

    for (const c of s.module3.contributions) {
      if (c.points > 0) {
        indicatorCounts[c.indicator] = (indicatorCounts[c.indicator] || 0) + 1;
      }
    }
  }

  const sortedIndicators = Object.entries(indicatorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  const recentScans = allScans.slice(0, 10).map(s => ({
    id: s.id,
    timestamp: s.timestamp,
    rawUrl: s.rawUrl,
    riskScore: s.riskScore,
    threatLevel: s.threatLevel,
    keyFinding: s.summaryReason,
  }));

  return {
    totalScans: allScans.length,
    threatDistribution,
    averageRiskScore: allScans.length > 0 ? Math.round(totalRiskScoreSum / allScans.length) : 0,
    topIndicators: sortedIndicators.length > 0 ? sortedIndicators : [
      { name: 'Password Forms', count: 0 },
      { name: 'Brand Mismatch', count: 0 },
      { name: 'Excessive Subdomains', count: 0 },
      { name: 'Suspicious Keywords', count: 0 },
    ],
    moduleThreatCounts: {
      module1Flags,
      module2Flags,
    },
    recentScans,
  };
}

/**
 * Seeds initial synthetic DEMO SCANS to populate dashboard charts with real data structure
 */
async function seedDemoScans(): Promise<void> {
  const { analyzeUrlPipeline } = await import('../engine/classifier');

  const demoUrls = [
    'https://www.wikipedia.org',
    'http://login-verification-bank.test/secure/account',
    'http://192.0.2.10/login/paypal/verify',
    'https://www.python.org/downloads',
    'http://paypal-security-update.account-verify.test/login',
  ];

  for (const url of demoUrls) {
    try {
      const scan = await analyzeUrlPipeline(url, true);
      await saveScanToDb(scan);
    } catch (e) {
      // Ignore individual demo seed error
    }
  }
}
