'use client';

import React from 'react';
import { CreditCard, Check, Zap } from 'lucide-react';

export default function BillingView() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px 0' }}>Billing & Plans</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Manage your subscription and upgrade your limits.</p>
      </div>

      <div style={{ background: '#0a0a0a', border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Free Tier
              <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Current Plan</span>
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Perfect for getting started with AI memory.</p>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            $0<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
          </div>
        </div>
        
        <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 500, margin: '0 0 16px 0', color: 'var(--text-muted)' }}>What's included:</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem' }}>
                <div style={{ padding: '2px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
                  <Check style={{ width: '12px', height: '12px', color: '#10b981' }} />
                </div>
                Up to 50MB of raw string storage
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem' }}>
                <div style={{ padding: '2px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
                  <Check style={{ width: '12px', height: '12px', color: '#10b981' }} />
                </div>
                Unlimited Projects
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem' }}>
                <div style={{ padding: '2px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
                  <Check style={{ width: '12px', height: '12px', color: '#10b981' }} />
                </div>
                API / MCP Access
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem' }}>
                <div style={{ padding: '2px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
                  <Check style={{ width: '12px', height: '12px', color: '#10b981' }} />
                </div>
                Standard Support
              </li>
            </ul>
          </div>
          
          <div style={{ background: '#18181b', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <Zap style={{ width: '24px', height: '24px', color: '#3b82f6', marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 500, margin: '0 0 8px 0' }}>Need more capacity?</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Upgrade to the Pro tier for 5GB of storage, semantic vector search, and priority routing.
            </p>
            <button disabled style={{ width: '100%', padding: '8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, cursor: 'not-allowed', opacity: 0.5 }}>
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '24px', background: '#0a0a0a', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
        <div style={{ padding: '12px', background: '#18181b', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <CreditCard style={{ width: '24px', height: '24px', color: 'var(--text-muted)' }} />
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 500, margin: '0 0 8px 0' }}>Payment Method</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            No payment method is currently attached to your account.
          </p>
        </div>
      </div>
    </div>
  );
}
