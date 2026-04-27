-- Run this in the Neon SQL Editor (neon.tech → your project → SQL Editor)

-- Tables

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

create table if not exists projects (
  id            bigserial primary key,
  owner_fid     bigint not null references builders(fid),
  title         text not null,
  plan_json     jsonb not null default '{}',
  metadata_uri  text,
  tx_hash       text,
  published_at  timestamptz not null default now()
);

create index if not exists builders_skills_idx on builders using gin(skills);
create index if not exists projects_owner_idx  on projects(owner_fid);

-- Seed (dev data — fictional builders)

insert into builders (fid, username, bio, skills, wallet, avatar_url) values
  (100001, 'carlos.eth',   'Fullstack + Solidity desde Bogotá. DeFi & infra.',   array['Solidity','DeFi','Backend'],    '0x0000000000000000000000000000000000000001', null),
  (100002, 'valentina.fc', 'Frontend React + Farcaster frames. Lima.',            array['Frontend','React','Frames'],    '0x0000000000000000000000000000000000000002', null),
  (100003, 'miguel.base',  'Smart contracts + Foundry. CDMX. Auditor.',           array['Solidity','Auditing','EVM'],    '0x0000000000000000000000000000000000000003', null),
  (100004, 'sofia.fc',     'Diseño de producto Web3. Buenos Aires.',              array['Design','UX','Branding'],       '0x0000000000000000000000000000000000000004', null),
  (100005, 'andres.eth',   'GTM & comunidad crypto latam. Santiago.',             array['GTM','Community','BD'],         '0x0000000000000000000000000000000000000005', null),
  (100006, 'lucia.dev',    'Full stack Next.js + wagmi. Medellín.',               array['Frontend','Next.js','wagmi'],   '0x0000000000000000000000000000000000000006', null),
  (100007, 'renzo.sol',    'Contratos DeFi + Base. Lima.',                        array['Solidity','DeFi','Base'],       '0x0000000000000000000000000000000000000007', null),
  (100008, 'diana.fc',     'Producto y growth para startups Web3. Caracas.',      array['Product','Growth','GTM'],       '0x0000000000000000000000000000000000000008', null)
on conflict (fid) do nothing;
