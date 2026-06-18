import { create } from 'zustand';

import { community, CommunityPost } from '@/services/community';
import { track } from '@/services/analytics';

interface CommunityState {
  posts: CommunityPost[];
  loading: boolean;
  loaded: boolean;
  error?: string;

  load: () => Promise<void>;
  publish: (input: {
    authorName: string;
    petName?: string;
    text: string;
    imageUri?: string;
  }) => Promise<boolean>;
  toggleLike: (id: string) => void;
}

export const useCommunity = create<CommunityState>((set, get) => ({
  posts: [],
  loading: false,
  loaded: false,
  error: undefined,

  load: async () => {
    set({ loading: true, error: undefined });
    try {
      const posts = await community.list();
      set({ posts, loading: false, loaded: true });
    } catch {
      set({ loading: false, loaded: true, error: 'No hemos podido cargar la comunidad.' });
    }
  },

  publish: async ({ authorName, petName, text, imageUri }) => {
    const clean = text.trim();
    if (!clean && !imageUri) return false;
    // Optimista: el post aparece al instante (siempre funciona, también en
    // Expo Go). Si hay backend, se intenta guardar y se reconcilia el id.
    const tempId = `temp-${Date.now()}`;
    const optimistic: CommunityPost = {
      id: tempId,
      authorName,
      petName,
      text: clean,
      imageUri,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    set((s) => ({ posts: [optimistic, ...s.posts], error: undefined }));
    try {
      const saved = await community.create({ authorName, petName, text: clean, imageUri });
      set((s) => ({
        posts: s.posts.map((p) =>
          p.id === tempId ? { ...saved, imageUri: saved.imageUri ?? imageUri } : p,
        ),
      }));
    } catch {
      // Se queda el post local (mejor esfuerzo); no bloquea al usuario.
    }
    track('comunidad_post_creado');
    return true;
  },

  toggleLike: (id) => {
    const post = get().posts.find((p) => p.id === id);
    if (!post) return;
    const delta = post.likedByMe ? -1 : 1;
    // Optimista: actualiza al instante; el backend hace el incremento real.
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === id ? { ...p, likes: Math.max(0, p.likes + delta), likedByMe: !p.likedByMe } : p,
      ),
    }));
    community.like(id, delta).catch(() => {});
  },
}));
