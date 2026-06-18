import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FadeIn } from '@/components/anim/FadeIn';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { t, TKey } from '@/i18n';
import { colors, gradients, radius, shadow, spacing, type } from '@/theme';

const STEPS: { emoji: string; titleKey: TKey; descKey: TKey }[] = [
  { emoji: '📸', titleKey: 'ob.how.step1.title', descKey: 'ob.how.step1.desc' },
  { emoji: '✨', titleKey: 'ob.how.step2.title', descKey: 'ob.how.step2.desc' },
  { emoji: '✅', titleKey: 'ob.how.step3.title', descKey: 'ob.how.step3.desc' },
];

/** Onboarding 2/5 — cómo funciona, en una línea de tiempo de 3 pasos. */
export default function OnboardingHow() {
  return (
    <Screen>
      <ProgressBar step={2} total={5} />
      <View style={styles.center}>
        <FadeIn style={styles.headerBlock}>
          <Text style={styles.eyebrow}>{t('ob.how.eyebrow')}</Text>
          <Text style={[type.title, { textAlign: 'center' }]}>{t('ob.how.title')}</Text>
        </FadeIn>

        <View style={styles.timeline}>
          {STEPS.map((step, index) => (
            <FadeIn key={step.titleKey} delay={index * 150} offsetY={16} style={styles.row}>
              <View style={styles.railCol}>
                <LinearGradient colors={gradients.brand} style={styles.node}>
                  <Text style={styles.nodeEmoji}>{step.emoji}</Text>
                </LinearGradient>
                {index < STEPS.length - 1 && <View style={styles.rail} />}
              </View>
              <View style={styles.card}>
                <Text style={styles.stepNum}>{t('ob.how.stepLabel', { n: index + 1 })}</Text>
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

const NODE = 56;
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: spacing.xl },
  headerBlock: { alignItems: 'center', gap: spacing.xs },
  eyebrow: {
    ...type.small,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  timeline: { width: '100%' },
  row: { flexDirection: 'row', gap: spacing.md },
  railCol: { alignItems: 'center', width: NODE },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  nodeEmoji: { fontSize: 26 },
  rail: { flex: 1, width: 2.5, backgroundColor: colors.primarySoft, marginVertical: 4 },
  card: {
    flex: 1,
    gap: 3,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  stepNum: {
    ...type.small,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
