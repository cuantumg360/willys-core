import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { FadeIn } from '@/components/anim/FadeIn';
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
      <FadeIn style={styles.center} offsetY={18} duration={560}>
        <Text style={styles.emoji}>🐶</Text>
        <FadeIn delay={200} style={styles.statCard}>
          <Text style={styles.stat}>{t('ob.hook.stat')}</Text>
          <Text style={[type.bodyMuted, { textAlign: 'center' }]}>{t('ob.hook.statCaption')}</Text>
        </FadeIn>
        <Text style={[type.hero, styles.title]}>{t('ob.hook.title')}</Text>
        <Text style={[type.bodyMuted, styles.subtitle]}>{t('ob.hook.subtitle')}</Text>
      </FadeIn>
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
