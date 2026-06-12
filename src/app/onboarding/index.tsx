import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { t } from '@/i18n';
import { colors, radius, spacing, type } from '@/theme';

/** Onboarding 1/5 — hook emocional. */
export default function OnboardingHook() {
  return (
    <Screen scroll={false}>
      <ProgressBar step={1} total={5} />
      <View style={styles.center}>
        <Text style={styles.emoji}>🐶</Text>
        <View style={styles.statCard}>
          <Text style={styles.stat}>{t('ob.hook.stat')}</Text>
          <Text style={[type.bodyMuted, { textAlign: 'center' }]}>{t('ob.hook.statCaption')}</Text>
        </View>
        <Text style={[type.hero, styles.title]}>{t('ob.hook.title')}</Text>
        <Text style={[type.bodyMuted, styles.subtitle]}>{t('ob.hook.subtitle')}</Text>
      </View>
      <Button label={t('common.start')} onPress={() => router.push('/onboarding/como-funciona')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  emoji: { fontSize: 84 },
  statCard: {
    backgroundColor: colors.badSoft,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  stat: { fontSize: 26, fontWeight: '800', color: colors.bad },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center' },
});
