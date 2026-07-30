'use client';

import React, { useState } from 'react';
import { Folder, ArrowRight, Activity, Plus, Trash2 } from 'lucide-react';

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
  type: string;
  created_at: string;
}

interface GlobalProjectsProps {
  projects: Project[];
  memories: Memory[];
  onSelectProject: (id: string) => void;
  onOpenCreateModal: () => void;
  onDeleteProject?: (id: string) => void;
  apiKey?: string;
}

export default function GlobalProjects({ projects, memories, onSelectProject, onOpenCreateModal, onDeleteProject, apiKey }: GlobalProjectsProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); // Don't open the project
    if (!confirm(`Delete project "${project.name}" and ALL its memories? This cannot be undone.`)) return;

    setDeletingId(project.id);
    try {
      const res = await fetch('/api/project/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ project_id: project.id }),
      });
      const data = await res.json();
      if (data.success) {
        onDeleteProject?.(project.id);
      } else {
        alert(`Failed to delete: ${data.error}`);
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px 0' }}>All Projects</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Manage your memory banks and workspaces.</p>
        </div>
        <button 
          onClick={onOpenCreateModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
        >
          <Plus style={{ width: '16px', height: '16px' }} />
          Create New Project
        </button>
      </div>

      <div className="projects-grid">
        {projects.map((project) => {
          const projectMemories = memories.filter(m => m.project_id === project.id);
          const latestMemory = projectMemories.length > 0 
            ? projectMemories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
            : null;

          let lastSyncedText = 'Never';
          if (latestMemory) {
            const diffMins = Math.floor((new Date().getTime() - new Date(latestMemory.created_at).getTime()) / 60000);
            if (diffMins < 60) lastSyncedText = `${diffMins}m ago`;
            else if (diffMins < 1440) lastSyncedText = `${Math.floor(diffMins / 60)}h ago`;
            else lastSyncedText = `${Math.floor(diffMins / 1440)}d ago`;
          }

          const isDeleting = deletingId === project.id;
          const isHovered = hoveredId === project.id;

          return (
            <div 
              key={project.id} 
              className="project-card" 
              onClick={() => onSelectProject(project.id)}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ position: 'relative' }}
            >
              {/* Delete button — top right corner */}
              <button
                onClick={(e) => handleDelete(e, project)}
                disabled={isDeleting}
                title="Delete project"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: isHovered ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                  border: isHovered ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  opacity: isHovered ? 1 : 0,
                  zIndex: 10,
                }}
              >
                <Trash2 style={{ width: '14px', height: '14px', color: isDeleting ? '#888' : '#ef4444' }} />
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingRight: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#18181b', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Folder style={{ width: '20px', height: '20px', color: '#fff' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: '0 0 4px 0', color: '#fff' }}>{project.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                      ID: {project.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <div style={{ padding: '4px 8px', borderRadius: '4px', background: latestMemory ? 'rgba(16, 185, 129, 0.1)' : '#18181b', border: `1px solid ${latestMemory ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-light)'}`, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity style={{ width: '12px', height: '12px', color: latestMemory ? '#10b981' : 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.7rem', color: latestMemory ? '#10b981' : 'var(--text-muted)', fontWeight: 500 }}>
                    {latestMemory ? 'Active' : 'Idle'}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Stored Memories</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>{projectMemories.length}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Last Synced</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#fff', display: 'block', marginTop: '6px' }}>{lastSyncedText}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {isDeleting ? 'Deleting...' : 'Open Workspace'}
                </span>
                <ArrowRight style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
              </div>
            </div>
          );
        })
        }
      </div>
    </div>
  );
}
