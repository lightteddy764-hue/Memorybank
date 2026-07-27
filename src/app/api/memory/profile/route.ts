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
      .select('id, name, created_at')
      .eq('api_key', apiKey)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
    }

    // Fetch all memories for this project
    const { data: memories, error: memError } = await supabaseAdmin
      .from('memories')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });

    if (memError) {
      console.error('Supabase error:', memError);
      return NextResponse.json({ error: memError.message }, { status: 500 });
    }

    const allMemories = memories || [];

    // Separate Static Facts vs Dynamic Active Context (Supermemory style)
    const staticFacts = allMemories
      .filter(m => m.type === 'architecture' || m.type === 'lessonsLearned')
      .map(m => ({ id: m.id, content: m.content, type: m.type, entities: m.entities || [] }));

    const dynamicContext = allMemories
      .filter(m => m.type === 'activeContext' || m.type === 'general')
      .slice(0, 5) // top 5 most recent active contexts
      .map(m => ({ id: m.id, content: m.content, created_at: m.created_at, entities: m.entities || [] }));

    // Aggregate Entity Registry (Knowledge Graph nodes)
    const entityCounts = new Map<string, number>();
    allMemories.forEach(m => {
      (m.entities || []).forEach((ent: string) => {
        entityCounts.set(ent, (entityCounts.get(ent) || 0) + 1);
      });
    });

    const topEntities = Array.from(entityCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(e => ({ name: e[0], occurrences: e[1] }));

    const profile = {
      project: {
        id: project.id,
        name: project.name || 'Untitled Project',
        total_memories: allMemories.length,
      },
      static_facts: staticFacts,
      dynamic_context: dynamicContext,
      knowledge_graph_nodes: topEntities
    };

    return NextResponse.json({ success: true, profile }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
