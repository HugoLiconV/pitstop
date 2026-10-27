-- Pitstop schema. Single user, but every row is owned and protected by RLS.

create table vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  vin text,
  plate text,
  purchase_date date not null,
  initial_km integer not null check (initial_km >= 0),
  created_at timestamptz not null default now()
);

create table odometer_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  vehicle_id uuid not null references vehicles on delete cascade,
  date date not null,
  km integer not null check (km >= 0),
  source text not null check (source in ('manual', 'service')),
  created_at timestamptz not null default now()
);
create index odometer_readings_vehicle_date on odometer_readings (vehicle_id, date);

create table maintenance_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  vehicle_id uuid not null references vehicles on delete cascade,
  name text not null,
  interval_km integer check (interval_km > 0),
  interval_months integer check (interval_months > 0),
  notes text,
  active boolean not null default true,
  source text not null default 'custom' check (source in ('manual', 'custom')),
  manual_page text,
  created_at timestamptz not null default now(),
  check (interval_km is not null or interval_months is not null)
);

create table services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  vehicle_id uuid not null references vehicles on delete cascade,
  date date not null,
  km integer not null check (km >= 0),
  workshop text,
  total_cost_mxn numeric(12, 2) check (total_cost_mxn >= 0),
  notes text,
  created_at timestamptz not null default now()
);
create index services_vehicle_date on services (vehicle_id, date);

create table service_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  service_id uuid not null references services on delete cascade,
  maintenance_item_id uuid not null references maintenance_items on delete cascade,
  cost_mxn numeric(12, 2) check (cost_mxn >= 0),
  created_at timestamptz not null default now(),
  unique (service_id, maintenance_item_id)
);

create table attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  service_id uuid not null references services on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['vehicles','odometer_readings','maintenance_items','services','service_items','attachments'] loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy owner_all on %I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;
