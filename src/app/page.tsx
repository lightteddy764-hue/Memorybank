export default function Home() {
  return (
    <main className="container">
      <header className="mb-8" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h1>Memory Bank</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
          Your AI's persistent memory. Connect your projects, log architecture decisions, and eliminate hallucination.
        </p>
        <button className="btn-primary">Connect New Project</button>
      </header>

      <section className="grid-auto mt-8">
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', marginRight: '12px' }}></div>
            <h2 style={{ margin: 0 }}>Active Projects</h2>
          </div>
          <p>You currently have no projects connected to the memory bank.</p>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>Pro Tip</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>Use the MCP Server endpoint to allow your local AI to automatically log lessons learned here.</p>
          </div>
        </div>

        <div className="glass-panel">
          <h2>Recent Memories</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card" style={{ opacity: 0.5 }}>
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
