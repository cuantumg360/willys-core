# Guía: activar los pagos reales (RevenueCat) y probarlos en el iPhone

La app ya tiene RevenueCat integrado, pero **desactivado por defecto** (usa
el mock, por eso funciona en Expo Go). RevenueCat es un módulo nativo: **no
funciona en Expo Go**, necesitas un *development build* (se compila en la
nube con EAS, sin Mac). Sigue estos pasos en orden.

## 0. Lo que necesitas

- Cuenta de **Apple Developer Program** (99 €/año).
- Cuenta gratis de **Expo** (https://expo.dev) y la **anon key** ya configurada si usas Supabase.
- Cuenta gratis de **RevenueCat** (https://revenuecat.com).

## 1. App Store Connect — crear la app y los productos

1. En https://appstoreconnect.apple.com crea la app (bundle id
   `com.willyapp.willy`, el de `app.json`).
2. Ve a **Suscripciones** y crea un **grupo de suscripción** (p. ej. "Willy Premium").
3. Crea los productos dentro del grupo:
   - **Semanal** — 4,99 € — id de producto: `guau_weekly`
   - **Anual** — 39,99 € — id: `guau_annual` — añade una **oferta
     introductoria** de **3 días gratis** (free trial). (En el paywall se
     muestra como "0,77 €/semana" para que se perciba más barato.)
   - **Lifetime fundador** — compra única (no suscripción) 24,99 € — id:
     `guau_lifetime` (créalo como *Non-Consumable* en "Compras dentro de la app").
4. Rellena precios por país (Apple ofrece tiers regionalizados automáticos
   para LatAm) y los metadatos mínimos. Disponibilidad: todos los países
   hispanohablantes.

## 2. RevenueCat — conectar productos y entitlement

1. Crea un proyecto y añade tu app de **App Store** (te pedirá el bundle id
   y una *App-Specific Shared Secret* de App Store Connect).
2. En **Entitlements**, crea uno con identificador exactamente **`premium`**.
3. En **Products**, importa/añade los tres productos (`guau_weekly`,
   `guau_annual`, `guau_lifetime`) y **adjúntalos al entitlement `premium`**.
4. En **Offerings**, crea la oferta `default` con tres **packages** cuyos
   identificadores sean **`weekly`**, **`annual`** y **`lifetime`** (la app
   busca esos nombres; ver `src/services/purchases/types.ts`).
5. En **API Keys**, copia la **Public app-specific API key de iOS**.

## 3. Conectar la app

1. Copia `.env.example` a `.env` (si no lo tienes) y rellena:
   ```
   EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxx
   ```
2. Activa el flag en `src/config/flags.ts`:
   ```ts
   useRealPurchases: true,
   ```
   (Con el flag activo **y** la key presente, la app usa RevenueCat; si falta
   cualquiera de los dos, sigue con el mock.)

## 4. Compilar el development build (sin Mac)

```bash
npm install -g eas-cli
eas login
eas build:configure        # solo la primera vez (crea el projectId)
eas build --profile development --platform ios
```

- EAS te guiará para crear las **credenciales de firma** (necesita tu cuenta
  de Apple Developer). Deja que las gestione él.
- Al terminar, te da un enlace/QR para **instalar la app en tu iPhone**
  (build interno). Ábrelo desde el iPhone e instálalo.
- Arranca el servidor con `npx expo start --dev-client` y abre la app
  instalada (ya no Expo Go).

> Nota: pon las claves (`EXPO_PUBLIC_REVENUECAT_IOS_KEY`,
> `EXPO_PUBLIC_SUPABASE_*`) en el `env` del perfil `development` de
> `eas.json` o como *EAS secrets*, para que el build las incluya.

## 5. Probar las compras (sandbox)

1. En App Store Connect > **Usuarios y acceso > Sandbox**, crea un
   **tester de sandbox** (un email que no uses como Apple ID real).
2. En el iPhone: Ajustes > App Store > inicia sesión en sandbox con ese
   tester (o te lo pedirá al comprar).
3. En la app, abre el paywall y compra: verás el diálogo real de Apple en
   modo sandbox (no se cobra). Comprueba que el acceso premium se activa y
   que "Restaurar compras" funciona.

## Notas

- La *public API key* de RevenueCat **no es secreta**; es de cliente.
- Mientras el flag esté en `false` (o falte la key), todo sigue en mock y
  puedes seguir desarrollando en Expo Go con normalidad.
- *Sign in with Apple*: no es obligatorio porque el login es por email; si
  añades login social, Apple exigirá ofrecer también "Iniciar sesión con
  Apple".
