create extension if not exists pgcrypto;

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  platform text not null,
  url text,
  credibility_score numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sources_platform_check check (
    platform in ('news', 'rss', 'reddit', 'x', 'manual', 'other')
  )
);

create table if not exists public.raw_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  external_id text,
  platform text not null default 'news',
  title text not null,
  url text not null,
  snippet text,
  author text,
  image_url text,
  published_at timestamptz,
  score numeric not null default 0,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint raw_items_platform_check check (
    platform in ('news', 'rss', 'reddit', 'x', 'manual', 'other')
  ),
  constraint raw_items_source_external_unique unique (source_id, external_id),
  constraint raw_items_url_unique unique (url)
);

create table if not exists public.story_clusters (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  topic text,
  score numeric not null default 0,
  source_count integer not null default 0,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.story_sources (
  id uuid primary key default gen_random_uuid(),
  story_cluster_id uuid not null references public.story_clusters(id) on delete cascade,
  raw_item_id uuid not null references public.raw_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint story_sources_cluster_item_unique unique (story_cluster_id, raw_item_id)
);

create table if not exists public.ai_summaries (
  id uuid primary key default gen_random_uuid(),
  story_cluster_id uuid not null references public.story_clusters(id) on delete cascade,
  headline text not null,
  summary text not null,
  model text,
  prompt_version text,
  source_item_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  preferred_topics text[] not null default '{}',
  blocked_sources text[] not null default '{}',
  region text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_preferences_user_unique unique (user_id)
);

create table if not exists public.saved_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  story_cluster_id uuid not null references public.story_clusters(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint saved_stories_user_story_unique unique (user_id, story_cluster_id)
);

create index if not exists sources_platform_idx
  on public.sources(platform);

create index if not exists raw_items_source_id_idx
  on public.raw_items(source_id);

create index if not exists raw_items_published_at_idx
  on public.raw_items(published_at desc);

create index if not exists raw_items_platform_idx
  on public.raw_items(platform);

create index if not exists raw_items_title_idx
  on public.raw_items using gin(to_tsvector('english', title));

create index if not exists story_clusters_score_idx
  on public.story_clusters(score desc);

create index if not exists story_clusters_last_seen_at_idx
  on public.story_clusters(last_seen_at desc);

create index if not exists story_clusters_topic_idx
  on public.story_clusters(topic);

create index if not exists story_sources_story_cluster_id_idx
  on public.story_sources(story_cluster_id);

create index if not exists story_sources_raw_item_id_idx
  on public.story_sources(raw_item_id);

create index if not exists ai_summaries_story_cluster_id_idx
  on public.ai_summaries(story_cluster_id);

alter table public.sources enable row level security;
alter table public.raw_items enable row level security;
alter table public.story_clusters enable row level security;
alter table public.story_sources enable row level security;
alter table public.ai_summaries enable row level security;
alter table public.topics enable row level security;
alter table public.user_preferences enable row level security;
alter table public.saved_stories enable row level security;
