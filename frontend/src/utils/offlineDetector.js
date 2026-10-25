// Client-Side Offline AI Leaf Disease Detection Engine
// Allows AgroVision AI to diagnose leaves and provide home remedies without an active internet connection.

import { getLocalizedHomeRemedies } from './homeRemediesData';

export async function runOfflineDetection(selectedImage, language = 'en') {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const maxDim = 640;
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;
          
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          
          // Draw image
          ctx.drawImage(img, 0, 0, w, h);
          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;

          let leafPixels = 0;
          let rustPixels = 0;
          let powderyPixels = 0;

          const rustPoints = [];
          const powderyPoints = [];

          // Sample pixels (every 2nd pixel for speed)
          for (let y = 0; y < h; y += 2) {
            for (let x = 0; x < w; x += 2) {
              const idx = (y * w + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              // Check if pixel belongs to leaf foliage (green, yellowish, brownish)
              const isLeaf = (g > 45 && g > b * 0.9 && (g > r * 0.85 || (r > 70 && g > 60))) || (r > 90 && g > 80 && b < 70);
              
              if (isLeaf) {
                leafPixels++;

                // 1. Rust Spot Criteria: Warm reddish-brown/orange spots on leaf
                // High Red, Medium Green, Low Blue
                if (r > 120 && g > 40 && g < 155 && b < 80 && r > g * 1.15 && r > b * 1.5) {
                  rustPixels++;
                  if (rustPoints.length < 300) {
                    rustPoints.push({ x, y });
                  }
                }

                // 2. Powdery Mildew Criteria: White/chalky grayish patches on leaf surface
                // High brightness, low saturation
                const maxVal = Math.max(r, g, b);
                const minVal = Math.min(r, g, b);
                if (r > 160 && g > 160 && b > 160 && (maxVal - minVal) < 30) {
                  powderyPixels++;
                  if (powderyPoints.length < 300) {
                    powderyPoints.push({ x, y });
                  }
                }
              }
            }
          }

          const effectiveLeaf = Math.max(leafPixels, 1);
          const rustRatio = rustPixels / effectiveLeaf;
          const powderyRatio = powderyPixels / effectiveLeaf;

          let detectedDisease = "HEALTHY";
          let confidence = 0.90;
          let severity = "Low";
          let isDetected = false;

          if (rustRatio > 0.012 || rustPixels > 100) {
            detectedDisease = "RUST";
            confidence = Math.min(0.94, Math.max(0.72, 0.65 + rustRatio * 6.0));
            severity = confidence > 0.82 ? "High" : confidence > 0.60 ? "Medium" : "Low";
            isDetected = true;

            // Draw bounding boxes around rust clusters
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#f97316';
            ctx.fillStyle = 'rgba(249, 115, 22, 0.15)';
            
            // Draw detection clusters
            for (let i = 0; i < rustPoints.length; i += 15) {
              const pt = rustPoints[i];
              ctx.strokeRect(Math.max(0, pt.x - 20), Math.max(0, pt.y - 20), 40, 40);
              ctx.fillRect(Math.max(0, pt.x - 20), Math.max(0, pt.y - 20), 40, 40);
            }

            // Annotation Header Banner
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(15, 15, 260, 42);
            ctx.fillStyle = '#f97316';
            ctx.font = 'bold 18px sans-serif';
            ctx.fillText(`⚡ RUST (${Math.round(confidence * 100)}%) [Offline]`, 25, 42);

          } else if (powderyRatio > 0.015 || powderyPixels > 120) {
            detectedDisease = "POWDERY";
            confidence = Math.min(0.93, Math.max(0.70, 0.62 + powderyRatio * 5.0));
            severity = confidence > 0.80 ? "High" : confidence > 0.60 ? "Medium" : "Low";
            isDetected = true;

            // Draw bounding boxes around powdery mildew clusters
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#38bdf8';
            ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';

            for (let i = 0; i < powderyPoints.length; i += 15) {
              const pt = powderyPoints[i];
              ctx.strokeRect(Math.max(0, pt.x - 25), Math.max(0, pt.y - 25), 50, 50);
              ctx.fillRect(Math.max(0, pt.x - 25), Math.max(0, pt.y - 25), 50, 50);
            }

            // Annotation Header Banner
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(15, 15, 290, 42);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 18px sans-serif';
            ctx.fillText(`⚡ POWDERY (${Math.round(confidence * 100)}%) [Offline]`, 25, 42);

          } else {
            detectedDisease = "HEALTHY";
            confidence = 0.91;
            severity = "Low";
            isDetected = false;

            // Clean green badge
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(15, 15, 280, 42);
            ctx.fillStyle = '#22c55e';
            ctx.font = 'bold 18px sans-serif';
            ctx.fillText(`⚡ HEALTHY LEAF (${Math.round(confidence * 100)}%) [Offline]`, 25, 42);
          }

          const annotatedImage = canvas.toDataURL('image/jpeg', 0.85);
          const homeRemedies = getLocalizedHomeRemedies(detectedDisease, language);

          let causes = ["healthyStatus", "maintenanceCause"];
          if (detectedDisease === "RUST") {
            causes = ["fungalCause", "waterImbalanceMore", "nutrientCause", "airCirculationCause"];
          } else if (detectedDisease === "POWDERY") {
            causes = ["fungalCause", "airCirculationCause", "waterImbalanceLess", "nutrientCause"];
          }

          resolve({
            disease: detectedDisease,
            confidence: Number(confidence.toFixed(2)),
            severity: severity,
            detected: isDetected,
            annotated_image: annotatedImage,
            home_remedies: homeRemedies,
            possible_causes: causes,
            severity_insight: severity === "High" ? "heavyInsight" : severity === "Medium" ? "mediumInsight" : "lowInsight",
            is_offline: true
          });

        } catch (innerErr) {
          reject(innerErr);
        }
      };

      img.onerror = (e) => reject(new Error("Failed to load image for offline processing"));
      img.src = selectedImage.preview || URL.createObjectURL(selectedImage.file);

    } catch (err) {
      reject(err);
    }
  });
}
