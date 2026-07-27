'use client';

import React, { useState } from 'react';
import AdvancedKnowledgeGraph from './AdvancedKnowledgeGraph';
import { Copy, Check, Key, Tag, Clock, Database, Layers } from 'lucide-react';

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
  const [feedFilter, setFeedFilter] = useState<string>('all');

  // Filter memories strictly to this project
  const projectMemories = allMemories.filter(m => m.project_id === project.id);

  const filteredFeed = feedFilter === 'all'
    ? projectMemories
    : projectMemories.filter(m => m.type === feedFilter);

  const copyApiKey = () => {
    navigator.clipboard.writeText(project.api_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badgeColors: Record<string, string> = {
    activeContext: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    lessonsLearned: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    architecture: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    general: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const borderColors: Record<string, string> = {
    activeContext: 'border-l-emerald-500',
    lessonsLearned: 'border-l-purple-500',
    architecture: 'border-l-cyan-500',
    general: 'border-l-amber-500',
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* Project Header Banner & API Key */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-indigo-950/40 border border-slate-800/80 shadow-2xl backdrop-blur-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">{project.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              Active Workspace
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
            {project.description || 'No project description provided. Start saving memories to build your AI knowledge graph.'}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Memories stored: <strong className="text-white">{projectMemories.length}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              Created: {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* API Key Copy Box */}
        <div className="w-full lg:w-auto flex flex-col gap-2 bg-slate-950/90 p-4 rounded-xl border border-slate-800/90 min-w-[320px] shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              Project API Key (.env.local)
            </span>
            <span className="text-[10px] text-slate-400">MEMORY_BANK_API_KEY</span>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 bg-slate-900 px-3 py-2 rounded-lg text-xs font-mono text-emerald-400 border border-slate-800/80 truncate">
              {project.api_key}
            </code>
            <button
              onClick={copyApiKey}
              className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all active:scale-95 flex items-center justify-center shrink-0"
              title="Copy API Key"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Knowledge Graph Engine */}
      <section>
        <AdvancedKnowledgeGraph memories={projectMemories} projectName={project.name} />
      </section>

      {/* Project Activity Feed */}
      <section className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Project Activity Feed</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live memories and extracted entity tags saved by your AI assistant for this project.
            </p>
          </div>

          {/* Feed Filter Buttons */}
          <div className="flex items-center bg-slate-950/80 rounded-lg p-1 border border-slate-800 text-xs self-start sm:self-auto">
            {['all', 'architecture', 'lessonsLearned', 'activeContext', 'general'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFeedFilter(tab)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  feedFilter === tab
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All' : tab === 'lessonsLearned' ? 'Lessons' : tab === 'activeContext' ? 'Context' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Memory Cards Grid */}
        {filteredFeed.length === 0 ? (
          <div className="p-12 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center flex flex-col items-center justify-center gap-2">
            <Database className="w-8 h-8 text-slate-600 mb-1 animate-bounce" />
            <p className="text-sm font-medium text-slate-400">No memories found for this project filter.</p>
            <p className="text-xs text-slate-400">Connect your AI using the API Key above and start coding!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
            {filteredFeed.map((mem) => (
              <div
                key={mem.id}
                className={`p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between gap-3 border-l-4 ${
                  borderColors[mem.type] || 'border-l-slate-600'
                } shadow-md hover:shadow-lg`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider border ${
                        badgeColors[mem.type] || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {mem.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(mem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-normal">{mem.content}</p>
                </div>

                {mem.entities && mem.entities.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-900/80">
                    <Tag className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {mem.entities.map((ent, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 font-mono text-[10px]"
                        >
                          #{ent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
