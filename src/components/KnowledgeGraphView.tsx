'use client';

import React, { useState } from 'react';
import { Share2, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

interface Memory {
  id: string;
  project_id: string;
  type: string;
  content: string;
  entities?: string[];
}

interface KnowledgeGraphViewProps {
  projects: Project[];
  memories: Memory[];
}

export default function KnowledgeGraphView({ projects, memories }: KnowledgeGraphViewProps) {
  const [zoom, setZoom] = useState(1);

  return (
    <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px 0' }}>Knowledge Graph</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Visual mapping of all your projects and their connected memory nodes.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} style={{ background: '#18181b', border: '1px solid var(--border-light)', color: '#fff', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
            <ZoomOut style={{ width: '16px', height: '16px' }} />
          </button>
          <button onClick={() => setZoom(1)} style={{ background: '#18181b', border: '1px solid var(--border-light)', color: '#fff', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
            <Maximize style={{ width: '16px', height: '16px' }} />
          </button>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.2))} style={{ background: '#18181b', border: '1px solid var(--border-light)', color: '#fff', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
            <ZoomIn style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        background: '#0a0a0a', 
        border: '1px solid var(--border-light)', 
        borderRadius: '12px', 
        position: 'relative', 
        overflow: 'hidden',
        backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 80%)'
      }}>
        
        {projects.length === 0 ? (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-muted)' }}>
            No data to visualize.
          </div>
        ) : (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            width: '100%', 
            height: '100%', 
            transform: `translate(-50%, -50%) scale(${zoom})`, 
            transition: 'transform 0.3s ease' 
          }}>
            {(() => {
              const nodes: any[] = [];
              const lines: any[] = [];
              
              // Center System Node
              nodes.push({ id: 'center', name: 'Memory Bank', x: 50, y: 50, size: 24, color: '#fff', glow: true });

              projects.forEach((proj, i, arr) => {
                const angle = (i / arr.length) * Math.PI * 2;
                const radius = 20; 
                const x = 50 + Math.cos(angle) * radius;
                const y = 50 + Math.sin(angle) * radius;
                
                nodes.push({ id: proj.id, name: proj.name, x, y, size: 16, color: '#a1a1aa' });
                lines.push({ x1: 50, y1: 50, x2: x, y2: y, stroke: 'rgba(255,255,255,0.15)', width: 2 });

                const projMems = memories.filter(m => m.project_id === proj.id);
                // Limit to max 12 nodes visually per project so it doesn't get infinitely cluttered
                const visualMems = projMems.slice(0, 12);
                
                visualMems.forEach((mem, j) => {
                  const mAngle = angle + ((j - (visualMems.length/2)) * 0.4);
                  const mRadius = 12;
                  const mx = x + Math.cos(mAngle) * mRadius;
                  const my = y + Math.sin(mAngle) * mRadius;
                  
                  nodes.push({ id: mem.id, x: mx, y: my, size: 6, color: '#71717a' });
                  lines.push({ x1: x, y1: y, x2: mx, y2: my, stroke: 'rgba(255,255,255,0.05)', width: 1 });
                });
              });

              return (
                <>
                  <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
                    {lines.map((line, i) => (
                      <line key={i} x1={`${line.x1}%`} y1={`${line.y1}%`} x2={`${line.x2}%`} y2={`${line.y2}%`} stroke={line.stroke} strokeWidth={line.width} />
                    ))}
                  </svg>
                  {nodes.map(node => (
                    <div 
                      key={node.id} 
                      className="graph-node-hover"
                      style={{ 
                        position: 'absolute', 
                        top: `${node.y}%`, 
                        left: `${node.x}%`, 
                        transform: 'translate(-50%, -50%)', 
                        width: `${node.size}px`, 
                        height: `${node.size}px`, 
                        borderRadius: '50%', 
                        background: node.color, 
                        boxShadow: node.glow ? `0 0 20px ${node.color}` : 'none',
                        cursor: 'pointer'
                      }} 
                    >
                      {node.name && (
                        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                          {node.name}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
