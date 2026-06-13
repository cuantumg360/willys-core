import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { FREE_SCANS_TOTAL } from '@/config/limits';
import { cloud } from '@/services/sync';
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
  /** Mascota seleccionada (sobre la que se escanea y a la que saluda la app). */
  activePetId?: string;
  scans: ScanRecord[];
  /** Escaneos gratis consumidos (freemium duro: 3 en total). */
  freeScansUsed: number;

  setOnboardingDone: () => void;
  addPet: (pet: Pet) => void;
  updatePet: (id: string, changes: Partial<Pet>) => void;
  removePet: (id: string) => void;
  setActivePet: (id: string) => void;
  addScan: (scan: ScanRecord) => void;
  consumeFreeScan: () => void;
  /** Carga mascotas y escaneos descargados de la nube (reemplaza lo local). */
  loadFromCloud: (pets: Pet[], scans: ScanRecord[]) => void;
  /** Borra todos los datos locales (mascotas, escaneos, progreso). */
  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hydrated: false,
      onboardingDone: false,
      pets: [],
      activePetId: undefined,
      scans: [],
      freeScansUsed: 0,

      setOnboardingDone: () => set({ onboardingDone: true }),
      // Al añadir una mascota pasa a ser la activa. Se replica en la nube.
      addPet: (pet) => {
        set((s) => ({ pets: [...s.pets, pet], activePetId: pet.id }));
        cloud.upsertPet(pet);
      },
      updatePet: (id, changes) => {
        set((s) => ({ pets: s.pets.map((p) => (p.id === id ? { ...p, ...changes } : p)) }));
        const updated = useAppStore.getState().pets.find((p) => p.id === id);
        if (updated) cloud.upsertPet(updated);
      },
      removePet: (id) => {
        set((s) => {
          const pets = s.pets.filter((p) => p.id !== id);
          return {
            pets,
            // Sus escaneos se eliminan con ella; la activa pasa a la primera restante.
            scans: s.scans.filter((scan) => scan.petId !== id),
            activePetId: s.activePetId === id ? pets[0]?.id : s.activePetId,
          };
        });
        cloud.deletePet(id);
      },
      setActivePet: (id) => set({ activePetId: id }),
      addScan: (scan) => {
        set((s) => ({ scans: [scan, ...s.scans] }));
        cloud.upsertScan(scan);
      },
      consumeFreeScan: () => set((s) => ({ freeScansUsed: s.freeScansUsed + 1 })),
      loadFromCloud: (pets, scans) =>
        set((s) => ({
          pets,
          scans,
          activePetId: pets.some((p) => p.id === s.activePetId) ? s.activePetId : pets[0]?.id,
        })),
      resetAll: () =>
        set({
          onboardingDone: false,
          pets: [],
          activePetId: undefined,
          scans: [],
          freeScansUsed: 0,
        }),
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

/** Devuelve la mascota activa de un estado (activa elegida o la primera). */
export function selectActivePet(state: AppState): Pet | undefined {
  return state.pets.find((p) => p.id === state.activePetId) ?? state.pets[0];
}

/** Mascota activa (sobre la que se escanea y a la que saluda la app). */
export function usePrimaryPet(): Pet | undefined {
  return useAppStore(selectActivePet);
}
