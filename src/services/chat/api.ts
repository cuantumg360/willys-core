import { BACKEND_URL, SUPABASE_ANON_KEY } from '@/config/app';

import { ChatRequest } from './types';

/**
 * Cliente del backend de chat. La Edge Function "chat" guarda la API key del
 * modelo y habla con Claude. Endpoint: POST {BACKEND_URL}/chat.
 */
export async function reply(req: ChatRequest): Promise<string> {
  if (!BACKEND_URL) throw new Error('EXPO_PUBLIC_BACKEND_URL no está configurada.');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (SUPABASE_ANON_KEY) {
    headers.apikey = SUPABASE_ANON_KEY;
    headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
  }

  const response = await fetch(`${BACKEND_URL}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages: req.messages, pet: req.pet }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`El chat falló (HTTP ${response.status}) ${detail}`.trim());
  }
  const data = (await response.json()) as { reply?: string };
  if (!data.reply) throw new Error('Respuesta vacía del backend.');
  return data.reply;
}
