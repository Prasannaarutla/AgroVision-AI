import React from 'react';
import { Sprout, CheckCircle2, Leaf, ShieldCheck } from 'lucide-react';

const OrganicTreatment = ({ treatment, t }) => {
  if (!treatment || !treatment.methods || !treatment.methods.length) return null;

  return (
    <div className="glass-panel" style={{ animation: 'slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
      <div className="section-header">
        <div className="icon-box" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--primary)' }}>
          <ShieldCheck size={24} />
        </div>
        <h2 style={{ fontSize: '1.25rem' }}>{t.organicTitle.toUpperCase()}</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginTop: '2rem' }}>
        {treatment.methods.map((item, idx) => (
          <div 
            key={idx} 
            style={{ 
              background: 'rgba(34, 197, 94, 0.02)', 
              padding: '1.75rem', 
              borderRadius: '24px', 
              border: '1px solid var(--border)',
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'flex-start',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ color: 'var(--primary)', marginTop: '0.25rem', background: 'rgba(34, 197, 94, 0.08)', padding: '0.5rem', borderRadius: '10px' }}>
              <Leaf size={20} />
            </div>
            <div>
              <p style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
                {item.name || `Eco-Strategy ${idx + 1}`}
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontWeight: 500 }}>
                {item.instruction}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganicTreatment;
