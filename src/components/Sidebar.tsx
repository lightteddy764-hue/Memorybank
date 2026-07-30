'use client';

import React from 'react';
import { Home, Folder, Database, Share2, Key, BarChart3, Settings, CreditCard, FileText, Box, LogOut } from 'lucide-react';

interface SidebarProps {
  userEmail: string;
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Folder, label: 'Projects' },
    { icon: Database, label: 'Memories' },
    { icon: Share2, label: 'Knowledge Graph' },
    { icon: Key, label: 'API Keys' },
    { icon: BarChart3, label: 'Usage' },
    { icon: Settings, label: 'Settings', spacer: true },
    { icon: CreditCard, label: 'Billing' },
    { icon: FileText, label: 'Docs' },
  ];

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 4px' }}>
          <div style={{ width: '32px', height: '32px', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box style={{ width: '18px', height: '18px', color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>Memory Bank</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>AI Memory Infrastructure</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, idx) => (
            <React.Fragment key={item.label}>
              {item.spacer && <div style={{ height: '24px' }} />}
              <button
                className={`sidebar-item ${item.active ? 'sidebar-item-active' : ''}`}
                style={{
                  justifyContent: 'flex-start',
                  padding: '10px 12px',
                  background: item.active ? '#18181b' : 'transparent',
                  border: 'none',
                  color: item.active ? '#fff' : 'var(--text-muted)'
                }}
              >
                <item.icon style={{ width: '18px', height: '18px', color: item.active ? '#fff' : 'var(--text-dark)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: item.active ? 500 : 400 }}>{item.label}</span>
              </button>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Storage Bar */}
        <div style={{ padding: '16px', background: '#0a0a0a', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 500 }}>
            <span style={{ color: '#fff' }}>Storage</span>
            <span style={{ color: '#fff' }}>72%</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: '#27272a', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ width: '72%', height: '100%', background: '#fff', borderRadius: '2px' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>3.6 GB / 5 GB</span>
        </div>

        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'transparent' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#18181b', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: '0.8rem', color: '#fff', margin: 0, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Udita Singh</h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</p>
          </div>
        </div>

        {/* Logout */}
        <form action="/auth/signout" method="post" style={{ width: '100%' }}>
          <button type="submit" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
            <LogOut style={{ width: '16px', height: '16px' }} />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
