'use client';

import { useState } from 'react';
import { createProject } from '@/app/auth/actions';

export default function CreateProjectForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await createProject(formData);
    if (res && res.error) {
      setError(res.error);
    } else {
      setIsOpen(false);
    }
    setLoading(false);
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn-primary">
        + Create New Project
      </button>
    );
  }

  return (
    <div className="glass-panel mt-4" style={{ border: '1px solid #10b981' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: '#fff' }}>Create a New Memory Bank Project</h3>
        <button 
          onClick={() => setIsOpen(false)} 
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#a1a1aa' }}>Project Name</label>
          <input 
            type="text" 
            name="name" 
            required 
            placeholder="e.g., SaaS Dashboard AI"
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              background: 'rgba(0,0,0,0.5)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: '#fff',
              outline: 'none' 
            }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#a1a1aa' }}>Description (Optional)</label>
          <textarea 
            name="description" 
            rows={3}
            placeholder="Briefly describe what this project does so the AI understands the overall architecture..."
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              background: 'rgba(0,0,0,0.5)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: '#fff',
              outline: 'none',
              resize: 'vertical'
            }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={() => setIsOpen(false)}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
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
