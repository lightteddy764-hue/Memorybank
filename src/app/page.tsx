import { supabaseAdmin } from '@/utils/supabase/server';
import { getUserIp } from '@/app/actions';
import DashboardLayout from '@/components/DashboardLayout';

// Opt out of static rendering so we always see the latest projects
export const dynamic = 'force-dynamic';

export default async function Home() {
  const userIp = await getUserIp();
  
  // Fetch only the projects created under the current visitor's IP address
  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('user_ip', userIp)
    .order('created_at', { ascending: false });

  const projectIds = (projects || []).map(p => p.id);
  let memories: any[] = [];
  if (projectIds.length > 0) {
    const { data: memData } = await supabaseAdmin
      .from('memories')
      .select('*')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false });
    memories = memData || [];
  }

  return (
    <DashboardLayout
      projects={projects || []}
      memories={memories}
      userIp={userIp}
    />
  );
}
