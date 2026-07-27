'use client';

import React, { useState } from 'react';
import AdvancedKnowledgeGraph from './AdvancedKnowledgeGraph';
import { Database, Key, Copy, Check, Clock, Tag, Share2, Sparkles, Activity, Layers, Zap } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'architecture': return '#10b981'; // emerald
      case 'lessonsLearned': return '#8b5cf6'; // purple
      case 'activeContext': return '#06b6d4'; // cyan
      default: return '#f59e0b'; // amber
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Project Header Card */}
      <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(25, 25, 38, 0.8) 0%, rgba(13, 13, 20, 0.9) 100%)', border: '1px solid rgba(99, 102, 241, 0.25)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span className="badge badge-purple" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <Database style={{ width: '12px', height: '12px' }} />
                Active Project Bank
              </span>
              <span style={{ fontSize: '0.8rem', color: '#71717a' }}>• ID: {project.id.slice(0, 8)}...</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{project.name}</h1>
            <p style={{ color: '#a1a1aa', fontSize: '0.95rem', margin: 0, lineHeight: 1.6, maxWidth: '650px' }}>
              {project.description || 'No project description provided. This workspace stores structured graph memories and active rules.'}
            </p>
          </div>

          {/* API Key Box */}
          <div style={{ background: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '16px', minWidth: '310px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              <Key style={{ width: '14px', height: '14px', color: '#06b6d4' }} />
              <span>Project API Key (.env.local)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '6px 10px' }}>
              <code style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#34d399', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {project.api_key}
              </code>
              <button
                onClick={handleCopy}
                style={{ background: 'transparent', border: 'none', color: copied ? '#10b981' : '#a1a1aa', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                title="Copy API Key"
              >
                {copied ? <Check style={{ width: '16px', height: '16px' }} /> : <Copy style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#71717a', margin: '8px 0 0 0' }}>
              Use this key with your local <code style={{ color: '#a5f3fc' }}>mcp-server.mjs</code> to scope memories to this project!
            </p>
          </div>
        </div>
      </div>

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
        
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity style={{ width: '18px', height: '18px', color: '#8b5cf6' }} />
              Project Memory Stream ({projectMemories.length})
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#71717a', margin: '4px 0 0 0' }}>Live real-time activity feed of memories saved to this project</p>
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
          <div style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <Layers style={{ width: '32px', height: '32px', color: '#52525b', margin: '0 auto 12px auto' }} />
            <p style={{ color: '#a1a1aa', fontSize: '0.95rem', margin: 0 }}>No memories found for this filter in {project.name}.</p>
            <p style={{ color: '#71717a', fontSize: '0.8rem', marginTop: '4px', marginBottom: 0 }}>Connect your IDE via MCP and ask your AI to store architectural decisions!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredMemories.map(m => {
              const borderLeftColor = getTypeColor(m.type);
              return (
                <div
                  key={m.id}
                  className="glass-card"
                  style={{ borderLeft: `4px solid ${borderLeftColor}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px', background: 'rgba(24, 24, 32, 0.6)' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                      <span className="badge" style={{ background: `${borderLeftColor}20`, color: borderLeftColor, border: `1px solid ${borderLeftColor}40` }}>
                        <Tag style={{ width: '10px', height: '10px' }} />
                        {m.type}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#71717a' }}>
                        <Clock style={{ width: '12px', height: '12px' }} />
                        <span>{new Date(m.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <p style={{ color: '#e4e4e7', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {m.content}
                    </p>
                  </div>

                  {m.entities && m.entities.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {m.entities.map(ent => (
                        <span key={ent} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#a1a1aa', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
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
