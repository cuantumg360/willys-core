-- ============================================================================
-- Esquema para la sincronización en la nube (mascotas y escaneos).
-- Pégalo tal cual en el SQL Editor de tu proyecto Supabase y ejecútalo.
-- La seguridad la dan las Row Level Security policies: cada usuario solo
-- puede ver y modificar sus propias filas. La columna user_id se rellena
-- sola con auth.uid(), así que el cliente nunca la envía.
-- (Las claves primarias son TEXT porque la app genera ids de texto.)
-- ============================================================================

-- ── Mascotas ────────────────────────────────────────────────────────────────
create table if not exists public.pets (
  id          text primary key,
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  nombre      text not null,
  raza        text,
  edad_anios  numeric,
  peso_kg     numeric,
  foto_uri    text,
  created_at  timestamptz not null default now()
);

alter table public.pets enable row level security;

create policy "Las mascotas son del usuario"
  on public.pets for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── Escaneos ────────────────────────────────────────────────────────────────
create table if not exists public.scans (
  id          text primary key,
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  pet_id      text references public.pets on delete cascade,
  scanner_id  text not null,
  result      jsonb not null,
  photo_uris  jsonb,
  created_at  timestamptz not null default now()
);

alter table public.scans enable row level security;

create policy "Los escaneos son del usuario"
  on public.scans for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── Comunidad (muro de suscriptores) ─────────────────────────────────────────
-- Lectura para cualquier usuario autenticado; cada uno solo puede crear/editar
-- y borrar sus propios posts. El "like" se incrementa con una función segura.
create table if not exists public.community_posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  author_name text not null,
  pet_name    text,
  text        text not null check (char_length(text) between 1 and 280),
  likes       integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.community_posts enable row level security;

create policy "Comunidad: leer (autenticados)"
  on public.community_posts for select
  using (auth.uid() is not null);

create policy "Comunidad: crear propios"
  on public.community_posts for insert
  with check (user_id = auth.uid());

create policy "Comunidad: editar/borrar propios"
  on public.community_posts for update using (user_id = auth.uid());

create policy "Comunidad: borrar propios"
  on public.community_posts for delete using (user_id = auth.uid());

-- Incremento atómico de "me gusta" (cualquier autenticado puede dar like).
create or replace function public.increment_post_likes(post_id uuid, delta integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.community_posts
     set likes = greatest(0, likes + delta)
   where id = post_id;
$$;
