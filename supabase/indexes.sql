-- ============================================================
-- Memory Bank — Schema Upgrades & Performance Indexes
-- Run this in your Supabase SQL Editor (one-time setup)
-- ============================================================

-- 0. Ensure missing graph columns exist (fixes ERROR 42703)
ALTER TABLE memories ADD COLUMN IF NOT EXISTS entities text[];
ALTER TABLE memories ADD COLUMN IF NOT EXISTS related_memory_ids uuid[];
ALTER TABLE memories ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 1. Critical: speeds up ALL project-scoped memory queries
CREATE INDEX IF NOT EXISTS idx_memories_project_id 
  ON memories(project_id);

-- 2. Speeds up type-filtered queries (architecture, lessonsLearned, etc.)
CREATE INDEX IF NOT EXISTS idx_memories_type 
  ON memories(type);

-- 3. Speeds up ordering by recency (used in profile + search)
CREATE INDEX IF NOT EXISTS idx_memories_created_at 
  ON memories(created_at DESC);

-- 4. Composite: covers "project memories ordered by date" in one index
CREATE INDEX IF NOT EXISTS idx_memories_project_created 
  ON memories(project_id, created_at DESC);

-- 5. Speeds up API key lookups on every single request
CREATE INDEX IF NOT EXISTS idx_projects_api_key 
  ON projects(api_key);

-- 6. Speeds up IP-based project listing (home page load)
CREATE INDEX IF NOT EXISTS idx_projects_user_ip 
  ON projects(user_ip);

-- 7. Full-text search index on memory content (enables fast keyword search)
CREATE INDEX IF NOT EXISTS idx_memories_content_fts 
  ON memories USING GIN(to_tsvector('english', content));

-- 8. GIN index for entity array containment queries
CREATE INDEX IF NOT EXISTS idx_memories_entities 
  ON memories USING GIN(entities);

-- ============================================================
-- Verify indexes were created:
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE tablename IN ('memories', 'projects') 
-- ORDER BY tablename, indexname;
-- ============================================================
