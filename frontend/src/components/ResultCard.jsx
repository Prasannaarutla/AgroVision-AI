import React from 'react';
import { AlertTriangle, Activity, Zap } from 'lucide-react';

const ResultCard = ({ result, t, language }) => {
  if (!result) return null;

  const getSeverityInfo = (sev) => {
    switch(sev?.toLowerCase()) {
      case 'high': return { color: 'var(--danger)', glow: '0 0 40px rgba(239, 68, 68, 0.2)', percent: 90 };
      case 'medium': return { color: 'var(--warning)', glow: '0 0 40px rgba(245, 158, 11, 0.2)', percent: 50 };
      case 'low': return { color: 'var(--primary)', glow: 'var(--glow-primary)', percent: 20 };
      default: return { color: 'var(--primary)', glow: 'var(--glow-primary)', percent: 0 };
    }
  };

  const translateDisease = (name) => {
    if (!name) return "";
    const d = name.toLowerCase();
    if (d.includes('healthy')) return t.healthy;
    if (d.includes('powdery')) return t.powdery;
    if (d.includes('rust')) return t.rust;
    return name;
  };

  const translateRecommendation = (rec, disease, severity) => {
    const d = (disease || '').toLowerCase();
    const s = (severity || 'low').toLowerCase();
    
    if (d.includes('healthy')) return t.recHealthy;
    if (d.includes('powdery')) {
      if (s === 'high') return t.recPowderyHigh;
      if (s === 'medium') return t.recPowderyMed;
      return t.recPowderyLow;
    }
    if (d.includes('rust')) {
      if (s === 'high') return t.recRustHigh;
      if (s === 'medium') return t.recRustMed;
      return t.recRustLow;
    }
    return rec;
  };

  const sevInfo = getSeverityInfo(result.severity);
  const confidencePercent = Math.round((result.confidence || 0) * 100);

  return (
    <div className="glass-panel" style={{ 
      borderLeft: `10px solid ${sevInfo.color}`,
      boxShadow: sevInfo.glow,
      animation: 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both'
    }}>
      <div className="section-header">
        <div className="icon-box" style={{ background: `${sevInfo.color}15`, color: sevInfo.color }}>
          <Activity size={24} />
        </div>
        <h2>{t.aiDiagnosticReport.toUpperCase()}</h2>
      </div>

      {result.low_confidence && (
        <div style={{ 
          background: 'rgba(245, 158, 11, 0.1)', 
          border: '1px dashed var(--warning)', 
          padding: '1rem', 
          borderRadius: '16px', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--warning)',
          fontSize: '0.85rem',
          fontWeight: 800
        }}>
          <AlertTriangle size={18} />
          {t.lowConfidence.toUpperCase()}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '0.8rem', letterSpacing: '-0.04em' }}>
            {translateDisease(result.disease)}
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: `${sevInfo.color}20`, color: sevInfo.color }}>
              {t[result.severity?.toLowerCase()]?.toUpperCase()} {t.severityLabel.toUpperCase()}
            </span>
            {result.is_offline && (
              <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                ⚡ {t.offlineMode.toUpperCase()}
              </span>
            )}
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: sevInfo.color, lineHeight: 1 }}>
            {confidencePercent}%
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
             {t.detectionConfidence}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t.predictionScore.toUpperCase()}</span>
            <span style={{ color: sevInfo.color }}>{confidencePercent}%</span>
          </div>
          <div className="progress-container">
            <div className="progress-fill" style={{ width: `${confidencePercent}%`, background: sevInfo.color }}></div>
          </div>
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t.pathogenRisk.toUpperCase()}</span>
            <span style={{ color: sevInfo.color }}>{t[result.severity?.toLowerCase()]?.toUpperCase()}</span>
          </div>
          <div className="progress-container">
            <div className="progress-fill" style={{ width: `${sevInfo.percent}%`, background: sevInfo.color }}></div>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.75rem', borderRadius: '24px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '5px', height: '100%', background: sevInfo.color }}></div>
        <div style={{ display: 'flex', gap: '0.75rem', color: sevInfo.color, marginBottom: '1rem', fontWeight: 900, fontSize: '0.95rem', alignItems: 'center' }}>
          <Zap size={20} fill={sevInfo.color} /> {t.recoveryProtocol.toUpperCase()}
        </div>
        <p style={{ fontSize: '1.15rem', lineHeight: 1.7, fontWeight: 500, color: 'var(--text-main)', margin: 0 }}>
          {translateRecommendation(result.recommendation || result.treatment, result.disease, result.severity)}
        </p>
      </div>
    </div>
  );
};

export default ResultCard;
