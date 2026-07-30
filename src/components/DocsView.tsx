'use client';

import React from 'react';
import { BookOpen, Terminal, Code } from 'lucide-react';

export default function DocsView() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', color: '#fff', paddingBottom: '64px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BookOpen style={{ width: '28px', height: '28px', color: '#3b82f6' }} />
          Documentation
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Learn how to connect your AI assistants to Memory Bank.</p>
      </div>

      <div style={{ background: '#0a0a0a', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '40px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 16px 0' }}>Model Context Protocol (MCP)</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 24px 0' }}>
          Memory Bank acts as an MCP Server that your AI tools (like Claude Desktop, Cursor, or Windsurf) can connect to. Once connected, your AI can automatically store and retrieve context, creating a long-term memory graph for your projects.
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', background: '#18181b', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '32px' }}>
          <Terminal style={{ width: '24px', height: '24px', color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: '0 0 12px 0' }}>Global Configuration</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
              To connect your AI tool to Memory Bank globally, you will need the base URL of this application and a Project API Key.
            </p>
            <div style={{ background: '#000', padding: '16px', borderRadius: '6px', border: '1px solid #27272a', fontFamily: 'monospace', fontSize: '0.8rem', color: '#e4e4e7' }}>
              <span style={{ color: '#ec4899' }}>"mcpServers"</span>: {'{\n'}
              {'  '}<span style={{ color: '#3b82f6' }}>"memory-bank"</span>: {'{\n'}
              {'    '}"command": "node",{'\n'}
              {'    '}"args": ["path/to/mcp/script.js"],{'\n'}
              {'    '}"env": {'{\n'}
              {'      '}"MEMORY_BANK_URL": <span style={{ color: '#10b981' }}>"https://memorybank-omega.vercel.app"</span>,{'\n'}
              {'      '}"MEMORY_BANK_API_KEY": <span style={{ color: '#10b981' }}>"YOUR_PROJECT_KEY"</span>{'\n'}
              {'    '}{'}\n'}
              {'  '}{'}\n'}
              {'}'}
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 16px 0', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>Available Tools</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          <div style={{ padding: '20px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Code style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
              <strong style={{ fontSize: '0.9rem' }}>search_memory</strong>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
              Allows the AI to semantically search the memory bank for specific entities, concepts, or past decisions related to the current context.
            </p>
          </div>

          <div style={{ padding: '20px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Code style={{ width: '16px', height: '16px', color: '#10b981' }} />
              <strong style={{ fontSize: '0.9rem' }}>add_memory</strong>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
              Enables the AI to automatically document new architectural decisions, bug fixes, and knowledge graph entities into the connected project.
            </p>
          </div>
          
          <div style={{ padding: '20px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Code style={{ width: '16px', height: '16px', color: '#eab308' }} />
              <strong style={{ fontSize: '0.9rem' }}>create_project</strong>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
              The AI can dynamically provision a new isolated memory project workspace if the current task warrants a distinct knowledge graph.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
