'use client';

import React from 'react';
import { BarChart3, Database, Layers, Activity } from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

interface Memory {
  id: string;
  project_id: string;
  type: string;
  created_at: string;
  entities?: string[];
}

interface AnalyticsDashboardProps {
  projects: Project[];
  memories: Memory[];
}

export default function AnalyticsDashboard({ projects, memories }: AnalyticsDashboardProps) {
  const totalEntities = memories.reduce((sum, mem) => sum + (mem.entities?.length || 0), 0);
  
  // Calculate memories per project
  const projectStats = projects.map(p => ({
    name: p.name,
    count: memories.filter(m => m.project_id === p.id).length
  })).sort((a, b) => b.count - a.count);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px 0' }}>Usage Analytics</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Monitor your AI's memory consumption and activity patterns.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Memories</span>
            <Database style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>{memories.length}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Entities</span>
            <Layers style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>{totalEntities}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Active Projects</span>
            <BarChart3 style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>{projects.length}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>System Load</span>
            <Activity style={{ width: '16px', height: '16px', color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>Low</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ background: '#0a0a0a', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: '0 0 24px 0' }}>Memory Distribution by Project</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {projectStats.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No project data available.</div>
            ) : (
              projectStats.map((stat, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
                    <span>{stat.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{stat.count} memories</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#18181b', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${memories.length > 0 ? (stat.count / memories.length) * 100 : 0}%`, 
                      height: '100%', 
                      background: '#fff', 
                      borderRadius: '4px' 
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ background: '#0a0a0a', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: '0 0 24px 0' }}>Storage Quota</h3>
          
          <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 24px auto' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#18181b"
                strokeWidth="4"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#fff"
                strokeWidth="4"
                strokeDasharray={`${Math.max(1, (JSON.stringify(memories).length / (50*1024*1024)) * 100)}, 100`}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{Math.max(1, Math.round((JSON.stringify(memories).length / (50*1024*1024)) * 100))}%</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Used</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Free Tier limits you to 50MB of raw stringified data storage.
          </div>
        </div>
      </div>
    </div>
  );
}
