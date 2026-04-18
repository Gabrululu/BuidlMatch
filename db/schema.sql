-- BuilderRegistry mirror (source of truth is onchain, this is the readable cache)
create table if not exists builders (
  fid           bigint primary key,
  username      text not null,
  bio           text not null default '',
  skills        text[] not null default '{}',
  wallet        text not null,
  avatar_url    text,
  registered_at timestamptz not null default now(),
  active        boolean not null default true
);

-- Projects published via Co-Builder
create table if not exists projects (
  id            bigserial primary key,
  owner_fid     bigint not null references builders(fid),
  title         text not null,
  plan_json     jsonb not null default '{}',  -- full agent output
  metadata_uri  text,                          -- IPFS/URL after onchain publish
  tx_hash       text,                          -- onchain tx, null until published
  published_at  timestamptz not null default now()
);

-- Indexes
create index if not exists builders_skills_idx on builders using gin(skills);
create index if not exists projects_owner_idx on projects(owner_fid);

-- RLS
alter table builders enable row level security;
alter table projects enable row level security;

-- Public read for both tables (needed by Snap + Co-Builder without auth)
create policy "builders_public_read" on builders
  for select using (true);

create policy "projects_public_read" on projects
  for select using (true);

-- Only service role can write (all writes go through our API routes with service key)
create policy "builders_service_insert" on builders
  for insert with check (auth.role() = 'service_role');

create policy "builders_service_update" on builders
  for update using (auth.role() = 'service_role');

create policy "projects_service_insert" on projects
  for insert with check (auth.role() = 'service_role');

create policy "projects_service_update" on projects
  for update using (auth.role() = 'service_role');
