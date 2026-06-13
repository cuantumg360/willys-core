import { Platform } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

import { REVENUECAT_ANDROID_KEY, REVENUECAT_IOS_KEY } from '@/config/app';
import { ENTITLEMENT, PLAN_PACKAGE, PlanId, PurchasesProvider } from './types';

/**
 * Compras reales con RevenueCat. Es un módulo NATIVO: no existe en Expo Go,
 * solo en un development build. Por eso este archivo se carga de forma
 * diferida (solo cuando el flag `useRealPurchases` está activo).
 */
function apiKey(): string {
  return Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
}

async function findPackage(plan: PlanId): Promise<PurchasesPackage | undefined> {
  const offerings = await Purchases.getOfferings();
  const packages = offerings.current?.availablePackages ?? [];
  const target = PLAN_PACKAGE[plan];
  return (
    packages.find((p) => p.identifier === target) ??
    packages.find((p) => p.product.identifier.includes(target))
  );
}

export function createRevenueCatPurchases(): PurchasesProvider {
  return {
    async configure() {
      Purchases.configure({ apiKey: apiKey() });
    },

    async isPremium() {
      const info = await Purchases.getCustomerInfo();
      return typeof info.entitlements.active[ENTITLEMENT] !== 'undefined';
    },

    async purchase(plan) {
      const pkg = await findPackage(plan);
      if (!pkg) return false;
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return typeof customerInfo.entitlements.active[ENTITLEMENT] !== 'undefined';
    },

    async restore() {
      const info = await Purchases.restorePurchases();
      return typeof info.entitlements.active[ENTITLEMENT] !== 'undefined';
    },

    onChange(callback) {
      const listener = (info: Awaited<ReturnType<typeof Purchases.getCustomerInfo>>) => {
        callback(typeof info.entitlements.active[ENTITLEMENT] !== 'undefined');
      };
      Purchases.addCustomerInfoUpdateListener(listener);
      return () => Purchases.removeCustomerInfoUpdateListener(listener);
    },
  };
}
