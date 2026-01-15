
-- Table for storing simple key-value settings for bots/app
create table if not exists public.bot_settings (
  key text primary key,
  value text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references public.profiles(id)
);

-- RLS
alter table public.bot_settings enable row level security;

create policy "Staff can view settings."
  on public.bot_settings for select
  using ( exists ( select 1 from public.profiles where id = auth.uid() and role in ('admin', 'moderator', 'staff') ) );

create policy "Staff can manage settings."
  on public.bot_settings for all
  using ( exists ( select 1 from public.profiles where id = auth.uid() and role in ('admin', 'moderator', 'staff') ) );
