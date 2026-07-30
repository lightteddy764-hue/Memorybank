import { supabaseAdmin } from '@/utils/supabase/server';
import { getUserIp } from '@/app/actions';
import DashboardLayout from '@/components/DashboardLayout';

// Opt out of static rendering so we always see the latest projects
export const dynamic = 'force-dynamic';

export default async function Home() {
  const userIp = await getUserIp();

  // Fetch projects and all memories in parallel (not serial) — Supermemory pattern
  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('user_ip', userIp)
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

  return (
    <DashboardLayout
      projects={projects || []}
      memories={memories}
      userIp={userIp}
    />
  );
}
