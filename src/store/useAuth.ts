import { create } from 'zustand';

import { auth, AuthError, AuthUser } from '@/services/auth';
import { track } from '@/services/analytics';
import { cloud } from '@/services/sync';
import { useAppStore } from '@/store/useAppStore';

type Status = 'loading' | 'authed' | 'guest';

/**
 * Al autenticarse, sincroniza con la nube: si la cuenta ya tiene datos, los
 * descarga (aparece en cualquier dispositivo); si está vacía pero hay datos
 * locales (creados en el onboarding antes de la cuenta), los sube.
 */
async function syncOnAuth() {
  if (!cloud.enabled()) return;
  cloud.setActive(true);
  const remote = await cloud.pull();
  if (!remote) return;
  const local = useAppStore.getState();
  if (remote.pets.length > 0 || remote.scans.length > 0) {
    local.loadFromCloud(remote.pets, remote.scans);
  } else {
    local.pets.forEach((pet) => cloud.upsertPet(pet));
    local.scans.forEach((scan) => cloud.upsertScan(scan));
  }
}

interface AuthState {
  status: Status;
  user?: AuthUser;
  submitting: boolean;
  error?: string;

  /** Carga la sesión guardada al arrancar y escucha cambios. */
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

function messageFrom(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  return 'Algo salió mal. Revisa tu conexión e inténtalo de nuevo.';
}

export const useAuth = create<AuthState>((set, get) => ({
  status: 'loading',
  user: undefined,
  submitting: false,
  error: undefined,

  init: async () => {
    try {
      const session = await auth().getSession();
      set({ status: session ? 'authed' : 'guest', user: session?.user });
      if (session) await syncOnAuth();
    } catch {
      set({ status: 'guest' });
    }
    // Escucha cambios de sesión (p. ej. expiración de token en Supabase).
    auth().onAuthChange?.((session) => {
      set({ status: session ? 'authed' : 'guest', user: session?.user });
      if (!session) cloud.setActive(false);
    });
  },

  signIn: async (email, password) => {
    set({ submitting: true, error: undefined });
    try {
      const session = await auth().signIn(email, password);
      set({ status: 'authed', user: session.user, submitting: false });
      track('sesion_iniciada');
      await syncOnAuth();
      return true;
    } catch (error) {
      set({ submitting: false, error: messageFrom(error) });
      return false;
    }
  },

  signUp: async (email, password) => {
    set({ submitting: true, error: undefined });
    try {
      const session = await auth().signUp(email, password);
      set({ status: 'authed', user: session.user, submitting: false });
      track('cuenta_creada');
      await syncOnAuth();
      return true;
    } catch (error) {
      set({ submitting: false, error: messageFrom(error) });
      return false;
    }
  },

  signOut: async () => {
    await auth().signOut();
    cloud.setActive(false);
    set({ status: 'guest', user: undefined });
    track('sesion_cerrada');
  },

  deleteAccount: async () => {
    await auth().deleteAccount();
    cloud.setActive(false);
    set({ status: 'guest', user: undefined });
    track('cuenta_eliminada');
  },

  clearError: () => {
    if (get().error) set({ error: undefined });
  },
}));
