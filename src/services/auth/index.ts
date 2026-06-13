import { hasSupabase } from '@/config/app';
import { AuthProvider } from './types';

export * from './types';

/**
 * Selecciona el proveedor de auth: Supabase si hay credenciales, mock si no.
 * El módulo de Supabase se carga de forma diferida para no incluir su
 * cliente cuando se trabaja con el mock (desarrollo en Expo Go).
 */
let provider: AuthProvider | undefined;

export function auth(): AuthProvider {
  if (!provider) {
    if (hasSupabase) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      provider = (require('./supabase') as typeof import('./supabase')).createSupabaseAuth();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      provider = (require('./mock') as typeof import('./mock')).createMockAuth();
    }
  }
  return provider;
}
