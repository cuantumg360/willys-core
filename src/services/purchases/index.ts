import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { track } from '@/services/analytics';

/**
 * Capa de compras. Fase 1: mock persistido para construir y probar el
 * gating. Fase 3: sustituir las funciones marcadas por react-native-purchases
 * (RevenueCat) manteniendo esta misma interfaz — el resto de la app solo
 * conoce `premium` y estas funciones, nunca el SDK.
 *
 * Mapeo RevenueCat previsto:
 *   entitlement "premium"  ←  semanal 4,99 € | anual 29,99 € (trial 3 días)
 *                             | lifetime fundador 24,99 € (oculto por flag)
 */
export type PlanId = 'weekly' | 'annual' | 'lifetime';

interface PurchasesState {
  premium: boolean;
  purchase: (plan: PlanId) => Promise<void>;
  restore: () => Promise<boolean>;
}

export const usePurchases = create<PurchasesState>()(
  persist(
    (set, get) => ({
      premium: false,

      // Fase 3: Purchases.purchasePackage(...) y leer entitlements.active.premium
      purchase: async (plan) => {
        track(plan === 'annual' ? 'trial_iniciado' : 'compra_realizada', { plan });
        set({ premium: true });
      },

      // Fase 3: Purchases.restorePurchases()
      restore: async () => {
        const restored = get().premium;
        if (restored) track('compra_restaurada');
        return restored;
      },
    }),
    { name: 'willy-purchases-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
