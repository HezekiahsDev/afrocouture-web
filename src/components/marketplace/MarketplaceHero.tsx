import Link from 'next/link';

export default function MarketplaceHero() {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center', padding: '1rem 0' }}>
      {/* Left */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22D3EE', display: 'inline-block' }} />
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: '#94A3B8' }}>THE FIRST NIGERIAN BESPOKE AI ATELIER</span>
          <span style={{ color: '#64748B', fontSize: '10px' }}>•</span>
          <span style={{ fontSize: '10px', color: '#64748B' }}>Over 1,400+ Verified Master Tailors</span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '42px', fontWeight: 800, lineHeight: '1.15', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          Your Style. <span style={{ color: '#00A3FF' }}>Our Craft.</span>
          <br />Powered by AI.
        </h1>

        <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '420px' }}>
          Find verified authentic African tailors, source premium Ankara and brocade silks, and preview tailored silhouettes instantly before the first cut.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/marketplace" className="btn-primary" style={{ textDecoration: 'none' }}>
            🛍️ Explore Marketplace
          </Link>
          <button className="btn-ai">✦ Create with AI</button>
          <button className="btn-ghost" style={{ fontSize: '12px' }}>🔒 100% Escrow Protection</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {[
            { icon: '✅', label: 'Verified', sub: 'Top-Rated Tailors' },
            { icon: '🔒', label: 'Safe', sub: 'Escrow Held Until Fitting' },
            { icon: '⭐', label: '4.9/5', sub: '10,000+ Reviews' },
            { icon: '✦', label: 'AI Design', sub: 'Prompt-to-Pattern' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', marginBottom: '2px' }}>{s.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{s.label}</div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — AI garment showcase */}
      <div style={{ position: 'relative' }}>
        <div
          className="glass-card"
          style={{
            overflow: 'hidden',
            height: '400px',
            background: 'linear-gradient(160deg, rgba(0,163,255,0.08) 0%, rgba(139,92,246,0.06) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: '120px', filter: 'drop-shadow(0 0 40px rgba(0,163,255,0.3))' }}>👘</div>
          {/* AI label overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              right: '1rem',
              padding: '0.75rem 1rem',
              background: 'rgba(9,13,22,0.9)',
              backdropFilter: 'blur(12px)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(0,163,255,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: '#22D3EE' }}>✦ GENERATIVE KAFTAN MODEL V1.3</span>
              <span style={{ fontSize: '9px', padding: '1px 6px', background: 'rgba(0,163,255,0.15)', color: '#38BDF8', borderRadius: '4px', fontWeight: 700 }}>Prompt Ready</span>
            </div>
            <p style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.4 }}>
              &quot;Midnight blue bespoke royal Kaftan with intricate gold chest embroidery and fitted matching Hausa Fila cap...&quot;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Turnaround: 4-6 Days</span>
              <button className="btn-primary" style={{ padding: '4px 12px', fontSize: '11px', borderRadius: '6px' }}>Recreate Style →</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
