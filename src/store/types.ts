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
