import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }
    
    const apiKey = authHeader.replace('Bearer ', '');

    // Look up the project using the API Key
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('api_key', apiKey)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
    }

    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    // Fetch all memories for the project to perform Graph Traversal & Ranking
    const { data: allMemories, error } = await supabaseAdmin
      .from('memories')
      .select('*')
      .eq('project_id', project.id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!allMemories || allMemories.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter((t: string) => t.length > 2);

    // 1. Find Direct Matches (keyword or entity match)
    const directMatches = new Set<string>();
    const matchedEntities = new Set<string>();

    allMemories.forEach((mem) => {
      const contentLower = (mem.content || '').toLowerCase();
      const isContentMatch = contentLower.includes(queryLower) || queryTerms.some((term: string) => contentLower.includes(term));
      const isEntityMatch = (mem.entities || []).some((ent: string) => queryLower.includes(ent.toLowerCase()) || queryTerms.includes(ent.toLowerCase()));

      if (isContentMatch || isEntityMatch) {
        directMatches.add(mem.id);
        (mem.entities || []).forEach((e: string) => matchedEntities.add(e));
        (mem.related_memory_ids || []).forEach((relId: string) => directMatches.add(relId)); // auto-include direct edges
      }
    });

    // 2. Graph Neighbor Expansion (find memories sharing entities with direct matches)
    const rankedResults = allMemories
      .map((mem) => {
        let score = 0;
        let graphReason = '';

        if (directMatches.has(mem.id)) {
          score += 100;
          graphReason = 'Direct Match / Edge';
        }

        // Add points for shared entities (graph neighbor)
        const sharedEntities = (mem.entities || []).filter((e: string) => matchedEntities.has(e));
        if (sharedEntities.length > 0) {
          score += sharedEntities.length * 20;
          if (!graphReason) {
            graphReason = `Graph Neighbor (Shared: ${sharedEntities.join(', ')})`;
          }
        }

        return { ...mem, _score: score, _graph_reason: graphReason };
      })
      .filter((mem) => mem._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 10);

    return NextResponse.json({ success: true, data: rankedResults }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
