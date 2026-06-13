/**
 * Identidad de la app. El nombre es PROVISIONAL: cámbialo aquí y se
 * actualiza en toda la app (el copy usa siempre esta constante).
 */
export const APP_NAME = 'Willy';

export const APP_VERSION = '1.0.0';

export const SUPPORT_EMAIL = 'hola@willyapp.es'; // TODO: email real de soporte

/** URL del backend de análisis (Fase 2). Se inyecta por variable de entorno. */
export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

/**
 * Credenciales de Supabase (cuentas con login). Si están presentes, la app
 * usa Supabase real; si no, usa el mock local (para desarrollo en Expo Go).
 * Se configuran como variables de entorno EXPO_PUBLIC_* (ver .env.example).
 */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** ¿Hay backend de auth real configurado? Si no, se usa el mock. */
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * API keys públicas de RevenueCat (una por plataforma). Solo se usan si el
 * flag `useRealPurchases` está activo (en un development build, no en Expo
 * Go). Son claves de cliente, no secretas.
 */
export const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
export const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';
