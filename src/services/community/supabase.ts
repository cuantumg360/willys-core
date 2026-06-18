import { getSupabase } from '@/services/supabase/client';

import { CommunityPost, NewPost } from './types';

/**
 * Muro de la comunidad en Supabase. Lectura pública para suscriptores;
 * escritura solo del propio usuario (RLS). Ver backend/supabase.sql
 * (tabla community_posts).
 */

interface PostRow {
  id: string;
  author_name: string;
  pet_name: string | null;
  text: string;
  likes: number | null;
  created_at: string;
}

function fromRow(r: PostRow): CommunityPost {
  return {
    id: r.id,
    authorName: r.author_name,
    petName: r.pet_name ?? undefined,
    text: r.text,
    likes: r.likes ?? 0,
    createdAt: r.created_at,
  };
}

export async function list(): Promise<CommunityPost[]> {
  const { data, error } = await getSupabase()
    .from('community_posts')
    .select('id, author_name, pet_name, text, likes, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data as PostRow[]).map(fromRow);
}

export async function create(input: NewPost): Promise<CommunityPost> {
  const { data, error } = await getSupabase()
    .from('community_posts')
    .insert({ author_name: input.authorName, pet_name: input.petName ?? null, text: input.text })
    .select('id, author_name, pet_name, text, likes, created_at')
    .single();
  if (error) throw error;
  return fromRow(data as PostRow);
}

export async function like(id: string, delta: number): Promise<void> {
  // Incremento atómico vía RPC; si no existe, mejor esfuerzo con update.
  const { error } = await getSupabase().rpc('increment_post_likes', { post_id: id, delta });
  if (error) throw error;
}
