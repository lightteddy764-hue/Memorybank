import { supabaseAdmin, createClient } from '@/utils/supabase/server';
import DashboardLayout from '@/components/DashboardLayout';
import { redirect } from 'next/navigation';

// Opt out of static rendering so we always see the latest projects
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch projects and all memories in parallel (not serial) — Supermemory pattern
  // Now scoped to the authenticated user's ID
  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const projectIds = (projects || []).map(p => p.id);

  const memories = projectIds.length > 0
    ? await supabaseAdmin
        .from('memories')
        .select('id, project_id, content, type, entities, created_at')  // select only needed cols
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })
        .limit(200)  // cap to prevent huge payloads on large projects
        .then(r => r.data || [])
    : [];

  const userApiKeys = await supabaseAdmin
    .from('user_api_keys')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .then(r => r.data || []);

  return (
    <DashboardLayout
      projects={projects || []}
      memories={memories}
      apiKeys={userApiKeys}
      userEmail={user.email || 'user@example.com'}
      userName={user.user_metadata?.full_name || 'Udita'}
    />
  );
}
