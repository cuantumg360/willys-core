import { BACKEND_URL } from '@/config/app';

import * as api from './api';
import * as mock from './mock';
import { ChatRequest } from './types';

export * from './types';

/**
 * Asistente IA. Usa el backend real (Claude) si EXPO_PUBLIC_BACKEND_URL está
 * configurada; si falla o no hay backend, cae al asistente local por reglas
 * para que el chat SIEMPRE responda (también en Expo Go).
 */
export const chat = {
  async send(req: ChatRequest): Promise<string> {
    if (!BACKEND_URL) return mock.reply(req);
    try {
      return await api.reply(req);
    } catch (error) {
      console.warn('[chat] backend falló, usando asistente local:', String(error));
      return mock.reply(req);
    }
  },
};
