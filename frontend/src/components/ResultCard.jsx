import React from 'react';
import { Shield, AlertTriangle, CheckCircle2, Info, TrendingUp, Zap, Activity } from 'lucide-react';

const ResultCard = ({ result, loading, t, language }) => {
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
    if (language === 'en') return rec;
    const d = disease.toLowerCase();
    const s = severity.toLowerCase();
    if (d.includes('healthy')) return t.recHealthy;
    if (d.includes('powdery')) {
      if (s === 'low') return t.recPowderyLow;
      if (s === 'medium') return t.recPowderyMed;
      return t.recPowderyHigh;
    }
    if (d.includes('rust')) {
      if (s === 'low') return t.recRustLow;
      if (s === 'medium') return t.recRustMed;
      return t.recRustHigh;
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h3 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, marginBottom: '0.8rem', letterSpacing: '-0.05em' }}>
            {translateDisease(result.disease)}
          </h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className="badge" style={{ background: `${sevInfo.color}20`, color: sevInfo.color }}>
              {t[result.severity?.toLowerCase()]?.toUpperCase()} {t.severityLabel.toUpperCase()}
            </span>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '3rem' }}>
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

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '28px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: sevInfo.color }}></div>
        <div style={{ display: 'flex', gap: '1rem', color: sevInfo.color, marginBottom: '1.25rem', fontWeight: 900, fontSize: '1rem', alignItems: 'center' }}>
          <Zap size={22} fill={sevInfo.color} /> {t.recoveryProtocol.toUpperCase()}
        </div>
        <p style={{ fontSize: '1.25rem', lineHeight: 1.8, fontWeight: 500, color: 'var(--text-main)' }}>
          {translateRecommendation(result.recommendation || result.treatment, result.disease, result.severity)}
        </p>
      </div>
    </div>
  );
};

export default ResultCard;
