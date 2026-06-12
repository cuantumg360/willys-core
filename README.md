# Willy 🐾 — escáner de salud para perros con IA

App iOS (React Native + Expo) tipo "Yuka + Cal AI de las mascotas": el
usuario hace una foto y recibe un veredicto claro y accionable. Idioma
único al lanzar: español (i18n preparada para inglés en 2027).

> El nombre **Willy** es provisional: se cambia en `src/config/app.ts`
> y en `app.json` (`name`).

## Estado: Fase 1 ✅ (estructura + pantallas con datos mock)

Funciona de punta a punta con un motor de análisis **mock** (sin coste de
API): onboarding → escáneres con cámara guiada → animación de análisis →
resultado → historial → paywall con gating freemium real (3 escaneos
gratis en total).

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Estructura, pantallas, mock, gating freemium | ✅ Hecha |
| 2 | Backend (Edge Function/Worker) + IA de visión real | ⬜ `backend/README.md` |
| 3 | RevenueCat real (3 productos) + PostHog | ⬜ Interfaz lista en `src/services/purchases` |
| 4 | EAS Build/Submit a App Store Connect | ⬜ `eas.json` listo, faltan IDs |

## Ejecutar en desarrollo

```bash
npm install
npx expo start
```

Escanea el QR con **Expo Go** (iPhone). No hace falta Mac.

Para probar flujos repetidos: borra la app de Expo Go o limpia el
almacenamiento (el onboarding y el contador de escaneos persisten en el
dispositivo).

## Arquitectura

```
src/
├── app/                  # Rutas (Expo Router)
│   ├── onboarding/       # 5 pasos: hook → cómo funciona → tu perro → cámara → paywall
│   ├── (tabs)/           # inicio · historial · ajustes
│   ├── escaner/[id]/     # intro → cámara guiada → analizando (genérico para todo escáner)
│   ├── resultado/[scanId]
│   ├── paywall.tsx       # único paywall (onboarding, límite y ajustes)
│   └── legal/            # términos y privacidad (placeholders TODO LEGAL)
├── features/scanners/    # REGISTRO de escáneres: añadir uno nuevo = una entrada aquí
├── services/
│   ├── analysis/         # contrato JSON + validación + mock + cliente backend (fase 2)
│   ├── purchases/        # interfaz de compras (mock → RevenueCat en fase 3)
│   └── analytics/        # eventos tipados (consola → PostHog)
├── store/                # zustand + AsyncStorage (todo local, sin cuentas)
├── i18n/                 # t() tipado; es.ts único diccionario por ahora
├── theme/                # colores/espaciado/tipografía (sin dark mode en MVP)
└── config/               # APP_NAME, feature flags, límites freemium
```

Decisiones clave:

- **Escáneres como config**: las pantallas de cámara/análisis/resultado no
  conocen escáneres concretos; leen `features/scanners/registry.ts`.
  El escáner de toxicidad (fase 2) y modo gato (fase 3) son nuevas entradas.
- **La API key de IA nunca va en el cliente**: `services/analysis/api.ts`
  llama a un backend propio (contrato en `backend/README.md`).
- **Gating por entitlement**: la app solo conoce `premium: boolean` de
  `services/purchases`; en fase 3 se enchufa `react-native-purchases` sin
  tocar pantallas.
- **Confianza "baja"** (foto no válida): se pide repetir la foto, no se
  guarda en historial ni consume escaneo gratis.

## Pasos manuales pendientes (resumen; detalle al llegar a cada fase)

1. **Apple Developer Program** (99 €/año) con tu Apple ID.
2. **App Store Connect**: crear la app con el bundle id definitivo
   (ahora `com.willyapp.willy` en `app.json` — cámbialo si quieres otro),
   y los 3 productos de suscripción/compra.
3. **RevenueCat**: proyecto + entitlement `premium` + productos
   (semanal 4,99 € · anual 29,99 € con trial 3 días · lifetime 24,99 € oculto).
4. **EAS**: `npx eas init` (crea el projectId), rellenar `ascAppId` y
   `appleTeamId` en `eas.json`, luego `eas build -p ios` y `eas submit`.
5. **Backend**: desplegar la Edge Function/Worker (fase 2) y definir
   `EXPO_PUBLIC_BACKEND_URL` en `eas.json`.
6. **Legal**: sustituir los placeholders de `src/app/legal/` por textos
   revisados, y declarar los nutrition labels de privacidad en App Store
   Connect (las fotos se procesan y no se almacenan).
