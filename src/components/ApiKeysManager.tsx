'use client';

import React, { useState } from 'react';
import { Key, Copy, Check } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  api_key: string;
  created_at: string;
}

interface ApiKeysManagerProps {
  projects: Project[];
}

export default function ApiKeysManager({ projects }: ApiKeysManagerProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px 0' }}>API Keys</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Manage your project-specific API keys for MCP integration.</p>
        </div>
      </div>

      <div style={{ background: '#0a0a0a', border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#18181b', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project Name</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project ID</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secret Key</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No projects created yet. Create a project to generate an API key.
                </td>
              </tr>
            ) : (
              projects.map(proj => (
                <tr key={proj.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: 500 }}>{proj.name}</td>
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{proj.id}</td>
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    ••••••••••••••••••••••••
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <button 
                      onClick={() => copyToClipboard(proj.api_key)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '6px', 
                        padding: '6px 12px', background: '#18181b', border: '1px solid var(--border-light)', 
                        borderRadius: '6px', color: '#fff', fontSize: '0.75rem', cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {copiedKey === proj.api_key ? (
                        <><Check style={{ width: '14px', height: '14px', color: '#10b981' }} /> Copied</>
                      ) : (
                        <><Copy style={{ width: '14px', height: '14px' }} /> Copy</>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Key style={{ width: '20px', height: '20px', color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', color: '#fff' }}>Keep your keys secure</h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            These keys allow your AI assistant to read and write to your memory banks. Do not share them publicly or commit them to source control.
          </p>
        </div>
      </div>
    </div>
  );
}
