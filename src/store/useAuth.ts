import { create } from 'zustand';

import { auth, AuthError, AuthUser } from '@/services/auth';
import { track } from '@/services/analytics';

type Status = 'loading' | 'authed' | 'guest';

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
    } catch {
      set({ status: 'guest' });
    }
    // Escucha cambios de sesión (p. ej. expiración de token en Supabase).
    auth().onAuthChange?.((session) => {
      set({ status: session ? 'authed' : 'guest', user: session?.user });
    });
  },

  signIn: async (email, password) => {
    set({ submitting: true, error: undefined });
    try {
      const session = await auth().signIn(email, password);
      set({ status: 'authed', user: session.user, submitting: false });
      track('sesion_iniciada');
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
      return true;
    } catch (error) {
      set({ submitting: false, error: messageFrom(error) });
      return false;
    }
  },

  signOut: async () => {
    await auth().signOut();
    set({ status: 'guest', user: undefined });
    track('sesion_cerrada');
  },

  deleteAccount: async () => {
    await auth().deleteAccount();
    set({ status: 'guest', user: undefined });
    track('cuenta_eliminada');
  },

  clearError: () => {
    if (get().error) set({ error: undefined });
  },
}));
