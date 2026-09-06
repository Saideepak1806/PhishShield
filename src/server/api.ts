import { Router, Request, Response } from 'express';
import { analyzeUrlPipeline } from '../engine/classifier';
import {
  clearAllScansInDb,
  getAllScansFromDb,
  getDashboardStatsFromDb,
  getScanByIdFromDb,
  saveScanToDb,
} from '../db/database';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'PhishShield Security Engine', timestamp: new Date() });
});

function formatApiResponse(scanResult: any) {
  const m2Findings: string[] = [];
  if (scanResult.module2.validation.dnsResolved) m2Findings.push('DNS resolved: YES');
  if (scanResult.module2.validation.isHttps) m2Findings.push('HTTPS: YES');
  if (scanResult.module2.validation.tlsValid) m2Findings.push('TLS valid: YES');
  if (scanResult.module2.validation.redirectCount > 0) {
    m2Findings.push(`Redirects: ${scanResult.module2.validation.redirectCount}`);
  }
  if (scanResult.module2.validation.content?.hasForms) m2Findings.push('Forms detected: YES');
  if (scanResult.module2.validation.content?.hasPasswordFields) m2Findings.push('Password field: YES');
  if (scanResult.module2.validation.content?.hasOtpFields) m2Findings.push('OTP field: YES');
  if (scanResult.module2.validation.content?.hasPaymentFields) m2Findings.push('Payment field: YES');
  if (scanResult.module2.validation.content?.externalLinksCount > 0) {
    m2Findings.push(`External links: ${scanResult.module2.validation.content.externalLinksCount}`);
  }
  if (scanResult.module2.brand.detectedBrand) {
    m2Findings.push(`Brand detected: ${scanResult.module2.brand.detectedBrand}`);
  }
  if (scanResult.module2.brand.relationship === 'MISMATCH') {
    m2Findings.push('Brand/domain mismatch: YES');
  }

  return {
    ...scanResult,
    url: scanResult.rawUrl,
    module1: {
      ...scanResult.module1,
      result: scanResult.module1.status,
      automaton_trace: scanResult.module1.automaton.trace,
      detected_patterns: scanResult.module1.automaton.detectedPatterns,
    },
    module2: {
      ...scanResult.module2,
      findings: m2Findings,
    },
    module3: {
      ...scanResult.module3,
      risk_score: scanResult.module3.riskScore,
      classification: scanResult.module3.threatLevel,
      reasons: scanResult.module3.primaryReasons,
      recommendation: scanResult.module3.alertMessage.recommendation,
    },
  };
}

// Main URL Scan Endpoint
apiRouter.post('/scan', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({ error: 'Valid URL parameter is required.' });
    }

    const scanResult = await analyzeUrlPipeline(url.trim(), false);
    await saveScanToDb(scanResult);

    return res.json(formatApiResponse(scanResult));
  } catch (err: any) {
    console.error('Error in /api/scan:', err);
    return res.status(500).json({
      error: 'Failed to complete URL analysis',
      details: err.message || 'Internal server error',
    });
  }
});

// Demo URL Scan Endpoint
apiRouter.post('/scan-demo', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    const targetUrl = url || 'http://paypal-security-update.account-verify.test/login';

    const scanResult = await analyzeUrlPipeline(targetUrl, true);
    await saveScanToDb(scanResult);

    return res.json(formatApiResponse(scanResult));
  } catch (err: any) {
    console.error('Error in /api/scan-demo:', err);
    return res.status(500).json({
      error: 'Failed to run demo scan',
      details: err.message,
    });
  }
});

// History Scans List Endpoint
apiRouter.get('/scans', async (req: Request, res: Response) => {
  try {
    const threatLevel = req.query.threatLevel as string | undefined;
    const scans = await getAllScansFromDb(threatLevel);
    return res.json({ scans });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch scan history', details: err.message });
  }
});

// Clear All Scans Endpoint (Reset Prototype DB)
apiRouter.delete('/scans', async (req: Request, res: Response) => {
  try {
    await clearAllScansInDb();
    return res.json({ message: 'All scan logs successfully cleared.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to clear scans', details: err.message });
  }
});

// Single Scan Details Endpoint
apiRouter.get('/scans/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const scan = await getScanByIdFromDb(id);
    if (!scan) {
      return res.status(404).json({ error: 'Scan record not found' });
    }
    return res.json(formatApiResponse(scan));
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch scan detail', details: err.message });
  }
});

// Dashboard Statistics Endpoints (both /dashboard and /dashboard/stats)
apiRouter.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const stats = await getDashboardStatsFromDb();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch dashboard data', details: err.message });
  }
});

apiRouter.get('/dashboard/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getDashboardStatsFromDb();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch dashboard stats', details: err.message });
  }
});
