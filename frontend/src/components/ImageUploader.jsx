import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Camera, CheckCircle2, RefreshCw, Sprout } from 'lucide-react';

const ImageUploader = ({ onImageSelect, selectedImage, annotatedImage, t }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [stream, setStream] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const startCamera = async () => {
    setShowCamera(true);
    setCameraError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      setCameraError(t.cameraError);
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      // Convert dataUrl to File object for consistency
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
          onImageSelect({ file, preview: dataUrl });
          stopCamera();
        });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert(t.selectImageAlert);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onImageSelect({ file, preview: e.target.result });
    };
    reader.readAsDataURL(file);
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {!selectedImage && !showCamera ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          style={{ 
            cursor: 'pointer',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            border: `3px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: '28px',
            background: isDragging ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255, 255, 255, 0.02)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
          <div style={{ 
            background: 'rgba(34, 197, 94, 0.08)', 
            padding: '2rem', 
            borderRadius: '50%', 
            marginBottom: '2rem',
            color: 'var(--primary)',
            boxShadow: '0 0 30px rgba(34, 197, 94, 0.1)'
          }}>
            <Sprout size={48} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            {t.uploadTitle}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2.5rem', maxWidth: '300px', lineHeight: 1.6 }}>
            {t.uploadSubtitle}
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={onButtonClick} style={{ padding: '1rem 2rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UploadCloud size={20} /> {t.selectFile}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                startCamera();
              }} 
              className="secondary-button"
              style={{ padding: '1rem 2rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Camera size={20} /> {t.openCamera}
            </button>
          </div>
        </div>
      ) : showCamera ? (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          position: 'relative', 
          borderRadius: '32px', 
          overflow: 'hidden',
          background: '#000',
          border: '1px solid var(--border)'
        }}>
          {cameraError ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Camera size={48} style={{ marginBottom: '1rem' }} />
              <p>{cameraError}</p>
              <button onClick={stopCamera} style={{ marginTop: '1.5rem', borderRadius: '12px' }}>{t.reset}</button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ 
                position: 'absolute', 
                bottom: '2rem', 
                left: 0, 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '2rem',
                padding: '0 1rem'
              }}>
                <button 
                  onClick={stopCamera} 
                  className="secondary-button"
                  style={{ borderRadius: '14px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}
                >
                  {t.reset}
                </button>
                <button 
                  onClick={capturePhoto} 
                  style={{ 
                    width: '70px', 
                    height: '70px', 
                    borderRadius: '50%', 
                    padding: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'white',
                    color: 'black',
                    border: '4px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 0 20px rgba(255,255,255,0.4)'
                  }}
                >
                  <Camera size={32} />
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 15px 40px rgba(0,0,0,0.4)' }}>
          <img 
            src={annotatedImage || selectedImage.preview} 
            alt="Preview" 
            style={{ 
              width: '100%', 
              display: 'block',
              maxHeight: '450px',
              objectFit: 'cover'
            }} 
          />
          <div style={{ 
            position: 'absolute', 
            top: '1.25rem', 
            left: '1.25rem', 
            background: 'rgba(0,0,0,0.7)', 
            backdropFilter: 'blur(12px)',
            padding: '8px 20px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.8rem',
            fontWeight: 800,
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white'
          }}>
            {annotatedImage ? (
              <>
                <CheckCircle2 size={16} color="var(--primary)" />
                <span style={{ letterSpacing: '0.05em' }}>{t.aiAnalyzedOptics.toUpperCase()}</span>
              </>
            ) : (
              <>
                <ImageIcon size={16} color="var(--primary)" />
                <span style={{ letterSpacing: '0.05em' }}>{t.rawScanView.toUpperCase()}</span>
              </>
            )}
          </div>
          
          <div style={{ 
            position: 'absolute', 
            bottom: '1.25rem', 
            right: '1.25rem'
          }}>
            <button 
              onClick={() => onImageSelect(null)} 
              className="secondary-button"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem', backdropFilter: 'blur(12px)', borderRadius: '14px' }}
            >
              <RefreshCw size={16} /> {t.reset}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
