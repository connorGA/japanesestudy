create extension if not exists pgcrypto;

create type public.study_session_mode as enum ('chat', 'roleplay', 'listening', 'shadowing');
create type public.message_role as enum ('user', 'assistant', 'system');
create type public.review_item_type as enum ('vocabulary', 'grammar', 'sentence', 'listening');
create type public.audio_asset_status as enum ('pending', 'ready', 'failed');
create type public.review_rating as enum ('again', 'hard', 'good', 'easy');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  target_level text default 'N5-N4',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  mode public.study_session_mode not null default 'chat',
  title text,
  scenario_id text,
  level text default 'N5-N4',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audio_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  text text not null,
  normalized_text text generated always as (regexp_replace(trim(text), '\s+', ' ', 'g')) stored,
  content_hash text not null unique,
  voice_id text,
  model_id text not null,
  status public.audio_asset_status not null default 'pending',
  storage_path text,
  public_url text,
  duration_ms integer,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role public.message_role not null default 'assistant',
  user_input text,
  content jsonb not null default '{}'::jsonb,
  audio_asset_id uuid references public.audio_assets(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  japanese text not null,
  reading text,
  meaning text not null,
  part_of_speech text,
  source_message_id uuid references public.messages(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.grammar_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  pattern text not null,
  explanation text not null,
  examples jsonb not null default '[]'::jsonb,
  source_message_id uuid references public.messages(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.review_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  item_type public.review_item_type not null,
  prompt text not null,
  answer text not null,
  context text,
  source_message_id uuid references public.messages(id) on delete set null,
  audio_asset_id uuid references public.audio_assets(id) on delete set null,
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  ease_factor numeric(4,2) not null default 2.50,
  interval_days integer not null default 0,
  review_count integer not null default 0,
  lapses integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.review_attempts (
  id uuid primary key default gen_random_uuid(),
  review_item_id uuid not null references public.review_items(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  rating public.review_rating not null,
  previous_due_at timestamptz,
  next_due_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id uuid references public.study_sessions(id) on delete set null,
  mode public.study_session_mode not null,
  prompt text not null,
  response text,
  feedback jsonb not null default '{}'::jsonb,
  audio_asset_id uuid references public.audio_assets(id) on delete set null,
  created_at timestamptz not null default now()
);

create index study_sessions_user_id_created_at_idx on public.study_sessions(user_id, created_at desc);
create index messages_session_id_created_at_idx on public.messages(session_id, created_at);
create index review_items_user_id_due_at_idx on public.review_items(user_id, due_at);
create index review_items_due_at_idx on public.review_items(due_at);
create index audio_assets_content_hash_idx on public.audio_assets(content_hash);
create index practice_attempts_user_id_created_at_idx on public.practice_attempts(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger study_sessions_set_updated_at
before update on public.study_sessions
for each row execute function public.set_updated_at();

create trigger audio_assets_set_updated_at
before update on public.audio_assets
for each row execute function public.set_updated_at();

create trigger review_items_set_updated_at
before update on public.review_items
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.study_sessions enable row level security;
alter table public.audio_assets enable row level security;
alter table public.messages enable row level security;
alter table public.vocabulary_items enable row level security;
alter table public.grammar_points enable row level security;
alter table public.review_items enable row level security;
alter table public.review_attempts enable row level security;
alter table public.practice_attempts enable row level security;

create policy "profiles are visible to owner"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "profiles can be inserted by owner"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "profiles can be updated by owner"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "study sessions are owned by user"
on public.study_sessions for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "messages are owned by user"
on public.messages for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "vocabulary items are owned by user"
on public.vocabulary_items for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "grammar points are owned by user"
on public.grammar_points for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "review items are owned by user"
on public.review_items for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "review attempts are owned by user"
on public.review_attempts for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "practice attempts are owned by user"
on public.practice_attempts for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "ready audio assets are readable"
on public.audio_assets for select
to authenticated
using (status = 'ready' or user_id = auth.uid());

create policy "users can create their own audio assets"
on public.audio_assets for insert
to authenticated
with check (user_id = auth.uid());

create policy "users can update their own audio assets"
on public.audio_assets for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audio-assets', 'audio-assets', true, 10485760, array['audio/mpeg'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "audio assets are publicly readable"
on storage.objects for select
using (bucket_id = 'audio-assets');

create policy "authenticated users can upload audio assets"
on storage.objects for insert
to authenticated
with check (bucket_id = 'audio-assets');

create policy "authenticated users can update audio assets"
on storage.objects for update
to authenticated
using (bucket_id = 'audio-assets')
with check (bucket_id = 'audio-assets');
