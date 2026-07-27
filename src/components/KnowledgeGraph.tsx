'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Memory {
  id: string;
  content: string;
  type: string;
  entities?: string[];
  related_memory_ids?: string[];
  created_at: string;
}

interface Node {
  id: string;
  label: string;
  type: 'entity' | 'memory' | 'category';
  category?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  memory?: Memory;
}

interface Edge {
  source: string;
  target: string;
  type: 'has_entity' | 'belongs_to' | 'related';
}

export default function KnowledgeGraph({ memories }: { memories: Memory[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Generate Graph Nodes & Edges from Memories
  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const nodeMap = new Map<string, Node>();

    const categories = [
      { id: 'cat-activeContext', label: 'Active Context', color: '#10b981' }, // emerald
      { id: 'cat-lessonsLearned', label: 'Lessons Learned', color: '#8b5cf6' }, // purple
      { id: 'cat-architecture', label: 'Architecture', color: '#06b6d4' }, // cyan
      { id: 'cat-general', label: 'General Notes', color: '#f59e0b' }, // amber
    ];

    // Add category hub nodes
    categories.forEach((cat, index) => {
      const angle = (index / categories.length) * Math.PI * 2;
      const node: Node = {
        id: cat.id,
        label: cat.label,
        type: 'category',
        x: 350 + Math.cos(angle) * 150,
        y: 250 + Math.sin(angle) * 150,
        vx: 0,
        vy: 0,
        radius: 28,
        color: cat.color,
      };
      newNodes.push(node);
      nodeMap.set(cat.id, node);
    });

    const entitySet = new Set<string>();
    memories.forEach((mem) => {
      (mem.entities || []).forEach((ent) => entitySet.add(ent));
    });

    // Add entity nodes
    const entityList = Array.from(entitySet);
    entityList.forEach((ent, idx) => {
      const angle = (idx / (entityList.length || 1)) * Math.PI * 2;
      const id = `ent-${ent}`;
      const node: Node = {
        id,
        label: ent,
        type: 'entity',
        x: 350 + Math.cos(angle) * 220,
        y: 250 + Math.sin(angle) * 220,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 18,
        color: '#ec4899', // pink
      };
      newNodes.push(node);
      nodeMap.set(id, node);
    });

    // Add memory nodes
    memories.forEach((mem, idx) => {
      const id = mem.id;
      const colorMap: Record<string, string> = {
        activeContext: '#10b981',
        lessonsLearned: '#8b5cf6',
        architecture: '#06b6d4',
        general: '#f59e0b',
      };
      const node: Node = {
        id,
        label: mem.content.slice(0, 22) + (mem.content.length > 22 ? '...' : ''),
        type: 'memory',
        category: mem.type,
        x: 350 + (Math.random() - 0.5) * 400,
        y: 250 + (Math.random() - 0.5) * 300,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 12,
        color: colorMap[mem.type] || '#64748b',
        memory: mem,
      };
      newNodes.push(node);
      nodeMap.set(id, node);

      // Edge to category
      if (nodeMap.has(`cat-${mem.type}`)) {
        newEdges.push({ source: id, target: `cat-${mem.type}`, type: 'belongs_to' });
      }

      // Edges to entities
      (mem.entities || []).forEach((ent) => {
        if (nodeMap.has(`ent-${ent}`)) {
          newEdges.push({ source: id, target: `ent-${ent}`, type: 'has_entity' });
        }
      });

      // Edges to related memories
      (mem.related_memory_ids || []).forEach((relId) => {
        if (nodeMap.has(relId)) {
          newEdges.push({ source: id, target: relId, type: 'related' });
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [memories]);

  // Animation & Physics Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Update positions (light bouncing physics)
      nodes.forEach((node) => {
        if (node.type !== 'category') {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x <= node.radius || node.x >= canvas.width - node.radius) node.vx *= -1;
          if (node.y <= node.radius || node.y >= canvas.height - node.radius) node.vy *= -1;
        }
      });

      // Draw Edges
      edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (!sourceNode || !targetNode) return;

        const isHighlighted =
          hoveredNode?.id === sourceNode.id ||
          hoveredNode?.id === targetNode.id ||
          selectedNode?.id === sourceNode.id ||
          selectedNode?.id === targetNode.id;

        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.strokeStyle = isHighlighted
          ? 'rgba(6, 182, 212, 0.8)' // neon cyan
          : edge.type === 'has_entity'
          ? 'rgba(236, 72, 153, 0.25)' // pink
          : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = isHighlighted ? 2.5 : 1;
        ctx.stroke();
      });

      // Draw Nodes
      nodes.forEach((node) => {
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;

        // Glow effect
        if (isSelected || isHovered || node.type === 'category') {
          ctx.save();
          ctx.shadowColor = node.color;
          ctx.shadowBlur = isSelected || isHovered ? 20 : 12;
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isSelected || isHovered ? 4 : 0), 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.stroke();

        if (isSelected || isHovered || node.type === 'category') {
          ctx.restore();
        }

        // Labels
        ctx.fillStyle = isHovered || isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.8)';
        ctx.font = `${node.type === 'category' ? '600 13px' : '11px'} Outfit, Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y + node.radius + 14);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, edges, hoveredNode, selectedNode]);

  // Handle Mouse Events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const found = nodes.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 5;
    });

    setHoveredNode(found || null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode);
    } else {
      setSelectedNode(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            Interactive Knowledge Graph Engine
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Real-time node relationships across memories, categories, and entities (Cognee & Supermemory inspired).
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Architecture
          </span>
          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" /> Lessons
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Context
          </span>
          <span className="px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" /> Entities
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-xl bg-slate-950/70 border border-slate-800/60 shadow-inner">
        <canvas
          ref={canvasRef}
          width={700}
          height={500}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          className="w-full h-[500px] cursor-pointer"
        />

        {hoveredNode && !selectedNode && (
          <div className="absolute top-4 right-4 max-w-xs p-3 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              {hoveredNode.type.toUpperCase()}
            </span>
            <p className="text-sm font-semibold text-white mt-1.5">{hoveredNode.label}</p>
            {hoveredNode.memory && (
              <p className="text-xs text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                {hoveredNode.memory.content}
              </p>
            )}
          </div>
        )}
      </div>

      {selectedNode && selectedNode.memory && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-cyan-500/30 shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Selected Memory Node
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-700/80 transition-colors"
            >
              Close ✕
            </button>
          </div>
          <p className="text-sm font-medium text-slate-200 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
            "{selectedNode.memory.content}"
          </p>
          {selectedNode.memory.entities && selectedNode.memory.entities.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">Connected Entities:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.memory.entities.map((ent, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs font-mono"
                  >
                    #{ent}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
