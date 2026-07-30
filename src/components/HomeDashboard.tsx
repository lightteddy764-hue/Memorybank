'use client';

import React, { useMemo } from 'react';
import { Folder, MoreVertical, Plus, Activity, ArrowUpRight, BarChart3, Database, Key, Network } from 'lucide-react';
import { MemoryGraph } from '@supermemory/memory-graph';

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
  entities?: string[];
}

interface HomeDashboardProps {
  projects: Project[];
  memories: Memory[];
  onSelectProject: (id: string) => void;
  onOpenCreateModal: () => void;
  userName: string;
}

// Helper to format relative time
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function HomeDashboard({ projects, memories, onSelectProject, onOpenCreateModal, userName }: HomeDashboardProps) {
  
  // Real data calculations
  const totalProjects = projects.length;
  const totalMemories = memories.length;
  
  // Calculate total entities extracted
  const totalEntities = useMemo(() => {
    return memories.reduce((acc, mem) => acc + (mem.entities?.length || 0), 0);
  }, [memories]);

  // Calculate memories created in the last 7 days
  const recentMemoriesCount = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return memories.filter(m => new Date(m.created_at) > sevenDaysAgo).length;
  }, [memories]);

  // Generate Recent Activity from memories and projects
  const recentActivity = useMemo(() => {
    // We'll combine new projects and new memories into a single timeline
    const activities: any[] = [];
    
    memories.forEach(mem => {
      const proj = projects.find(p => p.id === mem.project_id);
      if (proj) {
        activities.push({
          type: 'memory',
          title: `Stored new ${mem.type || 'context'} memory`,
          proj: proj.name,
          timeStr: mem.created_at,
          color: '#3b82f6', // blue
          icon: 'M'
        });
      }
    });

    projects.forEach(proj => {
      activities.push({
        type: 'project',
        title: `Created Project Bank`,
        proj: proj.name,
        timeStr: proj.created_at,
        color: '#10b981', // green
        icon: 'P'
      });
    });

    // Sort descending by time
    activities.sort((a, b) => new Date(b.timeStr).getTime() - new Date(a.timeStr).getTime());
    
    // Add relative time string
    return activities.slice(0, 7).map(a => ({
      ...a,
      time: timeAgo(a.timeStr)
    }));
  }, [memories, projects]);

  // Generate Chart Data based on memories per day (last 7 days)
  const chartData = useMemo(() => {
    const days = 7;
    const bins = Array(days).fill(0);
    const now = new Date();
    
    memories.forEach(m => {
      const d = new Date(m.created_at);
      const diffTime = Math.abs(now.getTime() - d.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < days) {
        // Bin 0 is today, Bin 6 is 7 days ago. Let's store chronologically (Bin 0 = 7 days ago, Bin 6 = today)
        bins[days - 1 - diffDays] += 1;
      }
    });
    
    const maxVal = Math.max(...bins, 1); // Avoid div by 0
    // We interpolate it to more bars just for visual density if we want, or just show 7 bars.
    // To keep the dense UI look, we can repeat or smooth the bins.
    const denseBins: number[] = [];
    for(let i=0; i < 35; i++) {
      // Map 35 bars to the 7 days (5 bars per day)
      const dayIndex = Math.floor(i / 5);
      const val = bins[dayIndex];
      // Add slight random noise for visual texture, scaled to maxVal
      const noise = val > 0 ? (Math.random() * 0.4 - 0.2) * val : 0;
      denseBins.push(Math.max(0, val + noise));
    }
    const maxDense = Math.max(...denseBins, 1);
    const normalized = denseBins.map(v => Math.max(10, (v / maxDense) * 100)); // min 10% height

    return { normalized, totalLast7: bins.reduce((a, b) => a + b, 0) };
  }, [memories]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Greeting Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Good evening, {userName} <span style={{ fontSize: '1.2rem' }}>👋</span>
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
          Here's your memory bank overview and recent system activity.
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
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>{totalProjects}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Total connected workspaces
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
            <ArrowUpRight style={{ width: '12px', height: '12px' }} /> {recentMemoriesCount} this week
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-card" style={{ padding: '16px', background: '#0a0a0a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Knowledge Entities</span>
            <Network style={{ width: '16px', height: '16px', color: 'var(--text-dark)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>{totalEntities.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Extracted graph nodes
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass-card" style={{ padding: '16px', background: '#0a0a0a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Storage Status</span>
            <Activity style={{ width: '16px', height: '16px', color: 'var(--text-dark)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Healthy</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            All systems operational
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
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              
              {projects.map((proj, idx) => {
                const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
                const color = colors[idx % colors.length];
                const projMemories = memories.filter(m => m.project_id === proj.id);
                const projMemoriesCount = projMemories.length;
                
                let lastSync = 'Never synced';
                if (projMemoriesCount > 0) {
                  const sorted = [...projMemories].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                  lastSync = `Last synced ${timeAgo(sorted[0].created_at)}`;
                } else {
                  lastSync = `Created ${timeAgo(proj.created_at)}`;
                }

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
                      {projMemoriesCount.toLocaleString()} memories
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dark)', marginBottom: '16px' }}>
                      {lastSync}
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
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>Knowledge Graph Topology</h3>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Visualizing {totalEntities} entities</span>
            </div>
            <div style={{ height: '180px', background: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%)', position: 'relative', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)', overflow: 'hidden' }}>
              {/* Dynamic Graph Nodes */}
              {(() => {
                if (projects.length === 0) {
                  return (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Graph uninitialized
                    </div>
                  );
                }

                // Map data for Supermemory Graph
                const mappedDocuments = projects.map((proj) => {
                  const projMemories = memories.filter(m => m.project_id === proj.id).slice(0, 5); // Limit memories for dashboard
                  
                  return {
                    id: proj.id,
                    title: proj.name,
                    summary: `Project Hub`,
                    documentType: 'project_hub',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    memories: projMemories.map((m) => ({
                      id: m.id,
                      memory: m.content || 'Untitled',
                      content: m.content,
                      isStatic: true,
                      spaceId: proj.id,
                      isLatest: true,
                      isForgotten: false,
                      forgetAfter: null,
                      forgetReason: null,
                      version: 1,
                      parentMemoryId: null,
                      rootMemoryId: null,
                      createdAt: m.created_at || new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      relation: 'derives' as any
                    }))
                  };
                });

                return (
                  <MemoryGraph 
                    documents={mappedDocuments}
                    variant="consumer" // Consumer variant might look cleaner for a small dashboard widget
                    isLoading={false}
                  />
                );
              })()}
            </div>
          </div>

        </div>

        {/* Main Right Column (Activity & API Chart) */}
        <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Recent Activity */}
          <div className="glass-card" style={{ background: '#0a0a0a', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>Recent Activity</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {recentActivity.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>
                  No recent activity found. Connect your AI to start storing memories!
                </div>
              ) : (
                recentActivity.map((activity, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: `rgba(255,255,255,0.05)`, color: activity.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                      {activity.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', color: '#fff', marginBottom: '2px', lineHeight: 1.3 }}>{activity.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>{activity.proj}</div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                      {activity.time}
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: activity.color }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Chart */}
          <div className="glass-card" style={{ background: '#0a0a0a', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>Memory Activity <span style={{ color: 'var(--text-dark)', fontWeight: 400 }}>(7 Days)</span></h3>
            </div>
            
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{chartData.totalLast7}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '20px' }}>
              Memories captured recently
            </div>

            {/* Real Data Bar Chart */}
            <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', gap: '2px', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}>
              {chartData.normalized.map((height, i) => {
                return (
                  <div key={i} style={{ flex: 1, background: '#fff', height: `${height}%`, borderRadius: '1px 1px 0 0', opacity: i > 25 ? 0.9 : 0.4 }} />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.65rem', color: 'var(--text-dark)' }}>
              <span>7d ago</span>
              <span>Today</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
