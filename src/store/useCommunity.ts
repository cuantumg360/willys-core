import { create } from 'zustand';

import { community, CommunityPost } from '@/services/community';
import { track } from '@/services/analytics';

interface CommunityState {
  posts: CommunityPost[];
  loading: boolean;
  loaded: boolean;
  error?: string;

  load: () => Promise<void>;
  publish: (input: { authorName: string; petName?: string; text: string }) => Promise<boolean>;
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

  publish: async ({ authorName, petName, text }) => {
    const clean = text.trim();
    if (!clean) return false;
    try {
      const post = await community.create({ authorName, petName, text: clean });
      set((s) => ({ posts: [post, ...s.posts] }));
      track('comunidad_post_creado');
      return true;
    } catch {
      set({ error: 'No hemos podido publicar. Inténtalo de nuevo.' });
      return false;
    }
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
