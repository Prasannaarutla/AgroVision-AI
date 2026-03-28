import React from 'react';
import { AlertTriangle, Zap, Leaf } from 'lucide-react';

const EnvironmentalInsights = ({ insights, t }) => {
  if (!insights) return null;

  const getRiskColor = (risk) => {
    switch(risk?.toLowerCase()) {
      case 'high': return 'var(--danger)';
      case 'medium': return 'var(--warning)';
      default: return 'var(--primary)';
    }
  };

  const riskColor = getRiskColor(insights.risk_level);

  return (
    <div className="glass-panel" style={{ flex: 1, animation: 'slideUp 0.8s ease-out both', borderLeft: `6px solid ${riskColor}` }}>
      <div className="section-header" style={{ marginBottom: '1.25rem' }}>
        <div className="icon-box" style={{ background: `${riskColor}10`, color: riskColor }}>
          <Leaf size={20} />
        </div>
        <h2 style={{ fontSize: '0.9rem', color: riskColor }}>{t.epidemicRisk.toUpperCase()}</h2>
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
          <Zap size={16} fill={riskColor} />
          {t[insights.risk_level?.toLowerCase()]?.toUpperCase()} {t.priority.toUpperCase()}
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 500 }}>
        {t[`envInsight${insights.risk_level}`] || insights.insight_message || insights.advice}
      </p>
    </div>
  );
};

export default EnvironmentalInsights;
