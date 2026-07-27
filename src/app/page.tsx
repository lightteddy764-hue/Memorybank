import { supabaseAdmin } from '@/utils/supabase/server';
import { getUserIp } from '@/app/actions';
import CreateProjectForm from '@/components/CreateProjectForm';

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

  return (
    <main className="container">
      <header className="mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Memory Bank</h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#a1a1aa' }}>Frictionless access via IP: <span style={{ color: '#10b981', fontFamily: 'monospace' }}>{userIp}</span></p>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#a1a1aa', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
          ⚡ Zero-Login Onboarding
        </div>
      </header>

      <div style={{ marginBottom: '2rem' }}>
        <CreateProjectForm />
      </div>

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
          <h2>Recent Activity</h2>
          <p style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Memories added by your AI will appear here in real-time as you code.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card" style={{ opacity: 0.3 }}>
                <div style={{ width: '100%', height: '16px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px' }}></div>
                <div style={{ width: '60%', height: '16px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
