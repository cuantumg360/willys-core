import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ChipSelect } from '@/components/ui/ChipSelect';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { t, TKey } from '@/i18n';
import { ReminderKind } from '@/store/types';
import { usePrimaryPet, useAppStore } from '@/store/useAppStore';
import { spacing, type } from '@/theme';
import { newId } from '@/utils/id';

const KINDS: ReminderKind[] = ['vacuna', 'desparasitacion', 'alimentacion', 'otro'];
const DATES: { value: string; offsetDays: number; labelKey: TKey }[] = [
  { value: 'inWeek', offsetDays: 7, labelKey: 'date.inWeek' },
  { value: 'inMonth', offsetDays: 30, labelKey: 'date.inMonth' },
  { value: 'in3Months', offsetDays: 90, labelKey: 'date.in3Months' },
  { value: 'in6Months', offsetDays: 180, labelKey: 'date.in6Months' },
  { value: 'inYear', offsetDays: 365, labelKey: 'date.inYear' },
];

/** Alta de un recordatorio de cuidado (modal). */
export default function NuevoRecordatorio() {
  const pet = usePrimaryPet();
  const addReminder = useAppStore((s) => s.addReminder);

  const [kind, setKind] = useState<ReminderKind>('vacuna');
  const [title, setTitle] = useState('');
  const [dateKey, setDateKey] = useState('inMonth');

  if (!pet) {
    router.back();
    return null;
  }

  const save = () => {
    const offset = DATES.find((d) => d.value === dateKey)?.offsetDays ?? 30;
    const due = new Date();
    due.setDate(due.getDate() + offset);
    addReminder({
      id: newId(),
      petId: pet.id,
      kind,
      title: title.trim() || t(`kind.${kind}`),
      dueDate: due.toISOString(),
      done: false,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <Text style={[type.title, { textAlign: 'center' }]}>{t('reminder.newTitle')}</Text>

        <View style={styles.form}>
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.label}>{t('record.kind')}</Text>
            <ChipSelect
              options={KINDS.map((k) => ({ value: k, label: t(`kind.${k}`) }))}
              value={kind}
              onChange={setKind}
            />
          </View>

          <Field
            label={t('record.titleLabel')}
            placeholder={t('reminder.titlePlaceholder')}
            value={title}
            onChangeText={setTitle}
          />

          <View style={{ gap: spacing.sm }}>
            <Text style={styles.label}>{t('date.label')}</Text>
            <ChipSelect
              options={DATES.map((d) => ({ value: d.value, label: t(d.labelKey) }))}
              value={dateKey}
              onChange={setDateKey}
            />
          </View>
        </View>

        <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
          <Button label={t('common.save')} onPress={save} />
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
