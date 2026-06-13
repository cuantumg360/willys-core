/**
 * Contrato de compras. La app solo conoce `premium` y estas funciones,
 * nunca el SDK: en Expo Go se usa el mock y, en un development build con
 * RevenueCat configurado, el proveedor real, sin tocar pantallas.
 */
export type PlanId = 'weekly' | 'annual' | 'lifetime';

/** Entitlement de RevenueCat que concede el acceso premium. */
export const ENTITLEMENT = 'premium';

/**
 * Identificadores de los planes en RevenueCat. Deben coincidir con los
 * "package identifiers" / productos configurados en el dashboard.
 */
export const PLAN_PACKAGE: Record<PlanId, string> = {
  weekly: 'weekly',
  annual: 'annual',
  lifetime: 'lifetime',
};

export interface PurchasesProvider {
  /** Inicializa el SDK (una vez al arrancar). */
  configure(): Promise<void>;
  /** ¿El usuario tiene el entitlement premium activo? */
  isPremium(): Promise<boolean>;
  /** Compra un plan. Devuelve si el usuario queda premium. */
  purchase(plan: PlanId): Promise<boolean>;
  /** Restaura compras anteriores. Devuelve si el usuario queda premium. */
  restore(): Promise<boolean>;
  /** Suscripción a cambios de estado premium (opcional). */
  onChange?(callback: (premium: boolean) => void): () => void;
}
