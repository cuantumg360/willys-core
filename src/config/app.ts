/**
 * Identidad de la app. El nombre es PROVISIONAL: cámbialo aquí y se
 * actualiza en toda la app (el copy usa siempre esta constante).
 */
export const APP_NAME = 'Willy';

export const APP_VERSION = '1.0.0';

export const SUPPORT_EMAIL = 'hola@willyapp.es'; // TODO: email real de soporte

/** URL del backend de análisis (Fase 2). Se inyecta por variable de entorno. */
export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
