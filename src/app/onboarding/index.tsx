import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadeIn } from '@/components/anim/FadeIn';
import { Pop } from '@/components/anim/Pop';
import { PulseRings } from '@/components/anim/PulseRings';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { t } from '@/i18n';
import { radius, spacing, type } from '@/theme';

/** Onboarding 1/5 — hook emocional cinematográfico. */
export default function OnboardingHook() {
  const insets = useSafeAreaInsets();
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1FA47C', '#0C6B4D', '#08231A']} style={StyleSheet.absoluteFill} />

      <View style={[styles.content, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
        <ProgressBar step={1} total={5} tone="light" />

        <View style={styles.center}>
          <Pop style={styles.emblemWrap}>
            <PulseRings size={210} color="rgba(255,255,255,0.5)" count={3} />
            <Animated.View style={[styles.emblem, { transform: [{ translateY }] }]}>
              <Text style={styles.emoji}>🐶</Text>
            </Animated.View>
          </Pop>

          <FadeIn delay={220} offsetY={10} style={styles.badge}>
            <Text style={styles.badgeText}>{t('ob.hook.badge')}</Text>
          </FadeIn>

          <FadeIn delay={360} offsetY={14} style={styles.statBlock}>
            <Text style={styles.stat}>{t('ob.hook.stat')}</Text>
            <Text style={styles.statCaption}>{t('ob.hook.statCaption')}</Text>
          </FadeIn>

          <FadeIn delay={520} offsetY={14} style={{ gap: spacing.sm }}>
            <Text style={styles.title}>{t('ob.hook.title')}</Text>
            <Text style={styles.subtitle}>{t('ob.hook.subtitle')}</Text>
          </FadeIn>
        </View>

        <FadeIn delay={680}>
          <Button label={t('common.start')} variant="light" onPress={() => router.push('/onboarding/como-funciona')} />
        </FadeIn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08231A' },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  emblemWrap: { width: 210, height: 210, alignItems: 'center', justifyContent: 'center' },
  emblem: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 70 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  badgeText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  statBlock: { alignItems: 'center', gap: spacing.xs },
  stat: { fontSize: 40, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', letterSpacing: -0.5 },
  statCaption: { ...type.body, color: 'rgba(255,255,255,0.82)', textAlign: 'center', maxWidth: 280 },
  title: { ...type.hero, fontSize: 26, lineHeight: 32, color: '#FFFFFF', textAlign: 'center' },
  subtitle: { ...type.body, color: 'rgba(255,255,255,0.82)', textAlign: 'center' },
});
