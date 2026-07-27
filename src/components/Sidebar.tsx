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
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <aside className="w-full lg:w-72 bg-slate-950/90 border-r border-slate-800/80 p-5 flex flex-col justify-between min-h-[calc(100vh-2rem)] rounded-2xl lg:rounded-r-none border border-slate-800/60 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-6">
        
        {/* Logo & IP Header */}
        <div className="flex flex-col gap-2 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Memory Bank</h1>
          </div>
          
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>IP Auth:</span>
            </div>
            <span className="font-mono text-emerald-400 font-semibold">{userIp}</span>
          </div>
        </div>

        {/* Create Project Button */}
        <button
          onClick={onOpenCreateModal}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2 group active:scale-95"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span>New Memory Bank</span>
        </button>

        {/* Projects List */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            <span>Your Projects ({projects.length})</span>
          </div>

          {projects.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-center">
              <p className="text-xs text-slate-400">No projects found for this IP.</p>
              <p className="text-[11px] text-slate-400 mt-1">Click above to create your first bank!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto pr-1">
              {projects.map((proj, idx) => {
                const isSelected = selectedProjectId === proj.id;
                return (
                  <button
                    key={proj.id}
                    onClick={() => onSelectProject(proj.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-start justify-between gap-3 group border ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/10 border-cyan-500/40 text-white shadow-md'
                        : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800/60 hover:border-slate-700/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-lg mt-0.5 transition-colors ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800/60 text-slate-400 group-hover:text-slate-200'
                      }`}>
                        {getProjectIcon(idx)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold truncate leading-snug">{proj.name}</h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {proj.description || 'No description'}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shadow-sm shadow-cyan-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Status */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Engine Status:</span>
        </div>
        <span className="text-cyan-400 font-mono font-medium">Superhouse 2.0</span>
      </div>
    </aside>
  );
}
