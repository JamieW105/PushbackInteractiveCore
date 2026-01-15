
-- Seed data for Default Questions (Templates)
-- Run this in your Supabase SQL Editor to populate the 'Default Questions' tab.

INSERT INTO public.qotd_posts (question, title, mode, options, is_template)
VALUES 
(
    'How do you feel about the latest update?', 
    'Community Check-in', 
    'reaction', 
    '[{"label": "Love it!", "emoji": "😍"}, {"label": "It''s okay", "emoji": "😐"}, {"label": "Needs work", "emoji": "🛠️"}]'::jsonb,
    true
),
(
    'What features would you like to see in the next patch?', 
    'Feature Request', 
    'thread', 
    '[]'::jsonb,
    true
),
(
    'Who is your favorite operator in the game?', 
    'Operator Poll', 
    'reaction', 
    '[{"label": "Alpha", "emoji": "🅰️"}, {"label": "Bravo", "emoji": "🅱️"}]'::jsonb,
    true
);
