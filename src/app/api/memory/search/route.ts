import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

export async function POST(request: Request) {
  try {
    const { projectId, query } = await request.json();

    if (!projectId || !query) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // TODO: In a production app with embeddings enabled, you would:
    // 1. Generate an embedding for the `query` text.
    // 2. Perform a similarity search in Supabase using `rpc('match_memories', { query_embedding: ... })`.
    //
    // For now, as a fallback until embeddings are configured, we will do a basic text search.
    
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('project_id', projectId)
      .textSearch('content', query);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
