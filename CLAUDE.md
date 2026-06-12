# Willy — notas para desarrollo

- App iOS Expo + TypeScript estricto + Expo Router. Rutas en `src/app/`.
- TODO el texto visible pasa por `t()` de `src/i18n` (claves tipadas en
  `es.ts`). No escribir strings de UI en las pantallas.
- Tema único en `src/theme` (sin dark mode). Colores semáforo:
  `colors.good/warn/bad` + helpers `bcsColor()` / `scoreColor()`.
- Los escáneres se definen SOLO en `src/features/scanners/registry.ts`;
  las pantallas de cámara/análisis/resultado son genéricas.
- Capas intercambiables por flags (`src/config/flags.ts`):
  análisis mock ↔ backend real, compras mock ↔ RevenueCat.
- Verificación: `npx tsc --noEmit` y `npm run lint`.
