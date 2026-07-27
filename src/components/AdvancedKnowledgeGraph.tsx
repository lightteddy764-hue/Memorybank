'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Maximize2, Minimize2, RefreshCw, Filter, Sparkles, Info, X, Tag } from 'lucide-react';

// Dynamically import ForceGraph2D with SSR disabled to prevent Node window errors in Next.js
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[550px] flex flex-col items-center justify-center bg-slate-950/70 rounded-xl border border-slate-800/80 gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      <span className="text-xs font-mono text-cyan-400">Loading Force-Directed Physics Engine...</span>
    </div>
  )
});

interface Memory {
  id: string;
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
  type: string;
  color: string;
}

export default function AdvancedKnowledgeGraph({ memories, projectName }: { memories: Memory[]; projectName: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 550 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Measure container dimensions for responsive canvas
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 700,
          height: isFullscreen ? window.innerHeight - 150 : 550
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

  // Construct Graph Data (Nodes & Links)
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeIds = new Set<string>();

    const categories = [
      { id: 'cat-activeContext', name: 'Active Context Hub', color: '#10b981', val: 20 },
      { id: 'cat-lessonsLearned', name: 'Lessons Hub', color: '#8b5cf6', val: 20 },
      { id: 'cat-architecture', name: 'Architecture Hub', color: '#06b6d4', val: 20 },
      { id: 'cat-general', name: 'General Notes Hub', color: '#f59e0b', val: 18 },
    ];

    // Add category hubs
    categories.forEach((cat) => {
      nodes.push({
        id: cat.id,
        name: cat.name,
        val: cat.val,
        color: cat.color,
        type: 'category'
      });
      nodeIds.add(cat.id);
    });

    const filteredMemories = activeFilter === 'all' 
      ? memories 
      : memories.filter(m => m.type === activeFilter);

    const entitySet = new Set<string>();
    filteredMemories.forEach(m => {
      (m.entities || []).forEach(ent => entitySet.add(ent));
    });

    // Add entity nodes
    entitySet.forEach(ent => {
      const id = `ent-${ent}`;
      nodes.push({
        id,
        name: `#${ent}`,
        val: 12,
        color: '#ec4899', // pink
        type: 'entity'
      });
      nodeIds.add(id);
    });

    // Add memory nodes & links
    const colorMap: Record<string, string> = {
      activeContext: '#34d399',
      lessonsLearned: '#a78bfa',
      architecture: '#22d3ee',
      general: '#fbbf24',
    };

    filteredMemories.forEach(mem => {
      nodes.push({
        id: mem.id,
        name: mem.content.slice(0, 30) + (mem.content.length > 30 ? '...' : ''),
        val: 8,
        color: colorMap[mem.type] || '#94a3b8',
        type: 'memory',
        category: mem.type,
        memory: mem
      });
      nodeIds.add(mem.id);

      // Link memory to category hub
      if (nodeIds.has(`cat-${mem.type}`)) {
        links.push({
          source: mem.id,
          target: `cat-${mem.type}`,
          type: 'belongs_to',
          color: 'rgba(255, 255, 255, 0.15)'
        });
      }

      // Link memory to entities
      (mem.entities || []).forEach(ent => {
        if (nodeIds.has(`ent-${ent}`)) {
          links.push({
            source: mem.id,
            target: `ent-${ent}`,
            type: 'has_entity',
            color: 'rgba(236, 72, 153, 0.3)'
          });
        }
      });

      // Link to related memories
      (mem.related_memory_ids || []).forEach(relId => {
        if (nodeIds.has(relId)) {
          links.push({
            source: mem.id,
            target: relId,
            type: 'related',
            color: 'rgba(6, 182, 212, 0.5)'
          });
        }
      });
    });

    return { nodes, links };
  }, [memories, activeFilter]);

  // Handle zoom to fit
  const handleZoomToFit = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 50);
    }
  }, []);

  // Custom Node Canvas Rendering (Supermemory/Obsidian Glowing Style)
  const renderNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedNode?.id === node.id;
    const isHovered = hoveredNode?.id === node.id;

    const label = node.name;
    const fontSize = node.type === 'category' ? 12 / globalScale : 10 / globalScale;
    const radius = Math.sqrt(node.val) * 2;

    // Draw glowing halo if hovered/selected or hub
    if (isSelected || isHovered || node.type === 'category') {
      ctx.save();
      ctx.shadowColor = node.color;
      ctx.shadowBlur = isSelected ? 25 : 15;
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius + (isSelected ? 3 : 0), 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color;
    ctx.fill();

    ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = isSelected ? 2 / globalScale : 1 / globalScale;
    ctx.stroke();

    if (isSelected || isHovered || node.type === 'category') {
      ctx.restore();
    }

    // Draw text label when zoomed in or when hovered/selected/hub
    if (globalScale > 1.2 || isHovered || isSelected || node.type === 'category') {
      ctx.font = `${node.type === 'category' ? '600' : '400'} ${fontSize}px Outfit, Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isHovered || isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(label, node.x, node.y + radius + (8 / globalScale));
    }
  }, [selectedNode, hoveredNode]);

  return (
    <div className={`flex flex-col gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl shadow-2xl transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50 overflow-hidden' : 'relative w-full'}`}>
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              {projectName} Knowledge Graph
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Advanced force-directed graph (react-force-graph-2d). Drag nodes, scroll to zoom, click to inspect.
          </p>
        </div>

        {/* Filter & Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950/80 rounded-lg p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${activeFilter === 'all' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              All Nodes
            </button>
            <button
              onClick={() => setActiveFilter('architecture')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${activeFilter === 'architecture' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Architecture
            </button>
            <button
              onClick={() => setActiveFilter('lessonsLearned')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${activeFilter === 'lessonsLearned' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Lessons
            </button>
            <button
              onClick={() => setActiveFilter('activeContext')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${activeFilter === 'activeContext' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Context
            </button>
          </div>

          <button
            onClick={handleZoomToFit}
            title="Recenter & Fit Graph"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800/60 shadow-inner">
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
        <div className="absolute top-4 left-4 flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800/80 text-[11px] font-mono text-slate-400 backdrop-blur-md pointer-events-none">
          <span>Nodes: <strong className="text-cyan-400">{graphData.nodes.length}</strong></span>
          <span>•</span>
          <span>Edges: <strong className="text-purple-400">{graphData.links.length}</strong></span>
        </div>

        {/* Hover Tooltip */}
        {hoveredNode && !selectedNode && (
          <div className="absolute bottom-4 right-4 max-w-sm p-3.5 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredNode.color }} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
                {hoveredNode.type.toUpperCase()}
              </span>
            </div>
            <p className="text-sm font-semibold text-white mt-1">{hoveredNode.name}</p>
            {hoveredNode.memory && (
              <p className="text-xs text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                {hoveredNode.memory.content}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Node Inspector Drawer */}
      {selectedNode && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-indigo-950/50 border border-cyan-500/30 shadow-2xl flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full shadow-lg" style={{ backgroundColor: selectedNode.color }} />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  {selectedNode.type === 'category' ? 'Category Hub Node' : selectedNode.type === 'entity' ? 'Entity Tag Node' : `Memory Node • ${selectedNode.category}`}
                </span>
                <h4 className="text-sm font-bold text-white">{selectedNode.name}</h4>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedNode.memory ? (
            <div className="flex flex-col gap-3">
              <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 text-sm font-medium text-slate-200 leading-relaxed">
                "{selectedNode.memory.content}"
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span>Saved on: {new Date(selectedNode.memory.created_at).toLocaleString()}</span>
                {selectedNode.memory.entities && selectedNode.memory.entities.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-pink-400" />
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.memory.entities.map((ent, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 font-mono text-[11px]"
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
            <p className="text-xs text-slate-400 italic">
              This is a hub node representing an entity tag or memory category. Connected memories orbit around this node in the force graph.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
