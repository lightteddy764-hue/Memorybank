'use client';

import React from 'react';
import { Folder, Database, Cpu, Plus, Sparkles, ShieldCheck, Activity } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  api_key: string;
  created_at: string;
}

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  userIp: string;
  onOpenCreateModal: () => void;
}

export default function Sidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  userIp,
  onOpenCreateModal
}: SidebarProps) {
  const getProjectIcon = (index: number) => {
    const icons = [Database, Cpu, Folder];
    const IconComponent = icons[index % icons.length];
    return <IconComponent style={{ width: '18px', height: '18px' }} />;
  };

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Logo & Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles style={{ width: '16px', height: '16px', color: '#000000' }} />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>Memory Bank</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '6px', background: '#0a0a0a', border: '1px solid var(--border-light)', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dark)' }}>
              <ShieldCheck style={{ width: '14px', height: '14px', color: '#ededed' }} />
              <span>Account:</span>
            </div>
            <span style={{ fontFamily: 'monospace', color: '#ededed', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{userIp}</span>
          </div>
        </div>

        {/* Create Project Button */}
        <button
          onClick={onOpenCreateModal}
          className="btn-primary"
          style={{ width: '100%', padding: '12px 16px', fontSize: '0.9rem', justifyContent: 'center' }}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          <span>New Memory Bank</span>
        </button>

        {/* Projects List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717a', padding: '0 4px' }}>
            <span>Your Projects ({projects.length})</span>
          </div>

          {projects.length === 0 ? (
            <div style={{ padding: '16px', borderRadius: '6px', background: '#0a0a0a', border: '1px dashed var(--border-light)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>No projects found.</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)', marginTop: '4px', marginBottom: 0 }}>Create your first bank above.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '4px' }}>
              {projects.map((proj, idx) => {
                const isSelected = selectedProjectId === proj.id;
                return (
                  <button
                    key={proj.id}
                    onClick={() => onSelectProject(proj.id)}
                    className={`sidebar-item ${isSelected ? 'sidebar-item-active' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                      <div style={{ padding: '6px', borderRadius: '4px', background: isSelected ? '#ffffff' : 'transparent', color: isSelected ? '#000000' : 'var(--text-muted)', marginTop: '2px', display: 'flex' }}>
                        {getProjectIcon(idx)}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 500, color: isSelected ? '#fff' : 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{proj.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: isSelected ? '#a1a1aa' : 'var(--text-dark)', margin: 0, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {proj.description || 'No description'}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff', flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Status */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dark)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity style={{ width: '12px', height: '12px', color: '#ededed' }} />
          <span>Engine Status:</span>
        </div>
        <span style={{ color: '#ededed', fontFamily: 'monospace', fontWeight: 500 }}>Superhouse 2.0</span>
      </div>
    </aside>
  );
}
