import { flags } from '@/config/flags';
import { analyzeViaBackend } from './api';
import { analyzeMock } from './mock';
import { AnalysisRequest, AnalysisResult } from './types';

export * from './types';

/** Punto único de entrada del pipeline foto → IA → resultado. */
export function analyze(request: AnalysisRequest): Promise<AnalysisResult> {
  return flags.useRealAnalysis ? analyzeViaBackend(request) : analyzeMock(request);
}
