import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/server';

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const apiKey = authHeader.replace('Bearer ', '');

    // Validate API key and get user_id
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

    // Ensure the project belongs to this user
    const { data: project, error: projectErr } = await supabaseAdmin
      .from('projects')
      .select('id, name')
      .eq('id', project_id)
      .eq('user_id', userKey.user_id)
      .single();

    if (projectErr || !project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    // Delete all memories for this project first
    await supabaseAdmin
      .from('memories')
      .delete()
      .eq('project_id', project_id);

    // Delete the project
    const { error: deleteErr } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', project_id)
      .eq('user_id', userKey.user_id);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Project '${project.name}' deleted successfully.` });
  } catch (err: any) {
    console.error('Error in /api/project/delete:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
