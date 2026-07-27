-- Run this if you already created the projects table
alter table projects
add column if not exists api_key uuid default gen_random_uuid() not null unique;
