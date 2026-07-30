'use client';

import React, { useState } from 'react';
import { Key, Copy, Check, Plus, Eye, EyeOff, Trash2 } from 'lucide-react';

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
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

  const handleRevoke = (id: string) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      alert(`Revoke action for key ${id} would be triggered here.`);
      // TODO: Implement actual API call to DELETE /api/apikey
    }
  };

  const handleCreateKey = () => {
    alert("Create new master key action would be triggered here.");
    // TODO: Implement actual API call to POST /api/apikey
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
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
        >
          <Plus style={{ width: '16px', height: '16px' }} />
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
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', marginTop: '8px' }}
                    >
                      <Plus style={{ width: '16px', height: '16px' }} />
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
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '6px', 
                          padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', 
                          borderRadius: '6px', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
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
    </div>
  );
}
