// AgroVision AI - v1.3 (improved cloud timeout + refined lesion detection)
import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';
import DosageCalculator from './components/DosageCalculator';
import HomeRemedies from './components/HomeRemedies';
import PossibleCauses from './components/PossibleCauses';
import { translations } from './utils/translations';
import { getLocalizedHomeRemedies } from './utils/homeRemediesData';
import { runOfflineDetection } from './utils/offlineDetector';
import { Leaf, RefreshCw, Shield, AlertCircle, Sprout, Languages, Camera, Wifi, WifiOff, Lightbulb } from 'lucide-react';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/predict`;

async function fetchWithTimeout(url, options, timeoutMs = 65000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

function App() {
  const [language, setLanguage] = useState('en');
  const t = translations[language] || translations.en;
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [annotatedImage, setAnnotatedImage] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (navigator.onLine && API_BASE_URL) {
      fetch(`${API_BASE_URL}/wake`).catch(() => {});
    }
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (result && result.disease) {
      setResult(prev => ({
        ...prev,
        home_remedies: getLocalizedHomeRemedies(prev.disease, language)
      }));
    }
  }, [language]);

  const handleImageSelect = (fileData) => {
    setSelectedImage(fileData);
    setResult(null);
    setAnnotatedImage(null);
    setError(null);
  };

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

    if (!navigator.onLine || isOffline) {
      try {
        const offlineResult = await runOfflineDetection(selectedImage, language, true);
        const localRemedies = getLocalizedHomeRemedies(offlineResult.disease, language);
        setResult({ ...offlineResult, home_remedies: localRemedies });
        if (offlineResult.annotated_image) {
          setAnnotatedImage(offlineResult.annotated_image);
        }
      } catch (err) {
        console.error('Offline Detection Error:', err);
        setError(t.analysisError);
      } finally {
        setLoading(false);
      }
      return;
    }

    let completed = false;

    // 1. Try Cloud API (45s timeout to allow YOLOv8 model inference & Render wake-up)
    try {
      const formData = new FormData();
      formData.append('file', selectedImage.file);
      formData.append('lang', language);
      const response = await fetchWithTimeout(API_URL, { method: 'POST', body: formData }, 45000);
      if (response && response.ok) {
        const data = await response.json();
        if (data && data.disease) {
          const localRemedies = getLocalizedHomeRemedies(data.disease, language);
          setResult({ ...data, home_remedies: localRemedies });
          if (data.annotated_image) {
            setAnnotatedImage(data.annotated_image);
          }
          completed = true;
        }
      }
    } catch (apiErr) {
      console.warn('Cloud API unavailable or timed out, executing instant on-device diagnosis:', apiErr);
    }

    // 2. If Cloud API was slow or failed, immediately run on-device computer vision AI
    if (!completed) {
      try {
        const onDeviceResult = await runOfflineDetection(selectedImage, language, false);
        const localRemedies = getLocalizedHomeRemedies(onDeviceResult.disease, language);
        setResult({ ...onDeviceResult, home_remedies: localRemedies });
        if (onDeviceResult.annotated_image) {
          setAnnotatedImage(onDeviceResult.annotated_image);
        }
      } catch (fallbackErr) {
        console.error('All detection methods failed:', fallbackErr);
        setError(t.analysisError);
      }
    }

    setLoading(false);
  };

  return (
    <div className="app-container" style={{ paddingBottom: '5rem' }}>
      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3.5rem', animation: 'fadeIn 1.2s ease-out' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '1.25rem', borderRadius: '28px', marginBottom: '1.5rem', boxShadow: '0 0 40px rgba(34, 197, 94, 0.35)', animation: 'pulse 3s infinite' }}>
          <Leaf size={44} color="white" />
        </div>
        <h1 className="title" style={{ fontSize: '3.6rem', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>{t.title}</h1>
        <p className="subtitle" style={{ fontSize: '1.25rem', opacity: 0.9, letterSpacing: '0.01em', maxWidth: '650px' }}>{t.subtitle}</p>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', marginTop: '2.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.85rem 2.5rem', borderRadius: '40px', border: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 800, color: isOffline ? 'var(--danger)' : 'var(--primary)' }}>
            {isOffline ? <WifiOff size={18} /> : <Wifi size={18} />}
            <span>{isOffline ? t.offlineMode.toUpperCase() : t.onlineMode.toUpperCase()}</span>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Languages size={19} style={{ color: 'var(--primary)' }} />
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.95rem', fontWeight: 800, outline: 'none', cursor: 'pointer' }}>
              <option value="en" style={{ background: '#020617' }}>English</option>
              <option value="te" style={{ background: '#020617' }}>తెలుగు (Telugu)</option>
              <option value="hi" style={{ background: '#020617' }}>हिन्दी (Hindi)</option>
            </select>
          </div>
          {selectedImage && (
            <>
              <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
              <button className="secondary-button" onClick={handleReset} style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem', gap: '0.5rem', borderRadius: '12px' }}>
                <RefreshCw size={14} /> {t.reset}
              </button>
            </>
          )}
        </div>
      </header>

      {isOffline && (
        <div style={{ background: 'rgba(220,38,38,0.15)', color: '#fca5a5', padding: '0.65rem 1.25rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '2rem', borderRadius: '14px', border: '1px solid rgba(220,38,38,0.4)', boxShadow: '0 4px 20px rgba(220,38,38,0.15)', animation: 'slideDown 0.3s ease-out' }}>
          <WifiOff size={18} />
          <span>{t.offlineBanner}  -  {t.offlineDetectNote || 'Offline AI detection active'}</span>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="sticky-column">
          <div className="glass-panel">
            <div className="section-header">
              <div className="icon-box"><Camera size={20} /></div>
              <h2>{t.uploadTitle}</h2>
            </div>
            <ImageUploader onImageSelect={handleImageSelect} selectedImage={selectedImage} annotatedImage={annotatedImage} t={t} />
            <button onClick={handleDetect} disabled={!selectedImage || loading} style={{ width: '100%', marginTop: '1.5rem', padding: '1.2rem' }}>
              {loading ? (<><RefreshCw size={20} className="spin" /><span>{t.analyzing}</span></>) : (<><Shield size={20} /><span>{t.detectButton}</span></>)}
            </button>
            {loading && !isOffline && (
              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.6rem', opacity: 0.8 }}>
                ? {t.serverWarmUp}
              </p>
            )}
            {error && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderLeft: '4px solid var(--danger)', borderRadius: '12px', color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} /> {error}
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
              <Lightbulb size={18} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'white' }}>{t.photoTipsTitle || "Photo Tips for Best Detection"}</h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <li>{t.tipFocus || "Focus closely on the leaf and diseased spots"}</li>
              <li>{t.tipLighting || "Ensure bright, natural daylight without harsh shadows"}</li>
              <li>{t.tipBackground || "Avoid cluttered backgrounds for clear AI diagnostics"}</li>
            </ul>
          </div>
        </div>

        <div className="scroll-column">
          {!result ? (
            <div className="glass-panel" style={{ height: '100%', minHeight: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.5rem', padding: '4rem 2rem', borderStyle: 'dashed' }}>
              <div style={{ background: 'rgba(34,197,94,0.08)', padding: '2rem', borderRadius: '50%', color: 'var(--primary)' }}><Sprout size={64} /></div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'white' }}>{t.readyToAnalyzeTitle}</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto', lineHeight: 1.6 }}>{t.readyToAnalyzeDesc}</p>
              </div>
            </div>
          ) : (
            <>
              <ResultCard result={result} t={t} language={language} />
              <HomeRemedies result={result} t={t} language={language} />
              <DosageCalculator result={result} t={t} />
              {result.possible_causes && <PossibleCauses result={result} t={t} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
