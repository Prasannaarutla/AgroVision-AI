import React from 'react';
import { 
  Sprout, Leaf, ShieldCheck, Droplets, Sparkles, Sun, 
  Wind, Scissors, FlaskConical, Lightbulb, HeartPulse 
} from 'lucide-react';
import { getLocalizedHomeRemedies } from '../utils/homeRemediesData';

const iconMap = {
  Droplets: <Droplets size={22} />,
  Leaf: <Leaf size={22} />,
  ShieldCheck: <ShieldCheck size={22} />,
  Scissors: <Scissors size={22} />,
  Sparkles: <Sparkles size={22} />,
  Sun: <Sun size={22} />,
  Wind: <Wind size={22} />,
  Sprout: <Sprout size={22} />,
  Droplet: <Droplets size={22} />
};

const HomeRemedies = ({ result, t, language = 'en' }) => {
  if (!result) return null;

  // Automatically fetch localized remedies in the selected language (en, te, hi)
  // This ensures changing language translates all remedy names, ingredients, steps, and benefits instantly!
  const remedies = getLocalizedHomeRemedies(result.disease, language);

  if (!remedies || remedies.length === 0) return null;

  const isHealthy = result.disease?.toLowerCase().includes('healthy');

  return (
    <div className="glass-panel" style={{ animation: 'slideUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) both', marginTop: '2rem' }}>
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <div className="icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
          {isHealthy ? <Sprout size={24} /> : <HeartPulse size={24} />}
        </div>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'white', marginBottom: '0.25rem' }}>
            {t.homeRemediesTitle || (isHealthy ? "Preventive Natural Care" : "Required Home Remedies & Organic Care")}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {t.homeRemediesSubtitle || "Safe, non-toxic, and effective remedies you can prepare using common home ingredients"}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
        {remedies.map((remedy, idx) => {
          const icon = iconMap[remedy.icon] || <Leaf size={22} />;
          
          return (
            <div 
              key={remedy.id || idx}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '24px',
                border: '1px solid var(--border)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
              className="hover-lift"
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '5px', height: '100%', background: 'linear-gradient(to bottom, #22c55e, #10b981)' }}></div>
              
              {/* Header with Title and Remedy Number */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    background: 'rgba(34, 197, 94, 0.12)', 
                    color: '#22c55e', 
                    padding: '0.6rem', 
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {icon}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.01em', margin: 0 }}>
                    {remedy.name}
                  </h3>
                </div>
                
                <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#4ade80', fontSize: '0.75rem', fontWeight: 800 }}>
                  {t.stepBadge || "Remedy"} #{idx + 1}
                </span>
              </div>

              {/* Ingredients Box */}
              {remedy.ingredients && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.04)',
                  padding: '1rem 1.25rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(34, 197, 94, 0.15)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <FlaskConical size={18} style={{ color: '#4ade80', marginTop: '0.2rem', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4ade80', display: 'block', marginBottom: '0.2rem' }}>
                      {t.ingredientsLabel || "Required Ingredients"}
                    </span>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.5 }}>
                      {remedy.ingredients}
                    </p>
                  </div>
                </div>
              )}

              {/* Preparation & Application Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {remedy.preparation && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.015)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      🛠️ {t.preparationLabel || "Preparation"}
                    </span>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, fontWeight: 500 }}>
                      {remedy.preparation}
                    </p>
                  </div>
                )}

                {remedy.application && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.015)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                      🚿 {t.applicationLabel || "Application & Timing"}
                    </span>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, fontWeight: 500 }}>
                      {remedy.application} {remedy.frequency && <strong style={{ color: '#4ade80' }}>({remedy.frequency})</strong>}
                    </p>
                  </div>
                )}
              </div>

              {/* Why it works / Benefit banner */}
              {remedy.benefit && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.85rem',
                  color: 'rgba(255, 255, 255, 0.75)',
                  paddingTop: '0.5rem',
                  borderTop: '1px dashed var(--border)'
                }}>
                  <Lightbulb size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  <span>
                    <strong style={{ color: 'white' }}>{t.benefitLabel || "Why it works"}:</strong> {remedy.benefit}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeRemedies;
