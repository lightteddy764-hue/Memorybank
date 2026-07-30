'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ProjectDashboard from './ProjectDashboard';
import HomeDashboard from './HomeDashboard';
import GlobalProjects from './GlobalProjects';
import GlobalMemories from './GlobalMemories';
import KnowledgeGraphView from './KnowledgeGraphView';
import ApiKeysManager from './ApiKeysManager';
import AnalyticsDashboard from './AnalyticsDashboard';
import SettingsView from './SettingsView';
import BillingView from './BillingView';
import DocsView from './DocsView';
import CreateProjectForm from './CreateProjectForm';
import { Plus, Search, Bell } from 'lucide-react';

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

interface UserApiKey {
  id: string;
  user_id: string;
  name: string;
  api_key: string;
  created_at: string;
}

export default function DashboardLayout({
  projects,
  memories,
  apiKeys,
  userEmail,
  userName
}: {
  projects: Project[];
  memories: Memory[];
  apiKeys: UserApiKey[];
  userEmail: string;
  userName: string;
}) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Home');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    setSelectedProjectId(null); // Clear selected project when navigating away
  };

  const renderContent = () => {
    if (selectedProject) {
      return (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <button 
              onClick={() => setSelectedProjectId(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              &larr; Back to Dashboard
            </button>
          </div>
          <ProjectDashboard project={selectedProject} allMemories={memories} projects={projects} />
        </div>
      );
    }

    switch (activeTab) {
      case 'Projects':
        return <GlobalProjects projects={projects} memories={memories} onSelectProject={setSelectedProjectId} onOpenCreateModal={() => setIsCreateModalOpen(true)} />;
      case 'Memories':
        return <GlobalMemories projects={projects} memories={memories} />;
      case 'Knowledge Graph':
        return <KnowledgeGraphView projects={projects} memories={memories} />;
      case 'API Keys':
        return <ApiKeysManager apiKeys={apiKeys} />;
      case 'Usage':
        return <AnalyticsDashboard projects={projects} memories={memories} />;
      case 'Settings':
        return <SettingsView userName={userName} userEmail={userEmail} />;
      case 'Billing':
        return <BillingView />;
      case 'Docs':
        return <DocsView />;
      case 'Home':
      default:
        return <HomeDashboard 
          projects={projects} 
          memories={memories} 
          onSelectProject={setSelectedProjectId} 
          onOpenCreateModal={() => setIsCreateModalOpen(true)} 
          userName={userName}
        />;
    }
  };

  return (
    <div className="workspace-layout">
      
      {/* Left Sidebar */}
      <Sidebar userEmail={userEmail} userName={userName} memories={memories} activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* Main Workspace Area */}
      <main className="workspace-main" style={{ padding: '24px 32px' }}>
        
        {/* Top Navbar */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          
          {/* Search Bar */}
          <div style={{ position: 'relative', width: '320px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-dark)' }} />
            <input 
              type="text" 
              placeholder="Search memories..." 
              style={{ width: '100%', padding: '10px 10px 10px 36px', background: 'transparent', border: '1px solid var(--border-light)', borderRadius: '8px', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
            />
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: 'var(--text-dark)', background: '#18181b', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>⌘K</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              New Project
            </button>

            <button style={{ background: 'transparent', border: '1px solid var(--border-light)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              <Bell style={{ width: '16px', height: '16px', color: '#fff' }} />
              <div style={{ position: 'absolute', top: '8px', right: '10px', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            </button>

            <button style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#18181b', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
              {userName.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        {renderContent()}

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
