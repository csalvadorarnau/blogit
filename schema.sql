-- Blogit — esquema de base de datos para Supabase
-- Pega este archivo completo en el SQL Editor de tu proyecto de Supabase y ejecútalo.

create extension if not exists "pgcrypto";

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text not null default 'Sin nombre',
  bio text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: lectura pública" on public.profiles
  for select using (true);

create policy "profiles: solo yo puedo crear mi perfil" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles: solo yo puedo editar mi perfil" on public.profiles
  for update using (auth.uid() = id);

-- Crea automáticamente una fila en profiles cuando alguien se registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- POSTS ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  topic text not null check (topic in ('Moda', 'Fotografía', 'Comida', 'Superhéroes', 'Viajes')),
  title text not null,
  body text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_topic_idx on public.posts (topic);
create index if not exists posts_author_idx on public.posts (author_id);

alter table public.posts enable row level security;

create policy "posts: lectura pública" on public.posts
  for select using (true);

create policy "posts: solo autenticados publican como ellos mismos" on public.posts
  for insert with check (auth.uid() = author_id);

-- ---------- COMMENTS ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_idx on public.comments (post_id);

alter table public.comments enable row level security;

create policy "comments: lectura pública" on public.comments
  for select using (true);

create policy "comments: solo autenticados comentan como ellos mismos" on public.comments
  for insert with check (auth.uid() = author_id);

-- ---------- LIKES ----------
create table if not exists public.likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.likes enable row level security;

create policy "likes: lectura pública" on public.likes
  for select using (true);

create policy "likes: solo yo puedo dar like como yo" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "likes: solo yo puedo quitar mi like" on public.likes
  for delete using (auth.uid() = user_id);

-- ---------- FOLLOWS ----------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followed_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  constraint follows_no_self check (follower_id <> followed_id)
);

alter table public.follows enable row level security;

create policy "follows: lectura pública" on public.follows
  for select using (true);

create policy "follows: solo yo puedo seguir como yo" on public.follows
  for insert with check (auth.uid() = follower_id);

create policy "follows: solo yo puedo dejar de seguir" on public.follows
  for delete using (auth.uid() = follower_id);

-- ---------- STORAGE: fotos de posts ----------
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "post-images: lectura pública" on storage.objects
  for select using (bucket_id = 'post-images');

create policy "post-images: solo autenticados suben fotos" on storage.objects
  for insert with check (bucket_id = 'post-images' and auth.role() = 'authenticated');
