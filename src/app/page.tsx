import { supabaseAdmin } from '@/utils/supabase/server';
import { getUserIp } from '@/app/actions';
import CreateProjectForm from '@/components/CreateProjectForm';
import KnowledgeGraph from '@/components/KnowledgeGraph';

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
    <main className="container">
      <header className="mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Memory Bank</h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#a1a1aa' }}>Frictionless access via IP: <span style={{ color: '#10b981', fontFamily: 'monospace' }}>{userIp}</span></p>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#a1a1aa', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
          ⚡ Zero-Login AI Superhouse
        </div>
      </header>

      <div style={{ marginBottom: '2.5rem' }}>
        <CreateProjectForm />
      </div>

      <section style={{ marginBottom: '3rem' }}>
        <KnowledgeGraph memories={memories} />
      </section>

      <section className="grid-auto mt-8">
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', marginRight: '12px' }}></div>
            <h2 style={{ margin: 0 }}>Your IP Projects</h2>
          </div>
          
          {!projects || projects.length === 0 ? (
            <p style={{ color: '#a1a1aa' }}>You currently have no projects created from this IP address ({userIp}). Click the button above to create your first Memory Bank!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {projects.map((project) => (
                <div key={project.id} className="glass-card">
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.2rem' }}>{project.name}</h3>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#a1a1aa' }}>{project.description || 'No description provided.'}</p>
                  
                  <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.3rem' }}>Your API Key for this project:</p>
                    <code style={{ fontSize: '0.9rem', color: '#10b981', wordBreak: 'break-all', display: 'block', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                      {project.api_key}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="glass-card mt-8" style={{ borderColor: 'rgba(59, 130, 246, 0.3)', background: 'rgba(59, 130, 246, 0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#60a5fa', marginBottom: '0.5rem' }}>How to connect your AI</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: 0, color: '#d1d5db' }}>
              Copy the API Key above and paste it into your local `.env.local` file as `MEMORY_BANK_API_KEY`. When you run the CLI, your local AI will automatically write memories to this specific project!
            </p>
          </div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Recent Activity Feed</h2>
            <span style={{ fontSize: '0.8rem', color: '#a1a1aa', background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              {memories.length} memories
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Memories added by your AI appear here in real-time as you code.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', maxHeight: '550px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {memories.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                No memories saved yet. Start coding with your AI assistant!
              </div>
            ) : (
              memories.map((mem) => {
                const badgeColors: Record<string, string> = {
                  activeContext: 'rgba(16, 185, 129, 0.2)',
                  lessonsLearned: 'rgba(139, 92, 246, 0.2)',
                  architecture: 'rgba(6, 182, 212, 0.2)',
                  general: 'rgba(245, 158, 11, 0.2)',
                };
                const textColors: Record<string, string> = {
                  activeContext: '#34d399',
                  lessonsLearned: '#a78bfa',
                  architecture: '#22d3ee',
                  general: '#fbbf24',
                };
                return (
                  <div key={mem.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: `3px solid ${textColors[mem.type] || '#fff'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', background: badgeColors[mem.type] || 'rgba(255,255,255,0.1)', color: textColors[mem.type] || '#fff' }}>
                        {mem.type}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(mem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#f8fafc', margin: 0, lineHeight: 1.5 }}>{mem.content}</p>
                    {mem.entities && mem.entities.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.2rem' }}>
                        {mem.entities.map((ent: string, idx: number) => (
                          <span key={idx} style={{ fontSize: '0.7rem', color: '#ec4899', background: 'rgba(236, 72, 153, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                            #{ent}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
