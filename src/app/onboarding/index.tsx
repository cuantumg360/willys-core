import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FadeIn } from '@/components/anim/FadeIn';
import { Pop } from '@/components/anim/Pop';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { t } from '@/i18n';
import { colors, radius, shadow, spacing, type } from '@/theme';

/** Onboarding 1/5 — hook emocional. */
export default function OnboardingHook() {
  return (
    <Screen>
      <ProgressBar step={1} total={5} />
      <View style={styles.center}>
        <Pop style={styles.heroOuter}>
          <View style={styles.heroInner}>
            <Text style={styles.emoji}>🐶</Text>
          </View>
        </Pop>

        <FadeIn delay={180} style={styles.badge}>
          <Text style={styles.badgeText}>{t('ob.hook.badge')}</Text>
        </FadeIn>

        <FadeIn delay={300} style={styles.statCard}>
          <Text style={styles.stat}>{t('ob.hook.stat')}</Text>
          <Text style={[type.bodyMuted, { textAlign: 'center' }]}>{t('ob.hook.statCaption')}</Text>
        </FadeIn>

        <FadeIn delay={420} style={{ gap: spacing.sm }}>
          <Text style={[type.hero, styles.title]}>{t('ob.hook.title')}</Text>
          <Text style={[type.bodyMuted, styles.subtitle]}>{t('ob.hook.subtitle')}</Text>
        </FadeIn>
      </View>

      <Button label={t('common.start')} onPress={() => router.push('/onboarding/como-funciona')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  heroOuter: {
    width: 152,
    height: 152,
    borderRadius: 76,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInner: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  emoji: { fontSize: 62 },
  badge: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    ...shadow.soft,
  },
  badgeText: { fontSize: 13, fontWeight: '700', color: colors.primaryDark },
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
