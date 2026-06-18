import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadeIn } from '@/components/anim/FadeIn';
import { Button } from '@/components/ui/Button';
import { APP_NAME } from '@/config/app';
import { flags } from '@/config/flags';
import { t } from '@/i18n';
import { track } from '@/services/analytics';
import { PlanId, usePurchases } from '@/services/purchases';
import { useAppStore, usePrimaryPet } from '@/store/useAppStore';
import { colors, gradients, radius, shadow, spacing, type } from '@/theme';

const BULLETS = ['paywall.bullet1', 'paywall.bullet2', 'paywall.bullet3'] as const;

/**
 * Paywall único (final del onboarding y al agotar escaneos gratis).
 * Pantalla corta: beneficio + 3 bullets + selector anual/semanal + CTA.
 * La X aparece a los 2 segundos, pequeña y arriba a la izquierda.
 */
export default function Paywall() {
  const { context } = useLocalSearchParams<{ context?: string }>();
  const insets = useSafeAreaInsets();
  const pet = usePrimaryPet();
  const purchase = usePurchases((s) => s.purchase);
  const restore = usePurchases((s) => s.restore);
  const setOnboardingDone = useAppStore((s) => s.setOnboardingDone);

  const [plan, setPlan] = useState<PlanId>('annual');
  const [showClose, setShowClose] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    track('paywall_visto', { context: context ?? 'desconocido' });
    const timer = setTimeout(() => setShowClose(true), 2000);
    return () => clearTimeout(timer);
  }, [context]);

  const finish = () => {
    if (context === 'onboarding') {
      setOnboardingDone();
      track('onboarding_completado');
      // Limpia el historial del onboarding para que la app no vuelva a sus
      // pantallas (cámara, etc.) al regresar de un resultado.
      if (router.canDismiss()) router.dismissAll();
      router.replace('/inicio');
    } else {
      router.back();
    }
  };

  const close = () => {
    track('paywall_cerrado', { context: context ?? 'desconocido' });
    finish();
  };

  const buy = async () => {
    setBuying(true);
    try {
      // Solo avanzamos si la compra se completa (con RevenueCat el usuario
      // puede cancelar el diálogo; en el mock siempre concede premium).
      const ok = await purchase(plan);
      if (ok) finish();
    } finally {
      setBuying(false);
    }
  };

  const doRestore = async () => {
    const restored = await restore();
    if (restored) finish();
  };

  return (
    <View style={styles.screen}>
      {showClose && (
        <Pressable accessibilityLabel={t('common.close')} onPress={close} style={[styles.close, { top: insets.top + spacing.sm }]} hitSlop={12}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      )}

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.lg,
          paddingHorizontal: spacing.lg,
          gap: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
      <FadeIn style={styles.top} offsetY={16} duration={520}>
        <Text style={styles.emoji}>🐾</Text>
        <Text style={[type.title, { textAlign: 'center' }]}>
          {pet?.nombre ? t('paywall.title', { name: pet.nombre }) : t('paywall.titleNoName')}
        </Text>
        <View style={styles.bullets}>
          {BULLETS.map((key, index) => (
            <FadeIn key={key} delay={160 + index * 90} style={styles.bullet}>
              <Text style={styles.check}>✓</Text>
              <Text style={[type.body, { flex: 1 }]}>{t(key)}</Text>
            </FadeIn>
          ))}
        </View>
      </FadeIn>

      {/* Anclaje de valor: lo que costaría por separado (~200€) vs 39,99€ */}
      <FadeIn delay={240}>
        <LinearGradient colors={gradients.hero} style={styles.valueCard}>
          <Text style={styles.valueTitle}>{t('paywall.value.title')}</Text>
          {VALUE_ROWS.map((row) => (
            <View key={row.k} style={styles.valueRow}>
              <Text style={[type.body, { flex: 1 }]}>{t(row.k)}</Text>
              <Text style={styles.valueItemPrice}>{t(row.p)}</Text>
            </View>
          ))}
          <View style={styles.valueDivider} />
          <View style={styles.valueRow}>
            <Text style={[type.body, { flex: 1, fontWeight: '700' }]}>
              {t('paywall.value.totalLabel')}
            </Text>
            <Text style={styles.valueTotalStrike}>{t('paywall.value.total')}</Text>
          </View>
          <View style={styles.valueYouRow}>
            <Text style={styles.valueYouLabel}>{t('paywall.value.youLabel', { app: APP_NAME })}</Text>
            <Text style={styles.valueYouPrice}>{t('paywall.value.you')}</Text>
          </View>
        </LinearGradient>
      </FadeIn>

      <View style={{ gap: spacing.sm }}>
        <PlanOption
          selected={plan === 'annual'}
          onPress={() => setPlan('annual')}
          title={t('paywall.plan.annual')}
          price={t('paywall.plan.annualPrice')}
          note={t('paywall.plan.annualTrial')}
          badge={t('paywall.plan.annualBadge')}
          emphasize
        />
        <PlanOption
          selected={plan === 'weekly'}
          onPress={() => setPlan('weekly')}
          title={t('paywall.plan.weekly')}
          price={t('paywall.plan.weeklyPrice')}
        />
        {flags.lifetimeFounder && (
          <PlanOption
            selected={plan === 'lifetime'}
            onPress={() => setPlan('lifetime')}
            title={t('paywall.plan.lifetime')}
            price={t('paywall.plan.lifetimePrice')}
          />
        )}

        <Button
          label={plan === 'annual' ? t('paywall.cta.trial') : t('paywall.cta.buy')}
          onPress={buy}
          loading={buying}
          style={{ marginTop: spacing.sm }}
        />
        <Text style={[type.small, { textAlign: 'center' }]}>
          {plan === 'annual' ? t('paywall.trialNote') : t('paywall.weeklyNote')}
        </Text>

        {showClose && (
          <Pressable onPress={close} hitSlop={8} style={{ paddingVertical: spacing.xs }}>
            <Text style={styles.maybeLater}>{t('paywall.maybeLater')}</Text>
          </Pressable>
        )}

        <View style={styles.footer}>
          <Pressable onPress={doRestore} hitSlop={8}>
            <Text style={styles.footerLink}>{t('paywall.restore')}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/legal/terminos')} hitSlop={8}>
            <Text style={styles.footerLink}>{t('paywall.terms')}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/legal/privacidad')} hitSlop={8}>
            <Text style={styles.footerLink}>{t('paywall.privacy')}</Text>
          </Pressable>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const VALUE_ROWS = [
  { k: 'paywall.value.r1', p: 'paywall.value.r1p' },
  { k: 'paywall.value.r2', p: 'paywall.value.r2p' },
  { k: 'paywall.value.r3', p: 'paywall.value.r3p' },
  { k: 'paywall.value.r4', p: 'paywall.value.r4p' },
] as const;

function PlanOption({
  selected,
  onPress,
  title,
  price,
  note,
  badge,
  emphasize,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  price: string;
  note?: string;
  badge?: string;
  emphasize?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.plan, selected && styles.planSelected]}>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.planTitleRow}>
          <Text style={type.heading}>{title}</Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        {note ? <Text style={[type.small, { color: colors.primaryDark }]}>{note}</Text> : null}
      </View>
      <Text
        style={[
          emphasize ? styles.planPriceBig : type.heading,
          { color: selected ? colors.primaryDark : colors.textMuted },
        ]}
      >
        {price}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  close: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 14, color: colors.textMuted, fontWeight: '700' },
  valueCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    ...shadow.card,
  },
  valueTitle: { ...type.small, fontWeight: '800', letterSpacing: 0.4, color: colors.textMuted, textTransform: 'uppercase' },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  valueItemPrice: { ...type.body, color: colors.textMuted, fontWeight: '600' },
  valueDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  valueTotalStrike: {
    ...type.body,
    fontWeight: '700',
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  valueYouRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  valueYouLabel: { ...type.heading, color: colors.primaryDark, flex: 1 },
  valueYouPrice: { fontSize: 26, fontWeight: '800', color: colors.primary },
  planPriceBig: { fontSize: 22, fontWeight: '800', color: colors.text },
  top: { alignItems: 'center', gap: spacing.lg, marginTop: spacing.xl },
  emoji: { fontSize: 52 },
  bullets: { gap: spacing.sm, width: '100%' },
  bullet: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  check: { color: colors.primary, fontWeight: '800', fontSize: 17 },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  planSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: { color: colors.textOnPrimary, fontSize: 11, fontWeight: '800' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  footerLink: { ...type.small, textDecorationLine: 'underline' },
  maybeLater: { ...type.small, color: colors.textMuted, fontWeight: '600', textAlign: 'center' },
});
