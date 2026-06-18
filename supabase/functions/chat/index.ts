// @ts-nocheck — Código Deno (se ejecuta en Supabase, NO en la app). VS Code lo
// marcaría con falsos errores ("Cannot find name 'Deno'", "npm:..."); Deno lo
// ejecuta sin problema.
//
// Supabase Edge Function (Deno) — Asistente IA conversacional para dueños de
// perros. La API key de Anthropic vive SOLO aquí (variable de entorno), nunca
// en la app. Configúrala con `supabase secrets set ANTHROPIC_API_KEY=...`.
// Despliegue: supabase functions deploy chat --no-verify-jwt --use-api

import Anthropic from 'npm:@anthropic-ai/sdk@^0.69.0';

const MODEL = 'claude-sonnet-4-6';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `Eres el asistente de cuidado de una app de salud para perros. Hablas con el dueño.

Responde SIEMPRE en español neutro (válido para España y Latinoamérica), tono cercano, claro y breve (máximo ~120 palabras salvo que pidan más detalle).

REGLAS DE SEGURIDAD (no negociables):
- NO diagnostiques enfermedades ni recetes medicamentos, dosis o dietas médicas concretas.
- Da orientación general de hábitos: peso, alimentación, ejercicio, higiene, rutinas y prevención.
- Ante síntomas, dolor, urgencias o dudas médicas, recomienda acudir al veterinario.
- Si te falta información (peso, raza, edad), pide ese dato para afinar.
- No inventes datos del perro: usa solo los que te den.

Cuando sea útil, termina con un recordatorio breve de que no sustituyes al veterinario.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY no configurada' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const { messages, pet } = body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Faltan messages' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const petLine = pet
    ? `Datos del perro: ${[
        pet.nombre && `nombre ${pet.nombre}`,
        pet.raza && `raza ${pet.raza}`,
        pet.edadAnios && `${pet.edadAnios} años`,
        pet.pesoKg && `${pet.pesoKg} kg`,
      ]
        .filter(Boolean)
        .join(', ')}.`
    : '';

  const history = messages.slice(-12).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.text ?? '',
  }));

  try {
    const anthropic = new Anthropic({ apiKey });
    const completion = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: petLine ? `${SYSTEM_PROMPT}\n\n${petLine}` : SYSTEM_PROMPT,
      messages: history,
    });
    const reply = completion.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n')
      .trim();
    return new Response(JSON.stringify({ reply }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
