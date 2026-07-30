'use client';

import React from 'react';
import { Folder, MoreVertical, Plus, Activity, ArrowUpRight, BarChart3, Database, Key } from 'lucide-react';

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
}

interface HomeDashboardProps {
  projects: Project[];
  memories: Memory[];
  onSelectProject: (id: string) => void;
  onOpenCreateModal: () => void;
  userName: string;
}

export default function HomeDashboard({ projects, memories, onSelectProject, onOpenCreateModal, userName }: HomeDashboardProps) {
  
  // Mock data for the UI
  const totalMemories = memories.length > 0 ? memories.length : 238491;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Greeting Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Good evening, {userName} <span style={{ fontSize: '1.2rem' }}>👋</span>
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
          Here's what's happening with your memory banks today.
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        
        {/* Stat 1 */}
        <div className="glass-card" style={{ padding: '16px', background: '#0a0a0a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Project Banks</span>
            <Folder style={{ width: '16px', height: '16px', color: 'var(--text-dark)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>{projects.length || 12}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight style={{ width: '12px', height: '12px' }} /> 2 this week
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-card" style={{ padding: '16px', background: '#0a0a0a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stored Memories</span>
            <Database style={{ width: '16px', height: '16px', color: 'var(--text-dark)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>{totalMemories.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight style={{ width: '12px', height: '12px' }} /> 18.6k this week
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-card" style={{ padding: '16px', background: '#0a0a0a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>API Requests</span>
            <Activity style={{ width: '16px', height: '16px', color: 'var(--text-dark)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>1.2M</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight style={{ width: '12px', height: '12px' }} /> 12.4% this week
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass-card" style={{ padding: '16px', background: '#0a0a0a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Connections</span>
            <Key style={{ width: '16px', height: '16px', color: 'var(--text-dark)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>8</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight style={{ width: '12px', height: '12px' }} /> 2 this week
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Main Left Column (Projects & Graph) */}
        <div style={{ flex: 2, minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Projects Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>Project Banks</h3>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>View all &rarr;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              
              {projects.map((proj, idx) => {
                const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
                const color = colors[idx % colors.length];
                const projMemoriesCount = memories.filter(m => m.project_id === proj.id).length;

                return (
                  <div key={proj.id} onClick={() => onSelectProject(proj.id)} className="glass-card" style={{ background: '#0a0a0a', padding: '16px', cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#fff' }}>{proj.name}</span>
                      </div>
                      <MoreVertical style={{ width: '14px', height: '14px', color: 'var(--text-dark)' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {projMemoriesCount > 0 ? projMemoriesCount.toLocaleString() : '128,491'} memories
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dark)', marginBottom: '16px' }}>
                      Last synced 2 min ago
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>G</div>
                      <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'rgba(249, 115, 22, 0.2)', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>C</div>
                    </div>
                  </div>
                );
              })}

              {/* Create New Project Card */}
              <div onClick={onOpenCreateModal} className="glass-card" style={{ background: 'transparent', border: '1px dashed var(--border-light)', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '130px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <Plus style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Create New Project</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)', marginTop: '4px' }}>Start a new memory bank</span>
              </div>
            </div>
          </div>

          {/* Knowledge Graph Overview */}
          <div className="glass-card" style={{ background: '#0a0a0a', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>Knowledge Graph Overview</h3>
              </div>
              <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '4px', padding: '4px 8px', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}>Open Graph &rarr;</button>
            </div>
            <div style={{ height: '180px', background: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%)', position: 'relative', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)', overflow: 'hidden' }}>
              {/* Mock Nodes - for visual appeal matching the mockup */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px #fff' }} />
              <div style={{ position: 'absolute', top: '30%', left: '30%', width: '8px', height: '8px', borderRadius: '50%', background: '#a1a1aa' }} />
              <div style={{ position: 'absolute', top: '70%', left: '40%', width: '10px', height: '10px', borderRadius: '50%', background: '#e4e4e7' }} />
              <div style={{ position: 'absolute', top: '40%', left: '70%', width: '6px', height: '6px', borderRadius: '50%', background: '#71717a' }} />
              <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                <line x1="50%" y1="50%" x2="30%" y2="30%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="40%" y2="70%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="70%" y2="40%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="30%" y1="30%" x2="40%" y2="70%" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </svg>
            </div>
          </div>

        </div>

        {/* Main Right Column (Activity & API Chart) */}
        <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Recent Activity */}
          <div className="glass-card" style={{ background: '#0a0a0a', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>Recent Activity</h3>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>View all &rarr;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { title: 'GPT-5 stored new memories', proj: 'SaaS Dashboard AI', time: '2m ago', color: '#10b981', icon: 'G' },
                { title: 'Claude updated Project Bank', proj: 'Personal Brain', time: '15m ago', color: '#f97316', icon: 'C' },
                { title: 'Gemini queried embeddings', proj: 'Research Assistant', time: '1h ago', color: '#3b82f6', icon: '✦' },
                { title: 'GPT-5 created new relations', proj: 'SaaS Dashboard AI', time: '2h ago', color: '#10b981', icon: 'G' },
                { title: 'Claude stored new memories', proj: 'Content Creation Hub', time: '3h ago', color: '#f97316', icon: 'C' }
              ].map((activity, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: `rgba(255,255,255,0.05)`, color: activity.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                    {activity.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#fff', marginBottom: '2px' }}>{activity.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>{activity.proj}</div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {activity.time}
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: activity.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Usage Chart */}
          <div className="glass-card" style={{ background: '#0a0a0a', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>API Usage <span style={{ color: 'var(--text-dark)', fontWeight: 400 }}>(Requests)</span></h3>
              <select style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '4px', color: '#fff', fontSize: '0.75rem', padding: '4px 8px', outline: 'none' }}>
                <option>Today</option>
                <option>This Week</option>
              </select>
            </div>
            
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>1,203,120</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '20px' }}>
              <ArrowUpRight style={{ width: '12px', height: '12px' }} /> 12.4% vs yesterday
            </div>

            {/* Mock Bar Chart */}
            <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', gap: '2px', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}>
              {Array.from({ length: 40 }).map((_, i) => {
                // Generate a bell curve-like height
                const height = Math.max(10, Math.sin(i / 12) * 80 + Math.random() * 20);
                return (
                  <div key={i} style={{ flex: 1, background: '#fff', height: `${height}%`, borderRadius: '1px 1px 0 0', opacity: i > 30 ? 0.3 : 1 }} />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.65rem', color: 'var(--text-dark)' }}>
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>12 AM</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
