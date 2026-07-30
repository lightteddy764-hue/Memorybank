import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const apiKey = authHeader.replace('Bearer ', '');

    // Validate API key and get project in one query
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('api_key', apiKey)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
    }

    const { query } = await request.json();
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const queryTrimmed = query.trim();

    // ── Strategy 1: PostgreSQL Full-Text Search (Supermemory pattern) ──────────
    // Runs entirely in the DB engine — much faster than loading all rows into JS.
    // Uses the GIN index on to_tsvector('english', content) for near-instant matching.
    const ftsQuery = queryTrimmed
      .toLowerCase()
      .split(/\s+/)
      .filter(t => t.length > 1)
      .map(t => `${t}:*`)  // prefix search for partial matches
      .join(' & ');

    const [ftsResult, entityResult] = await Promise.all([
      // Full-text search on content
      supabaseAdmin
        .from('memories')
        .select('*')
        .eq('project_id', project.id)
        .textSearch('content', ftsQuery, { type: 'websearch', config: 'english' })
        .order('created_at', { ascending: false })
        .limit(20),

      // Entity-based search — find memories whose entity tags match query terms
      supabaseAdmin
        .from('memories')
        .select('*')
        .eq('project_id', project.id)
        .overlaps('entities', 
          queryTrimmed.split(/\s+/).map(t => t.trim()).filter(Boolean)
        )
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    // Merge results — deduplicate by id, score and rank
    const allFound = new Map<string, any>();

    (ftsResult.data || []).forEach(mem => {
      allFound.set(mem.id, { ...mem, _score: 80, _graph_reason: 'Full-Text Match' });
    });

    (entityResult.data || []).forEach(mem => {
      if (allFound.has(mem.id)) {
        // Boost score if found in both FTS and entity search
        const existing = allFound.get(mem.id)!;
        allFound.set(mem.id, { ...existing, _score: existing._score + 20, _graph_reason: 'Full-Text + Entity Match' });
      } else {
        allFound.set(mem.id, { ...mem, _score: 60, _graph_reason: 'Entity Match' });
      }
    });

    // ── Strategy 2: Fallback keyword search if DB search returned nothing ──────
    // This handles edge cases where content doesn't tokenize well in English FTS.
    if (allFound.size === 0) {
      const { data: fallbackData } = await supabaseAdmin
        .from('memories')
        .select('*')
        .eq('project_id', project.id)
        .ilike('content', `%${queryTrimmed}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      (fallbackData || []).forEach(mem => {
        allFound.set(mem.id, { ...mem, _score: 50, _graph_reason: 'Keyword Fallback' });
      });
    }

    // ── Strategy 3: Graph Neighbor Expansion (Cognee pattern) ─────────────────
    // For each found memory, find related memories via shared entity tags.
    // This runs as a single batched DB query (not N+1).
    if (allFound.size > 0) {
      const foundEntities = new Set<string>();
      allFound.forEach(mem => {
        (mem.entities || []).forEach((e: string) => foundEntities.add(e));
      });

      if (foundEntities.size > 0) {
        const { data: neighborData } = await supabaseAdmin
          .from('memories')
          .select('*')
          .eq('project_id', project.id)
          .overlaps('entities', Array.from(foundEntities))
          .not('id', 'in', `(${Array.from(allFound.keys()).map(id => `"${id}"`).join(',')})`)
          .order('created_at', { ascending: false })
          .limit(5);

        (neighborData || []).forEach(mem => {
          const sharedCount = (mem.entities || []).filter((e: string) => foundEntities.has(e)).length;
          allFound.set(mem.id, {
            ...mem,
            _score: sharedCount * 15,
            _graph_reason: `Graph Neighbor (${sharedCount} shared entities)`
          });
        });
      }
    }

    // Sort by score descending, return top 10
    const rankedResults = Array.from(allFound.values())
      .sort((a, b) => b._score - a._score)
      .slice(0, 10);

    return NextResponse.json({ success: true, data: rankedResults }, { status: 200 });
  } catch (err: any) {
    console.error('Search error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
