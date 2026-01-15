-- QOTD ENUMS
create type qotd_mode as enum ('reaction', 'thread');

-- Update qotd_posts table to include new fields
alter table public.qotd_posts 
add column if not exists mode qotd_mode default 'reaction',
add column if not exists options jsonb default '[]'::jsonb, -- Array of { label: string, emoji: string }
add column if not exists pings jsonb default '[]'::jsonb, -- Array of { type: 'role' | 'user', id: string, name: string }
add column if not exists is_template boolean default false,
add column if not exists title text; -- Optional title separate from main question text if needed

-- Make author_id optional (for system templates)
alter table public.qotd_posts alter column author_id drop not null;

-- PROFILES Policies (Ensure these exist if not already)
-- Note: Re-running these might error if they exist, but good for reference.
-- ensure we can read all profiles to select users for pings
create policy "Authenticated users can view all profiles."
  on public.profiles for select
  using ( auth.role() = 'authenticated' );
