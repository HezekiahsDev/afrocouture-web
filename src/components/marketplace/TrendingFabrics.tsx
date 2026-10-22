'use client';

import { useState } from 'react';

const categories = ['All Fabrics', 'Ankara Wax', 'Swiss Voile', 'Aso Oke', 'Brocade & Silk'];
const fabrics = [
  { name: 'Ankara Royal Gold', merchant: 'HAUSA FABRICS LTD', price: '₦8,500/yard', rating: 4.8, reviews: 49, tag: '100% Pure Cotton', emoji: '🟡' },
  { name: 'Emerald Swiss Voile', merchant: 'KANO TEXTILE HUB', price: '₦16,000/yard', rating: 4.6, reviews: 142, tag: 'Swiss Imported', emoji: '💚' },
  { name: 'Wine Imperial Aso Oke', merchant: 'OSHIOBO WEAVERS', price: '₦22,500/bundle', rating: 5.0, reviews: 44, tag: 'Hand Loomed', emoji: '🔴' },
  { name: 'Obsidian Damask Brocade', merchant: 'DALOG UN SILKS', price: '₦12,000/yard', rating: 4.8, reviews: 88, tag: 'Premium Damask', emoji: '⚫' },
];

export default function TrendingFabrics() {
  const [activeCategory, setActiveCategory] = useState('All Fabrics');

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: '#22D3EE' }}>✅ DIRECT FROM KANO & LAGOS FABRIC MARKETS</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-jakarta)', fontSize: '20px', fontWeight: 700, color: '#F8FAFC' }}>Trending Fabrics</h2>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Sourced directly from verified merchants. Ship directly to your chosen tailor.</p>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: activeCategory === cat ? 600 : 400,
                color: activeCategory === cat ? '#090D16' : '#94A3B8',
                background: activeCategory === cat ? '#00A3FF' : 'rgba(255,255,255,0.05)',
                border: activeCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {fabrics.map((fabric) => (
          <div key={fabric.name} className="glass-card" style={{ overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}>
            {/* Swatch */}
            <div style={{ height: '140px', background: 'linear-gradient(135deg, rgba(0,163,255,0.1), rgba(139,92,246,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
              {fabric.emoji}
              <span style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '9px', padding: '2px 8px', background: 'rgba(0,163,255,0.15)', border: '1px solid rgba(0,163,255,0.3)', borderRadius: '4px', color: '#38BDF8', fontWeight: 700 }}>{fabric.tag}</span>
            </div>
            <div style={{ padding: '0.875rem' }}>
              <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>{fabric.merchant}</div>
              <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '14px', fontWeight: 600, color: '#F8FAFC', marginBottom: '6px' }}>{fabric.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span style={{ color: '#FBBF24', fontSize: '12px' }}>⭐ {fabric.rating}</span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>({fabric.reviews} verified reviews)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '15px', fontWeight: 700, color: '#F8FAFC' }}>{fabric.price}</div>
                <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}>🧵 Send to Tailor</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
