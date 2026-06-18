# Backend

## Cuentas con login (Supabase Auth)

La app ya tiene login integrado (`src/services/auth`). En desarrollo usa un
**mock local** (registro/login/cerrar sesión funcionan en Expo Go sin
backend). Para activar las cuentas **reales**:

1. Crea un proyecto gratis en https://supabase.com.
2. En *Project Settings > API* copia la **Project URL** y la **anon key**.
3. En la raíz del proyecto, copia `.env.example` a `.env` y rellena:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```
4. Reinicia con `npx expo start --clear`. La app detecta las credenciales y
   pasa automáticamente del mock a Supabase (registro, login, sesión).

Notas:
- La *anon key* es **pública** por diseño; la seguridad real la dan las
  *Row Level Security policies* del proyecto. Nunca pongas la *service role
  key* en el cliente.
- **Eliminar la cuenta de verdad** (no solo cerrar sesión) requiere una Edge
  Function con la *service role key* que llame a `auth.admin.deleteUser()`.
  El cliente solo cierra sesión y borra los datos locales.
- *Sign in with Apple*: si más adelante añades login social, Apple exige
  ofrecer también "Iniciar sesión con Apple" (necesita development build,
  no funciona en Expo Go).

## Sincronización en la nube (mascotas y escaneos)

Ya está integrada (`src/services/sync`). En cuanto Supabase está configurado
y hay sesión, las mascotas y los escaneos se replican en la nube y aparecen
en cualquier dispositivo donde inicies sesión. Para activarla:

1. Configura Supabase (sección anterior).
2. En el **SQL Editor** de Supabase, pega y ejecuta `backend/supabase.sql`
   (crea las tablas `pets` y `scans` con sus RLS policies).
3. Listo. Cómo funciona:
   - Al iniciar sesión: si la cuenta ya tiene datos, se descargan; si está
     vacía pero hay datos locales (creados en el onboarding), se suben.
   - Cada cambio (añadir/editar/borrar mascota, nuevo escaneo) se replica al
     instante.
   - La app sigue funcionando offline (los datos viven también en local);
     al reconectar se vuelve a leer el estado real.

Pendiente (siguiente refinamiento):
- **Fotos**: hoy `foto_uri` y las fotos de escaneo son rutas locales del
  dispositivo, así que la **info** (nombre, raza, resultados) se sincroniza
  pero las **imágenes** no se ven en otros dispositivos. Para sincronizarlas
  hay que subirlas a **Supabase Storage** al elegirlas y guardar su URL
  pública en lugar de la ruta local.

# Backend de análisis de imágenes (IA de visión real)

Ya implementado como **Supabase Edge Function** en
`supabase/functions/analyze/index.ts` (carpeta estándar de Supabase, en la
raíz del proyecto). Hace de proxy entre la app y
**Claude Sonnet 4.6 con visión** (Anthropic; equilibrio calidad/coste — se
cambia en la constante `MODEL` de la función). **La API key del modelo vive solo
aquí, nunca en el cliente**, y la salida es JSON garantizado por esquema
("structured outputs").

## Desplegar (una vez)

1. Instala la CLI de Supabase y enlaza tu proyecto:
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref TU_PROJECT_REF
   ```
2. Guarda la API key de Anthropic como secreto del servidor (NO en la app):
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Despliega la función (`--use-api` compila en la nube, sin Docker):
   ```bash
   supabase functions deploy analyze --no-verify-jwt --use-api
   ```
   > El proyecto Supabase debe estar **activo** (no pausado): si está en
   > pausa, reactívalo en el panel antes de desplegar.
4. En la app, en `.env`, apunta al backend (el cliente añade `/analyze`):
   ```
   EXPO_PUBLIC_BACKEND_URL=https://TU_PROJECT_REF.supabase.co/functions/v1
   ```
5. Activa el flag en `src/config/flags.ts`:
   ```ts
   useRealAnalysis: true,
   ```
   (Con el flag activo y la URL presente, la app usa el backend real; si falta
   cualquiera de los dos, sigue con el mock — Expo Go sigue funcionando.)

## Sobre el peso

Estimar **kilos exactos desde una foto no es fiable**, ni siquiera con IA real.
Lo medicamente sólido es el **BCS** (condición corporal), que sí se evalúa bien
desde la silueta. Por eso: si el dueño indica el **peso real**, el sistema lo
usa tal cual (fuente fiable); si no, da un rango orientativo por raza + BCS,
claramente etiquetado. La app anima a introducir el peso real en el escáner.

## Contrato con la app

## Contrato con la app

`POST /analyze`

```jsonc
// Request (la app ya comprime a máx. 1024px y JPEG 0.7 — ver src/utils/image.ts)
{
  "scannerId": "condicion_corporal" | "etiqueta",
  "images": ["<jpeg base64>", "..."],
  "pet": { "nombre": "...", "raza": "...", "edadAnios": 4, "pesoKg": 12.5 }
}

// Response: exactamente el esquema validado en src/services/analysis/types.ts
{
  "tipo": "condicion_corporal",
  "puntuacion": 6,
  "categoria": "Sobrepeso",
  "titulo_resultado": "Le sobran unos kilitos",
  "explicacion": "...",
  "detalles": [{ "nombre": "...", "tipo": "positivo|negativo|neutro", "nota": "..." }],
  "recomendaciones": ["..."],
  "confianza": "alta|media|baja",
  "requiere_veterinario": false
}
```

## Proveedor de IA

Configurable por variable de entorno (`AI_PROVIDER=anthropic|openai`,
`AI_API_KEY=...`) para poder cambiar de proveedor sin tocar la app.
API de Anthropic: https://docs.claude.com/en/api/overview

## Reglas del system prompt (borrador)

```
Eres el motor de análisis de una app de salud para perros. Recibes fotos y
datos opcionales del perro (nombre, raza, edad, peso).

RESPONDE EXCLUSIVAMENTE CON JSON VÁLIDO según el esquema indicado, sin
texto adicional ni markdown.

Reglas:
- Español neutro, válido para España y Latinoamérica. Tono cercano pero serio.
- PROHIBIDO diagnosticar enfermedades, recetar medicamentos, dosis o dietas médicas.
- "recomendaciones": máximo 3, siempre generales (hábitos, raciones medidas,
  ejercicio, consultar al veterinario). Nunca médicas.
- Si la imagen no es válida (no se ve un perro completo / no se lee la
  etiqueta): confianza "baja", puntuación 0 y explicación pidiendo repetir
  la foto con instrucciones concretas.
- Si detectas algo preocupante (obesidad severa, delgadez extrema,
  ingrediente peligroso): requiere_veterinario = true.

Escáner "condicion_corporal": puntuacion = escala BCS 1-9.
Categorías: muy delgado (1-2) / delgado (3) / ideal (4-5) / sobrepeso (6-7) / obesidad (8-9).

Escáner "etiqueta": puntuacion = nota de calidad 0-100.
Categorías: excelente (80-100) / buena (60-79) / mejorable (40-59) / mala (0-39).
"detalles": los 3-5 ingredientes más relevantes (positivos y negativos), una frase cada uno.
```

## Pendiente al implementar

- Validar el JSON del modelo con el MISMO validador que el cliente
  (copiar/compartir `validateAnalysisResult`).
- No persistir imágenes: procesar y descartar (declarado en la política
  de privacidad y en los nutrition labels de App Store).
- Rate limiting básico por dispositivo (cabecera con app user id anónimo
  de RevenueCat) para proteger el coste de API.
