import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }
    
    const apiKey = authHeader.replace('Bearer ', '');

    // Look up existing master key to inherit user_id for zero-login scope
    const { data: userKey, error: keyErr } = await supabaseAdmin
      .from('user_api_keys')
      .select('user_id')
      .eq('api_key', apiKey)
      .single();

    if (keyErr || !userKey) {
      return NextResponse.json({ error: 'Invalid API Key provided in Authorization header' }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Project name is required and must be a non-empty string' }, { status: 400 });
    }

    // Insert the new project
    const { data: newProject, error: insertError } = await supabaseAdmin
      .from('projects')
      .insert([
        { 
          name: name.trim(), 
          description: description || '', 
          user_id: userKey.user_id,
          user_ip: '0.0.0.0' // Legacy fallback
        }
      ])
      .select()
      .single();

    if (insertError || !newProject) {
      console.error('Failed to create project:', insertError);
      return NextResponse.json({ error: insertError?.message || 'Failed to create project in database' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      project: newProject,
      message: `Project '${newProject.name}' created successfully! To switch your AI memory scope to this project, update MEMORY_BANK_API_KEY in your local .env.local or MCP server config to: ${newProject.api_key}`
    }, { status: 201 });
  } catch (err: any) {
    console.error('Error in /api/project/create:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
