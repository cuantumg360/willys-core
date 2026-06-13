import AsyncStorage from '@react-native-async-storage/async-storage';

import { PurchasesProvider } from './types';

/**
 * Compras mock (desarrollo, sin SDK nativo). Persiste el estado premium en
 * el dispositivo para poder construir y probar todo el gating en Expo Go.
 * Cualquier "compra" concede premium al instante.
 */
const PREMIUM_KEY = 'willy-premium-mock-v1';

export function createMockPurchases(): PurchasesProvider {
  const grant = async () => {
    await AsyncStorage.setItem(PREMIUM_KEY, '1');
    return true;
  };

  return {
    async configure() {
      /* nada que inicializar en el mock */
    },
    async isPremium() {
      return (await AsyncStorage.getItem(PREMIUM_KEY)) === '1';
    },
    async purchase() {
      // Pequeña latencia para imitar el diálogo de compra del sistema.
      await new Promise((resolve) => setTimeout(resolve, 700));
      return grant();
    },
    async restore() {
      return (await AsyncStorage.getItem(PREMIUM_KEY)) === '1';
    },
  };
}
