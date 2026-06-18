import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FadeIn } from '@/components/anim/FadeIn';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { t } from '@/i18n';
import { usePurchases } from '@/services/purchases';
import { useAuth } from '@/store/useAuth';
import { useCommunity } from '@/store/useCommunity';
import { usePrimaryPet } from '@/store/useAppStore';
import { colors, gradients, radius, shadow, spacing, type } from '@/theme';
import { formatScanDate } from '@/utils/dates';

const MAX_LEN = 280;

export default function Comunidad() {
  const premium = usePurchases((s) => s.premium);
  const pet = usePrimaryPet();
  const user = useAuth((s) => s.user);

  const posts = useCommunity((s) => s.posts);
  const loading = useCommunity((s) => s.loading);
  const loaded = useCommunity((s) => s.loaded);
  const load = useCommunity((s) => s.load);
  const publish = useCommunity((s) => s.publish);
  const toggleLike = useCommunity((s) => s.toggleLike);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const authorName = user?.email ? user.email.split('@')[0] : t('community.you');

  useEffect(() => {
    if (premium && !loaded) load();
  }, [premium, loaded, load]);

  // Muro solo para suscriptores
  if (!premium) {
    return (
      <Screen>
        <View style={styles.locked}>
          <Text style={styles.lockedEmoji}>🐾💬</Text>
          <Text style={[type.title, { textAlign: 'center' }]}>{t('community.lockedTitle')}</Text>
          <Text style={[type.bodyMuted, { textAlign: 'center' }]}>{t('community.lockedBody')}</Text>
          <Button
            label={t('community.lockedCta')}
            onPress={() => router.push('/paywall?context=comunidad')}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </Screen>
    );
  }

  const send = async () => {
    setSending(true);
    const ok = await publish({ authorName, petName: pet?.nombre, text });
    setSending(false);
    if (ok) setText('');
  };

  return (
    <Screen>
      <LinearGradient colors={gradients.hero} style={styles.hero}>
        <Text style={type.title}>{t('community.title')}</Text>
        <Text style={type.bodyMuted}>{t('community.subtitle')}</Text>
      </LinearGradient>

      {/* Compositor */}
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder={t('community.composerPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={(v) => setText(v.slice(0, MAX_LEN))}
          multiline
        />
        <View style={styles.composerFoot}>
          <Text style={type.small}>
            {text.length}/{MAX_LEN}
          </Text>
          <Button
            label={t('community.publish')}
            onPress={send}
            loading={sending}
            disabled={!text.trim()}
            style={{ minWidth: 130 }}
          />
        </View>
      </View>

      <Text style={styles.guideline}>{t('community.guideline')}</Text>

      {/* Muro */}
      {loading && posts.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : posts.length === 0 ? (
        <Text style={[type.bodyMuted, { textAlign: 'center', marginTop: spacing.xl }]}>
          {t('community.empty')}
        </Text>
      ) : (
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          {posts.map((post, index) => (
            <FadeIn key={post.id} delay={index * 50} offsetY={10} style={styles.post}>
              <View style={styles.postHead}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{post.authorName.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.author}>
                    {post.authorName}
                    {post.petName ? <Text style={styles.petName}>{`  ·  🐕 ${post.petName}`}</Text> : null}
                  </Text>
                  <Text style={type.small}>{formatScanDate(post.createdAt)}</Text>
                </View>
              </View>
              <Text style={[type.body, { marginTop: spacing.sm }]}>{post.text}</Text>
              <Pressable style={styles.likeRow} onPress={() => toggleLike(post.id)} hitSlop={8}>
                <Icon
                  symbol={post.likedByMe ? 'heart.fill' : 'heart'}
                  emoji={post.likedByMe ? '❤️' : '🤍'}
                  size={18}
                  color={post.likedByMe ? colors.bad : colors.textMuted}
                />
                <Text style={[styles.likeCount, post.likedByMe && { color: colors.bad }]}>{post.likes}</Text>
              </Pressable>
            </FadeIn>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  lockedEmoji: { fontSize: 52, marginBottom: spacing.sm },
  hero: {
    gap: 2,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadow.soft,
  },
  composer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  input: { ...type.body, minHeight: 64, textAlignVertical: 'top' },
  composerFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  guideline: { ...type.small, textAlign: 'center', marginTop: spacing.sm },
  post: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  postHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...type.heading, color: colors.primaryDark },
  author: { ...type.body, fontWeight: '800' },
  petName: { ...type.small, color: colors.textMuted, fontWeight: '600' },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md, alignSelf: 'flex-start' },
  likeCount: { ...type.small, fontWeight: '700', color: colors.textMuted },
});
