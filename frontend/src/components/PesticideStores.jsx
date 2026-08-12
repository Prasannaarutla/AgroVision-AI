import React, { useState } from 'react';
import { MapPin, ExternalLink, Loader2, Store, Star, WifiOff, Navigation, Search } from 'lucide-react';
import { API_BASE_URL } from '../config';

const PesticideStores = ({ t, isOffline, language = 'en' }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findStores = () => {
    if (isOffline) return;
    if (!navigator.geolocation) {
      setError(t.geolocationError);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`${API_BASE_URL}/nearby-stores?lat=${latitude}&lon=${longitude}&lang=${language}`);
          if (!response.ok) throw new Error("Failed to fetch stores");
          const data = await response.json();
          setStores(data.stores);
          if (data.stores.length === 0) setError(t.noStoresFound);
        } catch (err) {
          setError(t.connectionError);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(t.locationDenied);
        setLoading(false);
      }
    );
  };

  React.useEffect(() => {
    findStores();
  }, [language]);

  return (
    <div className="glass-panel" style={{ animation: 'slideUp 1.2s ease-out both' }}>
      <div className="section-header">
        <div className="icon-box"><Store size={22} /></div>
        <h2>{t.nearbyStores}</h2>
        
        {!stores.length && !loading && !isOffline && (
          <button 
            onClick={findStores}
            style={{ marginLeft: 'auto', padding: '0.75rem 1.75rem', fontSize: '0.9rem', borderRadius: '16px' }}
          >
            <Search size={18} /> {t.findStores}
          </button>
        )}
      </div>

      {isOffline && (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '1px dashed var(--border)' }}>
          <WifiOff size={56} style={{ color: 'var(--primary)', opacity: 0.15, marginBottom: '1.5rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.02em' }}>{t.offlineStores}</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <Loader2 size={48} className="spin" style={{ color: 'var(--primary)', marginBottom: '1.5rem', margin: '0 auto' }} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>{t.connectingSatellite}</p>
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', fontSize: '0.95rem', fontWeight: 800, textAlign: 'center' }}>
          {error}
        </div>
      )}

      {stores.length > 0 && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          {stores.map((store, idx) => (
            <div 
              key={idx} 
              className="glass-panel" 
              style={{ 
                padding: '1.75rem', 
                background: 'rgba(255,255,255,0.015)', 
                display: 'flex', 
                flexDirection: 'column',
                gap: '1.25rem',
                border: '1px solid var(--border)',
                animation: `slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.1}s both`,
                borderRadius: '24px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>{store.name}</h3>
                  {store.certified && (
                    <span style={{ 
                      background: 'rgba(34, 197, 94, 0.15)', 
                      color: '#4ade80', 
                      padding: '4px 10px', 
                      borderRadius: '10px', 
                      fontSize: '0.7rem', 
                      fontWeight: 900, 
                      textTransform: 'uppercase',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      letterSpacing: '0.05em'
                    }}>
                      {t.certifiedPartner}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.6rem', lineHeight: 1.5 }}>
                  <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} /> {store.address}
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 12px', borderRadius: '12px' }}>
                  <Star size={16} fill="var(--warning)" color="var(--warning)" />
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--warning)' }}>{store.rating}</span>
                </div>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="secondary-button"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem', textDecoration: 'none', borderRadius: '12px' }}
                >
                  {t.directions} <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PesticideStores;
