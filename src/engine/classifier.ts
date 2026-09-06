import { ScanResult } from '../types';
import { parseAndNormalizeUrl } from './urlParser';
import { UrlFiniteAutomaton } from './automaton';
import { extractUrlFeatures } from './featureExtractor';
import { analyzeWebsiteAndDomain } from './websiteAnalyzer';
import { calculateRiskAndClassification } from './riskEngine';

/**
 * Full End-to-End Analysis Pipeline
 * Module 1 (Automaton & Features) -> Module 2 (Domain & Website) -> Module 3 (Scoring & Classification)
 */
export async function analyzeUrlPipeline(
  rawUrl: string,
  isDemo = false
): Promise<ScanResult> {
  const timestamp = new Date().toISOString();

  // 1. URL Component Parsing
  const components = parseAndNormalizeUrl(rawUrl);

  // 2. Module 1: Finite Automata Analysis
  const automatonEngine = new UrlFiniteAutomaton();
  const automatonResult = automatonEngine.run(components);
  const features = extractUrlFeatures(components);

  const m1Result = {
    components,
    automaton: automatonResult,
    features,
    status: automatonResult.status,
  };

  // 3. Module 2: Website Validation & Content Analysis
  const m2Result = await analyzeWebsiteAndDomain(components, isDemo);

  // 4. Module 3: Evidence-Based Risk Scoring & Threat Classification
  const m3Result = calculateRiskAndClassification(m1Result, m2Result);

  const scanId = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    id: scanId,
    timestamp,
    rawUrl,
    normalizedUrl: components.normalizedUrl,
    finalUrl: m2Result.validation.finalUrl || components.normalizedUrl,
    riskScore: m3Result.riskScore,
    threatLevel: m3Result.threatLevel,
    isDemo,
    module1: m1Result,
    module2: m2Result,
    module3: m3Result,
    summaryReason: m3Result.primaryReasons[0] || 'Analysis completed.',
  };
}
