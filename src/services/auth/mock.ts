import AsyncStorage from '@react-native-async-storage/async-storage';

import { newId } from '@/utils/id';
import { AuthError, AuthProvider, AuthSession, isValidEmail, MIN_PASSWORD } from './types';

/**
 * Auth mock (desarrollo, sin backend). Guarda en el dispositivo los
 * usuarios registrados y la sesión activa, para poder construir y probar
 * todo el flujo (registro, login, errores, cerrar sesión) en Expo Go.
 * Se sustituye por Supabase real al configurar las credenciales.
 */
const USERS_KEY = 'willy-auth-users-v1';
const SESSION_KEY = 'willy-auth-session-v1';

interface StoredUser {
  id: string;
  email: string;
  password: string;
}

async function readUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as StoredUser[]) : [];
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function validate(email: string, password: string) {
  if (!isValidEmail(email)) throw new AuthError('Introduce un email válido.');
  if (password.length < MIN_PASSWORD) {
    throw new AuthError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
  }
}

export function createMockAuth(): AuthProvider {
  // Pequeña latencia para que la UI se comporte como con un backend real.
  const delay = () => new Promise((resolve) => setTimeout(resolve, 600));

  return {
    async getSession() {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    },

    async signUp(email, password) {
      validate(email, password);
      await delay();
      const normalized = email.trim().toLowerCase();
      const users = await readUsers();
      if (users.some((u) => u.email === normalized)) {
        throw new AuthError('Ya existe una cuenta con este email. Inicia sesión.');
      }
      const user = { id: newId(), email: normalized, password };
      await writeUsers([...users, user]);
      const session: AuthSession = { user: { id: user.id, email: user.email } };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    },

    async signIn(email, password) {
      validate(email, password);
      await delay();
      const normalized = email.trim().toLowerCase();
      const users = await readUsers();
      const user = users.find((u) => u.email === normalized);
      if (!user || user.password !== password) {
        throw new AuthError('Email o contraseña incorrectos.');
      }
      const session: AuthSession = { user: { id: user.id, email: user.email } };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    },

    async signOut() {
      await AsyncStorage.removeItem(SESSION_KEY);
    },

    async deleteAccount() {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw) {
        const { user } = JSON.parse(raw) as AuthSession;
        const users = await readUsers();
        await writeUsers(users.filter((u) => u.id !== user.id));
      }
      await AsyncStorage.removeItem(SESSION_KEY);
    },
  };
}
