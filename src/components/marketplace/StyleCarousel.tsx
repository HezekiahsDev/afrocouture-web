'use client';

const styles = [
  { label: "MEN'S BESPOKE", name: 'Kaftan for Men', price: '₦15,000', emoji: '🥷' },
  { label: 'WEDDING GUEST', name: 'Aso Ebi Dress', price: '₦65,000', emoji: '👗' },
  { label: 'CEREMONIAL', name: 'Imperial Agbada', price: '₦25,000', emoji: '🎭' },
  { label: 'EVERYDAY', name: 'Casual Wear', price: '₦8,000', emoji: '👕' },
  { label: 'CONTEMPORARY', name: 'Native Attire 2.0', price: '₦38,000', emoji: '🥻' },
  { label: 'COUPLES SUITE', name: 'Couples Aso Ebi', price: '₦42,000', emoji: '💑' },
];

export default function StyleCarousel() {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '20px', fontWeight: 700, color: '#F8FAFC' }}>Popular Styles & Prompts</h2>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Tap any garment archetype to remix with your preferred measurements and fabric</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['‹', '›'].map((arrow) => (
            <button key={arrow} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', cursor: 'pointer', fontSize: '16px' }}>{arrow}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
        {styles.map((style) => (
          <div
            key={style.name}
            className="glass-card"
            style={{ overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
          >
            {/* Image area */}
            <div style={{ height: '140px', background: 'linear-gradient(135deg, rgba(0,163,255,0.1), rgba(139,92,246,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {style.emoji}
            </div>
            <div style={{ padding: '0.625rem' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', marginBottom: '2px' }}>{style.label}</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#F8FAFC' }}>{style.name}</div>
              <div style={{ fontSize: '11px', color: '#00A3FF', marginTop: '4px', fontWeight: 600 }}>From {style.price}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
