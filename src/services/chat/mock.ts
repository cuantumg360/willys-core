import { ChatRequest } from './types';

const VET = 'Recuerda que esto es orientación general y no sustituye a tu veterinario.';

/**
 * Asistente simulado basado en reglas para Expo Go (sin backend). Da
 * respuestas útiles y prudentes según palabras clave. Con el backend real
 * configurado, se usa Claude en su lugar (ver api.ts).
 */
export async function reply(req: ChatRequest): Promise<string> {
  const name = req.pet?.nombre ?? 'tu perro';
  const last = (req.messages[req.messages.length - 1]?.text ?? '').toLowerCase();
  await new Promise((r) => setTimeout(r, 600));

  const has = (...w: string[]) => w.some((x) => last.includes(x));

  if (has('peso', 'adelgaz', 'gordo', 'sobrepeso', 'obes', 'bajar')) {
    return `Para ayudar a ${name} a alcanzar un peso sano: mide las raciones con taza o báscula (nada de "a ojo"), reduce premios y sustitúyelos por trozos de verdura segura (zanahoria), y aumenta poco a poco los paseos. Pésalo cada 2 semanas y repite el escáner para ver la evolución. ${VET}`;
  }
  if (has('comida', 'pienso', 'aliment', 'ración', 'racion', 'dieta', 'snack', 'premio')) {
    return `Busca un pienso cuyo primer ingrediente sea carne identificada (p. ej. "pollo"), con proteína de calidad y sin exceso de cereales o azúcares. Respeta la ración según su peso objetivo (no el actual si tiene sobrepeso) y reparte en 2 tomas. Usa el escáner de etiqueta para valorar cualquier producto. ${VET}`;
  }
  if (has('ejercicio', 'pasear', 'paseo', 'actividad', 'energía', 'energia', 'jugar')) {
    return `Como referencia, un perro adulto sano necesita entre 30 y 60 min de actividad al día, repartida en 2-3 paseos, ajustando según raza y edad. Combina paseo, olfateo y juego. Si nota mucho cansancio o le cuesta respirar, baja el ritmo. ${VET}`;
  }
  if (has('vacuna', 'desparasit', 'pulga', 'garrapata', 'veterinario', 'revisión', 'revision')) {
    return `Mantén al día el calendario: vacunación anual (o según tu veterinario), desparasitación interna cada 3 meses y externa (pulgas/garrapatas) mensual en temporada. Apúntalo en Recordatorios para no olvidarlo. ${VET}`;
  }
  if (has('edad', 'años', 'anos', 'viejo', 'mayor', 'cachorro', 'senior')) {
    return `La edad cambia sus necesidades: los cachorros necesitan más tomas y vigilancia del crecimiento; los seniors, menos calorías, articulaciones cuidadas y revisiones más frecuentes. Cuéntame su edad y te oriento mejor. ${VET}`;
  }
  if (has('raza', 'tamaño', 'tamano')) {
    return `La raza influye en el peso ideal, la energía y los riesgos de salud. Si me dices la raza de ${name}, te doy pautas más concretas de peso y ejercicio. ${VET}`;
  }
  if (has('hola', 'buenas', 'ayuda', 'puedes')) {
    return `¡Claro! Puedo orientarte sobre el peso de ${name}, su alimentación, ejercicio, rutinas de cuidado y cómo interpretar sus escáneres. ¿Qué te preocupa?`;
  }
  return `Buena pregunta sobre ${name}. Cuéntame un poco más (peso, raza, qué come o qué has notado) y te doy pautas concretas sobre alimentación, ejercicio o cuidados. ${VET}`;
}
