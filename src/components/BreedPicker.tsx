import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BREEDS } from '@/data/breeds';
import { t } from '@/i18n';
import { colors, radius, spacing, type } from '@/theme';

interface Props {
  label?: string;
  value?: string;
  onChange: (breed: string) => void;
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Selector de raza con buscador ("Mestizo" siempre primero). */
export function BreedPicker({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return BREEDS;
    return BREEDS.filter((breed) => normalize(breed).includes(q));
  }, [query]);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={value ? styles.value : styles.placeholder}>
          {value ?? t('ob.pet.breedPlaceholder')}
        </Text>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={[styles.modal, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.header}>
            <TextInput
              style={styles.search}
              placeholder={t('common.search')}
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            <Pressable onPress={() => setOpen(false)} hitSlop={12}>
              <Text style={styles.cancel}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
          <FlatList
            data={results}
            keyExtractor={(breed) => breed}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  onChange(item);
                  setQuery('');
                  setOpen(false);
                }}
              >
                <Text style={[type.body, item === value && styles.selected]}>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { ...type.small, fontWeight: '600', color: colors.textMuted },
  trigger: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  value: { fontSize: 17, color: colors.text },
  placeholder: { fontSize: 17, color: colors.textMuted },
  modal: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  search: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 17,
    color: colors.text,
  },
  cancel: { ...type.body, color: colors.primary, fontWeight: '600' },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  selected: { color: colors.primary, fontWeight: '700' },
});
