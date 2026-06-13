/**
 * Analytics mínimo y tipado. Fase 1: log en consola (dev). Para activar
 * PostHog (free tier): instalar posthog-react-native y sustituir el
 * cuerpo de track() — los nombres de evento ya quedan fijados aquí.
 */
export type AnalyticsEvent =
  | 'app_abierta'
  | 'cuenta_creada'
  | 'sesion_iniciada'
  | 'sesion_cerrada'
  | 'cuenta_eliminada'
  | 'onboarding_completado'
  | 'escaneo_iniciado'
  | 'escaneo_completado'
  | 'escaneo_fallido'
  | 'resultado_compartido'
  | 'paywall_visto'
  | 'paywall_cerrado'
  | 'trial_iniciado'
  | 'compra_realizada'
  | 'compra_restaurada';

export function track(event: AnalyticsEvent, props?: Record<string, string | number | boolean>) {
  if (__DEV__) {
    console.log(`[analytics] ${event}`, props ?? '');
  }
  // Fase 2/3: posthog.capture(event, props)
}
