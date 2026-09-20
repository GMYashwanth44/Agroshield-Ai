from fastapi import APIRouter
from app.schemas.schemas import VoiceQueryRequest

router = APIRouter(tags=["Multilingual Voice Farming Assistant"])

KNOWLEDGE_RESPONSES = {
    "brown": {
        "en": "Brown concentric spots on tomato leaves indicate Early Blight (Alternaria solani). Immediately prune infected lower leaves and spray Trichoderma viride or Mancozeb 75% WP @ 2g/L. Avoid overhead watering.",
        "kn": "ಟೊಮೇಟೊ ಎಲೆಗಳ ಮೇಲಿನ ಕಂದು ಮಚ್ಚೆಗಳು 'ಅರ್ಲಿ ಬ್ಲೈಟ್' ರೋಗದ ಲಕ್ಷಣಗಳಾಗಿವೆ. ಬಾಧಿತ ಕೆಳಗಿನ ಎಲೆಗಳನ್ನು ತೆಗೆಯಿರಿ ಮತ್ತು ಟ್ರೈಕೋಡರ್ಮಾ ಅಥವಾ ಮ್ಯಾಂಕೋಜೆಬ್ 2 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಸಿಂಪಡಿಸಿ.",
        "hi": "टमाटर की पत्तियों पर भूरे धब्बे अर्ली ब्लाइट (अगेती झुलसा) का संकेत हैं। प्रभावित निचली पत्तियों को काट दें और ट्राइकोडर्मा या मैंकोजेब 2 ग्राम/लीटर पानी का छिड़काव करें।",
        "mr": "टोमॅटोच्या पानांवरील तपकिरी डाग अर्ली ब्लाइट रोगाचे लक्षण आहेत. बाधित खालची पाने काढून टाका आणि ट्रायकोडर्मा किंवा मॅन्कोझेब २ ग्रॅम/लिटर पाण्यात मिसळून फवारा.",
        "te": "టమోటా ఆకులపై గోధుమ రంగు మచ్చలు ముందస్తు ఎండు తెగులు (Early Blight) సంకేతం. సోకిన కింది ఆకులను తొలగించి, లీటరు నీటికి 2 గ్రాముల మాంకోజెబ్ లేదా ట్రైకోడెర్మా పిచికారీ చేయండి.",
        "ta": "தக்காளி இலைகளில் பழுப்பு நிற புள்ளிகள் ஆரம்பகால கருகல் (Early Blight) நோயைக் குறிக்கின்றன. பாதிக்கப்பட்ட கீழ் இலைகளை அகற்றிவிட்டு, டிரைக்கோடெர்மா அல்லது மான்கோசெப் 2 கிராம்/லிட்டர் தெளிக்கவும்."
    },
    "yellow": {
        "en": "Yellowing leaves typically indicate nitrogen deficiency or early fungal infection. If veins stay green while leaf turns yellow, apply magnesium sulphate foliar spray @ 5g/L.",
        "kn": "ಎಲೆಗಳು ಹಳದಿಯಾಗುವುದು ಸಾರಜನಕದ ಕೊರತೆ ಅಥವಾ ಆರಂಭಿಕ ಶಿಲೀಂಧ್ರ ಸೋಂಕನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಮೆಗ್ನೀಸಿಯಮ್ ಸಲ್ಫೇಟ್ 5 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.",
        "hi": "पत्तियों का पीला पड़ना नाइट्रोजन की कमी या फंगल संक्रमण का संकेत है। मैग्नीशियम सल्फेट 5 ग्राम/लीटर का छिड़काव करें।",
        "mr": "पाने पिवळी पडणे नत्राची कमतरता किंवा बुरशीजन्य संसर्गाचे लक्षण आहे. मॅग्नेशियम सल्फेट ५ ग्रॅम/लिटर फवारा.",
        "te": "ఆకులు పసుపు రంగులోకి మారడం నత్రజని లోపం లేదా శిలీంధ్ర సంక్రమణకు సూచిక. మెగ్నీషియం సల్ఫేట్ 5 గ్రా/లీ పిచికారీ చేయండి.",
        "ta": "இலைகள் மஞ்சள் நிறமாக மாறுவது தழைச்சத்து குறைபாடு அல்லது பூஞ்சை தொற்றுக்கான அறிகுறியாகும். மெக்னீசியம் சல்பேட் 5 கிராம்/லிட்டர் தெளிக்கவும்."
    },
    "default": {
        "en": "I heard your agricultural question. For accurate diagnosis, use the 'Scan Crop' feature to take a photo of the affected leaf or connect with your local Agricultural Officer.",
        "kn": "ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ನಿಖರ ರೋಗನಿರ್ಣಯಕ್ಕಾಗಿ 'ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' ಆಯ್ಕೆ ಬಳಸಿ ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.",
        "hi": "आपका कृषि प्रश्न प्राप्त हुआ। सटीक जांच के लिए 'फसल स्कैन करें' से पत्ते की फोटो लें या अपने कृषि अधिकारी से संपर्क करें।",
        "mr": "तुमचा शेतीविषयक प्रश्न नोंदवला आहे. अचूक निदानासाठी 'पीक स्कॅन करा' वापरून फोटो काढा किंवा कृषी अधिकाऱ्याशी संपर्क साधा.",
        "te": "మీ వ్యవసాయ ప్రశ్న అందింది. ఖచ్చితమైన నిర్ధారణ కోసం 'పంటను స్కాన్ చేయండి' ఎంపಿಕ చేసుకోండి లేదా వ్యవసాయ అధికారిని సంప్రదించండి.",
        "ta": "உங்கள் விவசாயக் கேள்வி பெறப்பட்டது. துல்லியமான நோயறிதலுக்கு 'பயிரை ஸ்கேன் செய்' என்பதைப் பயன்படுத்தி புகைப்படம் எடுக்கவும்."
    }
}

@router.post("/voice-query")
def process_voice_query(data: VoiceQueryRequest):
    """
    Multilingual voice assistant endpoint supporting English, Kannada, Hindi, Marathi, Telugu, Tamil.
    """
    text = data.query.lower()
    lang = data.language if data.language in ["en", "kn", "hi", "mr", "te", "ta"] else "en"

    topic = "default"
    if any(w in text for w in ["brown", "spot", "blight", "ಕಂದು", "भूरा", "तपकिरी", "గోధుమ", "பழுப்பு"]):
        topic = "brown"
    elif any(w in text for w in ["yellow", "chlorosis", "ಹಳದಿ", "पीला", "पिवळे", "పసుపు", "மஞ்சள்"]):
        topic = "yellow"

    answer = KNOWLEDGE_RESPONSES[topic].get(lang, KNOWLEDGE_RESPONSES[topic]["en"])

    return {
        "query": data.query,
        "language": lang,
        "topic": topic,
        "answer": answer,
        "speech_text": answer,
        "suggested_action": "scan_crop" if topic != "default" else "expert_help"
    }
