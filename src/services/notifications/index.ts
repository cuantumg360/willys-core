import { Reminder } from '@/store/types';

/**
 * Avisos locales (recordatorios de salud). Carga diferida y protegida de
 * expo-notifications: si no está disponible (p. ej. limitaciones de Expo Go),
 * todo es no-op y la app no se rompe. En iOS los avisos locales funcionan
 * también en Expo Go.
 */
let N: ReturnType<typeof requireNotifications>;
function requireNotifications() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications');
  } catch {
    return undefined;
  }
}
N = requireNotifications();

let configured = false;

/** Configura cómo se muestran los avisos en primer plano (una vez). */
export function configureNotifications(): void {
  if (!N || configured) return;
  configured = true;
  try {
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    /* mejor esfuerzo */
  }
}

/** ¿Están concedidos los permisos de avisos? */
export async function notificationsGranted(): Promise<boolean> {
  if (!N) return false;
  try {
    const { status } = await N.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/** Pide permiso de avisos. Devuelve true si quedan concedidos. */
export async function requestNotifications(): Promise<boolean> {
  if (!N) return false;
  try {
    const { status } = await N.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/** Fecha del aviso: a las 9:00 del día de vencimiento. */
function triggerDate(iso: string): Date | null {
  const d = new Date(iso);
  d.setHours(9, 0, 0, 0);
  return d.getTime() > Date.now() ? d : null;
}

/**
 * Reprograma TODOS los avisos a partir de los recordatorios pendientes:
 * cancela los existentes y agenda uno por recordatorio futuro. Usa el id del
 * recordatorio como identificador para poder cancelarlo. No-op sin permiso.
 */
export async function rescheduleReminders(reminders: Reminder[], petName?: string): Promise<void> {
  if (!N || !(await notificationsGranted())) return;
  try {
    await N.cancelAllScheduledNotificationsAsync();
    const who = petName ? ` de ${petName}` : '';
    for (const r of reminders) {
      if (r.done) continue;
      const date = triggerDate(r.dueDate);
      if (!date) continue;
      await N.scheduleNotificationAsync({
        identifier: r.id,
        content: {
          title: `🐾 ${r.title}`,
          body: `Toca para ver los cuidados${who} de hoy.`,
        },
        trigger: { type: 'date', date },
      });
    }
  } catch {
    /* mejor esfuerzo */
  }
}
