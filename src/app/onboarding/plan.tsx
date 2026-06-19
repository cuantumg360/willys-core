import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FadeIn } from '@/components/anim/FadeIn';
import { Pop } from '@/components/anim/Pop';
import { PulseRings } from '@/components/anim/PulseRings';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { t, TKey } from '@/i18n';
import { useAuth } from '@/store/useAuth';
import { usePrimaryPet } from '@/store/useAppStore';
import { colors, radius, shadow, spacing, type } from '@/theme';

const STEPS: TKey[] = ['ob.plan.step1', 'ob.plan.step2', 'ob.plan.step3', 'ob.plan.step4'];
const ITEMS: { emoji: string; key: TKey }[] = [
  { emoji: '⚖️', key: 'ob.plan.item1' },
  { emoji: '🥣', key: 'ob.plan.item2' },
  { emoji: '💉', key: 'ob.plan.item3' },
  { emoji: '🤖', key: 'ob.plan.item4' },
];

/**
 * Reveal del plan personalizado antes del paywall (patrón Cal AI / BetterMe):
 * primero "analizamos" el perfil del perro creando anticipación, luego
 * revelamos un plan a su nombre. Construye la inversión psicológica que
 * dispara la conversión en el paywall.
 */
export default function OnboardingPlan() {
  const pet = usePrimaryPet();
  const authed = useAuth((s) => s.status === 'authed');
  const name = pet?.nombre ?? 'tu perro';

  const [phase, setPhase] = useState<'analyzing' | 'ready'>('analyzing');
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (phase !== 'analyzing') return;
    const tick = setInterval(() => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)), 750);
    const done = setTimeout(() => setPhase('ready'), STEPS.length * 750 + 400);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [phase]);

  const cta = () =>
    router.push(authed ? '/paywall?context=onboarding' : '/auth?context=onboarding');

  if (phase === 'analyzing') {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <Pop style={styles.ringWrap}>
            <PulseRings size={170} color={colors.primary} count={3} />
            <View style={styles.ringInner}>
              <Text style={styles.ringEmoji}>🐶</Text>
            </View>
          </Pop>
          <Text style={[type.title, { textAlign: 'center' }]}>
            {t('ob.plan.analyzingTitle', { name })}
          </Text>
          <View style={styles.steps}>
            {STEPS.map((key, i) => (
              <View key={key} style={styles.stepRow}>
                <Text style={[styles.stepCheck, { opacity: i <= stepIndex ? 1 : 0.25 }]}>
                  {i < stepIndex ? '✓' : i === stepIndex ? '◌' : '○'}
                </Text>
                <Text style={[type.body, { opacity: i <= stepIndex ? 1 : 0.4 }]}>{t(key)}</Text>
              </View>
            ))}
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flex: 1, gap: spacing.lg, justifyContent: 'center', paddingVertical: spacing.lg }}>
        <FadeIn style={{ alignItems: 'center', gap: spacing.xs }}>
          <Text style={styles.eyebrow}>{t('ob.plan.readyEyebrow')}</Text>
          <Text style={[type.hero, { textAlign: 'center', fontSize: 26 }]}>
            {t('ob.plan.readyTitle', { name })}
          </Text>
          <Text style={[type.bodyMuted, { textAlign: 'center' }]}>{t('ob.plan.readySubtitle')}</Text>
        </FadeIn>

        <View style={{ gap: spacing.sm }}>
          {ITEMS.map((item, i) => (
            <FadeIn key={item.key} delay={120 + i * 110} style={styles.item}>
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={[type.body, { flex: 1, fontWeight: '700' }]}>{t(item.key)}</Text>
              <Text style={styles.itemCheck}>✓</Text>
            </FadeIn>
          ))}
        </View>

        <FadeIn delay={620} style={styles.social}>
          <Text style={[type.small, { textAlign: 'center', color: colors.primaryDark }]}>
            {t('ob.plan.social')}
          </Text>
        </FadeIn>
      </View>

      <Button label={t('ob.plan.cta', { name })} onPress={cta} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.xl },
  ringWrap: { width: 170, height: 170, alignItems: 'center', justifyContent: 'center' },
  ringInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringEmoji: { fontSize: 54 },
  steps: { gap: spacing.md, width: '100%', paddingHorizontal: spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepCheck: { fontSize: 18, fontWeight: '800', color: colors.primary, width: 22, textAlign: 'center' },
  eyebrow: {
    ...type.small,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  itemEmoji: { fontSize: 26 },
  itemCheck: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 15,
    backgroundColor: colors.primarySoft,
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: 'center',
    lineHeight: 26,
    overflow: 'hidden',
  },
  social: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
