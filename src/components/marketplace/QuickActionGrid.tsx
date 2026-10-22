'use client';

import Link from 'next/link';

const actions = [
  { icon: '✂️', label: 'Find a Tailor', sub: 'Verified & trusted Nigerian guild tailors for bespoke Kaftans & Agbada.', cta: 'Browse 850+ Profiles →', href: '/tailors', badge: null },
  { icon: '🪢', label: 'Buy Fabric', sub: 'Authentic Swiss voile, Kano-dyed cotton, premium Ankara & Aso Oke.', cta: 'Wholesale & Per-Yard →', href: '/fabric-explorer', badge: null },
  { icon: '✦', label: 'AI Design Studio', sub: 'Describe your dream native attire or upload a sketch for instant 3D rendering.', cta: 'Try AI Generator →', href: '/ai-studio', badge: 'HOT' },
  { icon: '📦', label: 'My Orders', sub: 'Track cutting, tailoring milestones, fitting appointments, and escrow release.', cta: '2 Active Orders →', href: '/orders', badge: null },
];

export default function QuickActionGrid() {
  return (
    <section>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            style={{ textDecoration: 'none' }}
          >
            <div
              className="glass-card"
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,163,255,0.3)';
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(30,41,59,0.6)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(15,23,42,0.85)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0,163,255,0.12)', border: '1px solid rgba(0,163,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  {action.icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {action.badge && (
                    <span style={{ fontSize: '9px', padding: '1px 6px', background: '#00A3FF', color: '#090D16', borderRadius: '4px', fontWeight: 700 }}>{action.badge}</span>
                  )}
                  <span style={{ color: '#64748B', fontSize: '14px' }}>↗</span>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '15px', fontWeight: 600, color: '#F8FAFC', marginBottom: '6px' }}>{action.label}</div>
              <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5, marginBottom: '12px' }}>{action.sub}</p>
              <div style={{ fontSize: '11px', color: '#00A3FF', fontWeight: 600 }}>{action.cta}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
