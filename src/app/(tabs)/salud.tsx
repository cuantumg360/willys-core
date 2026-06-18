import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { PetAvatar } from '@/components/PetAvatar';
import { WeightChart } from '@/components/WeightChart';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { t } from '@/i18n';
import { HealthRecord, Reminder } from '@/store/types';
import { useAppStore, usePrimaryPet } from '@/store/useAppStore';
import { colors, gradients, radius, shadow, spacing, type } from '@/theme';
import { formatScanDate } from '@/utils/dates';
import { bcsPercentile, buildVetReport, daysUntil, deriveAlerts, reminderStatus } from '@/utils/health';
import { buildPredictions, PredictionLevel } from '@/utils/predictions';
import { buildVetReportHtml } from '@/utils/vetReportHtml';

const PRED_COLOR: Record<PredictionLevel, string> = {
  info: colors.primary,
  warn: colors.warn,
  bad: colors.bad,
};

const SEVERITY_COLOR = { bad: colors.bad, warn: colors.warn, info: colors.primary } as const;

const RECORD_EMOJI: Record<HealthRecord['kind'], string> = {
  peso: '⚖️',
  vacuna: '💉',
  desparasitacion: '🪱',
  tratamiento: '💊',
  visita: '🏥',
  nota: '📝',
};

const REMINDER_EMOJI: Record<Reminder['kind'], string> = {
  vacuna: '💉',
  desparasitacion: '🪱',
  alimentacion: '🍖',
  otro: '🔔',
};

export default function Salud() {
  const pet = usePrimaryPet();
  const scans = useAppStore((s) => s.scans);
  const healthRecords = useAppStore((s) => s.healthRecords);
  const reminders = useAppStore((s) => s.reminders);
  const updateReminder = useAppStore((s) => s.updateReminder);
  const removeReminder = useAppStore((s) => s.removeReminder);
  const removeHealthRecord = useAppStore((s) => s.removeHealthRecord);

  if (!pet) {
    return (
      <Screen floatingTabBar>
        <Text style={type.title}>{t('salud.titleNoPet')}</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🐾</Text>
          <Text style={[type.bodyMuted, { textAlign: 'center' }]}>{t('salud.empty')}</Text>
        </View>
      </Screen>
    );
  }

  const petRecords = healthRecords.filter((r) => r.petId === pet.id);
  const petReminders = reminders.filter((r) => r.petId === pet.id);
  const alerts = deriveAlerts(pet, scans, petReminders);
  const predictions = buildPredictions(pet, scans, healthRecords);

  const weightValues = petRecords
    .filter((r) => r.kind === 'peso' && typeof r.weightKg === 'number')
    .map((r) => r.weightKg as number)
    .reverse(); // petRecords está en orden descendente; lo pasamos a ascendente
  const currentWeight = pet.pesoKg ?? weightValues[weightValues.length - 1];

  const lastBcs = scans.find(
    (s) => s.petId === pet.id && s.result.tipo === 'condicion_corporal' && s.result.confianza !== 'baja',
  );
  const percentile = lastBcs ? bcsPercentile(lastBcs.result.puntuacion) : undefined;

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
    return colors.textMuted;
  };

  const shareReport = async () => {
    // Informe con marca en PDF (expo-print). Si algo falla, repartimos el
    // informe en texto plano como respaldo para no dejar al usuario sin nada.
    try {
      const html = buildVetReportHtml(pet, scans, healthRecords, reminders);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf',
          dialogTitle: t('salud.report.cta'),
        });
      } else {
        Share.share({ message: buildVetReport(pet, scans, healthRecords, reminders) });
      }
    } catch {
      Share.share({ message: buildVetReport(pet, scans, healthRecords, reminders) });
    }
  };

  const confirmDeleteReminder = (r: Reminder) =>
    Alert.alert(r.title, undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => removeReminder(r.id) },
    ]);

  const confirmDeleteRecord = (r: HealthRecord) =>
    Alert.alert(r.title, undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => removeHealthRecord(r.id) },
    ]);

  return (
    <Screen floatingTabBar>
      <LinearGradient colors={gradients.hero} style={styles.hero}>
        <PetAvatar uri={pet.fotoUri} size={48} />
        <Text style={[type.title, { flex: 1 }]}>{t('salud.title', { name: pet.nombre })}</Text>
      </LinearGradient>

      {/* Alertas */}
      {alerts.length > 0 && (
        <View style={[styles.card, { gap: spacing.sm }]}>
          <Text style={styles.cardTitle}>{t('salud.alerts')}</Text>
          {alerts.map((a) => (
            <View key={a.id} style={styles.alertRow}>
              <View style={[styles.alertDot, { backgroundColor: SEVERITY_COLOR[a.severity] }]} />
              <Text style={[type.body, { flex: 1 }]}>{a.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Peso */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('salud.weight.title')}</Text>
        {currentWeight ? (
          <>
            <View style={styles.weightRow}>
              <Text style={styles.weightValue}>{currentWeight}</Text>
              <Text style={styles.weightUnit}>kg</Text>
            </View>
            {weightValues.length >= 2 && (
              <WeightChart values={weightValues} caption={t('salud.weight.chartCaption')} />
            )}
          </>
        ) : (
          <Text style={type.bodyMuted}>{t('salud.weight.none')}</Text>
        )}
        <Button
          label={t('salud.weight.add')}
          variant="secondary"
          onPress={() => router.push('/registro?kind=peso')}
        />
      </View>

      {/* Predicción de salud */}
      <View style={styles.card}>
        <View style={{ gap: 2 }}>
          <Text style={styles.cardTitle}>{t('salud.prediction.title')}</Text>
          <Text style={type.small}>{t('salud.prediction.sub', { name: pet.nombre })}</Text>
        </View>
        {predictions.map((p) => (
          <View key={p.id} style={[styles.prediction, { borderLeftColor: PRED_COLOR[p.level] }]}>
            <Text style={styles.predEmoji}>{p.emoji}</Text>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[type.body, { fontWeight: '700' }]}>{p.title}</Text>
              <Text style={type.small}>{p.body}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Comparativa con perros similares */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('salud.compare.title')}</Text>
        {percentile !== undefined ? (
          <>
            <Text style={[type.heading, { color: colors.primary }]}>
              {t('salud.compare.text', { name: pet.nombre, pct: percentile })}
            </Text>
            <View style={styles.compareTrack}>
              <View style={[styles.compareFill, { width: `${percentile}%` }]} />
            </View>
            <Text style={type.small}>{t('salud.compare.note')}</Text>
          </>
        ) : (
          <Text style={type.bodyMuted}>{t('salud.compare.none', { name: pet.nombre })}</Text>
        )}
      </View>

      {/* Recordatorios */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('salud.reminders.title')}</Text>
          <Pressable onPress={() => router.push('/recordatorio')} hitSlop={8}>
            <Text style={styles.addLink}>＋ {t('common.add')}</Text>
          </Pressable>
        </View>
        {petReminders.length === 0 ? (
          <Text style={type.bodyMuted}>{t('salud.reminders.none')}</Text>
        ) : (
          petReminders.map((r) => (
            <Pressable
              key={r.id}
              style={styles.itemRow}
              onLongPress={() => confirmDeleteReminder(r)}
              onPress={() => updateReminder(r.id, { done: !r.done })}
            >
              <Text style={styles.itemEmoji}>{REMINDER_EMOJI[r.kind]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[type.body, { fontWeight: '700' }, r.done && styles.doneText]}>
                  {r.title}
                </Text>
                <Text style={[type.small, { color: dueColor(r.dueDate) }]}>
                  {r.done ? '✓' : dueLabel(r.dueDate)}
                </Text>
              </View>
              <View style={[styles.check, r.done && styles.checkOn]}>
                {r.done && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </Pressable>
          ))
        )}
      </View>

      {/* Historial médico */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('salud.history.title')}</Text>
          <Pressable onPress={() => router.push('/registro')} hitSlop={8}>
            <Text style={styles.addLink}>＋ {t('common.add')}</Text>
          </Pressable>
        </View>
        {petRecords.length === 0 ? (
          <Text style={type.bodyMuted}>{t('salud.history.none')}</Text>
        ) : (
          petRecords.map((r) => (
            <Pressable key={r.id} style={styles.itemRow} onLongPress={() => confirmDeleteRecord(r)}>
              <Text style={styles.itemEmoji}>{RECORD_EMOJI[r.kind]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[type.body, { fontWeight: '700' }]}>
                  {r.title}
                  {r.kind === 'peso' && r.weightKg ? ` · ${r.weightKg} kg` : ''}
                </Text>
                <Text style={type.small}>{formatScanDate(r.date)}</Text>
                {r.notes ? <Text style={type.small}>{r.notes}</Text> : null}
              </View>
            </Pressable>
          ))
        )}
      </View>

      {/* Informe veterinario */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('salud.report.title')}</Text>
        <Text style={type.bodyMuted}>{t('salud.report.desc', { name: pet.nombre })}</Text>
        <Button label={t('salud.report.cta')} onPress={shareReport} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyEmoji: { fontSize: 56 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { ...type.heading },
  addLink: { ...type.body, color: colors.primary, fontWeight: '700' },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  alertDot: { width: 10, height: 10, borderRadius: 5 },
  prediction: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
  },
  predEmoji: { fontSize: 22 },
  weightRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  weightValue: { fontSize: 40, fontWeight: '800', color: colors.text },
  weightUnit: { fontSize: 18, fontWeight: '700', color: colors.textMuted, marginBottom: 6 },
  compareTrack: {
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  compareFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  itemEmoji: { fontSize: 24 },
  doneText: { textDecorationLine: 'line-through', color: colors.textMuted },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkMark: { color: colors.textOnPrimary, fontWeight: '800', fontSize: 14 },
});
