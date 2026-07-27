-- Run this in your Supabase SQL Editor to upgrade an existing table:
alter table projects
add column if not exists api_key uuid default gen_random_uuid() not null unique;

alter table projects
add column if not exists user_ip text;
