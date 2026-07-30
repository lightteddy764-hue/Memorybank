'use client';

import React, { useMemo } from 'react';
import { Layers, Sparkles } from 'lucide-react';
// The MemoryGraph component needs to be imported safely
import { MemoryGraph } from '@supermemory/memory-graph';

interface Project {
  id: string;
  name: string;
}

interface Memory {
  id: string;
  project_id: string;
  type: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

interface KnowledgeGraphViewProps {
  projects: Project[];
  memories: Memory[];
}

export default function KnowledgeGraphView({ projects, memories }: KnowledgeGraphViewProps) {
  
  // Transform our generic database schema into the Supermemory Graph API schema
  const mappedDocuments = useMemo(() => {
    return projects.map((proj) => {
      // Find memories belonging to this project
      const projMemories = memories.filter(m => m.project_id === proj.id);

      // Map to GraphApiMemory format
      const mappedMemories = projMemories.map((m) => ({
        id: m.id,
        memory: m.content || 'Untitled Memory',
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
        updatedAt: m.updated_at || new Date().toISOString(),
        relation: 'derives' as any // Default relation type
      }));

      // Return GraphApiDocument format
      return {
        id: proj.id,
        title: proj.name,
        summary: `Project Hub containing ${mappedMemories.length} memories`,
        documentType: 'project_hub',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        memories: mappedMemories
      };
    });
  }, [projects, memories]);

  return (
    <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', color: '#fff' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles style={{ width: '24px', height: '24px', color: '#06b6d4' }} />
            Official Supermemory Graph
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Powered by @supermemory/memory-graph. Visualizing projects as documents and memories as hexagons.
          </p>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div 
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
            <p>No projects found. Create a project to initialize the visualization.</p>
          </div>
        ) : (
          <MemoryGraph 
            documents={mappedDocuments}
            variant="console"
            isLoading={false}
          />
        )}
      </div>
    </div>
  );
}
