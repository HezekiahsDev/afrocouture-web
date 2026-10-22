'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Fabric Explorer', href: '/fabric-explorer' },
  { label: 'AI Design Studio', href: '/ai-studio', badge: 'BETA' },
  { label: 'Tailors Directory', href: '/tailors' },
  { label: 'My Orders & Escrow', href: '/orders' },
  { label: 'Virtual Try-On', href: '/virtual-try-on' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header
      style={{
        background: 'rgba(9, 13, 22, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2.5rem',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Logo */}
        <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #00A3FF, #0284C7)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >
            🧵
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: '14px', color: '#F8FAFC', lineHeight: 1 }}>
              Tailor & Fabric
            </div>
          </div>
        </Link>

        {/* Location */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '5px 10px',
            color: '#94A3B8',
            fontSize: '12px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          📍 Kano, Nigeria ▾
        </button>

        {/* Search */}
        <div style={{ flex: 1, position: 'relative', maxWidth: '340px' }}>
          <input
            className="input-field"
            placeholder="Search bespoke kaftans, an..."
            style={{ paddingLeft: '2.5rem', height: '36px', fontSize: '12px', borderRadius: '8px' }}
          />
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '14px' }}>
            🔍
          </span>
          <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '4px' }}>
            {['Tailors', 'Fabrics', 'AI Designs'].map((tag) => (
              <span key={tag} style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(0,163,255,0.15)', color: '#38BDF8', borderRadius: '4px', fontWeight: 600 }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, overflowX: 'auto' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/marketplace' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#F8FAFC' : '#94A3B8',
                  background: isActive ? 'rgba(0, 163, 255, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 163, 255, 0.3)' : '1px solid transparent',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {link.label}
                {link.badge && (
                  <span style={{ fontSize: '9px', padding: '1px 5px', background: '#00A3FF', color: '#090D16', borderRadius: '4px', fontWeight: 700 }}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {['🔔', '🛍️'].map((icon, i) => (
            <button
              key={i}
              style={{
                width: '32px',
                height: '32px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {icon}
            </button>
          ))}
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #00A3FF, #0284C7)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            👤
          </div>
        </div>
      </div>
    </header>
  );
}
