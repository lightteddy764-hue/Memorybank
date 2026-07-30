'use client';

import React from 'react';
import { User, Mail, Moon } from 'lucide-react';

interface SettingsViewProps {
  userName: string;
  userEmail: string;
}

export default function SettingsView({ userName, userEmail }: SettingsViewProps) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px 0' }}>Settings</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Manage your personal profile and application preferences.</p>
      </div>

      <div style={{ background: '#0a0a0a', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: '0 0 24px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>Profile Information</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#18181b', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 600 }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.25rem' }}>{userName}</h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Personal Account</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
              <input type="text" value={userName} readOnly style={{ width: '100%', padding: '12px 12px 12px 36px', background: '#18181b', border: '1px solid var(--border-light)', borderRadius: '8px', color: '#fff', fontSize: '0.875rem', cursor: 'not-allowed', opacity: 0.7 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
              <input type="text" value={userEmail} readOnly style={{ width: '100%', padding: '12px 12px 12px 36px', background: '#18181b', border: '1px solid var(--border-light)', borderRadius: '8px', color: '#fff', fontSize: '0.875rem', cursor: 'not-allowed', opacity: 0.7 }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#0a0a0a', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '32px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: '0 0 24px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>Preferences</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: '#18181b', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <Moon style={{ width: '20px', height: '20px', color: '#fff' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', fontWeight: 500 }}>Theme Appearance</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Memory Bank is designed with a premium dark-mode aesthetic.</p>
            </div>
          </div>
          
          <select disabled style={{ padding: '8px 16px', background: '#18181b', border: '1px solid var(--border-light)', borderRadius: '6px', color: '#fff', fontSize: '0.875rem', cursor: 'not-allowed', opacity: 0.7 }}>
            <option>Dark Mode</option>
          </select>
        </div>
      </div>
    </div>
  );
}
