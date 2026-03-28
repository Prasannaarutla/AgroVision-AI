import React, { useState } from 'react';
import { Calculator, Beaker, Map as MapIcon, ChevronRight, PenTool } from 'lucide-react';

const DosageCalculator = ({ result, t }) => {
  const [acres, setAcres] = useState('');
  const [dosage, setDosage] = useState(null);

  const calculateDosage = () => {
    if (!acres || isNaN(acres)) return;
    const disease = result.disease?.toLowerCase() || '';
    let perAcre = 0;
    
    if (disease.includes('powdery')) perAcre = 200;
    else if (disease.includes('rust')) perAcre = 250;
    
    setDosage(perAcre * acres);
  };

  const getPesticide = () => {
    const disease = result.disease?.toLowerCase() || '';
    if (disease.includes('powdery')) return t.pesticideSulfur;
    if (disease.includes('rust')) return t.pesticideHexa;
    if (disease.includes('healthy')) return 'N/A';
    return t.pesticideGeneral;
  };

  return (
    <div className="glass-panel" style={{ animation: 'slideUp 1.1s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
      <div className="section-header">
        <div className="icon-box"><Calculator size={22} /></div>
        <h2 style={{ fontSize: '1.25rem' }}>{t.dosageTitle.toUpperCase()}</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t.fieldSize}
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" 
                value={acres} 
                onChange={(e) => setAcres(e.target.value)}
                style={{ 
                  width: '100%', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--border)', 
                  padding: '1.5rem', 
                  borderRadius: '20px', 
                  color: 'white', 
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                placeholder="0.0"
              />
              <div style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', fontWeight: 900, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                {t.acres.toUpperCase()}
              </div>
            </div>
          </div>
          <button onClick={calculateDosage} style={{ width: '100%', padding: '1.25rem' }}>
             {t.calculate} <ChevronRight size={20} />
          </button>
        </div>

        <div style={{ 
          background: 'rgba(34, 197, 94, 0.03)', 
          padding: '2rem', 
          borderRadius: '32px', 
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1.5rem',
          position: 'relative',
          minHeight: '200px'
        }}>
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.05, color: 'var(--primary)', pointerEvents: 'none' }}>
            <Beaker size={64} />
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
              {t.recommendedPesticide}
            </p>
            <p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>
               {getPesticide()}
            </p>
          </div>
          
          {dosage !== null && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                {t.totalDosage}
              </p>
              <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>
                {dosage} <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>{t.ml}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DosageCalculator;
