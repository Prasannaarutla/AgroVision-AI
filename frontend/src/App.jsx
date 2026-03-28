import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';
import DosageCalculator from './components/DosageCalculator';
import EnvironmentalForm from './components/EnvironmentalForm';
import PesticideStores from './components/PesticideStores';
import EnvironmentalInsights from './components/EnvironmentalInsights';
import PossibleCauses from './components/PossibleCauses';
import SpreadPredictor from './components/SpreadPredictor';
import OrganicTreatment from './components/OrganicTreatment';
import { translations } from './utils/translations';
import { Leaf, RefreshCw, Shield, Thermometer, Droplets, Layout, AlertCircle, Radio, Sprout, Languages, ChevronDown, Wifi, WifiOff } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/predict';

function App() {
  const [language, setLanguage] = useState('en');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const t = translations[language];
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [envData, setEnvData] = useState({ 
    temperature: '', 
    humidity: '', 
    rain: 'No', 
    city: '',
    rain_amount: 0,
    rain_status: ''
  });

  const handleImageSelect = (fileData) => {
    setSelectedImage(fileData);
    setResult(null);
    setAnnotatedImage(null);
    setError(null);
  };

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setAnnotatedImage(null);
    setError(null);
    setLoading(false);
  };

  const handleDetect = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedImage.file);
    if (envData.temperature) formData.append('temperature', envData.temperature);
    if (envData.humidity) formData.append('humidity', envData.humidity);
    formData.append('rain', envData.rain);
    formData.append('rain_status', envData.rain_status || 'No Rain');
    formData.append('rain_amount', envData.rain_amount || 0);
    formData.append('lang', language);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction from server');
      }

      const data = await response.json();
      setResult(data);
      if (data.annotated_image) {
        setAnnotatedImage(data.annotated_image);
      }
    } catch (err) {
      console.error('Detection Error:', err);
      setError(t.analysisError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '5rem' }}>
      <header style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        marginBottom: '5rem',
        animation: 'fadeIn 1.2s ease-out'
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
          padding: '1.25rem', 
          borderRadius: '28px',
          marginBottom: '2rem',
          boxShadow: '0 0 40px rgba(34, 197, 94, 0.3)',
          animation: 'pulse 3s infinite'
        }}>
          <Leaf size={48} color="white" />
        </div>
        <h1 className="title" style={{ fontSize: '4rem', marginBottom: '0.75rem' }}>{t.title}</h1>
        <p className="subtitle" style={{ fontSize: '1.4rem', opacity: 0.9, letterSpacing: '0.01em' }}>{t.subtitle}</p>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2rem',
          marginTop: '3.5rem',
          background: 'rgba(255,255,255,0.03)',
          padding: '0.85rem 2.5rem',
          borderRadius: '40px',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Connection Status */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            fontSize: '0.85rem', 
            fontWeight: 800,
            color: isOffline ? 'var(--danger)' : 'var(--primary)',
          }}>
            {isOffline ? <WifiOff size={18} /> : <Wifi size={18} />}
            {isOffline ? t.offlineMode.toUpperCase() : t.onlineMode.toUpperCase()}
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>

          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Languages size={20} style={{ color: 'var(--primary)' }} />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'white', 
                fontSize: '0.95rem', 
                fontWeight: 800,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="en" style={{ background: '#020617' }}>English</option>
              <option value="te" style={{ background: '#020617' }}>తెలుగు (Telugu)</option>
              <option value="hi" style={{ background: '#020617' }}>हिन्दी (Hindi)</option>
            </select>
          </div>

          {selectedImage && (
            <>
              <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
              <button 
                className="secondary-button" 
                onClick={handleReset} 
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', gap: '0.5rem', borderRadius: '14px' }}
              >
                <RefreshCw size={14} /> {t.reset}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Offline Alert Banner */}
      {isOffline && (
        <div style={{ 
          background: 'var(--danger)', 
          color: 'white', 
          padding: '0.5rem', 
          textAlign: 'center', 
          fontSize: '0.85rem', 
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <WifiOff size={16} /> {t.offlineBanner}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="sticky-column">
          <EnvironmentalForm envData={envData} setEnvData={setEnvData} t={t} language={language} isOffline={isOffline} />
          
          <div className="glass-panel">
            <div className="section-header">
              <div className="icon-box"><Layout size={20} /></div>
              <h2>{t.uploadTitle}</h2>
            </div>
            
            <ImageUploader 
              onImageSelect={handleImageSelect} 
              selectedImage={selectedImage}
              annotatedImage={annotatedImage} 
              t={t}
            />
            
            <button 
              onClick={handleDetect} 
              disabled={!selectedImage || loading}
              style={{ width: '100%', marginTop: '1.5rem', py: '1.2rem' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={20} className="spin" />
                  <span>{t.analyzing}</span>
                </>
              ) : (
                <>
                  <Shield size={20} />
                  <span>{t.detectButton}</span>
                </>
              )}
            </button>

            {error && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', borderRadius: '12px', color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} /> {error}
              </div>
            )}
          </div>
        </div>

        <div className="scroll-column">
          {!result ? (
            <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.5rem', padding: '4rem 2rem', borderStyle: 'dashed' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '2rem', borderRadius: '50%', color: 'var(--secondary)' }}>
                <Sprout size={64} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t.readyToAnalyzeTitle}</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>{t.readyToAnalyzeDesc}</p>
              </div>
            </div>
          ) : (
            <>
              <ResultCard result={result} loading={loading} t={t} language={language} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {result.environmental_insights && <EnvironmentalInsights insights={result.environmental_insights} t={t} />}
                {result.spread_prediction && <SpreadPredictor prediction={result.spread_prediction} t={t} />}
              </div>

              {result.possible_causes && <PossibleCauses result={result} t={t} />}

              {result.organic_treatment && <OrganicTreatment treatment={result.organic_treatment} t={t} />}
              
              <DosageCalculator result={result} t={t} />
              
              <PesticideStores t={t} isOffline={isOffline} language={language} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
