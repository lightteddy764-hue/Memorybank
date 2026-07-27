import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }
    
    const apiKey = authHeader.replace('Bearer ', '');

    // Look up existing project to find user_ip
    const { data: existingProj, error: projErr } = await supabaseAdmin
      .from('projects')
      .select('user_ip')
      .eq('api_key', apiKey)
      .single();

    if (projErr || !existingProj) {
      return NextResponse.json({ error: 'Invalid API Key provided in Authorization header' }, { status: 401 });
    }

    let query = supabaseAdmin
      .from('projects')
      .select('id, name, description, api_key, created_at, user_ip')
      .order('created_at', { ascending: false });

    if (existingProj.user_ip) {
      query = query.eq('user_ip', existingProj.user_ip);
    } else {
      query = query.limit(20);
    }

    const { data: projects, error: listErr } = await query;

    if (listErr) {
      console.error('Failed to list projects:', listErr);
      return NextResponse.json({ error: listErr.message || 'Failed to list projects from database' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      count: projects ? projects.length : 0,
      projects: projects || [] 
    }, { status: 200 });
  } catch (err: any) {
    console.error('Error in /api/project/list:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
