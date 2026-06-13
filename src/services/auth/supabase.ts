import { getSupabase as supabase } from '@/services/supabase/client';
import { AuthError, AuthProvider, AuthSession } from './types';

/**
 * Auth real con Supabase. La API key NUNCA es secreta aquí: es la "anon
 * key" pública, pensada para el cliente; la seguridad real la dan las
 * Row Level Security policies del proyecto Supabase.
 */
function toSession(user: { id: string; email?: string } | null): AuthSession | null {
  if (!user) return null;
  return { user: { id: user.id, email: user.email ?? '' } };
}

/** Traduce el mensaje de error de Supabase a algo legible en español. */
function translate(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('already registered')) return 'Ya existe una cuenta con este email. Inicia sesión.';
  if (m.includes('invalid login')) return 'Email o contraseña incorrectos.';
  if (m.includes('email not confirmed')) return 'Confirma tu email antes de iniciar sesión.';
  if (m.includes('password')) return 'La contraseña no cumple los requisitos mínimos.';
  return 'No hemos podido completar la operación. Inténtalo de nuevo.';
}

export function createSupabaseAuth(): AuthProvider {
  return {
    async getSession() {
      const { data } = await supabase().auth.getSession();
      return toSession(data.session?.user ?? null);
    },

    async signUp(email, password) {
      const { data, error } = await supabase().auth.signUp({ email: email.trim(), password });
      if (error) throw new AuthError(translate(error.message));
      const session = toSession(data.user);
      if (!session) throw new AuthError('Revisa tu email para confirmar la cuenta.');
      return session;
    },

    async signIn(email, password) {
      const { data, error } = await supabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw new AuthError(translate(error.message));
      const session = toSession(data.user);
      if (!session) throw new AuthError('No se pudo iniciar sesión.');
      return session;
    },

    async signOut() {
      await supabase().auth.signOut();
    },

    async deleteAccount() {
      // El borrado real del usuario requiere privilegios de servidor: se hace
      // con una Edge Function (service role). Aquí cerramos la sesión; la
      // función del backend completa la eliminación. (Ver backend/README.md)
      await supabase().auth.signOut();
    },

    onAuthChange(callback) {
      const { data } = supabase().auth.onAuthStateChange((_event, session) => {
        callback(toSession(session?.user ?? null));
      });
      return () => data.subscription.unsubscribe();
    },
  };
}
