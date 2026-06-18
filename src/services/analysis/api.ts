import { BACKEND_URL, SUPABASE_ANON_KEY } from '@/config/app';
import { compressForAnalysis } from '@/utils/image';
import { AnalysisRequest, AnalysisResult, validateAnalysisResult } from './types';

/**
 * Cliente del backend real. La Edge Function guarda la API key del modelo de
 * visión — la key NUNCA viaja en el cliente — y devuelve el JSON del contrato.
 *
 * Endpoint: POST {BACKEND_URL}/analyze
 *   { scannerId, images: [base64 jpeg], pet? }  →  AnalysisResult
 */
export async function analyzeViaBackend(request: AnalysisRequest): Promise<AnalysisResult> {
  if (!BACKEND_URL) {
    throw new Error('EXPO_PUBLIC_BACKEND_URL no está configurada.');
  }

  const images = await Promise.all(request.photoUris.map((uri) => compressForAnalysis(uri)));

  // La pasarela de Supabase Functions pide la "anon key" (pública) para enrutar.
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (SUPABASE_ANON_KEY) {
    headers.apikey = SUPABASE_ANON_KEY;
    headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
  }

  const response = await fetch(`${BACKEND_URL}/analyze`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      scannerId: request.scannerId,
      images: images.map((img) => img.base64),
      pet: request.pet,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`El análisis falló (HTTP ${response.status}) ${detail}`.trim());
  }

  return validateAnalysisResult(await response.json());
}
