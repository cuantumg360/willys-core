import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { t } from '@/i18n';
import { usePurchases } from '@/services/purchases';
import { usePrimaryPet } from '@/store/useAppStore';
import { useChat } from '@/store/useChat';
import { colors, gradients, radius, shadow, spacing, type } from '@/theme';

export default function Chat() {
  const premium = usePurchases((s) => s.premium);
  const pet = usePrimaryPet();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const messages = useChat((s) => s.messages);
  const sending = useChat((s) => s.sending);
  const send = useChat((s) => s.send);
  const seed = useChat((s) => s.seed);

  const [text, setText] = useState('');

  useEffect(() => {
    seed(pet?.nombre ? t('chat.greeting', { name: pet.nombre }) : t('chat.greetingNoPet'));
  }, [pet?.nombre, seed]);

  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(id);
  }, [messages.length, sending]);

  if (!premium) {
    return (
      <Screen>
        <View style={styles.locked}>
          <Text style={styles.lockedEmoji}>🤖💬</Text>
          <Text style={[type.title, { textAlign: 'center' }]}>{t('chat.lockedTitle')}</Text>
          <Text style={[type.bodyMuted, { textAlign: 'center' }]}>{t('chat.lockedBody')}</Text>
          <Button
            label={t('chat.lockedCta')}
            onPress={() => router.push('/paywall?context=chat')}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </Screen>
    );
  }

  const petCtx = pet
    ? { nombre: pet.nombre, raza: pet.raza, edadAnios: pet.edadAnios, pesoKg: pet.pesoKg }
    : undefined;

  const doSend = (value: string) => {
    send(value, petCtx);
    setText('');
  };

  const suggestions = [
    pet?.nombre ? t('chat.suggest1', { name: pet.nombre }) : t('chat.suggest1NoPet'),
    t('chat.suggest2'),
    t('chat.suggest3'),
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top + 44}
    >
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient colors={gradients.hero} style={styles.hero}>
          <Text style={styles.heroEmoji}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={type.title}>{t('chat.title')}</Text>
            <Text style={type.small}>
              {pet?.nombre ? t('chat.subtitle', { name: pet.nombre }) : t('chat.subtitleNoPet')}
            </Text>
          </View>
        </LinearGradient>

        {messages.map((m) => (
          <View
            key={m.id}
            style={[styles.bubble, m.role === 'user' ? styles.user : styles.assistant]}
          >
            <Text style={m.role === 'user' ? styles.userText : styles.assistantText}>{m.text}</Text>
          </View>
        ))}

        {sending && (
          <View style={[styles.bubble, styles.assistant]}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {/* Sugerencias solo al inicio */}
        {messages.length <= 1 && !sending && (
          <View style={styles.suggestions}>
            {suggestions.map((s) => (
              <Pressable key={s} style={styles.suggestChip} onPress={() => doSend(s)}>
                <Text style={styles.suggestText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Text style={styles.disclaimer}>{t('chat.disclaimer')}</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            onSubmitEditing={() => text.trim() && doSend(text)}
          />
          <Pressable
            style={[styles.sendBtn, !text.trim() && styles.sendBtnOff]}
            onPress={() => text.trim() && doSend(text)}
            disabled={!text.trim() || sending}
          >
            <Text style={styles.sendArrow}>↑</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  lockedEmoji: { fontSize: 52, marginBottom: spacing.sm },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadow.soft,
  },
  heroEmoji: { fontSize: 36 },
  bubble: { maxWidth: '88%', borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  assistant: { alignSelf: 'flex-start', backgroundColor: colors.surface, ...shadow.soft },
  user: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  assistantText: { ...type.body, color: colors.text },
  userText: { ...type.body, color: colors.textOnPrimary },
  suggestions: { gap: spacing.sm, marginTop: spacing.md },
  suggestChip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  suggestText: { ...type.small, color: colors.primaryDark, fontWeight: '700' },
  inputBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  disclaimer: { ...type.small, textAlign: 'center', fontSize: 11 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  input: {
    ...type.body,
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: 11,
    paddingBottom: 11,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnOff: { backgroundColor: colors.border },
  sendArrow: { color: colors.textOnPrimary, fontSize: 22, fontWeight: '800' },
});
