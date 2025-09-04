-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type user_role as enum ('customer', 'staff', 'company_admin', 'super_admin');
create type venue_type as enum ('ktv', 'restaurant', 'basketball_court', 'badminton_court', 'other');
create type membership_type as enum ('company', 'universal');
create type membership_status as enum ('active', 'inactive', 'suspended');
create type transaction_type as enum ('purchase', 'usage', 'refund', 'adjustment');
create type transaction_status as enum ('completed', 'pending', 'cancelled', 'refunded');
create type staff_role as enum ('staff', 'manager');
create type company_role as enum ('admin', 'manager');

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) primary key,
  email text,
  phone text,
  full_name text,
  role user_role default 'customer',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Companies table
create table public.companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  logo_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Venues table
create table public.venues (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  type venue_type not null,
  address text,
  phone text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Memberships table
create table public.memberships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  membership_type membership_type default 'company',
  balance decimal(10,2) default 0.00,
  total_purchased decimal(10,2) default 0.00,
  status membership_status default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, company_id)
);

-- Transactions table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  membership_id uuid references public.memberships(id) on delete cascade,
  venue_id uuid references public.venues(id) on delete set null,
  type transaction_type not null,
  amount decimal(10,2) not null,
  description text,
  processed_by uuid references public.users(id) on delete set null,
  status transaction_status default 'completed',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- User-Venue relationships (for staff access)
create table public.user_venues (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  venue_id uuid references public.venues(id) on delete cascade,
  role staff_role not null,
  created_at timestamp with time zone default now(),
  unique(user_id, venue_id)
);

-- User-Company relationships (for company admins)
create table public.user_companies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  role company_role not null,
  created_at timestamp with time zone default now(),
  unique(user_id, company_id)
);

-- Row Level Security (RLS) policies
alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.venues enable row level security;
alter table public.memberships enable row level security;
alter table public.transactions enable row level security;
alter table public.user_venues enable row level security;
alter table public.user_companies enable row level security;

-- Users can read their own data
create policy "Users can read own data" on public.users
  for select using (auth.uid() = id);

-- Users can update their own data
create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);

-- Everyone can read companies (for browsing)
create policy "Everyone can read companies" on public.companies
  for select to authenticated using (true);

-- Everyone can read venues (for browsing)
create policy "Everyone can read venues" on public.venues
  for select to authenticated using (true);

-- Users can read their own memberships
create policy "Users can read own memberships" on public.memberships
  for select using (auth.uid() = user_id);

-- Users can read their own transactions
create policy "Users can read own transactions" on public.transactions
  for select using (auth.uid() = user_id);

-- Staff can read transactions for their venues
create policy "Staff can read venue transactions" on public.transactions
  for select using (
    exists (
      select 1 from public.user_venues uv
      where uv.user_id = auth.uid() and uv.venue_id = transactions.venue_id
    )
  );

-- Functions to update updated_at timestamps
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_users_updated_at before update on public.users
  for each row execute function public.update_updated_at_column();

create trigger update_companies_updated_at before update on public.companies
  for each row execute function public.update_updated_at_column();

create trigger update_venues_updated_at before update on public.venues
  for each row execute function public.update_updated_at_column();

create trigger update_memberships_updated_at before update on public.memberships
  for each row execute function public.update_updated_at_column();

create trigger update_transactions_updated_at before update on public.transactions
  for each row execute function public.update_updated_at_column();

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, phone, full_name, role)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create user profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Insert demo data
-- Companies
insert into public.companies (id, name, description) values
  ('11111111-1111-1111-1111-111111111111', 'Entertainment Plus', 'Premium KTV and dining experiences'),
  ('22222222-2222-2222-2222-222222222222', 'Sports Arena', 'Basketball and badminton courts');

-- Venues for Entertainment Plus
insert into public.venues (company_id, name, type, address) values
  ('11111111-1111-1111-1111-111111111111', 'KTV Palace Downtown', 'ktv', '123 Main St, Downtown'),
  ('11111111-1111-1111-1111-111111111111', 'KTV Luxury Uptown', 'ktv', '456 High St, Uptown'),
  ('11111111-1111-1111-1111-111111111111', 'Golden Dragon Restaurant', 'restaurant', '789 Food Ave, Central'),
  ('11111111-1111-1111-1111-111111111111', 'Sakura Sushi Bar', 'restaurant', '321 Sushi Lane, East Side');

-- Venues for Sports Arena
insert into public.venues (company_id, name, type, address) values
  ('22222222-2222-2222-2222-222222222222', 'Court A Basketball', 'basketball_court', '111 Sports Blvd, North'),
  ('22222222-2222-2222-2222-222222222222', 'Court B Basketball', 'basketball_court', '111 Sports Blvd, North'),
  ('22222222-2222-2222-2222-222222222222', 'Badminton Central', 'badminton_court', '222 Racket St, South');
