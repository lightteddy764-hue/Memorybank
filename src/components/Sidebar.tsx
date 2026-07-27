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
        
        {/* Logo & IP Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(6, 182, 212, 0.3)' }}>
              <Sparkles style={{ width: '18px', height: '18px', color: '#fff' }} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Memory Bank</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a1a1aa' }}>
              <ShieldCheck style={{ width: '14px', height: '14px', color: '#10b981' }} />
              <span>IP Auth:</span>
            </div>
            <span style={{ fontFamily: 'monospace', color: '#10b981', fontWeight: 600 }}>{userIp}</span>
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
            <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0 }}>No projects for this IP.</p>
              <p style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '4px', marginBottom: 0 }}>Click above to create your first bank!</p>
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
                      <div style={{ padding: '8px', borderRadius: '8px', background: isSelected ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)', color: isSelected ? '#22d3ee' : '#a1a1aa', marginTop: '2px', display: 'flex' }}>
                        {getProjectIcon(idx)}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: isSelected ? '#fff' : '#e4e4e7', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{proj.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: isSelected ? '#a5f3fc' : '#71717a', margin: 0, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {proj.description || 'No description'}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 10px #06b6d4', flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Status */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#a1a1aa' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity style={{ width: '14px', height: '14px', color: '#06b6d4' }} />
          <span>Engine Status:</span>
        </div>
        <span style={{ color: '#06b6d4', fontFamily: 'monospace', fontWeight: 600 }}>Superhouse 2.0</span>
      </div>
    </aside>
  );
}
