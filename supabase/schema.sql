-- PrioritiseIt - Supabase Schema
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

create table public.boards (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null,
  description text,
  scoring_model varchar(10) not null default 'rice' check (scoring_model in ('rice', 'ice')),
  owner_id uuid not null references auth.users(id) on delete cascade,
  share_token varchar(64) unique default encode(gen_random_bytes(24), 'hex'),
  is_shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default uuid_generate_v4(),
  board_id uuid not null references public.boards(id) on delete cascade,
  title varchar(255) not null,
  description text,
  reach integer default 0 check (reach >= 0 and reach <= 100),
  impact integer default 1 check (impact >= 1 and impact <= 3),
  confidence integer default 1 check (confidence >= 1 and confidence <= 3),
  effort integer default 1 check (effort >= 1 and effort <= 5),
  score float generated always as (
    case
      when effort > 0 then (reach * impact * confidence)::float / effort
      else 0
    end
  ) stored,
  manual_rank integer,
  status varchar(20) not null default 'backlog' check (status in ('backlog', 'planned', 'in_progress', 'done')),
  created_at timestamptz not null default now()
);

create table public.collaborators (
  id uuid primary key default uuid_generate_v4(),
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role varchar(10) not null default 'viewer' check (role in ('editor', 'viewer')),
  created_at timestamptz not null default now(),
  unique(board_id, user_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_boards_owner on public.boards(owner_id);
create index idx_items_board on public.items(board_id);
create index idx_items_board_rank on public.items(board_id, manual_rank nulls last, score desc);
create index idx_collaborators_board on public.collaborators(board_id);
create index idx_collaborators_user on public.collaborators(user_id);
create index idx_boards_share_token on public.boards(share_token) where is_shared = true;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger boards_updated_at
  before update on public.boards
  for each row execute function public.handle_updated_at();

-- Also update board's updated_at when items change
create or replace function public.touch_board_updated_at()
returns trigger as $$
begin
  update public.boards set updated_at = now()
  where id = coalesce(new.board_id, old.board_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger items_touch_board
  after insert or update or delete on public.items
  for each row execute function public.touch_board_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.boards enable row level security;
alter table public.items enable row level security;
alter table public.collaborators enable row level security;

-- BOARDS policies
create policy "Owners can do everything with their boards"
  on public.boards for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Collaborators can view boards they belong to"
  on public.boards for select
  using (
    exists (
      select 1 from public.collaborators
      where collaborators.board_id = boards.id
      and collaborators.user_id = auth.uid()
    )
  );

create policy "Editor collaborators can update boards"
  on public.boards for update
  using (
    exists (
      select 1 from public.collaborators
      where collaborators.board_id = boards.id
      and collaborators.user_id = auth.uid()
      and collaborators.role = 'editor'
    )
  );

create policy "Anyone can view shared boards via token"
  on public.boards for select
  using (is_shared = true);

-- ITEMS policies
create policy "Board owners can manage items"
  on public.items for all
  using (
    exists (
      select 1 from public.boards
      where boards.id = items.board_id
      and boards.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.boards
      where boards.id = items.board_id
      and boards.owner_id = auth.uid()
    )
  );

create policy "Editor collaborators can manage items"
  on public.items for all
  using (
    exists (
      select 1 from public.collaborators
      where collaborators.board_id = items.board_id
      and collaborators.user_id = auth.uid()
      and collaborators.role = 'editor'
    )
  )
  with check (
    exists (
      select 1 from public.collaborators
      where collaborators.board_id = items.board_id
      and collaborators.user_id = auth.uid()
      and collaborators.role = 'editor'
    )
  );

create policy "Viewer collaborators can view items"
  on public.items for select
  using (
    exists (
      select 1 from public.collaborators
      where collaborators.board_id = items.board_id
      and collaborators.user_id = auth.uid()
      and collaborators.role = 'viewer'
    )
  );

create policy "Anyone can view items on shared boards"
  on public.items for select
  using (
    exists (
      select 1 from public.boards
      where boards.id = items.board_id
      and boards.is_shared = true
    )
  );

-- COLLABORATORS policies
create policy "Board owners manage collaborators"
  on public.collaborators for all
  using (
    exists (
      select 1 from public.boards
      where boards.id = collaborators.board_id
      and boards.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.boards
      where boards.id = collaborators.board_id
      and boards.owner_id = auth.uid()
    )
  );

create policy "Collaborators can view their own record"
  on public.collaborators for select
  using (auth.uid() = user_id);
