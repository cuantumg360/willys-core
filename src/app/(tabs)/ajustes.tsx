import { router } from 'expo-router';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { PetAvatar } from '@/components/PetAvatar';
import { Screen } from '@/components/ui/Screen';
import { APP_VERSION, SUPPORT_EMAIL } from '@/config/app';
import { MAX_PETS } from '@/config/limits';
import { t } from '@/i18n';
import { usePurchases } from '@/services/purchases';
import { cloud } from '@/services/sync';
import { useAppStore, usePrimaryPet } from '@/store/useAppStore';
import { useAuth } from '@/store/useAuth';
import { colors, radius, spacing, type } from '@/theme';

export default function Settings() {
  const pet = usePrimaryPet();
  const petCount = useAppStore((s) => s.pets.length);
  const resetAll = useAppStore((s) => s.resetAll);
  const premium = usePurchases((s) => s.premium);
  const restore = usePurchases((s) => s.restore);
  const resetPurchases = usePurchases((s) => s.reset);
  const userEmail = useAuth((s) => s.user?.email);
  const signOut = useAuth((s) => s.signOut);
  const deleteAccount = useAuth((s) => s.deleteAccount);

  const doRestore = async () => {
    const restored = await restore();
    Alert.alert(restored ? t('settings.sub.active') : t('settings.sub.inactive'));
  };

  const confirmSignOut = () => {
    Alert.alert(t('auth.signOutTitle'), t('auth.signOutBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.signOut'),
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  const confirmDeleteAccount = () => {
    Alert.alert(t('auth.deleteTitle'), t('auth.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.deleteAccount'),
        style: 'destructive',
        onPress: async () => {
          await deleteAccount();
          resetAll();
          router.replace('/');
        },
      },
    ]);
  };

  const confirmDeleteData = () => {
    Alert.alert(t('settings.account.deleteTitle'), t('settings.account.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.account.deleteCta'),
        style: 'destructive',
        onPress: async () => {
          await cloud.wipe();
          await resetPurchases();
          resetAll();
          router.replace('/onboarding');
        },
      },
    ]);
  };


  return (
    <Screen floatingTabBar>
      <Text style={type.title}>{t('settings.title')}</Text>

      <Section title={t('settings.pet.section')}>
        <Pressable style={styles.petRow} onPress={() => router.push('/mascotas')}>
          <PetAvatar uri={pet?.fotoUri} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={[type.body, { fontWeight: '700' }]}>
              {pet?.nombre ?? t('pet.edit.newTitle')}
            </Text>
            <Text style={type.small}>
              {t('settings.pet.count', { count: petCount, max: premium ? MAX_PETS : 1 })}
            </Text>
          </View>
          <Text style={type.small}>{t('settings.pet.manage')}</Text>
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

      <Section title={t('chat.title')}>
        <Row
          label={`🤖 ${t('chat.entry')}`}
          detail={premium ? undefined : '⭐'}
          onPress={() => router.push('/chat' as never)}
        />
      </Section>

      <Section title={t('community.title')}>
        <Row
          label={`💬 ${t('community.entry')}`}
          detail={premium ? undefined : '⭐'}
          onPress={() => router.push('/comunidad' as never)}
        />
      </Section>

      <Section title={t('settings.account.section')}>
        {userEmail ? (
          <>
            <View style={styles.row}>
              <Text style={styles.emailIcon}>👤</Text>
              <Text style={[type.body, { flex: 1 }]} numberOfLines={1}>
                {userEmail}
              </Text>
            </View>
            <Row label={t('auth.signOut')} onPress={confirmSignOut} />
            <Row label={t('auth.deleteAccount')} destructive onPress={confirmDeleteAccount} />
          </>
        ) : (
          <Row label={t('settings.account.login')} onPress={() => router.push('/auth')} />
        )}
      </Section>
      <Text style={[type.small, styles.syncNote]}>
        {cloud.enabled() ? t('settings.sync.cloud') : t('settings.sync.local')}
      </Text>

      <Section title={t('settings.data.section')}>
        <Row label={t('settings.account.deleteData')} destructive onPress={confirmDeleteData} />
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

function Row({
  label,
  detail,
  destructive,
  onPress,
}: {
  label: string;
  detail?: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={[type.body, { flex: 1 }, destructive && { color: colors.bad }]}>{label}</Text>
      {detail ? <Text style={type.small}>{detail}</Text> : null}
      {!destructive && <Text style={styles.chevron}>›</Text>}
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
  emailIcon: { fontSize: 18 },
  note: { paddingHorizontal: spacing.xs },
  syncNote: { paddingHorizontal: spacing.xs, marginTop: spacing.sm },
  version: { textAlign: 'center', marginTop: spacing.xl },
});
