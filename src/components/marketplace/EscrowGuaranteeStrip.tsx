export default function EscrowGuaranteeStrip() {
  return (
    <section>
      <div
        className="glass-card"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          background: 'rgba(0, 163, 255, 0.04)',
          border: '1px solid rgba(0, 163, 255, 0.15)',
        }}
      >
        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(0,163,255,0.12)', border: '1px solid rgba(0,163,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
          🔒
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '15px', fontWeight: 600, color: '#F8FAFC' }}>Smart Escrow Protection Guarantee</span>
            <span style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', borderRadius: '9999px', color: '#10B981', fontWeight: 700 }}>Bank-Grade Vault</span>
          </div>
          <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
            Your money is locked safely in escrow. Artisans only receive payment when you physically receive the garment and confirm a perfect fit.
          </p>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '2px' }}>Total Escrow Processed</div>
          <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '22px', fontWeight: 800, color: '#00A3FF' }}>₦450M+ Protected</div>
        </div>
        <button className="btn-ghost" style={{ fontSize: '12px', padding: '8px 16px', flexShrink: 0 }}>
          ℹ Learn How Escrow Works
        </button>
      </div>
    </section>
  );
}
