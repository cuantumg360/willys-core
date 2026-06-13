/**
 * Contrato de autenticación. La app solo conoce esta interfaz, nunca el
 * SDK concreto: en desarrollo se usa el mock local y, al poner las
 * credenciales de Supabase, se cambia al backend real sin tocar pantallas.
 */
export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
}

export interface AuthProvider {
  /** Sesión guardada (si la hay) al arrancar. */
  getSession(): Promise<AuthSession | null>;
  signUp(email: string, password: string): Promise<AuthSession>;
  signIn(email: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  /** Elimina la cuenta del usuario actual. */
  deleteAccount(): Promise<void>;
  /** Suscripción a cambios de sesión (opcional). Devuelve función para cancelar. */
  onAuthChange?(callback: (session: AuthSession | null) => void): () => void;
}

/** Error de auth con mensaje ya legible para el usuario (en español). */
export class AuthError extends Error {}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export const MIN_PASSWORD = 6;
