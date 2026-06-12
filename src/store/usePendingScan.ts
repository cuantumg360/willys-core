import { create } from 'zustand';

import { AnalysisResult, ScannerId } from '@/services/analysis/types';

/**
 * Estado transitorio del escaneo en curso (NO persistido): fotos hechas
 * e inputs opcionales. Evita pasar URIs largas por parámetros de ruta.
 * lastResult guarda análisis con confianza "baja", que se muestran pero
 * no se guardan en el historial ni consumen escaneo gratis.
 */
interface PendingScanState {
  scannerId?: ScannerId;
  photoUris: string[];
  inputs: { raza?: string; edadAnios?: number; pesoKg?: number };
  lastResult?: AnalysisResult;

  start: (scannerId: ScannerId, inputs?: PendingScanState['inputs']) => void;
  addPhoto: (uri: string) => void;
  setLastResult: (result: AnalysisResult) => void;
  reset: () => void;
}

export const usePendingScan = create<PendingScanState>((set) => ({
  scannerId: undefined,
  photoUris: [],
  inputs: {},
  lastResult: undefined,

  start: (scannerId, inputs = {}) => set({ scannerId, photoUris: [], inputs }),
  addPhoto: (uri) => set((s) => ({ photoUris: [...s.photoUris, uri] })),
  setLastResult: (result) => set({ lastResult: result }),
  reset: () => set({ scannerId: undefined, photoUris: [], inputs: {} }),
}));
