export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(9,13,22,0.95)',
        padding: '1rem 2.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748B' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00A3FF', display: 'inline-block' }} />
          Guaranteed Multi-Sig Escrow • Tailor Milestone Release • 256-bit TLS Encrypted
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '12px', color: '#64748B' }}>
          {['Escrow Protection Guarantee', 'Artisan Verification', 'Terms & Privacy'].map((l) => (
            <a key={l} href="#" style={{ color: '#64748B', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
