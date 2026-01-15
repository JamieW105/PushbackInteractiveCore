-- 1. Add join_link column to game_servers table
alter table game_servers 
add column if not exists join_link text;
