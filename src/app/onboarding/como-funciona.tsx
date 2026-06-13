import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FadeIn } from '@/components/anim/FadeIn';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { t, TKey } from '@/i18n';
import { colors, radius, spacing, type } from '@/theme';

const STEPS: { emoji: string; titleKey: TKey; descKey: TKey }[] = [
  { emoji: '📸', titleKey: 'ob.how.step1.title', descKey: 'ob.how.step1.desc' },
  { emoji: '✨', titleKey: 'ob.how.step2.title', descKey: 'ob.how.step2.desc' },
  { emoji: '✅', titleKey: 'ob.how.step3.title', descKey: 'ob.how.step3.desc' },
];

/** Onboarding 2/5 — cómo funciona en 3 pasos. */
export default function OnboardingHow() {
  return (
    <Screen scroll={false}>
      <ProgressBar step={2} total={5} />
      <View style={styles.center}>
        <Text style={[type.title, { textAlign: 'center' }]}>{t('ob.how.title')}</Text>
        <View style={{ gap: spacing.md, width: '100%' }}>
          {STEPS.map((step, index) => (
            <FadeIn key={step.titleKey} delay={index * 120} style={styles.card}>
              <Text style={styles.emoji}>{step.emoji}</Text>
              <View style={styles.texts}>
                <Text style={type.heading}>{t(step.titleKey)}</Text>
                <Text style={type.bodyMuted}>{t(step.descKey)}</Text>
              </View>
            </FadeIn>
          ))}
        </View>
      </View>
      <Button label={t('common.continue')} onPress={() => router.push('/onboarding/tu-perro')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  emoji: { fontSize: 36 },
  texts: { flex: 1, gap: 2 },
});
