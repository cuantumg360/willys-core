import { hasSupabase } from '@/config/app';

import * as mock from './mock';
import { CommunityPost, NewPost } from './types';

export * from './types';

type Impl = typeof import('./supabase');

function real(): Impl {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('./supabase') as Impl;
}

/**
 * Fachada de la comunidad. Con Supabase configurado usa el muro real; si no
 * (Expo Go sin backend), usa un mock en memoria con ejemplos. Misma API.
 */
export const community = {
  enabled(): boolean {
    return hasSupabase;
  },
  list(): Promise<CommunityPost[]> {
    return hasSupabase ? real().list() : mock.list();
  },
  create(input: NewPost): Promise<CommunityPost> {
    return hasSupabase ? real().create(input) : mock.create(input);
  },
  like(id: string, delta: number): Promise<void> {
    return hasSupabase ? real().like(id, delta) : mock.like(id, delta);
  },
};
