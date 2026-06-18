// @ts-nocheck — Este archivo es código Deno (se ejecuta en Supabase, NO en la
// app). VS Code lo revisaría con las reglas de la app y marcaría falsos errores
// ("Cannot find name 'Deno'", "npm:..."); Deno lo valida y ejecuta sin problema.
//
// Supabase Edge Function (Deno) — motor de análisis con IA de visión.
//
// La API key de Anthropic vive SOLO aquí (variable de entorno del servidor),
// NUNCA en este archivo ni en la app. La clave se pone con `supabase secrets
// set` (se escribe en la terminal, no se guarda en el código). Despliegue y
// configuración: ver backend/README.md.

import Anthropic from 'npm:@anthropic-ai/sdk@^0.69.0';

// Modelo de visión. Sonnet 4.6: excelente para esto y ~2x más barato que Opus
// (clave para el margen de una app de consumo). Cambia a 'claude-opus-4-8' si
// quieres la máxima capacidad a más coste.
const MODEL = 'claude-sonnet-4-6';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `Eres el motor de análisis de una app de salud para perros. Recibes 1-2 fotos y datos opcionales del perro (nombre, raza, edad, y peso conocido si lo indica el dueño).

Responde SIEMPRE en español neutro (válido para España y Latinoamérica), tono cercano pero serio.

REGLAS DE SEGURIDAD (no negociables):
- PROHIBIDO diagnosticar enfermedades, recetar medicamentos, dosis o dietas médicas.
- "recomendaciones": máximo 3, siempre generales (hábitos, raciones medidas, ejercicio, consultar al veterinario). Nunca médicas.
- Si la imagen no es válida (no se ve un perro completo / no se lee la etiqueta), devuelve confianza "baja", puntuacion en el mínimo y una explicación pidiendo repetir la foto con instrucciones concretas.
- Si detectas algo preocupante (obesidad severa, delgadez extrema, ingrediente peligroso), pon requiere_veterinario = true.

ESCÁNER "condicion_corporal":
- "puntuacion" = escala BCS 1-9 evaluada a partir de la silueta (vista cenital y de perfil): cintura, abdomen recogido, costillas.
- Categorías: muy delgado (1-2) / delgado (3) / ideal (4-5) / sobrepeso (6-7) / obesidad (8-9).
- PESO (peso_estimado_kg): si el dueño indica un peso conocido, DEVUÉLVELO TAL CUAL (es la fuente fiable: tú no puedes pesar al perro desde una foto). Si NO hay peso conocido, estima un rango realista a partir del peso típico de su raza ajustado por el BCS, y NUNCA propongas un peso que contradiga el tamaño evidente del perro; en ese caso baja la "confianza". Estimar kilos exactos desde una foto no es fiable: trátalo como orientativo.

ESCÁNER "etiqueta":
- "puntuacion" = nota de calidad 0-100. Categorías: excelente (80-100) / buena (60-79) / mejorable (40-59) / mala (0-39).
- "detalles": los 3-5 ingredientes más relevantes (positivos y negativos), una frase cada uno.`;

// Esquema de salida estructurada (debe coincidir con AnalysisResult del cliente).
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    tipo: { type: 'string', enum: ['condicion_corporal', 'etiqueta', 'toxicidad'] },
    puntuacion: { type: 'number' },
    categoria: { type: 'string' },
    titulo_resultado: { type: 'string' },
    explicacion: { type: 'string' },
    detalles: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          nombre: { type: 'string' },
          tipo: { type: 'string', enum: ['positivo', 'negativo', 'neutro'] },
          nota: { type: 'string' },
        },
        required: ['nombre', 'tipo', 'nota'],
      },
    },
    recomendaciones: { type: 'array', items: { type: 'string' } },
    confianza: { type: 'string', enum: ['alta', 'media', 'baja'] },
    requiere_veterinario: { type: 'boolean' },
    peso_estimado_kg: { type: ['number', 'null'] },
  },
  required: [
    'tipo',
    'puntuacion',
    'categoria',
    'titulo_resultado',
    'explicacion',
    'detalles',
    'recomendaciones',
    'confianza',
    'requiere_veterinario',
    'peso_estimado_kg',
  ],
};

interface AnalyzeBody {
  scannerId: 'condicion_corporal' | 'etiqueta' | 'toxicidad';
  images: string[];
  pet?: { nombre?: string; raza?: string; edadAnios?: number; pesoKg?: number };
}

function petContext(pet: AnalyzeBody['pet']): string {
  if (!pet) return 'Sin datos del perro.';
  const parts = [
    pet.nombre ? `Nombre: ${pet.nombre}` : null,
    pet.raza ? `Raza: ${pet.raza}` : null,
    pet.edadAnios ? `Edad: ${pet.edadAnios} años` : null,
    pet.pesoKg ? `Peso conocido (indicado por el dueño): ${pet.pesoKg} kg` : 'Peso conocido: no indicado',
  ].filter(Boolean);
  return parts.join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: cors });
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY no configurada' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  let body: AnalyzeBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const { scannerId, images, pet } = body;
  if (!scannerId || !Array.isArray(images) || images.length === 0) {
    return new Response(JSON.stringify({ error: 'Faltan scannerId o images' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const client = new Anthropic({ apiKey });

  const imageBlocks = images.slice(0, 2).map((data) => ({
    type: 'image' as const,
    source: { type: 'base64' as const, media_type: 'image/jpeg' as const, data },
  }));

  const userText =
    `Tipo de análisis: ${scannerId}.\n` +
    `${petContext(pet)}\n\n` +
    `Analiza la(s) foto(s) y responde con el JSON del esquema. Asegúrate de que "tipo" sea "${scannerId}".`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: [...imageBlocks, { type: 'text', text: userText }] }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const json = textBlock && 'text' in textBlock ? JSON.parse(textBlock.text) : null;
    if (!json) throw new Error('La IA no devolvió JSON');

    // Si el dueño indica un peso conocido, esa es la fuente fiable.
    if (scannerId === 'condicion_corporal' && pet?.pesoKg) {
      json.peso_estimado_kg = pet.pesoKg;
    }

    return new Response(JSON.stringify(json), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 502,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
