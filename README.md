# AgroVision AI 🌾🤖

> **Empowering Agriculture with AI-Driven Crop Disease Detection, Weather Insights, and Smart Farming Solutions.**

AgroVision AI is an end-to-end intelligent agricultural assistant designed to help farmers and agricultural professionals detect crop diseases instantly using computer vision, receive tailored treatment dosage recommendations, monitor micro-climatic environmental risks, and find nearby agricultural supply stores.

---

## ✨ Features

- 📸 **AI Leaf Disease Detection**: High-accuracy crop disease diagnosis powered by Ultralytics YOLO (`best.pt`).
- 💊 **Chemical & Organic Treatment Calculator**: Calculates required pesticide/organic treatment dosage based on field area (acres/hectares).
- 🌤️ **Environmental & Weather Insights**: Real-time temperature, humidity, and rainfall monitoring for disease risk analysis.
- 📈 **Disease Spread Predictor**: Evaluates weather conditions to estimate disease transmission risk.
- 📍 **Nearby Pesticide Store Finder**: Uses Geolocation to locate agricultural suppliers nearby with direct navigation links.
- 🌐 **Multilingual Support**: Supports English, Telugu, Hindi, and regional languages for accessible farming assistance.
- ⚡ **Offline Resiliency**: Built-in offline fallback modes for low-connectivity rural farming environments.

---

## 🛠️ Technology Stack

### **Backend**
- **Framework**: FastAPI (Python 3.10+)
- **Machine Learning**: Ultralytics YOLOv8 PyTorch model
- **Image Processing**: Pillow, `pi-heif` (HEIC image support), `pillow-avif-plugin`
- **Server**: Uvicorn

### **Frontend**
- **Framework**: React 19 + Vite 8
- **UI Components & Icons**: Lucide React, CSS3 with responsive glassmorphism aesthetic
- **Routing & Upload**: React Dropzone, custom SPA routing

---

## 📁 Repository Structure

```text
AgroVision-AI/
├── backend/
│   ├── main.py              # FastAPI server & prediction endpoints
│   ├── best.pt              # Trained YOLO model weights
│   ├── requirements.txt     # Python backend dependencies
│   └── Procfile             # Web service process configuration
├── frontend/
│   ├── src/                 # React components & UI logic
│   │   ├── components/      # Weather, Store Locator, Uploaders, Dosage Calculators
│   │   ├── utils/           # Multilingual translation dictionaries
│   │   ├── config.js        # Dynamic API configuration
│   │   └── App.jsx          # Main application component
│   ├── package.json         # Node.js dependencies & scripts
│   ├── vercel.json          # Vercel SPA routing rules
│   └── vite.config.js       # Vite bundler configuration
├── render.yaml              # Infrastructure-as-Code deployment blueprint
└── README.md                # Project documentation
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Python**: `3.10` or higher
- **Node.js**: `v18` or higher
- **npm**: `v9` or higher

---

### 1️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The FastAPI backend server will be running at `http://127.0.0.1:8000`. You can test the interactive API docs at `http://127.0.0.1:8000/docs`.

---

### 2️⃣ Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser to view the application.

---

## ☁️ Production Deployment

### Backend (Render)
- **Runtime**: Python 3
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
- **Framework**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: `VITE_API_BASE_URL` = `https://your-backend.onrender.com`

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
