import { Platform } from 'react-native';
import { create } from 'zustand';

import { REVENUECAT_ANDROID_KEY, REVENUECAT_IOS_KEY } from '@/config/app';
import { flags } from '@/config/flags';
import { track } from '@/services/analytics';
import { PlanId, PurchasesProvider } from './types';

export type { PlanId } from './types';

/**
 * Capa de compras. Por defecto usa el mock (Expo Go). Con
 * `flags.useRealPurchases` activo y la API key de RevenueCat presente
 * (development build), usa el SDK real. El módulo nativo se carga de forma
 * diferida para no romper Expo Go.
 */
function realPurchasesEnabled(): boolean {
  const key = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
  return flags.useRealPurchases && Boolean(key);
}

let provider: PurchasesProvider | undefined;
function purchases(): PurchasesProvider {
  if (!provider) {
    if (realPurchasesEnabled()) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      provider = (require('./revenuecat') as typeof import('./revenuecat')).createRevenueCatPurchases();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      provider = (require('./mock') as typeof import('./mock')).createMockPurchases();
    }
  }
  return provider;
}

interface PurchasesState {
  premium: boolean;
  ready: boolean;
  purchasing: boolean;

  /** Inicializa el SDK y lee el estado premium (al arrancar). */
  init: () => Promise<void>;
  purchase: (plan: PlanId) => Promise<boolean>;
  restore: () => Promise<boolean>;
}

export const usePurchases = create<PurchasesState>((set) => ({
  premium: false,
  ready: false,
  purchasing: false,

  init: async () => {
    try {
      await purchases().configure();
      set({ premium: await purchases().isPremium(), ready: true });
      purchases().onChange?.((premium) => set({ premium }));
    } catch {
      set({ ready: true });
    }
  },

  purchase: async (plan) => {
    set({ purchasing: true });
    try {
      const premium = await purchases().purchase(plan);
      set({ premium, purchasing: false });
      if (premium) {
        track(plan === 'annual' ? 'trial_iniciado' : 'compra_realizada', { plan });
      }
      return premium;
    } catch {
      set({ purchasing: false });
      return false;
    }
  },

  restore: async () => {
    const premium = await purchases().restore();
    set({ premium });
    if (premium) track('compra_restaurada');
    return premium;
  },
}));
