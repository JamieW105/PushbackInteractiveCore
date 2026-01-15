-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ROLES ENUM
create type user_role as enum ('admin', 'moderator', 'staff', 'user');

-- PROFILES TABLE (Public profile for each user)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  username text,
  role user_role default 'user'::user_role,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- QOTD (Question of the Day) TABLE
create table public.qotd_posts (
  id uuid default uuid_generate_v4() primary key,
  question text not null,
  author_id uuid references public.profiles(id) not null,
  status text check (status in ('draft', 'scheduled', 'posted')) default 'draft',
  scheduled_for timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.qotd_posts enable row level security;

create policy "Staff can view all QOTD posts."
  on public.qotd_posts for select
  using ( exists ( select 1 from public.profiles where id = auth.uid() and role in ('admin', 'moderator', 'staff') ) );

create policy "Staff can insert QOTD posts."
  on public.qotd_posts for insert
  with check ( exists ( select 1 from public.profiles where id = auth.uid() and role in ('admin', 'moderator', 'staff') ) );

create policy "Staff can update QOTD posts."
  on public.qotd_posts for update
  using ( exists ( select 1 from public.profiles where id = auth.uid() and role in ('admin', 'moderator', 'staff') ) );

-- MANAGEMENT LOGS TABLE
create table public.bot_management_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  action text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bot_management_logs enable row level security;

create policy "Staff can view logs."
  on public.bot_management_logs for select
  using ( exists ( select 1 from public.profiles where id = auth.uid() and role in ('admin', 'moderator', 'staff') ) );

create policy "System/Staff can insert logs."
  on public.bot_management_logs for insert
  with check ( true ); -- Usually restricted further in real app, but 'true' allows authenticated inserts for now.

-- FUNCTION TO HANDLE NEW USER SIGNUP
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, role)
  values (new.id, new.email, new.raw_user_meta_data ->> 'username', 'user');
  return new;
end;
$$;

-- TRIGGER FOR NEW USER SIGNUP
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
