'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, Tag, Layers, RefreshCw, Maximize2, Minimize2, X, Info, ChevronDown } from 'lucide-react';

// Dynamically import react-force-graph-2d with SSR disabled
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '550px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(10, 10, 15, 0.7)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', gap: '12px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #06b6d4', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#06b6d4' }}>Loading Force-Directed Physics Engine...</span>
    </div>
  )
});

interface Memory {
  id: string;
  project_id: string;
  content: string;
  type: string;
  entities?: string[];
  related_memory_ids?: string[];
  created_at: string;
}

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  type: 'category' | 'entity' | 'memory';
  category?: string;
  memory?: Memory;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  architecture: '#10b981', // emerald
  lessonsLearned: '#8b5cf6', // purple
  activeContext: '#06b6d4', // cyan
  general: '#f59e0b', // amber
  entity: '#ec4899', // pink
};

interface Project {
  id: string;
  name: string;
}

export default function AdvancedKnowledgeGraph({
  memories,
  allMemories,
  projects = [],
  projectName = 'Project'
}: {
  memories: Memory[];
  allMemories?: Memory[];
  projects?: Project[];
  projectName?: string;
}) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 550 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'architecture' | 'lessonsLearned' | 'activeContext'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('current');

  // Resolve which memories to show based on dropdown
  const activeMemories = useMemo(() => {
    if (selectedProjectId === 'current' || !allMemories) return memories;
    if (selectedProjectId === 'all') return allMemories;
    return allMemories.filter(m => m.project_id === selectedProjectId);
  }, [selectedProjectId, memories, allMemories]);

  const hasProjectDropdown = projects.length > 0 && allMemories;

  // Resize listener
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        setDimensions({
          width: clientWidth || 800,
          height: isFullscreen ? window.innerHeight - 180 : 550
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

  // Construct Force Graph Data
  const graphData = useMemo(() => {
    const nodesMap = new Map<string, GraphNode>();
    const links: GraphLink[] = [];

    // Filter memories if tab is active
    const filteredMemories = activeMemories.filter(m => {
      if (activeFilter === 'all') return true;
      return m.type === activeFilter;
    });

    // 1. Create Category Hub Nodes
    const categories = Array.from(new Set(filteredMemories.map(m => m.type || 'general')));
    categories.forEach(cat => {
      const catId = `cat:${cat}`;
      nodesMap.set(catId, {
        id: catId,
        name: cat.toUpperCase(),
        val: 16,
        color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.general,
        type: 'category'
      });
    });

    // 2. Create Memory Nodes and Entity Hubs
    filteredMemories.forEach(mem => {
      const memId = `mem:${mem.id}`;
      const catColor = CATEGORY_COLORS[mem.type] || CATEGORY_COLORS.general;

      // Add Memory Node
      nodesMap.set(memId, {
        id: memId,
        name: mem.content.length > 30 ? mem.content.slice(0, 28) + '...' : mem.content,
        val: 6,
        color: catColor,
        type: 'memory',
        category: mem.type,
        memory: mem
      });

      // Link Memory to its Category Hub
      links.push({
        source: memId,
        target: `cat:${mem.type || 'general'}`,
        label: 'category',
        color: 'rgba(255, 255, 255, 0.15)'
      });

      // Add Entity Nodes & Links
      if (mem.entities && Array.isArray(mem.entities)) {
        mem.entities.forEach(ent => {
          const entId = `ent:${ent.toLowerCase().trim()}`;
          
          if (!nodesMap.has(entId)) {
            nodesMap.set(entId, {
              id: entId,
              name: `#${ent}`,
              val: 8,
              color: CATEGORY_COLORS.entity,
              type: 'entity'
            });
          }

          links.push({
            source: memId,
            target: entId,
            label: 'has_entity',
            color: 'rgba(236, 72, 153, 0.3)'
          });
        });
      }

      // Add Explicit Memory-to-Memory Links
      if (mem.related_memory_ids && Array.isArray(mem.related_memory_ids)) {
        mem.related_memory_ids.forEach(relId => {
          const targetMemId = `mem:${relId}`;
          if (filteredMemories.some(m => m.id === relId)) {
            links.push({
              source: memId,
              target: targetMemId,
              label: 'related_to',
              color: 'rgba(6, 182, 212, 0.4)'
            });
          }
        });
      }
    });

    return {
      nodes: Array.from(nodesMap.values()),
      links
    };
  }, [activeMemories, activeFilter]);

  // Recenter and zoom graph
  const handleZoomToFit = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 50);
    }
  }, []);

  // Custom Node Canvas Renderer
  const renderNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${node.type === 'category' ? 'bold ' : ''}${Math.max(fontSize, 3)}px Inter, sans-serif`;
    
    // Draw outer glow for category hubs or selected nodes
    if (node.type === 'category' || selectedNode?.id === node.id || hoveredNode?.id === node.id) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, Math.sqrt(node.val) * 2.5 + 4, 0, 2 * Math.PI, false);
      ctx.fillStyle = node.color + '33'; // 20% opacity glow
      ctx.fill();
    }

    // Draw main circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, Math.sqrt(node.val) * 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.lineWidth = selectedNode?.id === node.id ? 2 / globalScale : 1 / globalScale;
    ctx.strokeStyle = selectedNode?.id === node.id ? '#ffffff' : 'rgba(0,0,0,0.4)';
    ctx.stroke();

    // Render Text Labels when zoomed in or on hover/category
    if (globalScale > 1.2 || node.type === 'category' || node.type === 'entity' || hoveredNode?.id === node.id || selectedNode?.id === node.id) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = node.type === 'category' ? '#ffffff' : 'rgba(244, 244, 245, 0.9)';
      ctx.fillText(label, node.x, node.y + Math.sqrt(node.val) * 2 + (fontSize + 2));
    }
  }, [selectedNode, hoveredNode]);

  return (
    <div className="glass-panel" style={isFullscreen ? { position: 'fixed', top: '20px', left: '20px', right: '20px', bottom: '20px', zIndex: 999, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '16px' } : { display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles style={{ width: '18px', height: '18px', color: '#06b6d4' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              {projectName} Knowledge Graph
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: '4px 0 0 0' }}>
            Advanced force-directed graph (react-force-graph-2d). Drag nodes, scroll to zoom, click to inspect.
          </p>
        </div>

        {/* Filter & Action Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>

          {/* Project Dropdown — only shown when multiple projects are available */}
          {hasProjectDropdown && (
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <select
                value={selectedProjectId}
                onChange={(e) => { setSelectedProjectId(e.target.value); setSelectedNode(null); }}
                style={{
                  appearance: 'none',
                  background: '#18181b',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  padding: '7px 32px 7px 10px',
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '160px',
                }}
              >
                <option value="current">📌 Current Project</option>
                <option value="all">🌐 All Projects</option>
                {projects.map(p => {
                  const count = (allMemories || []).filter(m => m.project_id === p.id).length;
                  return (
                    <option key={p.id} value={p.id}>
                      📁 {p.name} ({count})
                    </option>
                  );
                })}
              </select>
              <ChevronDown style={{ position: 'absolute', right: '8px', width: '13px', height: '13px', color: '#71717a', pointerEvents: 'none' }} />
            </div>
          )}

          <div className="filter-bar">
            <button
              onClick={() => setActiveFilter('all')}
              className={`filter-tab ${activeFilter === 'all' ? 'filter-tab-active' : ''}`}
            >
              All Nodes
            </button>
            <button
              onClick={() => setActiveFilter('architecture')}
              className={`filter-tab ${activeFilter === 'architecture' ? 'filter-tab-active' : ''}`}
            >
              Architecture
            </button>
            <button
              onClick={() => setActiveFilter('lessonsLearned')}
              className={`filter-tab ${activeFilter === 'lessonsLearned' ? 'filter-tab-active' : ''}`}
            >
              Lessons
            </button>
            <button
              onClick={() => setActiveFilter('activeContext')}
              className={`filter-tab ${activeFilter === 'activeContext' ? 'filter-tab-active' : ''}`}
            >
              Context
            </button>
          </div>

          <button
            onClick={handleZoomToFit}
            title="Recenter & Fit Graph"
            className="btn-secondary"
            style={{ padding: '8px 10px' }}
          >
            <RefreshCw style={{ width: '16px', height: '16px' }} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
            className="btn-secondary"
            style={{ padding: '8px 10px' }}
          >
            {isFullscreen ? <Minimize2 style={{ width: '16px', height: '16px' }} /> : <Maximize2 style={{ width: '16px', height: '16px' }} />}
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div ref={containerRef} style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', background: 'rgba(10, 10, 16, 0.85)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.5)' }}>
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
          linkDirectionalParticleSpeed={0.006}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={(link: any) => link.color}
          linkColor={(link: any) => link.color}
          linkWidth={1.2}
          cooldownTicks={100}
          onNodeClick={(node: any) => setSelectedNode(node)}
          onNodeHover={(node: any) => setHoveredNode(node || null)}
          onNodeDragEnd={(node: any) => {
            // Lock node position after drag
            node.fx = node.x;
            node.fy = node.y;
          }}
        />

        {/* Legend / Stats overlay */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(15, 15, 23, 0.9)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', fontFamily: 'monospace', color: '#a1a1aa', pointerEvents: 'none' }}>
          <span>Nodes: <strong style={{ color: '#06b6d4' }}>{graphData.nodes.length}</strong></span>
          <span>•</span>
          <span>Edges: <strong style={{ color: '#8b5cf6' }}>{graphData.links.length}</strong></span>
        </div>

        {/* Hover Tooltip */}
        {hoveredNode && !selectedNode && (
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', maxWidth: '320px', padding: '14px', borderRadius: '12px', background: 'rgba(15, 15, 25, 0.95)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', pointerEvents: 'none', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: hoveredNode.color }} />
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', textTransform: 'uppercase', color: '#e4e4e7' }}>
                {hoveredNode.type.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>{hoveredNode.name}</p>
            {hoveredNode.memory && (
              <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '6px', marginBottom: 0, lineHeight: 1.5 }}>
                {hoveredNode.memory.content.length > 120 ? hoveredNode.memory.content.slice(0, 120) + '...' : hoveredNode.memory.content}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Node Inspector Drawer */}
      {selectedNode && (
        <div style={{ padding: '20px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(20, 20, 32, 0.95) 0%, rgba(30, 30, 50, 0.95) 100%)', border: '1px solid rgba(6, 182, 212, 0.4)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: selectedNode.color, boxShadow: `0 0 10px ${selectedNode.color}` }} />
              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', color: '#a1a1aa', display: 'block' }}>
                  {selectedNode.type === 'category' ? 'Category Hub Node' : selectedNode.type === 'entity' ? 'Entity Tag Node' : `Memory Node • ${selectedNode.category}`}
                </span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '2px 0 0 0' }}>{selectedNode.name}</h4>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {selectedNode.memory ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.95rem', color: '#e4e4e7', lineHeight: 1.6 }}>
                "{selectedNode.memory.content}"
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '0.8rem', color: '#a1a1aa' }}>
                <span>Saved on: {new Date(selectedNode.memory.created_at).toLocaleString()}</span>
                {selectedNode.memory.entities && selectedNode.memory.entities.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag style={{ width: '14px', height: '14px', color: '#ec4899' }} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {selectedNode.memory.entities.map((ent, idx) => (
                        <span
                          key={idx}
                          style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.3)', fontFamily: 'monospace', fontSize: '0.75rem' }}
                        >
                          #{ent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#a1a1aa', fontStyle: 'italic', margin: 0 }}>
              This is a hub node representing an entity tag or memory category. Connected memories orbit around this node in the force graph.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
