'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Share2, ZoomIn, ZoomOut, Maximize, RefreshCw, Layers, Sparkles } from 'lucide-react';

// Dynamically import react-force-graph-2d with SSR disabled
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(10, 10, 15, 0.7)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', gap: '12px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #06b6d4', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#06b6d4' }}>Loading Force-Directed Physics Engine...</span>
    </div>
  )
});

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

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  type: 'hub' | 'project' | 'memory';
  memory?: Memory;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface GraphLink {
  source: string;
  target: string;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  architecture: '#10b981', // emerald
  lessonsLearned: '#8b5cf6', // purple
  activeContext: '#06b6d4', // cyan
  general: '#f59e0b', // amber
};

export default function KnowledgeGraphView({ projects, memories }: KnowledgeGraphViewProps) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Resize listener
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth || 800,
          height: clientHeight || 600
        });
      }
    };

    updateDimensions();
    // Slight delay to handle flex box settling
    setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Construct Force Graph Data
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // 1. Central Hub
    nodes.push({
      id: 'master_hub',
      name: 'Memory Bank',
      val: 30,
      color: '#fff',
      type: 'hub'
    });

    // 2. Project Nodes
    projects.forEach(proj => {
      const projId = `proj:${proj.id}`;
      nodes.push({
        id: projId,
        name: proj.name,
        val: 18,
        color: '#3b82f6', // blue
        type: 'project'
      });

      // Link project to master hub
      links.push({
        source: projId,
        target: 'master_hub',
        color: 'rgba(59, 130, 246, 0.4)'
      });

      // 3. Memory Nodes for this project
      const projMems = memories.filter(m => m.project_id === proj.id);
      
      projMems.forEach(mem => {
        const memId = `mem:${mem.id}`;
        const color = CATEGORY_COLORS[mem.type] || CATEGORY_COLORS.general;

        nodes.push({
          id: memId,
          name: mem.content.length > 20 ? mem.content.slice(0, 18) + '...' : mem.content,
          val: 8,
          color,
          type: 'memory',
          memory: mem
        });

        // Link memory to project
        links.push({
          source: memId,
          target: projId,
          color: 'rgba(255, 255, 255, 0.15)'
        });
      });
    });

    return { nodes, links };
  }, [projects, memories]);

  const handleZoomToFit = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 50);
    }
  }, []);

  const renderNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${node.type === 'hub' ? 'bold ' : ''}${Math.max(fontSize, 3)}px Inter, sans-serif`;
    
    // Draw outer glow for hubs or hovered nodes
    if (node.type === 'hub' || node.type === 'project' || hoveredNode?.id === node.id) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, Math.sqrt(node.val) * 2.5 + 4, 0, 2 * Math.PI, false);
      ctx.fillStyle = node.color + '40'; // 25% opacity glow
      ctx.fill();
    }

    // Draw main circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, Math.sqrt(node.val) * 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.lineWidth = hoveredNode?.id === node.id ? 2 / globalScale : 1 / globalScale;
    ctx.strokeStyle = hoveredNode?.id === node.id ? '#ffffff' : 'rgba(0,0,0,0.5)';
    ctx.stroke();

    // Render Text Labels
    if (globalScale > 1.2 || node.type === 'hub' || node.type === 'project' || hoveredNode?.id === node.id) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = node.type === 'hub' ? '#ffffff' : 'rgba(244, 244, 245, 0.9)';
      ctx.fillText(label, node.x, node.y + Math.sqrt(node.val) * 2 + (fontSize + 4));
    }
  }, [hoveredNode]);

  return (
    <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', color: '#fff' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles style={{ width: '24px', height: '24px', color: '#06b6d4' }} />
            Global Knowledge Graph
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Interactive physics-based mapping of all your projects and their connected memory nodes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleZoomToFit} style={{ background: '#18181b', border: '1px solid var(--border-light)', color: '#fff', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} title="Recenter Graph">
            <RefreshCw style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div 
        ref={containerRef} 
        style={{ 
          flex: 1, 
          background: 'rgba(10, 10, 16, 0.85)', 
          border: '1px solid var(--border-light)', 
          borderRadius: '12px', 
          position: 'relative', 
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 30px rgba(0,0,0,0.6)'
        }}
      >
        {projects.length === 0 ? (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-muted)', textAlign: 'center' }}>
            <Layers style={{ width: '32px', height: '32px', margin: '0 auto 12px auto', opacity: 0.5 }} />
            <p>No projects found. Create a project to initialize the physics engine.</p>
          </div>
        ) : (
          <>
            <ForceGraph2D
              ref={fgRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeCanvasObject={renderNode}
              nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
                const radius = Math.sqrt(node.val) * 2 + 4;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                ctx.fill();
              }}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.005}
              linkDirectionalParticleWidth={1.5}
              linkDirectionalParticleColor={(link: any) => link.color}
              linkColor={(link: any) => link.color}
              linkWidth={1}
              cooldownTicks={150}
              d3VelocityDecay={0.3} // Higher friction so it settles faster
              onNodeHover={(node: any) => setHoveredNode(node || null)}
              onNodeDragEnd={(node: any) => {
                node.fx = node.x;
                node.fy = node.y;
              }}
            />

            {/* Hover Tooltip Overlay */}
            {hoveredNode && (
              <div style={{ position: 'absolute', bottom: '24px', right: '24px', maxWidth: '350px', padding: '16px', borderRadius: '12px', background: 'rgba(15, 15, 25, 0.95)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 30px rgba(0,0,0,0.6)', pointerEvents: 'none', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: hoveredNode.color, boxShadow: \`0 0 8px \${hoveredNode.color}\` }} />
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', color: '#e4e4e7', letterSpacing: '0.05em' }}>
                    {hoveredNode.type.toUpperCase()}
                  </span>
                </div>
                
                {hoveredNode.type === 'memory' && hoveredNode.memory ? (
                  <>
                    <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#fff', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                      "{hoveredNode.memory.content}"
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#a1a1aa' }}>
                        {hoveredNode.memory.type}
                      </span>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                    {hoveredNode.name}
                  </p>
                )}
              </div>
            )}
            
            {/* Stats Overlay */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(15, 15, 23, 0.9)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', fontFamily: 'monospace', color: '#a1a1aa', pointerEvents: 'none' }}>
              <span>Hubs: <strong style={{ color: '#3b82f6' }}>{projects.length + 1}</strong></span>
              <span>•</span>
              <span>Memories: <strong style={{ color: '#06b6d4' }}>{memories.length}</strong></span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
