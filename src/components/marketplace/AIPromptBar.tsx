'use client';

import { useState } from 'react';

const inspirations = ['Agbada for Groom', 'Aso Ebi Mermaid Gown', 'Senator Suit Minimalist', 'Silk Ankara Kimono'];

export default function AIPromptBar() {
  const [prompt, setPrompt] = useState('');

  return (
    <section>
      <div
        className="glass-card-interactive"
        style={{ padding: '1.25rem 1.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* AI indicator */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#00A3FF,#9333EA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✦</div>
            <div style={{ position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', border: '2px solid #090D16' }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: '#22D3EE' }}>AI ATELIER ENGINE</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22D3EE', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '16px', fontWeight: 600, color: '#F8FAFC', marginBottom: '8px' }}>Need a custom outfit?</div>
            <p style={{ fontSize: '12px', color: '#94A3B8' }}>Let AI convert your rough thoughts into photo-realistic fitting designs in seconds.</p>
          </div>

          {/* Prompt input + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '500px' }}>
            <input
              className="input-field"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A royal/blue Hausa Kaftan with silver neck embroidery and matching cap"
              style={{ flex: 1 }}
            />
            <button className="btn-ai" style={{ flexShrink: 0 }}>
              ✦ Generate Outfit
            </button>
          </div>
        </div>

        {/* Popular inspirations */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '11px', color: '#64748B', flexShrink: 0 }}>POPULAR INSPIRATIONS:</span>
          {inspirations.map((insp) => (
            <button
              key={insp}
              onClick={() => setPrompt(insp)}
              style={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9999px', padding: '3px 10px', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
            >
              {insp}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
