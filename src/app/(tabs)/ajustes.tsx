import { router } from 'expo-router';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { PetAvatar } from '@/components/PetAvatar';
import { Screen } from '@/components/ui/Screen';
import { APP_VERSION, SUPPORT_EMAIL } from '@/config/app';
import { t } from '@/i18n';
import { usePurchases } from '@/services/purchases';
import { usePrimaryPet } from '@/store/useAppStore';
import { colors, radius, spacing, type } from '@/theme';

export default function Settings() {
  const pet = usePrimaryPet();
  const premium = usePurchases((s) => s.premium);
  const restore = usePurchases((s) => s.restore);

  const doRestore = async () => {
    const restored = await restore();
    Alert.alert(restored ? t('settings.sub.active') : t('settings.sub.inactive'));
  };

  return (
    <Screen>
      <Text style={type.title}>{t('settings.title')}</Text>

      <Section title={t('settings.pet.section')}>
        <Pressable style={styles.petRow} onPress={() => router.push('/mascota')}>
          <PetAvatar uri={pet?.fotoUri} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={[type.body, { fontWeight: '700' }]}>
              {pet?.nombre ?? t('pet.edit.newTitle')}
            </Text>
            {pet?.raza ? <Text style={type.small}>{pet.raza}</Text> : null}
          </View>
          <Text style={type.small}>{t('settings.pet.edit')}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        {!premium && <Text style={[type.small, styles.note]}>{t('settings.pet.addLocked')}</Text>}
      </Section>

      <Section title={t('settings.sub.section')}>
        <Row
          label={premium ? `✅ ${t('settings.sub.active')}` : `⭐ ${t('settings.sub.inactive')}`}
          onPress={() => {
            if (!premium) router.push('/paywall?context=ajustes');
          }}
        />
        <Row label={t('settings.sub.restore')} onPress={doRestore} />
      </Section>

      <Section title={t('settings.legal.section')}>
        <Row label={t('settings.legal.terms')} onPress={() => router.push('/legal/terminos')} />
        <Row label={t('settings.legal.privacy')} onPress={() => router.push('/legal/privacidad')} />
        <Row
          label={t('settings.contact')}
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
        />
      </Section>

      <Text style={[type.small, styles.version]}>
        {t('settings.version', { version: APP_VERSION })}
      </Text>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[type.small, styles.sectionTitle]}>{title.toUpperCase()}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({ label, detail, onPress }: { label: string; detail?: string; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={[type.body, { flex: 1 }]}>{label}</Text>
      {detail ? <Text style={type.small}>{detail}</Text> : null}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xl, gap: spacing.sm },
  sectionTitle: { fontWeight: '700', letterSpacing: 0.6 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  chevron: { fontSize: 22, color: colors.textMuted },
  note: { paddingHorizontal: spacing.xs },
  version: { textAlign: 'center', marginTop: spacing.xl },
});
