-- Supabase SQL schema for FRA_Atlas pattas table
-- Paste this into the Supabase SQL editor (SQL > New query) and run

-- 1) Create extension for uuid generation if not exists
create extension if not exists "uuid-ossp";

-- 2) Drop existing pattas table (if you want a fresh start) and create new
drop table if exists public.pattas cascade;

-- 2) Create pattas table
create table public.pattas (
  id uuid default uuid_generate_v4() primary key,
  patta_id text not null unique,
  owner_id text not null, -- 'guest' for unauthenticated/temporary
  holder_name text,
  category text,
  right_type text,
  village text,
  district text,
  state text,
  coordinates jsonb, -- store as GeoJSON or simple JSON [lat, lng]
  area_hectares numeric, -- hectares
  status text default 'pending', -- pending, verified, approved, cancelled
  recommended_schemes jsonb default '[]'::jsonb, -- array of scheme ids or names
  ndvi_index double precision not null default 0.0, -- NDVI index (stored as float, default 0.0)
  ndwi_index double precision not null default 0.0, -- NDWI index (stored as float, default 0.0)
  date_applied timestamptz default now(),
  time_applied timestamptz default now(),
  date_verified timestamptz,
  reject_message text default 'Illegal claim',
  patta_doc_filename text,
  patta_doc_url text,
  scheme_priority text default 'balanced', -- balanced, priority, etc.
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) Create trigger to update updated_at
create or replace function public.update_timestamp()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_update_timestamp on public.pattas;
create trigger trg_update_timestamp
before update on public.pattas
for each row execute procedure public.update_timestamp();

-- 4) Indexes for common queries
create index if not exists idx_pattas_owner_id on public.pattas(owner_id);
create index if not exists idx_pattas_status on public.pattas(status);
create index if not exists idx_pattas_village on public.pattas(village);

-- 5) Row Level Security (RLS) policy example
-- If you have RLS enabled for your project you can create a policy to allow anonymous inserts for 'guest' owner_id
-- Note: only enable policies if you understand Supabase RLS. By default new projects have RLS enabled on new tables.
alter table public.pattas enable row level security;

create policy "Allow anon inserts for guest owner" on public.pattas
  for insert
  with check (owner_id = 'guest');

create policy "Allow anon select" on public.pattas
  for select
  using (true);

-- If you prefer to disable RLS instead, run:
-- alter table public.pattas disable row level security;

-- 5) Example row (remove if not needed)
-- insert into public.pattas (patta_id, owner_id, holder_name, village, district, state, coordinates, area_hectares)
-- values ('PATTA_EXAMPLE', 'guest', 'Guest User', 'Example Village', 'Example District', 'Example State', '{"lat":24.83,"lng":79.91}'::jsonb, 2.5);

-- End of schema
