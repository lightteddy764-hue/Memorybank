-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create the projects table
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  user_ip text,
  name text not null,
  description text,
  api_key uuid default gen_random_uuid() not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the memories table
create table memories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  content text not null,
  type text not null, -- e.g., 'activeContext', 'lessonsLearned', 'architecture'
  entities text[], -- Knowledge graph entity tags
  related_memory_ids uuid[], -- Connected memory edges
  embedding vector(768), -- Assuming a 768-dimensional embedding model
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table projects enable row level security;
alter table memories enable row level security;

-- Create policies for projects
create policy "Users can view their own projects."
  on projects for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own projects."
  on projects for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own projects."
  on projects for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own projects."
  on projects for delete
  using ( auth.uid() = user_id );

-- Create policies for memories
create policy "Users can view memories of their projects."
  on memories for select
  using ( 
    exists (
      select 1 from projects 
      where projects.id = memories.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert memories into their projects."
  on memories for insert
  with check ( 
    exists (
      select 1 from projects 
      where projects.id = memories.project_id 
      and projects.user_id = auth.uid()
    )
  );
