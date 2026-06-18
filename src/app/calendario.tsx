import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FadeIn } from '@/components/anim/FadeIn';
import { PetAvatar } from '@/components/PetAvatar';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { t } from '@/i18n';
import { HealthRecord, Reminder } from '@/store/types';
import { useAppStore, usePrimaryPet } from '@/store/useAppStore';
import { colors, gradients, radius, shadow, spacing, type } from '@/theme';
import { formatScanDate } from '@/utils/dates';
import { daysUntil, reminderStatus } from '@/utils/health';

const REMINDER_EMOJI: Record<Reminder['kind'], string> = {
  vacuna: '💉',
  desparasitacion: '🪱',
  alimentacion: '🍖',
  otro: '🔔',
};
const RECORD_EMOJI: Record<HealthRecord['kind'], string> = {
  peso: '⚖️',
  vacuna: '💉',
  desparasitacion: '🪱',
  tratamiento: '💊',
  visita: '🏥',
  nota: '📝',
};

export default function Calendario() {
  const pet = usePrimaryPet();
  const reminders = useAppStore((s) => s.reminders);
  const records = useAppStore((s) => s.healthRecords);
  const updateReminder = useAppStore((s) => s.updateReminder);

  const petReminders = reminders
    .filter((r) => (!pet || r.petId === pet.id) && !r.done)
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
  const petRecords = records
    .filter((r) => !pet || r.petId === pet.id)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const dueLabel = (iso: string) => {
    const d = daysUntil(iso);
    if (d < 0) return t('due.overdue');
    if (d === 0) return t('due.today');
    if (d === 1) return t('due.oneDay');
    return t('due.inDays', { days: d });
  };
  const dueColor = (iso: string) => {
    const st = reminderStatus(iso);
    if (st === 'overdue') return colors.bad;
    if (st === 'today' || st === 'soon') return colors.warn;
    return colors.primary;
  };

  const empty = petReminders.length === 0 && petRecords.length === 0;

  return (
    <Screen>
      <LinearGradient colors={gradients.hero} style={styles.hero}>
        <PetAvatar uri={pet?.fotoUri} size={48} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={type.title}>{t('calendar.title')}</Text>
          <Text style={type.small}>{t('calendar.subtitle')}</Text>
        </View>
      </LinearGradient>

      <View style={styles.actions}>
        <Button label={t('calendar.addReminder')} onPress={() => router.push('/recordatorio')} style={{ flex: 1 }} />
        <Button
          label={t('calendar.addRecord')}
          variant="secondary"
          onPress={() => router.push('/registro')}
          style={{ flex: 1 }}
        />
      </View>

      {empty ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🗓️</Text>
          <Text style={[type.bodyMuted, { textAlign: 'center' }]}>{t('calendar.empty')}</Text>
        </View>
      ) : (
        <>
          {/* Próximos */}
          {petReminders.length > 0 && (
            <View style={{ marginTop: spacing.lg }}>
              <Text style={styles.sectionLabel}>{t('calendar.upcoming')}</Text>
              <View style={styles.timeline}>
                {petReminders.map((r, i) => (
                  <FadeIn key={r.id} delay={i * 50} offsetY={10} style={styles.row}>
                    <View style={styles.railCol}>
                      <View style={[styles.node, { backgroundColor: dueColor(r.dueDate) }]}>
                        <Text style={styles.nodeEmoji}>{REMINDER_EMOJI[r.kind]}</Text>
                      </View>
                      {i < petReminders.length - 1 && <View style={styles.rail} />}
                    </View>
                    <Pressable
                      style={styles.card}
                      onPress={() => updateReminder(r.id, { done: true })}
                    >
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={[type.body, { fontWeight: '700' }]}>{r.title}</Text>
                        <Text style={[type.small, { color: dueColor(r.dueDate) }]}>
                          {formatScanDate(r.dueDate)} · {dueLabel(r.dueDate)}
                        </Text>
                      </View>
                      <Text style={styles.markDone}>{t('calendar.done')}</Text>
                    </Pressable>
                  </FadeIn>
                ))}
              </View>
            </View>
          )}

          {/* Historial */}
          {petRecords.length > 0 && (
            <View style={{ marginTop: spacing.lg }}>
              <Text style={styles.sectionLabel}>{t('calendar.history')}</Text>
              <View style={styles.timeline}>
                {petRecords.map((r, i) => (
                  <FadeIn key={r.id} delay={i * 40} offsetY={10} style={styles.row}>
                    <View style={styles.railCol}>
                      <View style={[styles.node, styles.nodePast]}>
                        <Text style={styles.nodeEmoji}>{RECORD_EMOJI[r.kind]}</Text>
                      </View>
                      {i < petRecords.length - 1 && <View style={styles.rail} />}
                    </View>
                    <View style={styles.card}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={[type.body, { fontWeight: '700' }]}>
                          {r.title}
                          {r.kind === 'peso' && r.weightKg ? ` · ${r.weightKg} kg` : ''}
                        </Text>
                        <Text style={type.small}>{formatScanDate(r.date)}</Text>
                        {r.notes ? <Text style={type.small}>{r.notes}</Text> : null}
                      </View>
                    </View>
                  </FadeIn>
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const NODE = 46;
const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingTop: spacing.xl },
  emptyEmoji: { fontSize: 56 },
  sectionLabel: { ...type.heading, marginBottom: spacing.md },
  timeline: { width: '100%' },
  row: { flexDirection: 'row', gap: spacing.md },
  railCol: { alignItems: 'center', width: NODE },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  nodePast: { backgroundColor: colors.surfaceMuted },
  nodeEmoji: { fontSize: 20 },
  rail: { flex: 1, width: 2.5, backgroundColor: colors.border, marginVertical: 4 },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  markDone: { ...type.small, fontWeight: '800', color: colors.primary },
});
