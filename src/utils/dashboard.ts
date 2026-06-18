import { TKey } from '@/i18n';
import { HealthRecord, Pet, Reminder, ScanRecord } from '@/store/types';

import { bcsPercentile, daysUntil, deriveAlerts } from './health';

export type Tone = 'good' | 'warn' | 'bad' | 'neutral';

export interface DashItem {
  id: string;
  emoji: string;
  labelKey: TKey;
  value: string;
  sub?: string;
  tone: Tone;
  /** Ruta a la que navega la tarjeta (opcional). */
  route?: string;
}

const round1 = (n: number) => Math.round(n * 2) / 2;

/** Peso "ideal" estimado a partir del peso actual y el BCS (orientativo). */
function idealWeight(current: number, bcs: number): number {
  if (bcs >= 4 && bcs <= 5) return round1(current);
  if (bcs > 5) return round1(current / (1 + (bcs - 5) * 0.1));
  return round1(current * (1 + (4 - bcs) * 0.08));
}

/**
 * Construye las tarjetas de resumen del panel principal (estilo MyFitnessPal):
 * peso, objetivo, estado corporal, nutrición, riesgo de obesidad, próximas
 * vacunas, alertas y evaluación mensual. Todo derivado de los datos locales.
 */
export function buildDashboard(
  pet: Pet | undefined,
  scans: ScanRecord[],
  records: HealthRecord[],
  reminders: Reminder[],
): DashItem[] {
  const petScans = scans.filter((s) => !pet || !s.petId || s.petId === pet.id);
  const petRecords = records.filter((r) => !pet || r.petId === pet.id);
  const petReminders = reminders.filter((r) => !pet || r.petId === pet.id);

  const bcsScans = petScans.filter(
    (s) => s.result.tipo === 'condicion_corporal' && s.result.confianza !== 'baja',
  );
  const lastBcs = bcsScans[0]?.result;
  const lastFood = petScans.find(
    (s) => s.result.tipo === 'etiqueta' && s.result.confianza !== 'baja',
  )?.result;

  const weightRecord = petRecords.find((r) => r.kind === 'peso' && typeof r.weightKg === 'number');
  const currentWeight = pet?.pesoKg ?? weightRecord?.weightKg;

  const none = '—';

  // 1. Peso actual
  const weight: DashItem = {
    id: 'weight',
    emoji: '⚖️',
    labelKey: 'home.dash.weight',
    value: currentWeight ? `${currentWeight} kg` : none,
    tone: 'neutral',
    route: '/salud',
  };

  // 2. Objetivo
  const goalValue =
    currentWeight && lastBcs ? `${idealWeight(currentWeight, lastBcs.puntuacion)} kg` : none;
  const goal: DashItem = {
    id: 'goal',
    emoji: '🎯',
    labelKey: 'home.dash.goal',
    value: goalValue,
    sub: currentWeight && lastBcs && goalValue !== `${currentWeight} kg` ? undefined : undefined,
    tone: 'neutral',
    route: '/salud',
  };

  // 3. Estado corporal (BCS)
  const bcsTone = (bcs: number): Tone =>
    bcs >= 4 && bcs <= 5 ? 'good' : bcs < 2.5 || bcs > 7.5 ? 'bad' : 'warn';
  const body: DashItem = {
    id: 'body',
    emoji: '🐕',
    labelKey: 'home.dash.body',
    value: lastBcs ? lastBcs.categoria : none,
    sub: lastBcs ? `BCS ${lastBcs.puntuacion}/9` : undefined,
    tone: lastBcs ? bcsTone(lastBcs.puntuacion) : 'neutral',
    route: lastBcs ? '/historial' : undefined,
  };

  // 4. Calidad nutricional
  const foodTone = (score: number): Tone => (score >= 60 ? 'good' : score >= 40 ? 'warn' : 'bad');
  const nutrition: DashItem = {
    id: 'nutrition',
    emoji: '🥣',
    labelKey: 'home.dash.nutrition',
    value: lastFood ? lastFood.categoria : none,
    sub: lastFood ? `${Math.round(lastFood.puntuacion)}/100` : undefined,
    tone: lastFood ? foodTone(lastFood.puntuacion) : 'neutral',
    route: '/historial',
  };

  // 5. Riesgo de obesidad
  let obesityVal: TKey = 'home.dash.noData';
  let obesityTone: Tone = 'neutral';
  if (lastBcs) {
    if (lastBcs.puntuacion <= 5) {
      obesityVal = 'home.dash.risk.low';
      obesityTone = 'good';
    } else if (lastBcs.puntuacion <= 7) {
      obesityVal = 'home.dash.risk.mid';
      obesityTone = 'warn';
    } else {
      obesityVal = 'home.dash.risk.high';
      obesityTone = 'bad';
    }
  }
  const obesity: DashItem = {
    id: 'obesity',
    emoji: '📊',
    labelKey: 'home.dash.obesity',
    value: obesityVal, // se traduce en la pantalla
    tone: obesityTone,
    route: lastBcs ? '/salud' : undefined,
    sub: lastBcs ? `${bcsPercentile(lastBcs.puntuacion)}%` : undefined,
  };

  // 6. Próximas vacunas
  const upcomingVac = petReminders
    .filter((r) => r.kind === 'vacuna' && !r.done)
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))[0];
  let vacValue = 'home.dash.noVaccine';
  let vacSub: string | undefined;
  let vacTone: Tone = 'neutral';
  if (upcomingVac) {
    const d = daysUntil(upcomingVac.dueDate);
    vacValue = upcomingVac.title;
    vacSub = d < 0 ? 'home.dash.overdue' : d === 0 ? 'home.dash.today' : `${d} d`;
    vacTone = d < 0 ? 'bad' : d <= 14 ? 'warn' : 'good';
  }
  const vaccine: DashItem = {
    id: 'vaccine',
    emoji: '💉',
    labelKey: 'home.dash.vaccine',
    value: vacValue,
    sub: vacSub,
    tone: vacTone,
    route: '/salud',
  };

  // 7. Alertas importantes
  const alerts = deriveAlerts(pet, scans, petReminders);
  const alertsItem: DashItem = {
    id: 'alerts',
    emoji: alerts.length ? '⚠️' : '✅',
    labelKey: 'home.dash.alerts',
    value: alerts.length ? `${alerts.length}` : 'home.dash.allGood',
    sub: alerts.length ? alerts[0].text : undefined,
    tone: alerts.length ? 'bad' : 'good',
    route: '/salud',
  };

  // 8. Evaluación mensual (tendencia del BCS)
  let monthlyVal: TKey = 'home.dash.noData';
  let monthlyTone: Tone = 'neutral';
  if (bcsScans.length >= 2) {
    const now = bcsScans[0].result.puntuacion;
    const prev = bcsScans[1].result.puntuacion;
    const dNow = Math.abs(now - 4.5);
    const dPrev = Math.abs(prev - 4.5);
    if (Math.abs(dNow - dPrev) < 0.4) {
      monthlyVal = 'home.dash.trend.same';
      monthlyTone = 'neutral';
    } else if (dNow < dPrev) {
      monthlyVal = 'home.dash.trend.better';
      monthlyTone = 'good';
    } else {
      monthlyVal = 'home.dash.trend.worse';
      monthlyTone = 'warn';
    }
  } else if (lastBcs) {
    monthlyVal = bcsTone(lastBcs.puntuacion) === 'good' ? 'home.dash.trend.same' : 'home.dash.trend.worse';
    monthlyTone = bcsTone(lastBcs.puntuacion) === 'good' ? 'good' : 'warn';
  }
  const monthly: DashItem = {
    id: 'monthly',
    emoji: '📅',
    labelKey: 'home.dash.monthly',
    value: monthlyVal,
    tone: monthlyTone,
    route: '/historial',
  };

  return [weight, goal, body, nutrition, obesity, vaccine, alertsItem, monthly];
}

/** Claves i18n que algunos valores usan (para traducir en la pantalla). */
export const DASH_VALUE_KEYS = new Set<string>([
  'home.dash.noData',
  'home.dash.allGood',
  'home.dash.noVaccine',
  'home.dash.risk.low',
  'home.dash.risk.mid',
  'home.dash.risk.high',
  'home.dash.trend.same',
  'home.dash.trend.better',
  'home.dash.trend.worse',
]);

/** Claves i18n usadas en el "sub" (relativos). */
export const DASH_SUB_KEYS = new Set<string>(['home.dash.overdue', 'home.dash.today']);
