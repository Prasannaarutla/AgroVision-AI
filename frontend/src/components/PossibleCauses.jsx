import React from 'react';
import { AlertCircle, Leaf, Droplet, Droplets, Bug, Sprout, Wind, Activity, Zap, CheckCircle2 } from 'lucide-react';

const PossibleCauses = ({ result, t }) => {
  if (!result || !result.possible_causes) return null;

  const { possible_causes, severity_insight, disease } = result;
  const isHealthy = disease?.toLowerCase().includes('healthy');

  const causeIcons = {
    fungalCause: <Leaf size={18} />,
    bacterialCause: <Activity size={18} />,
    viralCause: <Zap size={18} />,
    pestCause: <Bug size={18} />,
    rootRotCause: <Droplets size={18} />,
    nutrientCause: <Sprout size={18} />,
    waterImbalanceLess: <Droplet size={18} />,
    waterImbalanceMore: <Droplets size={18} />,
    airCirculationCause: <Wind size={18} />,
    healthyStatus: <CheckCircle2 size={18} />,
    maintenanceCause: <Sprout size={18} />,
    environmentalStress: <AlertCircle size={18} />,
    nutrientWatch: <Sprout size={18} />
  };

  // Mapping from cause to its action translation key
  const actionMapping = {
    fungalCause: "fungalAction",
    airCirculationCause: "airCirculationAction",
    waterImbalanceLess: "waterImbalanceLessAction",
    waterImbalanceMore: "waterImbalanceMoreAction",
    nutrientCause: "nutrientAction",
    pestCause: "pestAction",
    rootRotCause: "rootRotAction",
    maintenanceCause: "maintenanceAction",
    healthyStatus: "healthyAction"
  };

  return (
    <div className="glass-panel" style={{ 
      marginTop: '2rem', 
      animation: 'slideUp 1s ease-out both'
    }}>
      <div className="section-header" style={{ marginBottom: '1.75rem' }}>
        <div className="icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
          <AlertCircle size={22} />
        </div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.05em' }}>
          {t.possibleCausesTitle.toUpperCase()}
        </h2>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        {possible_causes.map((cause, index) => (
          <div key={index} className="hover-lift" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem', 
            background: 'rgba(255, 255, 255, 0.015)', 
            padding: '1.75rem', 
            borderRadius: '24px',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            cursor: 'default'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ color: '#4ade80', display: 'flex', background: 'rgba(74, 222, 128, 0.1)', padding: '10px', borderRadius: '14px' }}>
                {causeIcons[cause] || <AlertCircle size={22} />}
              </div>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1.4 }}>
                {t[cause] || cause}
              </span>
            </div>

            <div style={{ 
              marginTop: '0.5rem', 
              paddingTop: '1rem', 
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 800, 
                color: 'var(--primary)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <CheckCircle2 size={12} /> {t.suggestedActionLabel}
              </span>
              <p style={{ 
                fontSize: '0.9rem', 
                fontWeight: 600, 
                color: 'rgba(248, 250, 252, 0.7)', 
                lineHeight: 1.6,
                paddingLeft: '1.2rem'
              }}>
                {t[actionMapping[cause]] || "Monitor and maintain optimal growth conditions."}
              </p>
            </div>
          </div>
        ))}
      </div>

      {severity_insight && (
        <div style={{ 
          padding: '1.5rem', 
          background: isHealthy ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.08)', 
          borderRadius: '24px', 
          border: `1px solid ${isHealthy ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: isHealthy ? '#4ade80' : '#f87171',
          fontSize: '1rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <AlertCircle size={22} />
          {t[severity_insight] || severity_insight}
        </div>
      )}
    </div>
  );
};

export default PossibleCauses;
