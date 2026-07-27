import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/server';

function extractEntities(text: string): string[] {
  const commonTech = ['Next.js', 'React', 'Render', 'Supabase', 'PostgreSQL', 'TypeScript', 'JavaScript', 'Auth', 'API', 'Database', 'UI', 'Component', 'Hook', 'SQL', 'MCP', 'CSS', 'Tailwind', 'Vector', 'Embedding', 'Node.js', 'Vercel', 'NPM', 'Git', 'GitHub', 'SaaS', 'RLS', 'Schema', 'Migration', 'Docker', 'Python', 'Graph', 'Cursor', 'Windsurf', 'Claude'];
  const found = new Set<string>();
  commonTech.forEach(tech => {
    if (new RegExp(`\\b${tech.replace('.', '\\.')}\\b`, 'i').test(text)) {
      found.add(tech);
    }
  });
  const matches = text.match(/\b[A-Z][a-zA-Z0-9_-]{2,}\b/g);
  if (matches) {
    matches.forEach(m => {
      if (!['The', 'This', 'When', 'With', 'From', 'Have', 'Must', 'After', 'Before', 'Your', 'Our', 'Using', 'Save', 'Note', 'And', 'For', 'But'].includes(m)) {
        found.add(m);
      }
    });
  }
  return Array.from(found).slice(0, 8);
}

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

    const { content, type, entities, related_memory_ids } = await request.json();

    if (!content || !type) {
      return NextResponse.json({ error: 'content and type are required' }, { status: 400 });
    }

    const resolvedEntities = (entities && Array.isArray(entities) && entities.length > 0)
      ? entities
      : extractEntities(content);

    const resolvedRelations = (related_memory_ids && Array.isArray(related_memory_ids))
      ? related_memory_ids
      : [];

    // Insert the memory using the resolved project ID and graph attributes
    const { data, error } = await supabaseAdmin
      .from('memories')
      .insert([
        { 
          project_id: project.id, 
          content, 
          type,
          entities: resolvedEntities,
          related_memory_ids: resolvedRelations
        }
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
