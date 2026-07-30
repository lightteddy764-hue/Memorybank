'use client';

import React, { useState } from 'react';
import AdvancedKnowledgeGraph from './AdvancedKnowledgeGraph';
import { Database, Key, Copy, Check, Clock, Tag, Share2, Sparkles, Activity, Layers, Zap, Bot } from 'lucide-react';
import { useUI } from '@/context/UIContext';

interface Project {
  id: string;
  name: string;
  description?: string;
  api_key: string;
  created_at: string;
}

interface Memory {
  id: string;
  project_id: string;
  content: string;
  type: string;
  entities?: string[];
  related_memory_ids?: string[];
  created_at: string;
}

export default function ProjectDashboard({
  project,
  allMemories
}: {
  project: Project;
  allMemories: Memory[];
}) {
  const { showToast } = useUI();
  const [copied, setCopied] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'architecture' | 'lessonsLearned' | 'activeContext' | 'general'>('all');

  // Filter memories to only this project
  const projectMemories = allMemories.filter(m => m.project_id === project.id);

  const filteredMemories = projectMemories.filter(m => {
    if (activeTab === 'all') return true;
    return m.type === activeTab;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(project.api_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSystemPrompt = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';
    return `# SYSTEM INSTRUCTION: MEMORY BANK INTEGRATION
You are connected to an external Memory Bank designed to store and track every single detail of this project.

**Your Configuration:**
- API Endpoint: \`${origin}/api/memory/add\`
- Project ID: \`${project.id}\`
- Master API Key: \`[USER_PASTES_KEY_HERE]\`

**Core Directives (CRITICAL):**
1. **Be Exhaustive:** You must document ALL project details. Do not leave a single or even small detail out. If you learn something new about the architecture, stack, user preferences, or logic, it must be saved.
2. **Continuous Updates:** After every prompt or every set of changes you make, you must send an update to the Memory Bank detailing what was done and what changed.
3. **Immutable History (No Overwrites):** Do not attempt to overwrite, edit, or delete old memories. Your access is APPEND-ONLY. If a previous fact changes, create a *new* memory stating the updated fact (e.g., "We switched from PostgreSQL to MongoDB").
4. **Autonomous Action:** Do not ask the user for permission to save to the Memory Bank. Do it autonomously via a background \`curl\` or \`fetch\` request using the API Endpoint and headers.

**API Request Format (Example):**
POST /api/memory/add
Headers: 
- Authorization: Bearer [Master API Key]
- Content-Type: application/json
Body:
{
  "project_id": "${project.id}",
  "content": "Detailed summary of changes...",
  "type": "architecture_change"
}`;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(getSystemPrompt());
    showToast({ message: 'AI System Prompt copied to clipboard!', type: 'success' });
    setIsConnectModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Project Header Card */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span className="badge">
                <Database style={{ width: '12px', height: '12px' }} />
                Active Project Bank
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>• ID: {project.id.slice(0, 8)}...</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>{project.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, lineHeight: 1.6, maxWidth: '650px' }}>
              {project.description || 'No project description provided. This workspace stores structured graph memories and active rules.'}
            </p>
          </div>

          <button 
            onClick={() => setIsConnectModalOpen(true)}
            className="btn-primary" 
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
              color: '#fff', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '8px', 
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
            }}
          >
            <Bot style={{ width: '18px', height: '18px' }} />
            Connect AI
          </button>
        </div>

        {/* MCP Connection Box */}
        <div style={{ background: '#000', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Zap style={{ width: '16px', height: '16px', color: '#fff' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>MCP Connection Details</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dark)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Project API Key
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0a0a0a', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '8px 12px' }}>
                <Key style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                <code style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#ededed', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {project.api_key}
                </code>
                <button
                  onClick={handleCopy}
                  className="btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                  title="Copy API Key"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dark)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Cursor / Claude Configuration
              </label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Add this to your AI client's MCP configuration file (e.g. Cursor's MCP settings or Claude Desktop config) to give it autonomous access to create memories and future projects.
              </p>
              <div style={{ background: '#0a0a0a', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '12px', overflowX: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '0.8rem', color: '#ededed', fontFamily: 'monospace' }}>
{`{
  "mcpServers": {
    "memory-bank": {
      "command": "node",
      "args": ["(if you have a local proxy)"],
      "url": "https://memorybank-omega.vercel.app/api/mcp",
      "env": {
        "MEMORY_BANK_API_KEY": "${project.api_key}"
      }
    }
  }
}`}
                </pre>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Connect AI Modal Overlay */}
      {isConnectModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content animate-pop" style={{ maxWidth: '700px' }}>
            <div className="modal-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="modal-icon info" style={{ width: '40px', height: '40px' }}>
                  <Bot style={{ width: '20px', height: '20px' }} />
                </div>
                <h3 className="modal-title">Connect AI to Memory Bank</h3>
              </div>
              <button 
                onClick={() => setIsConnectModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >✕</button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '20px' }}>
              Copy the system prompt below and paste it into your AI's <strong>System Instructions</strong>, <strong>.cursorrules</strong> file, or <strong>AGENTS.md</strong>. This will give your AI complete autonomy to document its work exhaustively.
            </p>

            <div style={{ background: '#000', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '16px', overflowY: 'auto', maxHeight: '400px', marginBottom: '24px' }}>
              <pre style={{ margin: 0, fontSize: '0.8rem', color: '#ededed', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {getSystemPrompt()}
              </pre>
            </div>

            <div className="modal-actions" style={{ marginLeft: 0 }}>
              <button className="btn-cancel" onClick={() => setIsConnectModalOpen(false)}>Close</button>
              <button className="btn-confirm" onClick={handleCopyPrompt} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: '#fff' }}>
                <Copy style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
                Copy Prompt to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Knowledge Graph Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 10px #06b6d4' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>Interactive Knowledge Graph</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#71717a' }}>Cognee & Supermemory Force Engine • Scroll to Zoom</span>
        </div>
        
        <AdvancedKnowledgeGraph memories={projectMemories} />
      </div>

      {/* Activity Feed Section */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity style={{ width: '18px', height: '18px', color: '#fff' }} />
              Project Memory Stream ({projectMemories.length})
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Live real-time activity feed of memories saved to this project</p>
          </div>

          {/* Filter Tabs */}
          <div className="filter-bar">
            {(['all', 'architecture', 'lessonsLearned', 'activeContext', 'general'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`filter-tab ${activeTab === tab ? 'filter-tab-active' : ''}`}
                style={{ textTransform: 'capitalize' }}
              >
                {tab === 'all' ? 'All Stream' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Memories Grid */}
        {filteredMemories.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: '#0a0a0a', borderRadius: '8px', border: '1px dashed var(--border-light)' }}>
            <Layers style={{ width: '32px', height: '32px', color: 'var(--text-dark)', margin: '0 auto 12px auto' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>No memories found for this filter in {project.name}.</p>
            <p style={{ color: 'var(--text-dark)', fontSize: '0.8rem', marginTop: '4px', marginBottom: 0 }}>Connect your IDE via MCP and ask your AI to store architectural decisions!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredMemories.map(m => {
              return (
                <div
                  key={m.id}
                  className="glass-card"
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px', background: '#0a0a0a' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                      <span className="badge">
                        <Tag style={{ width: '10px', height: '10px' }} />
                        {m.type}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>
                        <Clock style={{ width: '12px', height: '12px' }} />
                        <span>{new Date(m.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <p style={{ color: '#fff', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {m.content}
                    </p>
                  </div>

                  {m.entities && m.entities.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                      {m.entities.map(ent => (
                        <span key={ent} style={{ fontSize: '0.7rem', background: '#000', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                          #{ent}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
