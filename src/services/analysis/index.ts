import { BACKEND_URL } from '@/config/app';
import { flags } from '@/config/flags';
import { analyzeViaBackend } from './api';
import { analyzeMock } from './mock';
import { AnalysisRequest, AnalysisResult } from './types';

export * from './types';

/**
 * Punto único de entrada del pipeline foto → IA → resultado.
 *
 * Usa el backend real (Claude con visión) en cuanto está configurada la URL
 * EXPO_PUBLIC_BACKEND_URL; si no, usa el mock. Así basta con rellenar el .env
 * para que la IA real se active (también funciona en Expo Go: solo es fetch +
 * compresión de imagen, sin módulos nativos). El flag `useRealAnalysis` fuerza
 * el backend aunque quieras probar el camino real explícitamente.
 */
export function analyze(request: AnalysisRequest): Promise<AnalysisResult> {
  const useReal = Boolean(BACKEND_URL) || flags.useRealAnalysis;
  return useReal ? analyzeViaBackend(request) : analyzeMock(request);
}
