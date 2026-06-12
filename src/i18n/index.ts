import { es } from './es';

/**
 * i18n mínimo y tipado. Un solo idioma al lanzar (es); para añadir otro:
 *   1. Crear src/i18n/en.ts con las mismas claves.
 *   2. Añadirlo a `dictionaries` y resolver `locale` con expo-localization.
 * Las claves están tipadas: usar una clave inexistente no compila.
 */
const dictionaries = { es } as const;

export type Locale = keyof typeof dictionaries;
export type TKey = keyof typeof es;

let locale: Locale = 'es';

export function setLocale(next: Locale) {
  locale = next;
}

/** Traduce una clave, interpolando placeholders {asi}. */
export function t(key: TKey, params?: Record<string, string | number>): string {
  let text: string = dictionaries[locale][key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}
