'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ProjectDashboard from './ProjectDashboard';
import CreateProjectForm from './CreateProjectForm';
import { Plus, Cpu } from 'lucide-react';

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

export default function DashboardLayout({
  projects,
  memories,
  userIp
}: {
  projects: Project[];
  memories: Memory[];
  userIp: string;
}) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Keep selectedProjectId valid if projects list changes
  useEffect(() => {
    if (projects.length > 0 && (!selectedProjectId || !projects.some(p => p.id === selectedProjectId))) {
      setSelectedProjectId(projects[0].id);
    } else if (projects.length === 0) {
      setSelectedProjectId(null);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="workspace-layout">
      
      {/* Left Sidebar */}
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => setSelectedProjectId(id)}
        userIp={userIp}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="workspace-main">
        
        {/* Top Workspace Bar */}
        <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge">
                AI Superhouse 2.0
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>• Minimalist & Fast</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff', margin: 0 }}>
              {selectedProject ? `Workspace: ${selectedProject.name}` : 'Welcome to Memory Bank'}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-secondary"
            >
              <Plus style={{ width: '16px', height: '16px', color: '#ededed' }} />
              <span>New Project Bank</span>
            </button>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="btn-secondary"
              >
                Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* Dashboard Content */}
        {projects.length === 0 ? (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', margin: 'auto 0', border: '1px dashed var(--border-light)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '1px solid var(--border-light)' }}>
              <Cpu style={{ width: '32px', height: '32px', color: '#ededed' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>No Projects Found</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '500px', marginBottom: '24px', lineHeight: 1.6 }}>
              Your Memory Bank is empty. Create your first project manually to generate your master API Key. 
              Once generated, you can connect your AI assistant (via MCP), and it will be able to create future projects and manage memories autonomously!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary"
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              <span>Create Your First Memory Bank</span>
            </button>
          </div>
        ) : selectedProject ? (
          <ProjectDashboard project={selectedProject} allMemories={memories} />
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa' }}>Please select a project from the sidebar.</div>
        )}

      </main>

      {/* Create Project Modal Overlay */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div style={{ width: '100%', maxWidth: '540px', position: 'relative' }}>
            <CreateProjectForm
              externalOpen={true}
              onCloseExternal={() => setIsCreateModalOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
