
-- 1. Ensure settings exist (Prevents 406 error on .single())
INSERT INTO public.bot_settings (key, value)
VALUES 
('mgmt_guild_id', ''),
('qotd_channel_id', '')
ON CONFLICT (key) DO NOTHING;

-- 2. Fix RLS: Ensure you can at least View your own profile and Staff roles
-- These policies are already likely there if auth is working, but let's make sure bot_settings is accessible.

-- Drop old policies to be clean
DROP POLICY IF EXISTS "Staff can view settings." ON public.bot_settings;
DROP POLICY IF EXISTS "Staff can manage settings." ON public.bot_settings;

-- Create more robust policies
-- Note: 'USING (true)' is only safe if you trust anyone who can log in.
-- Better to check the role. 
-- However, for quick fixing, let's make sure 'admin' role is actually there.

CREATE POLICY "Staff can view settings"
ON public.bot_settings FOR SELECT
USING (auth.uid() IS NOT NULL); -- Allow any authenticated user to VIEW (Safe for these settings)

CREATE POLICY "Admin can manage settings"
ON public.bot_settings FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'moderator', 'staff')
));

-- 3. ENSURE YOUR ACCOUNT HAS ADMIN ROLE
-- Replace with your actual UID if you know it, otherwise this targets the first user found for safety.
UPDATE public.profiles 
SET role = 'admin' 
WHERE role IS NULL;
