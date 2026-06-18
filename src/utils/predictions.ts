import { HealthRecord, Pet, ScanRecord } from '@/store/types';

export type PredictionLevel = 'info' | 'warn' | 'bad';

export interface Prediction {
  id: string;
  emoji: string;
  title: string;
  body: string;
  level: PredictionLevel;
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * Predicción de salud: detecta señales a partir de la evolución del peso y el
 * BCS (aumento acelerado de peso, posible sobrealimentación, posible reducción
 * de actividad, posible pérdida de masa muscular). Heurístico y orientativo.
 */
export function buildPredictions(
  pet: Pet | undefined,
  scans: ScanRecord[],
  records: HealthRecord[],
): Prediction[] {
  const name = pet?.nombre ?? 'tu perro';
  const out: Prediction[] = [];

  const weights = records
    .filter((r) => (!pet || r.petId === pet.id) && r.kind === 'peso' && typeof r.weightKg === 'number')
    .map((r) => ({ kg: r.weightKg as number, date: new Date(r.date).getTime() }))
    .sort((a, b) => a.date - b.date);

  const bcsScans = scans
    .filter((s) => (!pet || !s.petId || s.petId === pet.id) && s.result.tipo === 'condicion_corporal' && s.result.confianza !== 'baja')
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const lastBcs = bcsScans[0]?.result.puntuacion;

  let pctPerMonth = 0;
  if (weights.length >= 2) {
    const first = weights[0];
    const last = weights[weights.length - 1];
    const days = Math.max(1, (last.date - first.date) / DAY);
    if (first.kg > 0) pctPerMonth = ((last.kg - first.kg) / first.kg) * (30 / days) * 100;
  }

  const gaining = pctPerMonth >= 4;
  const fastGain = pctPerMonth >= 8;
  const losing = pctPerMonth <= -5;
  const pct = Math.abs(Math.round(pctPerMonth));

  if (gaining) {
    out.push({
      id: 'weight-gain',
      emoji: '📈',
      title: 'Aumento acelerado de peso',
      body: `${name} ha ganado ~${pct}% de peso al mes. A este ritmo, su condición corporal podría empeorar. Mide las raciones y revisa los premios.`,
      level: fastGain ? 'bad' : 'warn',
    });
    if (lastBcs !== undefined && lastBcs >= 6) {
      out.push({
        id: 'overfeeding',
        emoji: '🍖',
        title: 'Posible sobrealimentación',
        body: `Con sobrepeso y peso al alza, es probable que esté comiendo más de lo que necesita. Ajusta la ración a su peso objetivo y reparte en 2 tomas.`,
        level: 'warn',
      });
    }
    out.push({
      id: 'low-activity',
      emoji: '🐾',
      title: 'Posible reducción de actividad',
      body: `El aumento de peso suele acompañarse de menos ejercicio. Intenta sumar 10-15 min de paseo o juego al día y observa cómo evoluciona.`,
      level: 'info',
    });
  }

  if (losing) {
    const muscle = lastBcs === undefined || lastBcs <= 3;
    out.push({
      id: 'weight-loss',
      emoji: muscle ? '💪' : '📉',
      title: muscle ? 'Posible pérdida de masa muscular' : 'Pérdida de peso rápida',
      body: `${name} ha perdido ~${pct}% de peso al mes. Si no es una pérdida buscada, conviene vigilarla${muscle ? ' (puede haber pérdida de músculo)' : ''} y consultarlo con el veterinario.`,
      level: 'bad',
    });
  }

  if (out.length === 0) {
    const stable =
      lastBcs !== undefined && lastBcs >= 4 && lastBcs <= 5
        ? `${name} mantiene una condición corporal ideal y su peso es estable. ¡Buen trabajo! Sigue así.`
        : `Aún no hay suficientes datos para detectar tendencias. Pesa a ${name} y escanéalo cada pocas semanas para activar la predicción.`;
    out.push({
      id: 'stable',
      emoji: lastBcs !== undefined && lastBcs >= 4 && lastBcs <= 5 ? '✅' : 'ℹ️',
      title: lastBcs !== undefined && lastBcs >= 4 && lastBcs <= 5 ? 'Todo en orden' : 'Sin señales por ahora',
      body: stable,
      level: 'info',
    });
  }

  return out;
}
