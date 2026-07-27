import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

export async function POST(request: Request) {
  try {
    const { projectId, content, type } = await request.json();

    if (!projectId || !content || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // TODO: In a full production app, you would generate an embedding for `content` here
    // using an API like OpenAI (text-embedding-3-small) or Google Gemini.
    // For now, we will insert it without the embedding vector to get the base flow working.
    
    const { data, error } = await supabase
      .from('memories')
      .insert([
        { project_id: projectId, content, type }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
