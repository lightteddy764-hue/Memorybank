-- Run this in your Supabase SQL Editor to upgrade an existing table:
alter table projects
add column if not exists api_key uuid default gen_random_uuid() not null unique;

alter table projects
add column if not exists user_ip text;

-- Knowledge Graph Upgrades for memories table:
alter table memories
add column if not exists entities text[];

alter table memories
add column if not exists related_memory_ids uuid[];
