import { AnalysisResult, ScannerId } from '@/services/analysis/types';

export interface Pet {
  id: string;
  nombre: string;
  raza?: string;
  edadAnios?: number;
  pesoKg?: number;
  fotoUri?: string;
}

export interface ScanRecord {
  id: string;
  scannerId: ScannerId;
  petId?: string;
  /** ISO 8601. */
  createdAt: string;
  /** URIs locales de las fotos (solo en el dispositivo). */
  photoUris: string[];
  result: AnalysisResult;
}

/** Tipos de evento del historial médico. */
export type HealthRecordKind =
  | 'peso'
  | 'vacuna'
  | 'desparasitacion'
  | 'tratamiento'
  | 'visita'
  | 'nota';

export interface HealthRecord {
  id: string;
  petId: string;
  kind: HealthRecordKind;
  /** Título corto del evento (p. ej. "Vacuna polivalente"). */
  title: string;
  /** Fecha del evento, ISO 8601. */
  date: string;
  notes?: string;
  /** Solo para kind 'peso'. */
  weightKg?: number;
}

/** Tipos de recordatorio de cuidado. */
export type ReminderKind = 'vacuna' | 'desparasitacion' | 'alimentacion' | 'otro';

export interface Reminder {
  id: string;
  petId: string;
  kind: ReminderKind;
  title: string;
  /** Fecha de vencimiento, ISO 8601. */
  dueDate: string;
  done: boolean;
}

