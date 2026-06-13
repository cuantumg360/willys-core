import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { FadeIn } from '@/components/anim/FadeIn';
import { Pop } from '@/components/anim/Pop';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { APP_NAME } from '@/config/app';
import { t } from '@/i18n';
import { useAuth } from '@/store/useAuth';
import { colors, radius, shadow, spacing, type } from '@/theme';

/** Bienvenida + login / registro. Puerta de entrada cuando no hay sesión. */
export default function Auth() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signUp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submitting = useAuth((s) => s.submitting);
  const error = useAuth((s) => s.error);
  const signIn = useAuth((s) => s.signIn);
  const signUp = useAuth((s) => s.signUp);
  const clearError = useAuth((s) => s.clearError);

  const isSignUp = mode === 'signUp';

  const submit = async () => {
    const ok = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);
    // Al autenticarse, la puerta de entrada (index) reencamina solo.
    if (ok) router.replace('/');
  };

  const toggle = () => {
    clearError();
    setMode(isSignUp ? 'signIn' : 'signUp');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <View style={styles.hero}>
          <Pop style={styles.logo}>
            <Text style={styles.logoEmoji}>🐾</Text>
          </Pop>
          <FadeIn delay={120} style={{ gap: spacing.sm, alignItems: 'center' }}>
            <Text style={[type.title, { textAlign: 'center' }]}>
              {t('auth.welcome', { app: APP_NAME })}
            </Text>
            <Text style={[type.bodyMuted, { textAlign: 'center' }]}>{t('auth.tagline')}</Text>
          </FadeIn>
        </View>

        <FadeIn delay={220} style={styles.card}>
          <Text style={type.heading}>{isSignUp ? t('auth.signUpTitle') : t('auth.signInTitle')}</Text>

          <Field
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={(v) => {
              clearError();
              setEmail(v);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <Field
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChangeText={(v) => {
              clearError();
              setPassword(v);
            }}
            secureTextEntry
            textContentType={isSignUp ? 'newPassword' : 'password'}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label={isSignUp ? t('auth.signUp') : t('auth.signIn')}
            onPress={submit}
            loading={submitting}
            disabled={!email.trim() || !password}
          />

          <Pressable onPress={toggle} hitSlop={8} style={styles.toggle}>
            <Text style={styles.toggleText}>
              {isSignUp ? t('auth.toggleToSignIn') : t('auth.toggleToSignUp')}
            </Text>
          </Pressable>
        </FadeIn>

        <Text style={styles.legal}>{t('auth.legalNote')}</Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.xl },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  logoEmoji: { fontSize: 48 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.card,
  },
  error: { ...type.small, color: colors.bad, fontWeight: '600' },
  toggle: { alignItems: 'center', paddingTop: spacing.xs },
  toggleText: { ...type.body, color: colors.primary, fontWeight: '600' },
  legal: { ...type.small, textAlign: 'center', marginTop: spacing.lg },
});
