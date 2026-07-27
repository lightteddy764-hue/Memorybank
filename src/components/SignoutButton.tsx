'use client';

import { signout } from '@/app/auth/actions';

export default function SignoutButton() {
  return (
    <button 
      onClick={() => signout()} 
      style={{ 
        background: 'transparent', 
        border: '1px solid rgba(255,255,255,0.2)', 
        color: '#a1a1aa', 
        padding: '0.4rem 0.8rem', 
        borderRadius: '6px', 
        cursor: 'pointer',
        fontSize: '0.8rem'
      }}
    >
      Sign Out
    </button>
  );
}
