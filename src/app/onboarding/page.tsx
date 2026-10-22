'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const roles = [
  {
    id: 'customer',
    icon: '✦',
    title: 'Customer & Fashion Enthusiast',
    tag: 'BESPOKE COUTURE',
    tagColor: '#00A3FF',
    description:
      'Create generative AI designs, explore authentic African textiles, and commission master artisans with zero-risk escrow.',
    features: ['AI Haute Couture Studio', '18-Point Smart Fit', 'Escrow Milestone Releases', 'Alteration Guarantee'],
    cta: 'Continue as Customer',
    ctaHref: '/onboarding/fit-profile',
    extra: null,
    recommended: false,
  },
  {
    id: 'tailor',
    icon: '✂',
    title: 'Master Tailor & Couture Artisan',
    tag: 'GUILD ACCREDITED',
    tagColor: '#22D3EE',
    description:
      'Receive high-value custom orders from global clients, inspect 3D pattern layouts, and receive guaranteed milestone disbursements.',
    features: ['Guaranteed Escrow Payouts', 'AI 3D Pattern Feasibility', 'Direct Client Video/Chat', 'Guild Accreditation'],
    cta: 'Continue to Tailor Artisan Verification',
    ctaHref: '/onboarding/tailor-kyc',
    extra: { label: 'Average artisan earnings', value: '₦320,000/mo', sub: '↑ 100% Payout Safety' },
    recommended: true,
  },
  {
    id: 'merchant',
    icon: '⊞',
    title: 'Fabric Merchant & Direct Mill Vendor',
    tag: 'VERIFIED MERCHANT',
    tagColor: '#10B981',
    description:
      'Sell authentic Ankara wax, Swiss voile, Aso-Oke, and brocades in bulk yardage directly to tailors and clients.',
    features: ['Bulk Yardage Pricing Tiers', 'Direct Mill Verification', 'Automated GTBank Settlement', 'B2B Tailor Supply'],
    cta: 'Continue as Fabric Merchant',
    ctaHref: '/onboarding/merchant-verification',
    extra: { label: 'Direct GTBank', value: 'T+1 Settlement', sub: null },
    recommended: false,
  },
];

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string>('tailor');
  const router = useRouter();
  const selectedRole = roles.find((r) => r.id === selected)!;

  return (
    <div style={{ minHeight: '100vh', background: '#090D16', color: '#F8FAFC' }}>
      {/* Top trust bar */}
      <header
        style={{
          background: 'rgba(9,13,22,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 2.5rem',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#00A3FF,#0284C7)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🧵</div>
          <div>
            <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: '13px', color: '#F8FAFC' }}>AfroCouture<span className="ai-gradient-text">AI</span></div>
            <div style={{ fontSize: '9px', color: '#64748B', letterSpacing: '0.05em' }}>TAILOR & FABRIC PORTAL</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {[
            { icon: '🛡️', text: 'Bank-Grade 256-bit Escrow' },
            { icon: '🏆', text: 'African Fashion Guild Certified' },
          ].map((item) => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8' }}>
              <span>{item.icon}</span>{item.text}
            </div>
          ))}
        </div>
        <nav style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {[
            { label: 'Verification', active: true },
            { label: 'Escrow Vault' },
            { label: 'Guild Status' },
            { label: 'Switch Account' },
            { label: 'Support Drawer' },
          ].map((item) => (
            <button
              key={item.label}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: item.active ? 600 : 400,
                color: item.active ? '#090D16' : '#94A3B8',
                background: item.active ? '#00A3FF' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#00A3FF,#0284C7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer' }}>👤</div>
        </nav>
      </header>

      {/* Main content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 2.5rem', display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem', minHeight: 'calc(100vh - 52px - 56px)' }}>
        {/* Left panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Step indicator */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9999px', width: 'fit-content' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00A3FF', display: 'inline-block' }} />
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', color: '#94A3B8' }}>STEP 1 OF 3 • WELCOME GATEWAY</span>
          </div>

          {/* Hero headline */}
          <div>
            <h1 className="display-hero" style={{ fontFamily: 'var(--font-jakarta)' }}>
              Join Africa&apos;s Premier <span className="ai-gradient-text">AI Couture & Artisan</span> Ecosystem
            </h1>
            <p style={{ marginTop: '1rem', color: '#94A3B8', fontSize: '14px', lineHeight: '1.6' }}>
              Whether you want bespoke tailoring, earn high-ticket commissions as a master artisan, or distribute verified direct-mill textiles with automated financial trust.
            </p>
          </div>

          {/* Stats strip */}
          <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { value: '₦450M+', label: 'Escrow Protected', color: '#F8FAFC' },
              { value: '1,400+', label: 'Verified Tailors', color: '#00A3FF' },
              { value: '99.2%', label: 'Fit Precision', color: '#F8FAFC' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '20px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Escrow trust card */}
          <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0,163,255,0.12)', border: '1px solid rgba(0,163,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>🔒</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>Automated Smart Escrow Protection</span>
                <span style={{ fontSize: '14px' }}>✅</span>
              </div>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px', lineHeight: 1.5 }}>
                Funds held securely in Central Bank accredited vault until physical fit approval and milestone sign-off.
              </p>
            </div>
          </div>

          {/* Artisan image */}
          <div className="glass-card" style={{ overflow: 'hidden', height: '180px', position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(0,163,255,0.15), rgba(139,92,246,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px' }}>
              🪡
            </div>
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(9,13,22,0.85)', backdropFilter: 'blur(8px)', borderRadius: '9999px', border: '1px solid rgba(0,163,255,0.25)' }}>
              <span style={{ fontSize: '12px' }}>✅</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#22D3EE' }}>Digital Fabric Twin Certified</span>
            </div>
          </div>
        </div>

        {/* Right panel — role cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {roles.map((role) => {
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                style={{
                  textAlign: 'left',
                  width: '100%',
                  padding: '1.25rem',
                  borderRadius: '1rem',
                  background: isSelected ? 'rgba(30,41,59,0.9)' : 'rgba(15,23,42,0.7)',
                  border: isSelected ? '1px solid rgba(0,163,255,0.4)' : '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(16px)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 24px -4px rgba(0,163,255,0.2)' : 'none',
                  position: 'relative',
                }}
              >
                {role.recommended && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '3px 10px', background: 'rgba(0,163,255,0.15)', border: '1px solid rgba(0,163,255,0.35)', borderRadius: '9999px', fontSize: '10px', fontWeight: 700, color: '#38BDF8', letterSpacing: '0.04em' }}>
                    ☆ RECOMMENDED FOR ARTISANS
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  {/* Radio */}
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSelected ? '#00A3FF' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', transition: 'all 0.2s' }}>
                    {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00A3FF' }} />}
                  </div>

                  {/* Icon */}
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `rgba(${isSelected ? '0,163,255' : '255,255,255'},0.1)`, border: `1px solid rgba(${isSelected ? '0,163,255' : '255,255,255'},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    {role.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>{role.title}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', background: `rgba(0,0,0,0.4)`, border: `1px solid ${role.tagColor}`, borderRadius: '4px', color: role.tagColor, letterSpacing: '0.05em' }}>{role.tag}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: '6px 0 10px', lineHeight: 1.5 }}>{role.description}</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {role.features.map((f) => (
                        <span key={f} className="badge-pill">{f}</span>
                      ))}
                    </div>
                  </div>

                  {/* Extra metric */}
                  {role.extra && (
                    <div className="glass-card" style={{ padding: '0.75rem 1rem', minWidth: '160px', textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '2px' }}>{role.extra.label}</div>
                      <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '18px', fontWeight: 700, color: '#F8FAFC' }}>{role.extra.value}</div>
                      {role.extra.sub && (
                        <div style={{ fontSize: '10px', color: '#10B981', marginTop: '2px', fontWeight: 600 }}>{role.extra.sub}</div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom footer bar */}
      <div
        style={{
          background: 'rgba(9,13,22,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '1rem 2.5rem',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94A3B8' }}>
            <span>🛡️</span>
            <div>
              <div style={{ fontWeight: 600, color: '#F8FAFC' }}>Guild Identity Safe Guarded</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Already have a verified account?{' '}
                <Link href="/login" style={{ color: '#00A3FF', textDecoration: 'none' }}>Log in here</Link>
              </div>
            </div>
          </div>
          <button className="btn-ghost" style={{ fontSize: '12px', padding: '0.5rem 1rem' }}>Switch Role / Explore as Guest</button>
          <button
            className="btn-primary"
            style={{ padding: '0.875rem 2rem', fontSize: '14px' }}
            onClick={() => router.push(selectedRole.ctaHref)}
          >
            {selectedRole.cta} →
          </button>
        </div>

        <div style={{ maxWidth: '1280px', margin: '1rem auto 0', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          {['Guild Dispute Arbitration Board', 'KYC & Bio-ID Verification', 'Central Bank Regulated Custody'].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B' }}>
              <span>🏛️</span> {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
