import { hasSupabase } from '@/config/app';
import { Pet, ScanRecord } from '@/store/types';

/**
 * Fachada de sincronización en la nube. Si no hay Supabase configurado, todo
 * es no-op (la app funciona 100% local, como en Expo Go). El módulo de
 * Supabase se carga de forma diferida solo cuando hace falta.
 *
 * `active` se enciende cuando hay sesión + Supabase: a partir de ahí, cada
 * cambio local se replica en la nube (push optimista, errores silenciados
 * para no molestar; al volver a entrar se vuelve a leer el estado real).
 */
let active = false;

type SyncModule = typeof import('./supabase');

function impl(): SyncModule {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('./supabase') as SyncModule;
}

export const cloud = {
  /** ¿Hay backend de sincronización configurado? */
  enabled(): boolean {
    return hasSupabase;
  },

  setActive(value: boolean): void {
    active = value;
  },

  /** Descarga mascotas y escaneos del usuario (null si no hay nube). */
  async pull(): Promise<{ pets: Pet[]; scans: ScanRecord[] } | null> {
    if (!hasSupabase) return null;
    try {
      return await impl().pullAll();
    } catch {
      return null;
    }
  },

  upsertPet(pet: Pet): void {
    if (active) impl().upsertPet(pet).catch(() => {});
  },

  deletePet(id: string): void {
    if (active) impl().deletePet(id).catch(() => {});
  },

  upsertScan(scan: ScanRecord): void {
    if (active) impl().upsertScan(scan).catch(() => {});
  },

  /** Borra todos los datos del usuario en la nube. */
  async wipe(): Promise<void> {
    if (active) {
      try {
        await impl().wipeAll();
      } catch {
        /* mejor esfuerzo */
      }
    }
  },
};
