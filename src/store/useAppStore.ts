import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { FREE_SCANS_TOTAL } from '@/config/limits';
import { Pet, ScanRecord } from './types';

/**
 * Estado persistente de la app (AsyncStorage, todo local al dispositivo:
 * sin cuentas de usuario en el MVP). Un único store mantiene la
 * hidratación simple; si crece, separar en slices.
 */
interface AppState {
  hydrated: boolean;
  onboardingDone: boolean;
  pets: Pet[];
  scans: ScanRecord[];
  /** Escaneos gratis consumidos (freemium duro: 3 en total). */
  freeScansUsed: number;

  setOnboardingDone: () => void;
  addPet: (pet: Pet) => void;
  updatePet: (id: string, changes: Partial<Pet>) => void;
  addScan: (scan: ScanRecord) => void;
  consumeFreeScan: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hydrated: false,
      onboardingDone: false,
      pets: [],
      scans: [],
      freeScansUsed: 0,

      setOnboardingDone: () => set({ onboardingDone: true }),
      addPet: (pet) => set((s) => ({ pets: [...s.pets, pet] })),
      updatePet: (id, changes) =>
        set((s) => ({ pets: s.pets.map((p) => (p.id === id ? { ...p, ...changes } : p)) })),
      addScan: (scan) => set((s) => ({ scans: [scan, ...s.scans] })),
      consumeFreeScan: () => set((s) => ({ freeScansUsed: s.freeScansUsed + 1 })),
    }),
    {
      name: 'willy-app-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _hydrated, ...rest }) => rest,
      onRehydrateStorage: () => () => {
        useAppStore.setState({ hydrated: true });
      },
    },
  ),
);

/** Escaneos gratis restantes (0 si ya se agotaron). */
export function freeScansLeft(freeScansUsed: number): number {
  return Math.max(0, FREE_SCANS_TOTAL - freeScansUsed);
}

/** Mascota principal (la primera; multi-perro es premium). */
export function usePrimaryPet(): Pet | undefined {
  return useAppStore((s) => s.pets[0]);
}
