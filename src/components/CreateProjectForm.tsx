'use client';

import { useState } from 'react';
import { createProject } from '@/app/actions';

export default function CreateProjectForm({ 
  externalOpen, 
  onCloseExternal 
}: { 
  externalOpen?: boolean; 
  onCloseExternal?: () => void; 
} = {}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;

  const handleClose = () => {
    if (onCloseExternal) onCloseExternal();
    else setInternalOpen(false);
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await createProject(formData);
    if (res && res.error) {
      setError(res.error);
    } else {
      handleClose();
    }
    setLoading(false);
  }

  if (!isOpen) {
    return (
      <button onClick={() => setInternalOpen(true)} className="btn-primary">
        + Create New Project
      </button>
    );
  }

  return (
    <div className="glass-panel mt-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, color: '#fff' }}>Create a New Memory Bank Project</h3>
        <button 
          onClick={handleClose} 
          style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '1.2rem' }}
        >
          ✕
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Project Name</label>
          <input 
            type="text" 
            name="name" 
            required 
            placeholder="e.g., SaaS Dashboard AI"
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '6px', 
              background: '#0a0a0a', 
              border: '1px solid var(--border-light)', 
              color: '#fff',
              outline: 'none',
              fontSize: '0.875rem'
            }} 
            onFocus={(e) => e.target.style.borderColor = '#3f3f46'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Description (Optional)</label>
          <textarea 
            name="description" 
            rows={3}
            placeholder="Briefly describe what this project does so the AI understands the overall architecture..."
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '6px', 
              background: '#0a0a0a', 
              border: '1px solid var(--border-light)', 
              color: '#fff',
              outline: 'none',
              resize: 'vertical',
              fontSize: '0.875rem'
            }} 
            onFocus={(e) => e.target.style.borderColor = '#3f3f46'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={handleClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
