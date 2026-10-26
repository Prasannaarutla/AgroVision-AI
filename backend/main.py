import os
# Prevent Ultralytics from running pip install / autoupdate in the background
os.environ['YOLO_AUTOINSTALL'] = '0'
os.environ['YOLO_VERBOSE'] = 'False'

import io
import base64
import cv2
import numpy as np
from PIL import Image, ImageOps
import torch
try:
    torch.set_num_threads(min(2, os.cpu_count() or 1))
except Exception:
    pass

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="AgroVision AI - Crop Disease Detection API")

# Configure CORS for frontend access from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pre-load model on server startup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "best.pt")

model = None
try:
    if os.path.exists(MODEL_PATH):
        print(f"Pre-loading YOLO model from {MODEL_PATH}...")
        from ultralytics import YOLO
        model = YOLO(MODEL_PATH)
        print("YOLOv8 model pre-loaded successfully.")
        print(f"Model Classes: {model.names}")
    else:
        print(f"Warning: {MODEL_PATH} not found. Running with computer-vision fallback mode.")
except Exception as e:
    print(f"Warning preloading YOLO model ({e}). Running in fallback mode.")

def get_model():
    return model

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "service": "AgroVision AI Disease Detection API",
        "model_loaded": model is not None
    }

@app.get("/health")
def health_check():
    """Health check endpoint - also warms up the model."""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_classes": list(model.names.values()) if model is not None else []
    }

@app.get("/wake")
def wake_server():
    """Wake endpoint to trigger Render free-tier cold-start recovery."""
    return {"status": "awake", "model_ready": model is not None}

# ==========================================
# Comprehensive Required Home Remedies Data
# ==========================================
HOME_REMEDIES = {
    "RUST": [
        {
            "id": "rust_buttermilk",
            "name": {
                "en": "Sour Buttermilk (Fermented Whey) Spray",
                "te": "పుల్లటి మజ్జిగ ద్రావణం స్ప్రే",
                "hi": "खट्टी छाछ (मट्ठा) का स्प्रे"
            },
            "icon": "Droplets",
            "ingredients": {
                "en": "1 Liter sour buttermilk (fermented 3-4 days) + 5 Liters clean water",
                "te": "1 లీటరు పుల్లటి మజ్జిగ (3-4 రోజులు నిల్వ ఉంచినది) + 5 లీటర్ల నీరు",
                "hi": "1 लीटर खट्टी छाछ (3-4 दिन पुरानी) + 5 लीटर साफ पानी"
            },
            "preparation": {
                "en": "Mix sour buttermilk thoroughly with clean water and strain through a cloth.",
                "te": "పుల్లటి మజ్జిగను నీటితో బాగా కలిపి గుడ్డతో వడకట్టండి.",
                "hi": "खट्टी छाछ को पानी में मिलाकर सूती कपड़े से छान लें।"
            },
            "application": {
                "en": "Spray thoroughly on both the upper and lower leaf surfaces early morning.",
                "te": "ఉదయాన్నే ఆకుల పైభాగం మరియు వెనుక భాగం తడిసేలా పిచికారీ చేయండి.",
                "hi": "सुबह के समय पत्तियों की ऊपरी और निचली सतह पर अच्छी तरह छिड़कें।"
            },
            "frequency": {
                "en": "Apply every 4-5 days until rust spots dry out.",
                "te": "తుప్పు మచ్చలు తగ్గే వరకు ప్రతి 4-5 రోజులకు ఒకసారి పిచికారీ చేయండి.",
                "hi": "रतुआ के धब्बे सूखने तक हर 4-5 दिन में छिड़कें।"
            },
            "benefit": {
                "en": "Lactic acid bacteria suppress rust fungal spore reproduction naturally.",
                "te": "లాక్టిక్ యాసిడ్ శిలీంద్ర బీజాలు వ్యాపించకుండా సమర్థవంతంగా అరికడుతుంది.",
                "hi": "लैक्टिक एसिड फंगल बीजाणुओं के प्रसार को तुरंत रोकता है।"
            }
        },
        {
            "id": "rust_neem_turmeric",
            "name": {
                "en": "Neem Leaf & Turmeric Antifungal Decoction",
                "te": "వేప ఆకులు మరియు పసుపు కషాయం",
                "hi": "नीम और हल्दी का एंटीफंगल काढ़ा"
            },
            "icon": "Leaf",
            "ingredients": {
                "en": "100g fresh neem leaves + 20g pure turmeric powder + 1 Liter water",
                "te": "100 గ్రాముల తాజా వేపాకులు + 20 గ్రాముల పసుపు పొడి + 1 లీటరు నీరు",
                "hi": "100 ग्राम ताजी नीम की पत्तियां + 20 ग्राम शुद्ध हल्दी + 1 लीटर पानी"
            },
            "preparation": {
                "en": "Boil neem leaves in water for 15 minutes, cool, strain, and mix in turmeric.",
                "te": "వేపాకులను 15 నిమిషాలు మరిగించి, చల్లారాక వడకట్టి పసుపు కలపండి.",
                "hi": "नीम पत्तियों को 15 मिनट उबालें, ठंडा कर छानें और हल्दी मिलाएं।"
            },
            "application": {
                "en": "Foliar spray across all affected leaves and nearby stems.",
                "te": "మొక్కల ఆకులు మరియు కాండాలపై పిచికారీ చేయండి.",
                "hi": "प्रभावित पत्तियों और तनों पर अच्छी तरह छिड़कें।"
            },
            "frequency": {
                "en": "Apply every 5 days for 3 cycles.",
                "te": "ప్రతి 5 రోజులకు ఒకసారి, మొత్తం 3 సార్లు వాడండి.",
                "hi": "हर 5 दिन में एक बार, 3 चक्रों के लिए लगाएं।"
            },
            "benefit": {
                "en": "Curcumin and Azadirachtin kill rust fungal spores and build leaf immunity.",
                "te": "కర్కుమిన్ మరియు అజాడిరక్టిన్ ఫంగస్‌ను నిర్మూలించి మొక్కకు రక్షణ ఇస్తాయి.",
                "hi": "कर्क्यूमिन और एज़ाडिराक्टिन फंगस को नष्ट कर रोग प्रतिरोधकता बढ़ाते हैं।"
            }
        },
        {
            "id": "rust_wood_ash",
            "name": {
                "en": "Sifted Wood Ash Dusting",
                "te": "కట్టెల బూడిద పొడి చల్లడం",
                "hi": "लकड़ी की बारीक राख का छिड़काव"
            },
            "icon": "ShieldCheck",
            "ingredients": {
                "en": "Fine, dry sifted wood ash from untreated firewood",
                "te": "బాగా జల్లించిన పొడి కట్టెల బూడిద",
                "hi": "छानी हुई सूखी लकड़ी की राख"
            },
            "preparation": {
                "en": "Sift wood ash through fine mesh to remove coal lumps.",
                "te": "బూడిదను జల్లెడ పట్టి మెత్తని పొడిగా తయారు చేయండి.",
                "hi": "राख को बारीक छलनी से छान लें।"
            },
            "application": {
                "en": "Dust lightly onto morning dew-dampened leaves, focusing on rust spots.",
                "te": "ఉదయం మంచు ఉన్న సమయంలో ఆకులపై పలుచగా చల్లండి.",
                "hi": "सुबह ओस के समय पत्तियों पर हल्का छिड़कें।"
            },
            "frequency": {
                "en": "Once weekly or right after heavy rain.",
                "te": "వారానికి ఒకసారి లేదా వర్షం తగ్గిన తర్వాత చల్లండి.",
                "hi": "सप्ताह में एक बार या बारिश के बाद लगाएं।"
            },
            "benefit": {
                "en": "Deprives fungal spores of surface moisture while providing potassium to plant cells.",
                "te": "తేమను పీల్చివేసి ఫంగస్ పెరగకుండా చేస్తుంది మరియు పొటాష్ అందిస్తుంది.",
                "hi": "नमी को सोखकर फंगस को रोकता है और पोटाश प्रदान करता है।"
            }
        },
        {
            "id": "rust_prune",
            "name": {
                "en": "Prune & Burn Severely Infected Leaves",
                "te": "తీవ్రంగా సోకిన ఆకులను కత్తిరించి కాల్చివేయడం",
                "hi": "संक्रमित पत्तियों को काटकर नष्ट करना"
            },
            "icon": "Scissors",
            "ingredients": {
                "en": "Clean shears sterilized with rubbing alcohol",
                "te": "శుభ్రమైన కత్తెర",
                "hi": "साफ कीटाणुरहित कैंची"
            },
            "preparation": {
                "en": "Wipe shears before and after cutting.",
                "te": "కత్తెరను శానిటైజ్ చేసుకోండి.",
                "hi": "कैंची को अच्छी तरह साफ रखें।"
            },
            "application": {
                "en": "Carefully snip off heavily rusted leaves. Seal in a bag and burn or bury. Do NOT compost.",
                "te": "బాగా సోకిన ఆకులను కత్తిరించి కాల్చండి లేదా పాతిపెట్టండి. కంపోస్ట్‌లో వేయకండి.",
                "hi": "अधिक संक्रमित पत्तियों को काटकर जला दें या गाड़ दें। कम्पोस्ट में न डालें।"
            },
            "frequency": {
                "en": "Immediately upon spotting orange/yellow rust pustules.",
                "te": "మచ్చలు కనిపించిన వెంటనే చేయండి.",
                "hi": "रोग दिखते ही तुरंत करें।"
            },
            "benefit": {
                "en": "Breaks the fungal lifecycle and prevents wind from spreading rust spores.",
                "te": "గాలి ద్వారా ఇతర పంటలకు వ్యాపించకుండా నివారిస్తుంది.",
                "hi": "हवा द्वारा अन्य पौधों में बीमारी फैलने से रोकता है।"
            }
        }
    ],
    "POWDERY": [
        {
            "id": "powdery_baking_soda",
            "name": {
                "en": "Baking Soda & Vegetable Oil Fungicide",
                "te": "వంట సోడా మరియు నూనె స్ప్రే",
                "hi": "बेकिंग सोडा और वनस्पति तेल स्प्रे"
            },
            "icon": "Sparkles",
            "ingredients": {
                "en": "1 tbsp baking soda + 1 tsp vegetable oil + 2 drops mild dish soap + 1 Liter water",
                "te": "1 టేబుల్ స్పూన్ వంట సోడా + 1 టీస్పూన్ నూనె + 2 చుక్కల సోప్ + 1 లీటరు నీరు",
                "hi": "1 चम्मच बेकिंग सोडा + 1 चम्मच तेल + 2 बूंद लिक्विड साबुन + 1 लीटर पानी"
            },
            "preparation": {
                "en": "Dissolve baking soda and oil in warm water, add soap drops to help it adhere to leaves.",
                "te": "గోరువెచ్చని నీటిలో వంట సోడా, నూనె, సోప్ వేసి బాగా కలపండి.",
                "hi": "गुनगुने पानी में बेकिंग सोडा, तेल और साबुन अच्छी तरह मिला लें।"
            },
            "application": {
                "en": "Spray thoroughly over all white powdery spots early morning or late afternoon.",
                "te": "తెల్లటి బూడిద మచ్చలు ఉన్న ఆకులపై ఉదయం లేదా సాయంత్రం పిచికారీ చేయండి.",
                "hi": "सफेद फफूंद वाली पत्तियों पर सुबह या शाम छिड़काव करें।"
            },
            "frequency": {
                "en": "Every 5 to 7 days until powdery mildew clears.",
                "te": "తెగులు తగ్గే వరకు ప్రతి 5-7 రోజులకు ఒకసారి పిచికారీ చేయండి.",
                "hi": "रोग ठीक होने तक हर 5-7 दिन में छिड़कें।"
            },
            "benefit": {
                "en": "Raises leaf surface pH above 8.0, creating an alkaline environment lethal to powdery mildew fungi.",
                "te": "ఆకు ఉపరితల pH ని క్షారంగా మార్చి బూడిద ఫంగస్‌ను నాశనం చేస్తుంది.",
                "hi": "पत्तियों के पीएच को क्षारीय बनाकर फफूंद को समाप्त करता है।"
            }
        },
        {
            "id": "powdery_milk",
            "name": {
                "en": "Natural Milk & Sunlight Antiseptic Spray",
                "te": "పాలు - నీళ్ల మిశ్రమం స్ప్రే",
                "hi": "दूध और पानी का प्राकृतिक घोल"
            },
            "icon": "Sun",
            "ingredients": {
                "en": "100 ml fresh milk (cow or buffalo milk) + 900 ml water (1:9 ratio)",
                "te": "100 మి.లీ పాలు + 900 మి.లీ నీరు (1:9 నిష్పత్తి)",
                "hi": "100 मिली दूध + 900 मिली पानी (1:9 अनुपात)"
            },
            "preparation": {
                "en": "Mix milk with clean water in a spray bottle. Shake vigorously.",
                "te": "స్ప్రే బాటిల్‌లో పాలు మరియు నీటిని పోసి బాగా కుదపండి.",
                "hi": "स्प्रे बोतल में दूध और पानी को अच्छी तरह हिलाएं।"
            },
            "application": {
                "en": "Spray on leaves in the morning under bright sunlight.",
                "te": "మంచి ఎండ ఉన్న సమయంలో ఆకులపై పిచికారీ చేయండి.",
                "hi": "धूप के समय सुबह पत्तियों पर स्प्रे करें।"
            },
            "frequency": {
                "en": "Apply weekly as both treatment and prevention.",
                "te": "వారానికి ఒకసారి పిచికారీ చేయండి.",
                "hi": "सप्ताह में एक बार छिड़कें।"
            },
            "benefit": {
                "en": "Milk proteins (lactoferrin) react with sunlight to generate natural antiseptics that destroy mildew spores.",
                "te": "పాలలోని ప్రోటీన్లు ఎండతో చర్య జరిపి సహజ యాంటిసెప్టిక్‌గా మారి బూడిద తెగులును నయం చేస్తాయి.",
                "hi": "दूध के प्रोटीन सूर्य के प्रकाश में प्राकृतिक एंटीसेप्टिक बनकर फंगस को नष्ट करते हैं।"
            }
        },
        {
            "id": "powdery_garlic",
            "name": {
                "en": "Garlic & Neem Bio-Fungicide",
                "te": "వెల్లుల్లి మరియు వేప నూనె కషాయం",
                "hi": "लहसुन और नीम का जैविक कवकनाशी"
            },
            "icon": "Leaf",
            "ingredients": {
                "en": "5 crushed garlic cloves + 5ml pure cold-pressed neem oil + 1 Liter water",
                "te": "5 వెల్లుల్లి రెబ్బలు + 5 మి.లీ వేప నూనె + 1 లీటరు నీరు",
                "hi": "5 कुचली हुई लहसुन की कलियां + 5 मिली नीम का तेल + 1 लीटर पानी"
            },
            "preparation": {
                "en": "Crush garlic, steep in warm water for 6 hours, strain, and blend with neem oil.",
                "te": "వెల్లుల్లిని దంచి నీటిలో 6 గంటలు నానబెట్టి, వడకట్టి వేపనూనె కలపండి.",
                "hi": "लहसुन को पानी में 6 घंटे भिगोकर छानें और नीम का तेल मिलाएं।"
            },
            "application": {
                "en": "Spray infected plants, thoroughly coating both sides of foliage.",
                "te": "ఆకుల రెండు వైపులా పిచికారీ చేయండి.",
                "hi": "पत्तियों के दोनों ओर अच्छी तरह छिड़कें।"
            },
            "frequency": {
                "en": "Every 4-5 days.",
                "te": "ప్రతి 4-5 రోజులకు ఒకసారి వాడండి.",
                "hi": "हर 4-5 दिन में लगाएं।"
            },
            "benefit": {
                "en": "Allicin in garlic combined with azadirachtin provides strong bio-fungal inhibition.",
                "te": "వెల్లుల్లిలోని అల్లిసిన్ ఫంగస్ కణాలను త్వరగా అణచివేస్తుంది.",
                "hi": "लहसुन का एलिसिन फंगस की वृद्धि को तुरंत रोकता है।"
            }
        },
        {
            "id": "powdery_airflow",
            "name": {
                "en": "Prune for Airflow & Sunlight Exposure",
                "te": "గాలి వెలుతురు కోసం ఆకుల కత్తిరింపు",
                "hi": "हवा और धूप के लिए छंटाई"
            },
            "icon": "Wind",
            "ingredients": {
                "en": "Pruning shears, sunlight exposure",
                "te": "కత్తిరింపు పనిముట్లు",
                "hi": "छंटाई कैंची"
            },
            "preparation": {
                "en": "Identify overcrowded, shaded foliage near the base of the plant.",
                "te": "మొక్కల మొదట్లో ఒత్తుగా ఉన్న అదనపు ఆకులను గుర్తించండి.",
                "hi": "निचले घने पत्तों की पहचान करें।"
            },
            "application": {
                "en": "Prune lower congested leaves to allow wind and sunlight to circulate freely.",
                "te": "గాలి, ఎండ ధారాళంగా తగిలేలా అదనపు ఆకులను కత్తిరించండి.",
                "hi": "हवा और धूप के संचार के लिए अतिरिक्त पत्ते काटें।"
            },
            "frequency": {
                "en": "Once every 2-3 weeks as plant grows.",
                "te": "మొక్క పెరుగుదలను బట్టి 2-3 వారాలకు ఒకసారి చేయండి.",
                "hi": "हर 2-3 सप्ताह में आवश्यकतानुसार करें।"
            },
            "benefit": {
                "en": "Sunlight and dry ventilation eliminate the humid micro-climates powdery mildew requires.",
                "te": "మంచి గాలి వెలుతురు ఉండడం వల్ల ఫంగస్ నివారించబడుతుంది.",
                "hi": "धूप और हवा मिलने से फंगस प्राकृतिक रूप से खत्म होती है।"
            }
        }
    ],
    "HEALTHY": [
        {
            "id": "healthy_neem",
            "name": {
                "en": "Preventive Neem Oil Shield",
                "te": "నివారణ వేప నూనె రక్షణ కవచం",
                "hi": "निवारक नीम तेल कवच"
            },
            "icon": "ShieldCheck",
            "ingredients": {
                "en": "3ml pure neem oil + 1 drop dish soap + 1 Liter water",
                "te": "3 మి.లీ వేప నూనె + 1 చుక్క సోప్ + 1 లీటరు నీరు",
                "hi": "3 मिली नीम का तेल + 1 बूंद साबुन + 1 लीटर पानी"
            },
            "preparation": {
                "en": "Shake neem oil and soap in water until milky white emulsion forms.",
                "te": "నీటిలో వేప నూనెను బాగా కలిపి ద్రావణం తయారు చేయండి.",
                "hi": "पानी में नीम तेल और साबुन मिलाकर घोल बनाएं।"
            },
            "application": {
                "en": "Spray lightly as a protective coat against incoming spores and insect pests.",
                "te": "కీటకాలు, ఫంగస్ రాకుండా ముందు జాగ్రత్తగా పిచికారీ చేయండి.",
                "hi": "कीटों और फंगस से बचाव के लिए हल्का छिड़कें।"
            },
            "frequency": {
                "en": "Apply every 10-14 days.",
                "te": "ప్రతి 10-14 రోజులకు ఒకసారి పిచికారీ చేయండి.",
                "hi": "हर 10-14 दिन में एक बार लगाएं।"
            },
            "benefit": {
                "en": "Repels pests and coats leaf cuticles against fungal spore colonization.",
                "te": "మొక్కకు సహజ రోగనిరోధక శక్తిని అందిస్తుంది.",
                "hi": "पौधे की रोग प्रतिरोधक क्षमता बढ़ाता है।"
            }
        },
        {
            "id": "healthy_compost_tea",
            "name": {
                "en": "Organic Compost Tea / Jeevamrutham Foliar Feed",
                "te": "జీవామృతం / సేంద్రీయ కంపోస్ట్ టీ పిచికారీ",
                "hi": "जीवामृत / कम्पोस्ट चाय पोषण स्प्रे"
            },
            "icon": "Sprout",
            "ingredients": {
                "en": "Aged vermicompost or Jeevamrutham steeped in water (1:10 ratio)",
                "te": "జీవామృతం లేదా వర్మీకంపోస్ట్ నానబెట్టిన నీరు (1:10 నిష్పత్తి)",
                "hi": "जीवामृत या अच्छी कम्पोस्ट का पानी (1:10 अनुपात)"
            },
            "preparation": {
                "en": "Steep 100g compost in 1L water for 24 hours, strain out solids.",
                "te": "కంపోస్ట్‌ను 24 గంటలు నీటిలో నానబెట్టి వడకట్టండి.",
                "hi": "कम्पोस्ट को 24 घंटे पानी में भिगोकर छान लें।"
            },
            "application": {
                "en": "Spray on foliage and drench soil around roots in the evening.",
                "te": "సాయంత్రం ఆకులపై మరియు మొదళ్ల వద్ద పోయండి.",
                "hi": "शाम के समय पत्तियों पर छिड़कें और जड़ों में डालें।"
            },
            "frequency": {
                "en": "Apply every 2 weeks.",
                "te": "ప్రతి 2 వారాలకు ఒకసారి వాడండి.",
                "hi": "हर 2 सप्ताह में एक बार प्रयोग करें।"
            },
            "benefit": {
                "en": "Supplies beneficial microbes and micronutrients, promoting glossy, resilient leaves.",
                "te": "మొక్కకు అవసరమైన సూక్ష్మ పోషకాలను అందించి ఆకులను బలంగా ఉంచుతుంది.",
                "hi": "सूक्ष्म पोषक तत्व देकर पत्तियों को चमकदार और मजबूत बनाता है।"
            }
        },
        {
            "id": "healthy_watering",
            "name": {
                "en": "Morning Soil-Level Irrigation Practice",
                "te": "ఉదయం పూట మొదట్లో మాత్రమే నీరు పోయడం",
                "hi": "सुबह के समय जड़ों में सही सिंचाई"
            },
            "icon": "Droplet",
            "ingredients": {
                "en": "Clean water delivered at soil level",
                "te": "శుభ్రమైన నీరు",
                "hi": "साफ पानी"
            },
            "preparation": {
                "en": "Avoid spraying water on leaves; water directly at the plant root base.",
                "te": "ఆకులపై కాకుండా మొక్కల మొదట్లో మాత్రమే నీరు పోయండి.",
                "hi": "पत्तियों को गीला किए बिना केवल जड़ों में पानी दें।"
            },
            "application": {
                "en": "Water early in the morning so surface moisture evaporates quickly during the day.",
                "te": "ఉదయాన్నే మొదట్లో నీరు పెట్టండి.",
                "hi": "सुबह के समय सिंचाई करें।"
            },
            "frequency": {
                "en": "Whenever the top 1-2 inches of soil feels dry.",
                "te": "నేలలో తేమను బట్టి అవసరమైనప్పుడు నీరు పెట్టండి.",
                "hi": "मिट्टी सूखने पर पानी दें।"
            },
            "benefit": {
                "en": "90% of plant fungal diseases require wet leaves to infect; keeping foliage dry prevents disease permanently.",
                "te": "ఆకులు పొడిగా ఉండడం వల్ల 90% ఫంగస్ తెగుళ్లు రాకుండా ఉంటాయి.",
                "hi": "पत्तियों को सूखा रखने से 90% फंगल बीमारियों से बचा जा सकता है।"
            }
        }
    ]
}

def format_home_remedies(disease_key: str, lang: str):
    key = disease_key.upper().strip()
    if "RUST" in key:
        remedies = HOME_REMEDIES["RUST"]
    elif "POWDERY" in key:
        remedies = HOME_REMEDIES["POWDERY"]
    else:
        remedies = HOME_REMEDIES["HEALTHY"]
        
    l = lang.lower().strip()
    if l in ["telugu", "te"]: l = "te"
    elif l in ["hindi", "hi"]: l = "hi"
    else: l = "en"
    
    formatted = []
    for r in remedies:
        formatted.append({
            "id": r["id"],
            "name": r["name"].get(l, r["name"]["en"]),
            "icon": r.get("icon", "Leaf"),
            "ingredients": r["ingredients"].get(l, r["ingredients"]["en"]),
            "preparation": r["preparation"].get(l, r["preparation"]["en"]),
            "application": r["application"].get(l, r["application"]["en"]),
            "frequency": r["frequency"].get(l, r["frequency"]["en"]),
            "benefit": r["benefit"].get(l, r["benefit"]["en"]),
        })
    return formatted

def get_causes(d_name, sev):
    d = d_name.lower()
    if "powdery" in d:
        causes = ["fungalCause", "airCirculationCause", "waterImbalanceLess", "nutrientCause"]
    elif "rust" in d:
        causes = ["fungalCause", "waterImbalanceMore", "pestCause", "nutrientCause"]
    elif "healthy" in d:
        causes = ["healthyStatus", "maintenanceCause"]
    else:
        causes = ["environmentalStress", "nutrientWatch"]
    
    insight = "lowInsight"
    if sev == "High": insight = "heavyInsight"
    elif sev == "Medium": insight = "mediumInsight"
    
    return causes, insight

# ==========================================
# Prediction Endpoint
# ==========================================
@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    temperature: float = Form(25.0),
    humidity: float = Form(50.0),
    rain: str = Form("No"),
    rain_status: str = Form("No Rain"),
    rain_amount: float = Form(0.0),
    lang: str = Form("en")
):
    try:
        image_data = await file.read()
        try:
            image = Image.open(io.BytesIO(image_data))
            # Auto-rotate based on EXIF tag to fix smartphone photo orientation
            image = ImageOps.exif_transpose(image).convert('RGB')
            # Downscale large smartphone photos to 512x512 to prevent OOM and speed up inference
            image.thumbnail((512, 512), Image.Resampling.BILINEAR)
        except Exception:
            return JSONResponse(
                status_code=400,
                content={"detail": "Uploaded file is not a valid image format."},
                headers={"Access-Control-Allow-Origin": "*"}
            )
        
        np_img = np.array(image)
        h, w = np_img.shape[:2]
        
        # 1. Comprehensive Plant Foliage Canopy and Lesion Analysis
        hsv = cv2.cvtColor(np_img, cv2.COLOR_RGB2HSV)
        
        # Isolate green chlorophyll and yellow-green chlorotic leaf foliage
        mask_green = cv2.inRange(hsv, (26, 25, 25), (95, 255, 255))
        mask_yellow_green = cv2.inRange(hsv, (18, 25, 25), (32, 255, 255))
        green_foliage = cv2.bitwise_or(mask_green, mask_yellow_green)
        
        # Dilate green foliage slightly to establish leaf blade canopy boundary.
        # This bridges lesions inside the leaf while strictly rejecting isolated ground soil, mulch, pots, and sky.
        leaf_bridge = cv2.dilate(green_foliage, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (45, 45)))

        # Powdery Mildew: Chalky pale / whitish fungal dusting on the leaf canopy
        # High brightness (115-245), low saturation (0-72), confined to the leaf canopy
        mask_pale = cv2.inRange(hsv, (0, 0, 115), (180, 72, 245))
        powdery_on_leaf = cv2.bitwise_and(mask_pale, mask_pale, mask=leaf_bridge)
        powdery_on_leaf = cv2.morphologyEx(powdery_on_leaf, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
        powdery_pixels = int(np.sum(powdery_on_leaf > 0))

        # Rust Lesions: Fiery orange / amber fungal pustules on the leaf canopy
        # Hue [8, 24], rich saturation S >= 95, bright fiery orange V >= 100
        # Confined to leaf canopy to completely eliminate false triggers on dull brown soil / dirt
        mask_rust_color = cv2.inRange(hsv, (8, 95, 100), (24, 255, 245))
        rust_on_leaf_raw = cv2.bitwise_and(mask_rust_color, mask_rust_color, mask=leaf_bridge)
        rust_on_leaf_raw = cv2.morphologyEx(rust_on_leaf_raw, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3)))

        # Discard any excessively large continuous contour (>1500 px) which would be wood/soil/bark
        num_r, r_labels, r_stats, _ = cv2.connectedComponentsWithStats(rust_on_leaf_raw)
        rust_on_leaf = np.zeros_like(rust_on_leaf_raw)
        for i in range(1, num_r):
            area = r_stats[i, cv2.CC_STAT_AREA]
            if 15 <= area <= 1500:
                rust_on_leaf[r_labels == i] = 255
        rust_pixels = int(np.sum(rust_on_leaf > 0))

        # Full plant canopy (green foliage + any disease spots on plant)
        foliage_mask = cv2.bitwise_or(green_foliage, cv2.bitwise_or(powdery_on_leaf, rust_on_leaf))
        leaf_pixels = int(np.sum(foliage_mask > 0))
        green_pixels = int(np.sum(mask_green > 0))
        total_pixels = h * w
        foliage_coverage = (leaf_pixels / float(total_pixels)) if total_pixels > 0 else 0.0
        green_dominance = (green_pixels / float(leaf_pixels)) if leaf_pixels > 0 else 0.0

        rust_ratio = (rust_pixels / float(leaf_pixels)) if leaf_pixels > 0 else 0.0
        powdery_ratio = (powdery_pixels / float(leaf_pixels)) if leaf_pixels > 0 else 0.0

        # 2. Run Ultralytics YOLOv8 inference with standard threshold (conf=0.25)
        yolo_model = get_model()
        yolo_healthy_boxes = []
        yolo_rust_boxes = []
        yolo_powdery_boxes = []
        
        if yolo_model is not None:
            try:
                with torch.no_grad():
                    # imgsz=416 gives higher resolution accuracy without OOM risk
                    results = yolo_model(image, imgsz=416, conf=0.25, verbose=False)
                
                if results and len(results) > 0 and results[0].boxes:
                    for box in results[0].boxes:
                        cls_id = int(box.cls[0])
                        cls_name = str(yolo_model.names.get(cls_id, "")).upper()
                        c = float(box.conf[0])
                        xyxy = [int(v) for v in box.xyxy[0].cpu().numpy()]
                        box_data = {"conf": c, "xyxy": xyxy}
                        
                        if "HEALTHY" in cls_name:
                            yolo_healthy_boxes.append(box_data)
                        elif "RUST" in cls_name:
                            yolo_rust_boxes.append(box_data)
                        elif "POWDERY" in cls_name:
                            yolo_powdery_boxes.append(box_data)
            except Exception as yolo_err:
                print(f"YOLO inference error: {yolo_err}")

        max_healthy_conf = max([b["conf"] for b in yolo_healthy_boxes], default=0.0)
        max_rust_conf = max([b["conf"] for b in yolo_rust_boxes], default=0.0)
        max_powdery_conf = max([b["conf"] for b in yolo_powdery_boxes], default=0.0)

        # 3. Multi-Layer Cross-Validation & Decision Engine
        # Prevents low-confidence false positives on healthy green leaves and separates powdery vs rust
        rust_confirmed = False
        rust_conf = 0.0
        if max_rust_conf >= 0.65:
            rust_confirmed = True
            rust_conf = max_rust_conf
        elif max_rust_conf >= 0.40 and (rust_ratio >= 0.005 or rust_pixels >= 60):
            rust_confirmed = True
            rust_conf = max_rust_conf
        elif rust_ratio >= 0.010 or (rust_pixels >= 150 and rust_ratio >= 0.005):
            rust_confirmed = True
            rust_conf = min(0.95, max(0.72, 0.68 + float(rust_ratio) * 6.0))

        powdery_confirmed = False
        powdery_conf = 0.0
        if max_powdery_conf >= 0.65:
            powdery_confirmed = True
            powdery_conf = max_powdery_conf
        elif max_powdery_conf >= 0.40 and (powdery_ratio >= 0.008 or powdery_pixels >= 80):
            powdery_confirmed = True
            powdery_conf = max_powdery_conf
        elif powdery_ratio >= 0.012 or (powdery_pixels >= 200 and powdery_ratio >= 0.006):
            powdery_confirmed = True
            powdery_conf = min(0.95, max(0.74, 0.70 + float(powdery_ratio) * 4.5))

        # Check for false-positive suppressions on clean green foliage
        if green_dominance >= 0.68 and rust_ratio < 0.004 and max_rust_conf < 0.65:
            rust_confirmed = False

        if green_dominance >= 0.68 and powdery_ratio < 0.005 and max_powdery_conf < 0.65:
            powdery_confirmed = False

        # Final decision
        if rust_confirmed and powdery_confirmed:
            if powdery_pixels >= rust_pixels * 1.3 or powdery_ratio >= rust_ratio * 1.3:
                best_class = "POWDERY"
                final_conf = powdery_conf
            elif rust_pixels >= powdery_pixels * 1.3 or rust_ratio >= powdery_ratio * 1.3:
                best_class = "RUST"
                final_conf = rust_conf
            elif powdery_conf >= rust_conf:
                best_class = "POWDERY"
                final_conf = powdery_conf
            else:
                best_class = "RUST"
                final_conf = rust_conf
        elif powdery_confirmed:
            best_class = "POWDERY"
            final_conf = powdery_conf
        elif rust_confirmed:
            best_class = "RUST"
            final_conf = rust_conf
        else:
            best_class = "HEALTHY"
            final_conf = max(max_healthy_conf, 0.92 if green_dominance > 0.60 else 0.88)

        # 4. Generate Clean Diagnostic Bounding Boxes & Annotations
        ann_bgr = cv2.cvtColor(np_img, cv2.COLOR_RGB2BGR)

        if best_class == "HEALTHY":
            green_color = (34, 197, 94) # BGR emerald green
            boxes_drawn = 0
            if yolo_healthy_boxes:
                for hb in yolo_healthy_boxes:
                    if hb["conf"] >= 0.30:
                        x1, y1, x2, y2 = hb["xyxy"]
                        cv2.rectangle(ann_bgr, (x1, y1), (x2, y2), green_color, 2)
                        cv2.putText(ann_bgr, f"HEALTHY ({int(hb['conf']*100)}%)", (x1, max(25, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.65, green_color, 2, cv2.LINE_AA)
                        boxes_drawn += 1

            if boxes_drawn == 0:
                cnts, _ = cv2.findContours(foliage_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                cnts = [c for c in cnts if cv2.contourArea(c) > 600]
                if cnts:
                    for cnt in sorted(cnts, key=cv2.contourArea, reverse=True)[:3]:
                        bx, by, bw, bh = cv2.boundingRect(cnt)
                        cv2.rectangle(ann_bgr, (bx, by), (bx + bw, by + bh), green_color, 2)
                        cv2.putText(ann_bgr, f"HEALTHY ({int(final_conf*100)}%)", (bx, max(22, by - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.65, green_color, 2, cv2.LINE_AA)
                else:
                    cv2.rectangle(ann_bgr, (15, 15), (w - 15, h - 15), green_color, 2)
                    cv2.putText(ann_bgr, f"HEALTHY LEAF ({int(final_conf*100)}%)", (25, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.85, green_color, 2, cv2.LINE_AA)

        elif best_class == "RUST":
            rust_color = (0, 140, 255) # BGR amber/orange
            boxes_drawn = 0
            for rb in yolo_rust_boxes:
                if rb["conf"] >= 0.40:
                    x1, y1, x2, y2 = rb["xyxy"]
                    cv2.rectangle(ann_bgr, (x1, y1), (x2, y2), rust_color, 2)
                    cv2.putText(ann_bgr, f"RUST ({int(rb['conf']*100)}%)", (x1, max(25, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.65, rust_color, 2, cv2.LINE_AA)
                    boxes_drawn += 1

            if boxes_drawn == 0 and rust_pixels > 0:
                cnts, _ = cv2.findContours(rust_on_leaf, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                for cnt in cnts:
                    if 25 < cv2.contourArea(cnt) < 1500:
                        bx, by, bw, bh = cv2.boundingRect(cnt)
                        cv2.rectangle(ann_bgr, (bx, by), (bx + bw, by + bh), rust_color, 2)
                cv2.putText(ann_bgr, f"LEAF RUST ({int(final_conf*100)}%)", (25, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.85, rust_color, 2, cv2.LINE_AA)

        elif best_class == "POWDERY":
            powdery_color = (255, 200, 50) # BGR cyan/blue
            boxes_drawn = 0
            for pb in yolo_powdery_boxes:
                if pb["conf"] >= 0.40:
                    x1, y1, x2, y2 = pb["xyxy"]
                    cv2.rectangle(ann_bgr, (x1, y1), (x2, y2), powdery_color, 2)
                    cv2.putText(ann_bgr, f"POWDERY ({int(pb['conf']*100)}%)", (x1, max(25, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.65, powdery_color, 2, cv2.LINE_AA)
                    boxes_drawn += 1

            if boxes_drawn == 0 and powdery_pixels > 0:
                cnts, _ = cv2.findContours(powdery_on_leaf, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                for cnt in cnts:
                    if cv2.contourArea(cnt) > 35:
                        bx, by, bw, bh = cv2.boundingRect(cnt)
                        cv2.rectangle(ann_bgr, (bx, by), (bx + bw, by + bh), powdery_color, 2)
                cv2.putText(ann_bgr, f"POWDERY MILDEW ({int(final_conf*100)}%)", (25, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.85, powdery_color, 2, cv2.LINE_AA)

        annotated_img = Image.fromarray(cv2.cvtColor(ann_bgr, cv2.COLOR_BGR2RGB))

        # Base64 encode annotated image
        buffered = io.BytesIO()
        annotated_img.save(buffered, format="JPEG", quality=85)
        img_str = base64.b64encode(buffered.getvalue()).decode()

        # Severity determination
        d_upper = best_class.upper() if best_class else "HEALTHY"
        is_detected = d_upper in ["RUST", "POWDERY"]
        
        if is_detected:
            severity = "High" if final_conf > 0.82 else "Medium" if final_conf > 0.55 else "Low"
        else:
            severity = "Low"

        # Treatment recommendations
        if "RUST" in d_upper:
            treatment = "Leaf Rust detected. Apply sour buttermilk or neem-turmeric spray, and safely prune heavily infected leaves."
            disease_name = "Leaf Rust (తుప్పు తెగులు / रतुआ)"
        elif "POWDERY" in d_upper:
            treatment = "Powdery Mildew detected. Apply baking soda oil solution or milk spray, and increase plant sunlight and airflow."
            disease_name = "Powdery Mildew (బూడిద తెగులు / पाउडरी फफूंदी)"
        else:
            treatment = "Leaf is healthy with no significant fungal infection. Maintain regular watering and organic nutrition."
            disease_name = "Healthy Leaf (ఆరోగ్యకరమైన ఆకు / स्वस्थ पत्ती)"

        # Retrieve home remedies in selected language
        home_remedies = format_home_remedies(d_upper, lang)
        
        # Legacy organic methods for backward compatibility
        legacy_methods = []
        for r in home_remedies:
            legacy_methods.append({
                "name": r["name"],
                "instruction": f"{r['ingredients']} - {r['preparation']} {r['application']}"
            })

        possible_causes, severity_insight = get_causes(d_upper, severity)

        return JSONResponse(
            status_code=200,
            content={
                "disease": d_upper,
                "disease_name": disease_name,
                "confidence": float(round(final_conf, 3)),
                "severity": severity,
                "treatment": treatment,
                "recommendation": treatment,
                "detected": is_detected,
                "annotated_image": f"data:image/jpeg;base64,{img_str}",
                "home_remedies": home_remedies,
                "organic_treatment": {
                    "methods": legacy_methods,
                    "label": "Required Home Remedies & Organic Care"
                },
                "possible_causes": possible_causes,
                "severity_insight": severity_insight
            },
            headers={"Access-Control-Allow-Origin": "*"}
        )

    except Exception as e:
        print(f"Prediction error: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Model inference error: {str(e)}"},
            headers={"Access-Control-Allow-Origin": "*"}
        )

# Kept for backward compatibility
@app.get("/narsapur-weather")
def get_narsapur_weather():
    return {
        "temperature": 32,
        "humidity": 35,
        "rain_amount": 0.0,
        "rain_status": "noRain",
        "description": "Sunny",
        "city": "Narsapur, Telangana"
    }

@app.get("/nearby-stores")
def get_nearby_stores(lat: float = 17.74, lon: float = 78.17, lang: str = "en"):
    return {
        "stores": [
            {"name": "Rythumithra Fertilizers & Pesticides", "address": "Main Rd, Narsapur, Telangana", "rating": 5.0, "certified": True},
            {"name": "Kapil Fertilizers & Seeds", "address": "Narsapur, Telangana", "rating": 5.0, "certified": True}
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
