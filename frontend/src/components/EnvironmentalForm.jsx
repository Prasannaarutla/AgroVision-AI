import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, CloudRain, MapPin, RefreshCw, Settings, Save, AlertCircle, WifiOff } from 'lucide-react';

const EnvironmentalForm = ({ envData, setEnvData, t, language, isOffline }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isManual, setIsManual] = useState(false);
  const [apiKey, setApiKey] = useState('858a638d7f7ad7e8683e971635567c58');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchWeatherByGPS = async () => {
    setLoading(true);
    setError(null);
    setIsManual(false);

    try {
      const response = await fetch('http://127.0.0.1:8000/narsapur-weather');
      if (!response.ok) throw new Error("Local weather service unavailable");
      
      const data = await response.json();
      
      setEnvData({
        temperature: data.temperature,
        humidity: data.humidity,
        rain: data.rain_amount > 0 ? 'Yes' : 'No',
        rain_status: data.rain_status,
        rain_amount: data.rain_amount,
        city: data.city
      });
      setLastUpdated(data.last_updated);
    } catch (err) {
      setError(t.gpsSyncError);
      setIsManual(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (cityName) => {
    if (!cityName || isOffline) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey.trim()}&units=metric&_=${new Date().getTime()}`
      );
      
      if (!response.ok) throw new Error("City not found or weather service unavailable");
      
      const data = await response.json();
      
      let rain_status_key = 'noRain';
      let rain_amount = 0;
      if (data.rain) {
        rain_amount = data.rain['1h'] || data.rain['3h'] || 0;
        if (rain_amount > 2.5) rain_status_key = 'heavyRain';
        else if (rain_amount > 0.5) rain_status_key = 'moderateRain';
        else rain_status_key = 'lightRain';
      }

      setEnvData({
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        rain: data.rain ? 'Yes' : 'No',
        rain_status: rain_status_key,
        rain_amount: rain_amount,
        city: data.name
      });
      setLastUpdated(new Date().toLocaleTimeString());
      setIsManual(false);
    } catch (err) {
      setError(err.message || "Failed to fetch city weather");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOffline) {
      fetchWeatherByGPS();
    } else {
      setIsManual(true);
    }
  }, [isOffline]);

  return (
    <div className="glass-panel" style={{ animation: 'slideUp 0.6s ease-out' }}>
      <div className="section-header">
        <div className="icon-box"><CloudRain size={22} /></div>
        <h2>{t.weatherTitle}</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => setIsManual(!isManual)}
            className="secondary-button"
            style={{ padding: '0.5rem', borderRadius: '12px' }}
            title={isManual ? t.backToAuto : t.manualOverride}
          >
            {isManual ? <RefreshCw size={18} /> : <Settings size={18} />}
          </button>
          {!isOffline && (
            <button onClick={fetchWeatherByGPS} disabled={loading} className="secondary-button" style={{ padding: '0.5rem', borderRadius: '12px' }}>
              <RefreshCw size={18} className={loading ? 'spin' : ''} />
            </button>
          )}
        </div>
      </div>

      {isOffline && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.05)', 
          border: '1px dashed rgba(239, 68, 68, 0.2)', 
          padding: '1rem', 
          borderRadius: '20px', 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          color: 'var(--danger)',
          fontSize: '0.85rem',
          fontWeight: 700
        }}>
          <WifiOff size={16} />
          {t.offlineWeather}
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.25rem', marginTop: '1rem' }}>
        {/* Main Weather Hero Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05))',
          borderRadius: '24px',
          padding: '2rem',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
            <CloudRain size={120} color="var(--primary)" />
          </div>
          
          <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={14} /> {envData.city?.toUpperCase() || 'DETECTING...'}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <span style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-2px' }}>
              {isManual ? (
                <input 
                  type="number" 
                  value={envData.temperature} 
                  onChange={(e) => setEnvData({...envData, temperature: e.target.value})}
                  style={{ width: '120px', background: 'transparent', border: 'none', color: 'white', fontSize: 'inherit', fontWeight: 'inherit', outline: 'none' }}
                />
              ) : (envData.temperature || '--')}
            </span>
            <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginTop: '0.75rem', fontWeight: 700 }}>°C</span>
          </div>
          
          <div style={{ marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
             {t[envData.rain_status] || envData.rain_status || t.noRain}
          </div>

          {lastUpdated && !isManual && (
            <div style={{ fontSize: '0.6rem', opacity: 0.4, marginTop: '1rem', fontWeight: 700 }}>
              UPDATED: {lastUpdated}
            </div>
          )}
        </div>

        {/* Side Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="weather-card" style={{ flex: 1, padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              <Droplets size={16} />
              <span className="weather-label" style={{ fontSize: '0.7rem' }}>{t.humidity.toUpperCase()}</span>
            </div>
            {isManual ? (
              <input 
                type="number" 
                value={envData.humidity} 
                onChange={(e) => setEnvData({...envData, humidity: e.target.value})}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', fontWeight: 900, outline: 'none' }}
              />
            ) : (
              <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{envData.humidity || '--'}<span style={{ fontSize: '0.8rem', opacity: 0.5 }}>%</span></div>
            )}
          </div>

          <div className="weather-card" style={{ flex: 1, padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              <CloudRain size={16} />
              <span className="weather-label" style={{ fontSize: '0.7rem' }}>PRECIPITATION</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{envData.rain_amount || 0}<span style={{ fontSize: '0.7rem', opacity: 0.5, marginLeft: '4px' }}>mm</span></div>
          </div>
        </div>
      </div>

      {isManual && (
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '20px', border: '1px dashed var(--border)' }}>
          <input 
            type="text" 
            placeholder="Search city (e.g. Narsapur)..."
            style={{ 
              flex: 1, 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--border)', 
              padding: '0.75rem 1rem', 
              borderRadius: '14px', 
              color: 'white',
              fontSize: '0.9rem',
              outline: 'none'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchWeatherByCity(e.target.value);
              }
            }}
            id="citySearchInput"
          />
          <button 
            onClick={() => {
              const val = document.getElementById('citySearchInput').value;
              fetchWeatherByCity(val);
            }}
            className="primary-button"
            style={{ padding: '0 1.5rem', borderRadius: '14px' }}
          >
            Search
          </button>
        </div>
      )}
    </div>
  );
};

export default EnvironmentalForm;
