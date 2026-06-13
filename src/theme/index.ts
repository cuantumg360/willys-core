import { Platform, TextStyle, ViewStyle } from 'react-native';

/**
 * Tema único (sin dark mode en el MVP). Estilo cálido y confiable,
 * referencia Yuka / Cal AI: fondo claro cálido, un primario verde salud
 * y semáforo rojo/ámbar/verde para los resultados.
 */
export const colors = {
  background: '#FAF7F2',
  surface: '#FFFFFF',
  surfaceMuted: '#F2EDE5',
  border: '#E9E2D7',

  text: '#2B2722',
  textMuted: '#6F695F',
  textOnPrimary: '#FFFFFF',

  primary: '#1FA47C',
  primarySoft: '#E2F4EE',
  primaryDark: '#147A5B',

  accent: '#FF7A59',

  // Semáforo de resultados
  good: '#2FB66A',
  goodSoft: '#E4F6EC',
  warn: '#F0A422',
  warnSoft: '#FCF1DC',
  bad: '#E5484D',
  badSoft: '#FBE7E8',

  overlay: 'rgba(20, 18, 14, 0.55)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

/** Sombras suaves para dar profundidad premium a las tarjetas (iOS). */
export const shadow: Record<'card' | 'soft', ViewStyle> = {
  card:
    Platform.select({
      ios: {
        shadowColor: '#1A1712',
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      },
      default: { elevation: 3 },
    }) ?? {},
  soft:
    Platform.select({
      ios: {
        shadowColor: '#1A1712',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      default: { elevation: 2 },
    }) ?? {},
};

/**
 * Una sola fuente: la del sistema con pesos marcados.
 * TODO diseño: sustituir por una redondeada (p. ej. Nunito) vía expo-font.
 */
export const type = {
  hero: { fontSize: 32, fontWeight: '800', lineHeight: 38, color: colors.text } as TextStyle,
  title: { fontSize: 24, fontWeight: '800', lineHeight: 30, color: colors.text } as TextStyle,
  heading: { fontSize: 18, fontWeight: '700', lineHeight: 24, color: colors.text } as TextStyle,
  body: { fontSize: 16, fontWeight: '400', lineHeight: 23, color: colors.text } as TextStyle,
  bodyMuted: { fontSize: 16, fontWeight: '400', lineHeight: 23, color: colors.textMuted } as TextStyle,
  small: { fontSize: 13, fontWeight: '400', lineHeight: 18, color: colors.textMuted } as TextStyle,
  button: { fontSize: 17, fontWeight: '700', color: colors.textOnPrimary } as TextStyle,
} as const;

/** Color de semáforo para una nota 0-100. */
export function scoreColor(score: number): string {
  if (score >= 60) return colors.good;
  if (score >= 40) return colors.warn;
  return colors.bad;
}

/** Color de semáforo para una puntuación BCS 1-9 (4-5 es el rango ideal). */
export function bcsColor(bcs: number): string {
  if (bcs >= 3.5 && bcs <= 5.5) return colors.good;
  if (bcs < 2.5 || bcs > 7.5) return colors.bad;
  return colors.warn;
}
