/**
 * Feature flags. Todo lo que no es imprescindible para el MVP vive detrás
 * de uno de estos flags. En producción se podrán mover a un servicio
 * remoto (RevenueCat Offerings metadata o similar) sin tocar el código.
 */
export const flags = {
  /** Fase 2: enviar las fotos al backend real en lugar del motor mock. */
  useRealAnalysis: false,
  /** Fase 3: usar RevenueCat real en lugar del mock de compras. */
  useRealPurchases: false,
  /** Producto "Lifetime fundador" en el paywall (campaña de reservas, 50 plazas). */
  lifetimeFounder: true,
  /** Fase 2: escáner de toxicidad (planta/alimento/objeto). */
  toxicityScanner: false,
  /** Fase 3: modo gato. */
  catMode: false,
} as const;

export type FlagName = keyof typeof flags;
