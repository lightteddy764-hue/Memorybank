import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/server';

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

    const { project_id } = await request.json();

    if (!project_id) {
      return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
    }

    // Look up the project and verify it belongs to user
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, name, created_at')
      .eq('id', project_id)
      .eq('user_id', userKey.user_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    // Supermemory <50ms profile pattern: Parallel targeted queries instead of 1 massive table scan
    const [
      { count: totalMemories },
      { data: staticFactsData },
      { data: dynamicContextData },
      { data: entityData }
    ] = await Promise.all([
      // 1. Fast total count (no row data)
      supabaseAdmin.from('memories').select('*', { count: 'exact', head: true }).eq('project_id', project.id),
      
      // 2. Static facts (core knowledge)
      supabaseAdmin.from('memories')
        .select('id, content, type, entities')
        .eq('project_id', project.id)
        .in('type', ['architecture', 'lessonsLearned'])
        .order('created_at', { ascending: false })
        .limit(100),
        
      // 3. Dynamic context (recent active memory)
      supabaseAdmin.from('memories')
        .select('id, content, created_at, entities')
        .eq('project_id', project.id)
        .in('type', ['activeContext', 'general'])
        .order('created_at', { ascending: false })
        .limit(5),
        
      // 4. Graph entities (lightweight fetch of just the entities column)
      supabaseAdmin.from('memories')
        .select('entities')
        .eq('project_id', project.id)
        .not('entities', 'is', null)
    ]);

    const staticFacts = staticFactsData || [];
    const dynamicContext = dynamicContextData || [];

    // Aggregate Entity Registry (Knowledge Graph nodes)
    const entityCounts = new Map<string, number>();
    (entityData || []).forEach(m => {
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
        total_memories: totalMemories || 0,
      },
      static_facts: staticFacts,
      dynamic_context: dynamicContext,
      knowledge_graph_nodes: topEntities
    };

    return NextResponse.json({ success: true, profile }, { 
      status: 200,
      headers: {
        // Cache at Vercel Edge for 30s, allow stale for 60s — dramatically cuts Supabase invocations
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
