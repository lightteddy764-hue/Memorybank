'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ProjectDashboard from './ProjectDashboard';
import CreateProjectForm from './CreateProjectForm';
import { Sparkles, Plus, Database, ShieldAlert, Cpu } from 'lucide-react';

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
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Left Sidebar */}
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => setSelectedProjectId(id)}
        userIp={userIp}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Top Workspace Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                AI Superhouse 2.0
              </span>
              <span className="text-xs text-slate-400">• Cognee & Supermemory Inspired</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5">
              {selectedProject ? `Workspace: ${selectedProject.name}` : 'Welcome to Memory Bank'}
            </h2>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all flex items-center gap-2 text-xs font-semibold shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>New Project Bank</span>
          </button>
        </header>

        {/* Dashboard Content */}
        {projects.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4 border border-cyan-500/30 shadow-xl">
              <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Projects for IP Address ({userIp})</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
              Your Memory Bank is empty. Create your first project to generate an API key and start streaming graph-linked memories from your AI assistant.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Memory Bank</span>
            </button>
          </div>
        ) : selectedProject ? (
          <ProjectDashboard project={selectedProject} allMemories={memories} />
        ) : (
          <div className="p-8 text-center text-slate-400">Please select a project from the sidebar.</div>
        )}

      </main>

      {/* Create Project Modal Overlay */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl relative">
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
