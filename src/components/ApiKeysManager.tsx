'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Copy, Check, Plus, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';
import { useUI } from '@/context/UIContext';

interface UserApiKey {
  id: string;
  user_id: string;
  name: string;
  api_key: string;
  created_at: string;
}

interface ApiKeysManagerProps {
  apiKeys?: UserApiKey[];
}

export default function ApiKeysManager({ apiKeys = [] }: ApiKeysManagerProps) {
  const router = useRouter();
  const { showToast, confirm } = useUI();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    showToast({ message: 'Key copied to clipboard!', type: 'success' });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleKeys(newVisible);
  };

  const handleRevoke = async (id: string) => {
    const confirmed = await confirm({
      title: 'Revoke API Key',
      description: 'Are you sure you want to revoke this API key? Any MCP servers using this key will immediately lose access. This action cannot be undone.',
      confirmText: 'Revoke Key',
      danger: true
    });
    
    if (confirmed) {
      try {
        setIsLoading(true);
        const res = await fetch('/api/keys/revoke', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        if (!res.ok) throw new Error('Failed to revoke key');
        showToast({ message: 'API Key successfully revoked', type: 'success' });
        router.refresh();
      } catch (err: any) {
        showToast({ message: err.message || 'Something went wrong', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreateKey = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Master Key' })
      });
      if (!res.ok) throw new Error('Failed to create key');
      showToast({ message: 'Master Key successfully created', type: 'success' });
      router.refresh();
    } catch (err: any) {
      showToast({ message: err.message || 'Something went wrong', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px 0' }}>Master API Keys</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Manage your global API keys. One key grants MCP access to all your projects.</p>
        </div>
        <button
          onClick={handleCreateKey}
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isLoading ? '#6b7280' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.875rem', fontWeight: 500, cursor: isLoading ? 'not-allowed' : 'pointer' }}
        >
          {isLoading ? <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" /> : <Plus style={{ width: '16px', height: '16px' }} />}
          Create Master Key
        </button>
      </div>

      <div style={{ background: '#0a0a0a', border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#18181b', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Name</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secret Key</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', width: '250px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '48px 32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Key style={{ width: '32px', height: '32px', color: 'var(--border-light)' }} />
                    <p style={{ margin: 0 }}>No master keys found. Create one to connect your AI assistant.</p>
                    <button
                      onClick={handleCreateKey}
                      disabled={isLoading}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isLoading ? '#d1d5db' : '#fff', color: '#000', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '0.875rem', fontWeight: 500, cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
                    >
                      {isLoading ? <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" /> : <Plus style={{ width: '16px', height: '16px' }} />}
                      Create Master Key
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              apiKeys.map(key => (
                <tr key={key.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: 500 }}>{key.name}</td>
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {new Date(key.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {visibleKeys.has(key.id) ? key.api_key : '••••••••••••••••••••••••••••••••'}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => toggleVisibility(key.id)}
                        style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: '6px', background: '#18181b', border: '1px solid var(--border-light)', 
                          borderRadius: '6px', color: '#fff', cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        title={visibleKeys.has(key.id) ? "Hide Key" : "Show Key"}
                      >
                        {visibleKeys.has(key.id) ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
                      </button>

                      <button 
                        onClick={() => copyToClipboard(key.api_key)}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '6px', 
                          padding: '6px 12px', background: '#18181b', border: '1px solid var(--border-light)', 
                          borderRadius: '6px', color: '#fff', fontSize: '0.75rem', cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {copiedKey === key.api_key ? (
                          <><Check style={{ width: '14px', height: '14px', color: '#10b981' }} /> Copied</>
                        ) : (
                          <><Copy style={{ width: '14px', height: '14px' }} /> Copy</>
                        )}
                      </button>

                      <button 
                        onClick={() => handleRevoke(key.id)}
                        disabled={isLoading}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '6px', 
                          padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', 
                          borderRadius: '6px', color: isLoading ? '#9ca3af' : '#ef4444', fontSize: '0.75rem', cursor: isLoading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isLoading ? <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" /> : <Trash2 style={{ width: '14px', height: '14px' }} />}
                        Revoke
                      </button>
                    </div>
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
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', color: '#fff' }}>Global Access Rights</h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            These Master Keys grant full read/write access to ALL projects under your account. Configure your AI MCP server with one of these keys.
          </p>
        </div>
      </div>

      {/* Autonomous Zero-Touch Setup Feature */}
      <div className="glass-panel" style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
              Zero-Touch AI Autonomous Setup
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, maxWidth: '800px' }}>
              Don't want to create projects manually in the dashboard? Copy this Global Setup Prompt into your IDE (Cursor, Claude, etc.) when starting a new codebase. Your AI will autonomously ping our server, create the project, save the local ID, and begin tracking your workflow invisibly.
            </p>
          </div>
          <button 
            onClick={() => {
              const origin = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';
              const sampleKey = apiKeys.length > 0 ? apiKeys[0].api_key : '[USER_PASTES_KEY_HERE]';
              const prompt = `# SYSTEM INSTRUCTION: MEMORY BANK AUTONOMOUS SETUP
You are connected to an external Memory Bank designed to track every detail of this project.

**Your Master Configuration:**
- Global Setup Endpoint: \`${origin}/api/project/create\`
- Master API Key: \`${sampleKey}\`

**Setup Directives (RUN IMMEDIATELY IF NO PROJECT ID EXISTS):**
1. Check if a local \`.memorybank-id\` file exists in the root of this repository.
2. If it DOES NOT exist, you must create a new project by making a POST request to the Global Setup Endpoint:
   - Header: \`Authorization: Bearer [Master API Key]\`
   - Body: \`{"name": "Auto-Generated Project - [Insert Repo Name]", "description": "Project created autonomously from IDE"}\`
3. The API will respond with a JSON object containing \`project.id\`. Save this ID to a file named \`.memorybank-id\`.

**Memory Directives (RUN AFTER SETUP):**
1. **Be Exhaustive:** Document ALL project details, stack choices, and architecture decisions.
2. **Continuous Updates:** After every prompt or set of changes, use \`curl\` to POST a summary to \`${origin}/api/memory/add\`.
   - Include the Master API Key in the Authorization header.
   - Include the \`project_id\` (from \`.memorybank-id\`) in the JSON body.
3. **Immutable History:** Append-only. Do not attempt to overwrite or delete old facts. Add new facts as new memories.`;
              
              navigator.clipboard.writeText(prompt);
              showToast({ message: 'Global AI Setup Prompt copied to clipboard!', type: 'success' });
            }}
            className="btn-primary" 
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
              color: '#fff', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '8px', 
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
              flexShrink: 0
            }}
          >
            <Copy style={{ width: '18px', height: '18px', display: 'inline-block', marginRight: '8px', verticalAlign: 'text-bottom' }} />
            Copy Global Prompt
          </button>
        </div>

        <div style={{ background: '#000', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '16px', overflowX: 'auto' }}>
          <pre style={{ margin: 0, fontSize: '0.8rem', color: '#ededed', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {`# SYSTEM INSTRUCTION: MEMORY BANK AUTONOMOUS SETUP
You are connected to an external Memory Bank designed to track every detail of this project... (Click copy to get the full prompt with your injected Master Key)`}
          </pre>
        </div>
      </div>
    </div>
  );
}
