'use client';

import React, { useState } from 'react';
import { Database, Search, Clock, Tag } from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

interface Memory {
  id: string;
  project_id: string;
  type: string;
  content: string;
  entities?: string[];
  created_at: string;
}

interface GlobalMemoriesProps {
  memories: Memory[];
  projects: Project[];
}

export default function GlobalMemories({ memories, projects }: GlobalMemoriesProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMemories = memories.filter(m => 
    m.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.entities?.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getProjectName = (id: string) => {
    return projects.find(p => p.id === id)?.name || 'Unknown Project';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px 0' }}>All Memories</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Search and view all captured knowledge.</p>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: '600px', marginBottom: '32px' }}>
        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search across all memories, entities, or types..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '16px 16px 16px 48px', background: '#0a0a0a', border: '1px solid var(--border-light)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredMemories.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', background: '#0a0a0a', border: '1px solid var(--border-light)', borderRadius: '12px', color: 'var(--text-muted)' }}>
            No memories found matching "{searchQuery}"
          </div>
        ) : (
          filteredMemories.map((mem) => {
            const dateObj = new Date(mem.created_at);
            const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={mem.id} style={{ background: '#0a0a0a', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Database style={{ width: '12px', height: '12px' }} />
                      {getProjectName(mem.project_id)}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', padding: '2px 8px', border: '1px solid var(--border-light)', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {mem.type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <Clock style={{ width: '12px', height: '12px' }} />
                    {dateStr} at {timeStr}
                  </div>
                </div>

                <div style={{ fontSize: '1rem', lineHeight: 1.6, color: '#e4e4e7', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                  {mem.content}
                </div>

                {mem.entities && mem.entities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                    <Tag style={{ width: '14px', height: '14px', color: 'var(--text-muted)', marginTop: '4px' }} />
                    {mem.entities.map((ent, idx) => (
                      <span key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#18181b', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        {ent}
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
  );
}
