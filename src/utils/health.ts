import { HealthRecord, Pet, Reminder, ScanRecord } from '@/store/types';

/**
 * Comparativa con perros similares. MOCK basado en el BCS (cuanto más cerca
 * del ideal 4-5, mejor percentil). Cuando exista el backend real, esto se
 * calculará contra la base de datos de miles de perros de su raza y edad.
 */
export function bcsPercentile(bcs: number): number {
  const distance = Math.abs(bcs - 4.5);
  return Math.min(96, Math.max(6, Math.round(95 - distance * 22)));
}

export type ReminderStatus = 'overdue' | 'today' | 'soon' | 'upcoming';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Días hasta el vencimiento (negativo si ya venció). */
export function daysUntil(iso: string): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const due = new Date(iso);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - start.getTime()) / DAY_MS);
}

export function reminderStatus(iso: string): ReminderStatus {
  const days = daysUntil(iso);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days <= 7) return 'soon';
  return 'upcoming';
}

export interface HealthAlert {
  id: string;
  severity: 'bad' | 'warn' | 'info';
  text: string;
}

/**
 * Deriva alertas de salud a partir de los recordatorios vencidos y del
 * último escaneo de condición corporal de la mascota activa.
 */
export function deriveAlerts(
  pet: Pet | undefined,
  scans: ScanRecord[],
  reminders: Reminder[],
): HealthAlert[] {
  if (!pet) return [];
  const alerts: HealthAlert[] = [];

  reminders
    .filter((r) => r.petId === pet.id && !r.done && reminderStatus(r.dueDate) === 'overdue')
    .forEach((r) =>
      alerts.push({ id: `rem-${r.id}`, severity: 'warn', text: `Pendiente: ${r.title}` }),
    );

  const lastBcs = scans.find(
    (s) => s.petId === pet.id && s.result.tipo === 'condicion_corporal' && s.result.confianza !== 'baja',
  );
  if (lastBcs) {
    if (lastBcs.result.requiere_veterinario) {
      alerts.push({
        id: `vet-${lastBcs.id}`,
        severity: 'bad',
        text: `Tu último escaneo de ${pet.nombre} recomienda visitar al veterinario.`,
      });
    } else if (lastBcs.result.puntuacion >= 6) {
      alerts.push({
        id: `bcs-${lastBcs.id}`,
        severity: 'warn',
        text: `${pet.nombre} está por encima de su peso ideal. Cuida sus raciones.`,
      });
    }
  }

  return alerts;
}

/** Genera el texto del informe veterinario a partir de los datos de la mascota. */
export function buildVetReport(
  pet: Pet,
  scans: ScanRecord[],
  records: HealthRecord[],
  reminders: Reminder[],
): string {
  const lines: string[] = [];
  lines.push(`INFORME DE SALUD — ${pet.nombre}`);
  lines.push(
    [pet.raza, pet.edadAnios ? `${pet.edadAnios} años` : null, pet.pesoKg ? `${pet.pesoKg} kg` : null]
      .filter(Boolean)
      .join(' · ') || 'Sin datos de perfil',
  );
  lines.push('');

  const lastBcs = scans.find((s) => s.petId === pet.id && s.result.tipo === 'condicion_corporal');
  if (lastBcs) {
    lines.push(`Condición corporal (BCS): ${lastBcs.result.puntuacion}/9 — ${lastBcs.result.categoria}`);
    if (lastBcs.result.peso_estimado_kg) {
      lines.push(`Peso estimado: ~${lastBcs.result.peso_estimado_kg} kg`);
    }
    lines.push('');
  }

  const petRecords = records.filter((r) => r.petId === pet.id);
  if (petRecords.length) {
    lines.push('HISTORIAL MÉDICO');
    petRecords
      .slice(0, 20)
      .forEach((r) => lines.push(`· ${r.date.slice(0, 10)} — ${r.title}${r.notes ? ` (${r.notes})` : ''}`));
    lines.push('');
  }

  const pending = reminders.filter((r) => r.petId === pet.id && !r.done);
  if (pending.length) {
    lines.push('PRÓXIMOS CUIDADOS');
    pending.forEach((r) => lines.push(`· ${r.dueDate.slice(0, 10)} — ${r.title}`));
    lines.push('');
  }

  lines.push('Generado con Willy 🐾 — no sustituye el criterio del veterinario.');
  return lines.join('\n');
}
