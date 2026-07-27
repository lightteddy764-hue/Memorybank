'use client';

import { useState } from 'react';
import { login, signup } from '@/app/auth/actions';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const action = isLogin ? login : signup;
    const res = await action(formData);
    if (res && res.error) {
      setError(res.error);
    }
    setLoading(false);
  }

  return (
    <div className="glass-panel" style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#fff' }}>
        {isLogin ? 'Sign In to Memory Bank' : 'Create an Account'}
      </h2>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#a1a1aa' }}>Email</label>
          <input 
            type="email" 
            name="email" 
            required 
            placeholder="you@example.com"
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#a1a1aa' }}>Password</label>
          <input 
            type="password" 
            name="password" 
            required 
            placeholder="••••••••"
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

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary" 
          style={{ marginTop: '0.5rem', width: '100%', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#a1a1aa' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          type="button" 
          onClick={() => { setIsLogin(!isLogin); setError(null); }}
          style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isLogin ? 'Sign Up' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}
