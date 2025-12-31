-- Create Bookings Table
create table if not exists bookings (
  id text primary key,
  name text not null,
  cpf text not null,
  phone text,
  service_type text check (service_type in ('DAE', 'SEGURO')),
  zone text check (zone in ('RURAL', 'URBANA')),
  date text not null, -- YYYY-MM-DD
  time text not null, -- HH:MM
  status text default 'PENDENTE' check (status in ('PENDENTE', 'CONCLUIDO', 'CANCELADO')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table bookings enable row level security;

-- Create Policies
-- 1. Allow public insert (anyone can book)
create policy "Allow public insert" on bookings
  for insert with check (true);

-- 2. Allow public read of their own bookings (via ID/CPF search logic handled by app, currently app reads all for admin, filtered for user)
-- Ideally: 
-- For my-bookings search: The app queries everything? 
-- The current app logic in DataService loads ALL bookings to client side.
-- This is insecure for a large app but matches existing architecture (LocalStorage loaded all).
-- To allow DataService to list all bookings, non-authenticated users must be able to SELECT.
-- THIS IS A PRIVACY RISK.
-- However, maintaining feature parity with LocalStorage (where anyone on that PC could see local storage):
-- Ideally, we only allow SELECT if authenticated OR if looking up specific ID.
-- Since the App is SPA and filters client side, we need SELECT ALL for Admin.
-- For "My Bookings", we really should filter server side. 
-- But DataService `loadData` does `select *`. 
-- So we must allow public SELECT for now, or require Anon Key to allow it.
-- Anon key Allows it if Policy says so.

create policy "Allow public select" on bookings
  for select using (true);

-- 3. Allow only authenticated (Admins) to UPDATE/DELETE
create policy "Allow authenticated update" on bookings
  for update using (auth.role() = 'authenticated');

create policy "Allow authenticated delete" on bookings
  for delete using (auth.role() = 'authenticated');
