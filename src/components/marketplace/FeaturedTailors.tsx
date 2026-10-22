import Link from 'next/link';

const tailors = [
  {
    id: 't1',
    name: 'Alhaji Musa Tailor',
    location: 'Kano Old City',
    rating: 4.6,
    reviews: 124,
    onTime: '100% On-Time',
    specialties: ['Kaftan', 'Hausa Agbada', 'Embroidery', 'Fula Cape'],
    description: 'Third-generation master embroidery artisan specializing in royal Kano Kaftans, custom Agbadas, and ceremonial robes.',
    price: '₦40,000',
    emoji: '👨‍🎨',
  },
  {
    id: 't2',
    name: 'Aisha Styles',
    location: 'Lagos, Lagos',
    rating: 4.7,
    reviews: 98,
    onTime: '100% On-Time',
    specialties: ['Aso Ebi', 'Bridal Couture', 'Corsetry', 'Beading'],
    description: 'Celebrated for couture event pieces, bespoke wedding attire, sculpted gowns, and flawless custom lace corsetry.',
    price: '₦55,000',
    emoji: '👩‍🎨',
  },
  {
    id: 't3',
    name: 'Bello Fashion',
    location: 'Maitama, Abuja',
    rating: 4.6,
    reviews: 76,
    onTime: '89% On-Time',
    specialties: ['Senator Wear', 'Modern Daba', 'Executive Suits'],
    description: 'Precision-cut Senator styles, executive 2-piece sets, and minimalist contemporary African menswear for corporate and state occasions.',
    price: '₦35,000',
    emoji: '🧵',
  },
];

export default function FeaturedTailors() {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: '#22D3EE' }}>✅ VERIFIED ARTISANS</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '20px', fontWeight: 700, color: '#F8FAFC' }}>Featured Guild Tailors</h2>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Top-rated artisans with escrow-backed guarantees and proven delivery track records</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn-ghost" style={{ fontSize: '12px', padding: '6px 14px' }}>Filter by City ▾</button>
          <Link href="/tailors" className="btn-ghost" style={{ fontSize: '12px', padding: '6px 14px', textDecoration: 'none', color: '#00A3FF', borderColor: 'rgba(0,163,255,0.3)' }}>View All Tailors →</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
        {tailors.map((tailor) => (
          <div key={tailor.id} className="glass-card" style={{ overflow: 'hidden' }}>
            {/* Image */}
            <div style={{ height: '160px', background: 'linear-gradient(135deg, rgba(0,163,255,0.08), rgba(139,92,246,0.06))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
              {tailor.emoji}
              <div style={{ position: 'absolute', top: '8px', right: '8px', padding: '2px 8px', background: '#090D16', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#FBBF24', fontSize: '11px' }}>⭐ {tailor.rating}</span>
                <span style={{ color: '#64748B', fontSize: '10px' }}>({tailor.reviews})</span>
              </div>
            </div>

            <div style={{ padding: '1rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#00A3FF,#0284C7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  {tailor.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>{tailor.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>📍 {tailor.location}</div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '2px 7px', borderRadius: '9999px', border: '1px solid rgba(16,185,129,0.25)', whiteSpace: 'nowrap' }}>
                  {tailor.onTime}
                </span>
              </div>

              {/* Specialties */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                {tailor.specialties.map((s) => (
                  <span key={s} className="badge-pill" style={{ fontSize: '10px' }}>{s}</span>
                ))}
              </div>

              <p style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.5, marginBottom: '12px' }}>{tailor.description}</p>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize: '9px', color: '#64748B', letterSpacing: '0.04em' }}>STARTING PRICE</div>
                  <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>{tailor.price}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer' }}>💬</div>
                  <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '8px' }}>Hire Tailor</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
