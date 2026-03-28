import React from 'react';
import { Radio, ShieldAlert, TrendingUp, Radar } from 'lucide-react';

const SpreadPredictor = ({ prediction, t }) => {
  if (!prediction) return null;

  const getRiskColor = (risk) => {
    switch(risk?.toLowerCase()) {
      case 'high': return 'var(--danger)';
      case 'medium': return 'var(--warning)';
      default: return 'var(--primary)';
    }
  };

  const riskColor = getRiskColor(prediction.risk_level);

  return (
    <div className="glass-panel" style={{ flex: 1, animation: 'slideUp 0.9s ease-out both', borderLeft: `6px solid ${riskColor}` }}>
      <div className="section-header" style={{ marginBottom: '1.25rem' }}>
        <div className="icon-box" style={{ background: `${riskColor}10`, color: riskColor }}>
          <Radar size={20} className="pulse" />
        </div>
        <h2 style={{ fontSize: '0.9rem', color: riskColor }}>{t.spreadForecast.toUpperCase()}</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div style={{ 
          background: `${riskColor}15`, 
          color: riskColor, 
          padding: '8px 16px', 
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.9rem',
          fontWeight: 900,
          border: `1px solid ${riskColor}30`
        }}>
          <TrendingUp size={16} />
          {t[prediction.risk_level?.toLowerCase()]?.toUpperCase()} {t.velocity.toUpperCase()}
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 500 }}>
        {t[`spreadInsight${prediction.risk_level}`] || prediction.insight_message || prediction.advice}
      </p>
    </div>
  );
};

export default SpreadPredictor;
