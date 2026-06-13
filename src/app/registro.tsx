import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ChipSelect } from '@/components/ui/ChipSelect';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { t, TKey } from '@/i18n';
import { HealthRecordKind } from '@/store/types';
import { usePrimaryPet, useAppStore } from '@/store/useAppStore';
import { spacing, type } from '@/theme';
import { newId } from '@/utils/id';

const KINDS: HealthRecordKind[] = ['peso', 'vacuna', 'desparasitacion', 'tratamiento', 'visita', 'nota'];
const DATES: { value: string; offsetDays: number; labelKey: TKey }[] = [
  { value: 'today', offsetDays: 0, labelKey: 'date.today' },
  { value: 'yesterday', offsetDays: -1, labelKey: 'date.yesterday' },
  { value: 'weekAgo', offsetDays: -7, labelKey: 'date.weekAgo' },
  { value: 'monthAgo', offsetDays: -30, labelKey: 'date.monthAgo' },
];

/** Alta de un registro del historial médico (modal). */
export default function NuevoRegistro() {
  const { kind: kindParam } = useLocalSearchParams<{ kind?: string }>();
  const pet = usePrimaryPet();
  const addHealthRecord = useAppStore((s) => s.addHealthRecord);

  const [kind, setKind] = useState<HealthRecordKind>(
    KINDS.includes(kindParam as HealthRecordKind) ? (kindParam as HealthRecordKind) : 'vacuna',
  );
  const [title, setTitle] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [dateKey, setDateKey] = useState('today');

  if (!pet) {
    router.back();
    return null;
  }

  const isWeight = kind === 'peso';
  const canSave = isWeight ? Boolean(weight.trim()) : true;

  const save = () => {
    const offset = DATES.find((d) => d.value === dateKey)?.offsetDays ?? 0;
    const date = new Date();
    date.setDate(date.getDate() + offset);
    addHealthRecord({
      id: newId(),
      petId: pet.id,
      kind,
      title: title.trim() || t(`kind.${kind}`),
      date: date.toISOString(),
      notes: notes.trim() || undefined,
      weightKg: isWeight ? Number(weight.replace(',', '.')) || undefined : undefined,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <Text style={[type.title, { textAlign: 'center' }]}>{t('record.newTitle')}</Text>

        <View style={styles.form}>
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.label}>{t('record.kind')}</Text>
            <ChipSelect
              options={KINDS.map((k) => ({ value: k, label: t(`kind.${k}`) }))}
              value={kind}
              onChange={setKind}
            />
          </View>

          {isWeight ? (
            <Field
              label={t('record.weight')}
              placeholder={t('scan.intro.weightPlaceholder')}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
            />
          ) : (
            <Field
              label={t('record.titleLabel')}
              placeholder={t('record.titlePlaceholder')}
              value={title}
              onChangeText={setTitle}
            />
          )}

          <View style={{ gap: spacing.sm }}>
            <Text style={styles.label}>{t('date.label')}</Text>
            <ChipSelect
              options={DATES.map((d) => ({ value: d.value, label: t(d.labelKey) }))}
              value={dateKey}
              onChange={setDateKey}
            />
          </View>

          <Field
            label={t('record.notes', { optional: t('common.optional') })}
            placeholder=""
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
          <Button label={t('common.save')} onPress={save} disabled={!canSave} />
          <Button label={t('common.cancel')} variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg, marginTop: spacing.lg },
  label: { ...type.small, fontWeight: '600' },
});
