import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/server';

// ── Cognee-inspired entity extraction ───────────────────────────────────────
// Multi-strategy: tech dictionary + proper nouns + version patterns + hashtags
const TECH_DICTIONARY = new Set([
  // JS ecosystem
  'Next.js','React','Vue','Angular','Svelte','Remix','Astro','Vite','Webpack','Turbopack',
  'Node.js','Bun','Deno','Express','Fastify','Hono',
  // DB & Backend
  'Supabase','PostgreSQL','MySQL','SQLite','MongoDB','Redis','Prisma','Drizzle',
  'pgvector','GraphQL','REST','tRPC',
  // Auth & Security
  'Auth','OAuth','JWT','RLS','RBAC','Clerk','NextAuth','Lucia',
  // AI / ML
  'OpenAI','Anthropic','Claude','GPT','LLM','RAG','Vector','Embedding','MCP',
  'Ollama','LangChain','Vercel AI','Hugging Face',
  // DevOps / Infra
  'Vercel','Render','AWS','GCP','Azure','Docker','Kubernetes','GitHub','GitLab',
  'CI','CD','Nginx','Cloudflare','Tailscale',
  // Languages
  'TypeScript','JavaScript','Python','Rust','Go','Java','Swift','Kotlin','C++',
  // Tools & Patterns
  'Git','NPM','Yarn','pnpm','ESLint','Prettier','Vitest','Jest','Playwright',
  'CSS','Tailwind','SaaS','API','SDK','CLI','UI','UX','DX',
  // Editors / IDEs
  'Cursor','Windsurf','VSCode','Neovim','Copilot','Antigravity',
]);

function extractEntities(text: string): string[] {
  const found = new Set<string>();

  // Strategy 1: Match known tech dictionary (case-insensitive)
  TECH_DICTIONARY.forEach(tech => {
    const escaped = tech.replace(/\./g, '\\.').replace(/\+/g, '\\+');
    if (new RegExp(`(?:^|[\\s\\W])${escaped}(?=[\\s\\W]|$)`, 'i').test(text)) {
      found.add(tech);
    }
  });

  // Strategy 2: Capitalized proper nouns (names, tools, frameworks the dictionary doesn't know)
  const properNouns = text.match(/\b[A-Z][a-zA-Z0-9.+#-]{2,}\b/g) || [];
  const STOP_WORDS = new Set(['The','This','When','With','From','Have','Must','After',
    'Before','Your','Our','Using','Save','Note','And','For','But','That','Will',
    'Can','Are','Was','Has','Been','They','Also','More','Some','Any','All','Not']);
  properNouns.forEach(m => {
    if (!STOP_WORDS.has(m) && !found.has(m)) found.add(m);
  });

  // Strategy 3: Version patterns (v3.2, @latest, npm:package)
  const versionMatches = text.match(/\bv?\d+\.\d+(?:\.\d+)?(?:-\w+)?\b/g) || [];
  versionMatches.forEach(v => found.add(v));

  // Strategy 4: Quoted terms (high-signal: author explicitly called them out)
  const quoted = text.match(/["'`]([A-Za-z][A-Za-z0-9._-]{1,30})["'`]/g) || [];
  quoted.forEach(q => found.add(q.replace(/["'`]/g, '')));

  // Strategy 5: Hashtags (#entity)
  const hashtags = text.match(/#([A-Za-z][A-Za-z0-9_-]+)/g) || [];
  hashtags.forEach(h => found.add(h.slice(1)));

  return Array.from(found).slice(0, 12); // increased from 8 to 12
}

// ── Auto-infer memory type from content when not provided ───────────────────
// Cognee-inspired: avoids requiring AI to always specify a type correctly
function autoInferType(content: string, explicitType?: string): string {
  if (explicitType && ['activeContext','lessonsLearned','architecture','general'].includes(explicitType)) {
    return explicitType;
  }
  const lower = content.toLowerCase();
  if (/\b(architecture|stack|tech|built with|using|setup|infrastructure|database|api|endpoint|deploy)\b/.test(lower)) return 'architecture';
  if (/\b(lesson|learned|mistake|bug|fixed|issue|problem|solved|gotcha|warning|note:|important)\b/.test(lower)) return 'lessonsLearned';
  if (/\b(currently|working on|in progress|today|now|active|context|status|blocked|next step)\b/.test(lower)) return 'activeContext';
  return 'general';
}


export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }
    
    const apiKey = authHeader.replace('Bearer ', '');

    // Look up the master key
    const { data: userKey, error: keyErr } = await supabaseAdmin
      .from('user_api_keys')
      .select('user_id')
      .eq('api_key', apiKey)
      .single();

    if (keyErr || !userKey) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
    }

    const { project_id, content, type, entities, related_memory_ids } = await request.json();

    if (!project_id) {
      return NextResponse.json({ error: 'project_id is required since this is a global master key' }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    // Verify the project belongs to this user_ip
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('user_id', userKey.user_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or you do not have permission' }, { status: 404 });
    }

    // Auto-infer type from content if not provided or invalid (Cognee pattern)
    const resolvedType = autoInferType(content, type);

    const resolvedEntities = (entities && Array.isArray(entities) && entities.length > 0)
      ? entities
      : extractEntities(content);

    const resolvedRelations = (related_memory_ids && Array.isArray(related_memory_ids))
      ? related_memory_ids
      : [];


    // Insert the memory using the resolved project ID and graph attributes
    let { data, error } = await supabaseAdmin
      .from('memories')
      .insert([
        { 
          project_id: project.id, 
          content, 
          type: resolvedType,
          entities: resolvedEntities,
          related_memory_ids: resolvedRelations
        }
      ])
      .select()
      .single();

    // Fallback if entities or related_memory_ids column has not been added to Supabase schema yet
    if (error && (error.code === 'PGRST204' || error.message?.includes('schema cache') || error.message?.includes('column'))) {
      console.warn('Graph columns missing in Supabase. Falling back to basic memory insert. Please run supabase/alter_schema.sql in your Supabase SQL editor.');
      const fallbackRes = await supabaseAdmin
        .from('memories')
        .insert([
          { 
            project_id: project.id, 
            content, 
            type: resolvedType
          }
        ])
        .select()
        .single();
      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
