"""
AI Farmer Assistant Service ("Ask AgroShield").
Context-aware agricultural question answering engine with agronomic safety guardrails,
ICAR-approved biological recommendations, and multilingual response generation.
"""

from typing import Dict, Any, List, Optional

SUPPORTED_LANGUAGES = ["en", "kn", "hi", "te", "ta", "mr"]

# Knowledge base of safe agronomic answers
AGRONOMIC_KNOWLEDGE = {
    "organic_spray": {
        "en": "For organic disease management, apply Trichoderma viride @ 5g per litre of water or cold-pressed Neem Oil (10,000 ppm) @ 2-3ml/L with 1ml of mild liquid soap. Always spray during morning hours (7:00–9:30 AM) when temperature is cool.",
        "kn": "ಸಾವಯವ ರೋಗ ನಿಯಂತ್ರಣಕ್ಕಾಗಿ, ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಗ್ರಾಂ ಟ್ರೈಕೋಡರ್ಮಾ ವಿರಿಡೆ (Trichoderma viride) ಅಥವಾ 2-3 ಮಿಲಿ ಬೇವಿನ ಎಣ್ಣೆಯನ್ನು ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ. ಮುಂಜಾನೆ 7:00 ರಿಂದ 9:30 ರ ಅವಧಿಯಲ್ಲಿ ಸಿಂಪಡಿಸುವುದು ಅತ್ಯಂತ ಸೂಕ್ತ.",
        "hi": "जैविक रोग प्रबंधन के लिए, 5 ग्राम ट्राइकोडर्मा विरिडे प्रति लीटर पानी या 2-3 मिली नीम का तेल प्रति लीटर पानी में मिलाकर छिड़काव करें। सुबह 7:00 से 9:30 बजे के बीच छिड़काव करें।",
        "te": "సేంద్రీయ తెగుళ్ల నివారణ కోసం, లీటరు నీటికి 5 గ్రాముల ట్రైకోడెర్మా విరిడే లేదా 2-3 మి.లీ వేప నూనెను కలిపి పిచికారీ చేయండి. ఉదయం 7:00 నుండి 9:30 గంటల మధ్య పిచికారీ చేయడం శ్రేయస్కరం.",
        "ta": "இயற்கை நோய் மேலாண்மைக்கு, ஒரு லிட்டர் தண்ணீருக்கு 5 கிராம் ட்ரைகோடெர்மா விரிடி அல்லது 2-3 மி.லி வேப்பெண்ணெய் கலந்து தெளிக்கவும். காலை 7:00 முதல் 9:30 மணிக்குள் தெளிக்கவும்.",
        "mr": "सेंद्रिय रोग नियंत्रणासाठी, प्रति लिटर पाण्यात ५ ग्रॅम ट्रायकोडर्मा विरिडे किंवा २-३ मिली कडुनिंबाचे तेल मिसळून फवारावे. सकाळी ७:०० ते ९:३० च्या दरम्यान फवारणी करावी."
    },
    "rain_spray": {
        "en": "Do not spray immediately before anticipated rain! If rain occurs within 2–3 hours of spraying, the chemical or biological wash-off is almost complete. Wait until the rain stops, foliage dries, and spray with a silicone-based wetting sticker agent.",
        "kn": "ಮಳೆ ಬರುವ ಮುನ್ಸೂಚನೆ ಇದ್ದಾಗ ಔಷಧ ಸಿಂಪಡಿಸಬೇಡಿ! ಸಿಂಪಡಿಸಿದ 2-3 ಗಂಟೆಗಳಲ್ಲಿ ಮಳೆ ಬಂದರೆ ಔಷಧಿ ಕೊಚ್ಚಿ ಹೋಗುತ್ತದೆ. ಮಳೆ ನಿಂತು ಎಲೆಗಳು ಒಣಗಿದ ನಂತರವೇ ಸಿಂಪಡಿಸಿ.",
        "hi": "बारिश की संभावना होने पर तुरंत छिड़काव न करें! यदि छिड़काव के 2-3 घंटे के भीतर बारिश होती है, तो दवा बह जाती है। पत्तियां सूखने के बाद ही सिलिकॉन स्टिकर के साथ छिड़काव करें।",
        "te": "వర్షం పడే అవకాశం ఉన్నప్పుడు పిచికారీ చేయవద్దు! పిచికారీ చేసిన 2-3 గంటలలోపు వర్ಷం పడితే మందు కొట్టుకుపోతుంది. ఆకులు ఆరిన తర్వాత మాత్రమే పిచికారీ చేయండి.",
        "ta": "மழை வர வாய்ப்பு இருக்கும் போது மருந்து தெளிக்க வேண்டாம்! தெளித்த 2-3 மணி நேரத்திற்குள் மழை பெய்தால் மருந்து வீணாகிவிடும். இலைகள் காய்ந்த பிறகு தெளிக்கவும்.",
        "mr": "पावसाची शक्यता असल्यास फवारणी करू नका! फवारणीनंतर २-३ तासांत पाऊस पडल्यास औषध वाहून जाते. पाने कोरडी झाल्यावरच फवारणी करावी."
    },
    "pruning": {
        "en": "When pruning diseased leaves, use sharp shears disinfected with 70% alcohol. Cut at least 2 cm into healthy green stem tissue. Never throw diseased clippings into farm compost; collect them in sealed bags and bury or burn them.",
        "kn": "ರೋಗಪೀಡಿತ ಎಲೆಗಳನ್ನು ಕತ್ತರಿಸುವಾಗ, 70% ಆಲ್ಕೋಹಾಲ್‌ನಿಂದ ಕತ್ತರಿಯನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ. ಸೋಂಕು ತಗುಲಿದ ಎಲೆಗಳನ್ನು ಬ್ಯಾಗ್‌ನಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ ಹೊಲದಿಂದ ದೂರ ವಿಲೇವಾರಿ ಮಾಡಿ, ಗೊಬ್ಬರದ ಗುಂಡಿಗೆ ಹಾಕಬೇಡಿ.",
        "hi": "रोगग्रस्त पत्तियों की छंटाई करते समय, 70% अल्कोहल से कैंची को साफ करें। रोगग्रस्त पत्तियों को खाद के गड्ढे में न डालें; उन्हें प्लास्टिक बैग में भरकर खेत से दूर नष्ट करें।",
        "te": "వ్యాధి సోకిన ఆకులను కత్తిరించేటప్పుడు, కత్తెరను శానిటైజ్ చేయండి. వ్యాధి సోకిన ఆకులను కంపోస్ట్‌లో వేయకండి; పొలానికి దూరంగా పూడ్చిపెట్టండి.",
        "ta": "பாதிக்கப்பட்ட இலைகளை கவாத்து செய்யும்போது, கத்தரிக்கோலை தூய்மைப்படுத்தவும். பாதிக்கப்பட்ட இலைகளை உரக்குழியில் போடாமல், பண்ணைக்கு வெளியே கொண்டுசென்று அழிக்கவும்.",
        "mr": "रोगट पानांची छाटणी करताना कात्री निर्जंतुक करा. रोगट पाने कंपोस्ट खतात टाकू नका; त्यांना शेतापासून दूर नष्ट करा."
    },
    "fertilizer": {
        "en": "During active disease infection, halt high-nitrogen (Urea) applications as excessive nitrogen creates soft, tender leaf tissue that accelerates fungal penetration. Instead, apply Potassium and Silicon foliar sprays to harden cell walls.",
        "kn": "ಬೆಳೆಗೆ ರೋಗ ತಗುಲಿದಾಗ ಹೆಚ್ಚು ಯೂರಿಯಾ (ಸಾರಜನಕ) ಹಾಕಬೇಡಿ. ಇದು ಎಲೆಗಳನ್ನು ಮೃದುವಾಗಿಸಿ ರೋಗ ಹರಡುವಿಕೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ. ಬದಲಿಗೆ ಪೊಟ್ಯಾಷ್ ಮತ್ತು ಲಘು ಪೋಷಕಾಂಶಗಳನ್ನು ಸಿಂಪಡಿಸಿ.",
        "hi": "सक्रिय रोग के दौरान यूरिया (नाइट्रोजन) का प्रयोग रोक दें। अधिक नाइट्रोजन पत्तियों को कोमल बना देता है जिससे फंगस तेजी से फैलता है। पोटाश और सिलिकॉन का छिड़काव करें।",
        "te": "తెగులు ఉన్న సమయంలో యూరియా (నత్రజని) వాడకాన్ని తగ్గించండి. పొటాష్ మరియు సూక్ష్మ పోషకాలను పిచికారీ చేసి పంట రోగనిరోధక శక్తిని పెంచండి.",
        "ta": "நோய் தாக்கம் உள்ளபோது யூரியா பயன்படுத்துவதை தவிர்க்கவும். பொட்டாஷ் மற்றும் நுண்ணூட்டச்சத்துக்களை இலைவழியாக தெளித்து பயிரின் எதிர்ப்பு சக்தியை அதிகரிக்கவும்.",
        "mr": "रोगाच्या काळात युरियाचा अतिवापर टाळा. त्याऐवजी पोटॅश आणि सिलिकॉनयुक्त खतांची फवारणी करून पानांची रोगप्रतिकारक शक्ती वाढवा."
    }
}


def ask_farmer_assistant(
    question: str,
    crop: Optional[str] = "Tomato",
    disease: Optional[str] = "Early Blight",
    severity: Optional[str] = "Moderate",
    health_score: Optional[float] = 72.0,
    language: str = "en"
) -> Dict[str, Any]:
    """
    Generate contextual agronomic advice based on farmer query and scan state.
    """
    lang = language.lower() if language in SUPPORTED_LANGUAGES else "en"
    q_lower = question.lower()

    # Identify query intent
    if any(w in q_lower for w in ["organic", "bio", "neem", "trichoderma", "natural", "chemical"]):
        topic_key = "organic_spray"
    elif any(w in q_lower for w in ["rain", "weather", "spray", "water", "wet"]):
        topic_key = "rain_spray"
    elif any(w in q_lower for w in ["prune", "cut", "trim", "remove", "clean"]):
        topic_key = "pruning"
    elif any(w in q_lower for w in ["fertilizer", "urea", "nutrient", "npk", "food"]):
        topic_key = "fertilizer"
    else:
        topic_key = "organic_spray"

    response_text = AGRONOMIC_KNOWLEDGE[topic_key].get(lang, AGRONOMIC_KNOWLEDGE[topic_key]["en"])

    # Contextual preamble
    context_prefix = {
        "en": f"[Context: {crop} with {severity} {disease} • Health Score: {health_score}/100]\n\n",
        "kn": f"[ಮಾಹಿತಿ: {crop} - {severity} {disease} • ಆರೋಗ್ಯ ಅಂಕ: {health_score}/100]\n\n",
        "hi": f"[संदर्भ: {crop} में {severity} {disease} • स्वास्थ्य स्कोर: {health_score}/100]\n\n",
        "te": f"[సందర్భం: {crop} - {severity} {disease} • ఆరోగ్యం: {health_score}/100]\n\n",
        "ta": f"[சூழல்: {crop} - {severity} {disease} • ஆரோக்கிய மதிப்பீடு: {health_score}/100]\n\n",
        "mr": f"[संदर्भ: {crop} - {severity} {disease} • आरोग्य गुण: {health_score}/100]\n\n"
    }.get(lang, f"[Context: {crop} with {disease}]\n\n")

    return {
        "question": question,
        "language": lang,
        "topic": topic_key,
        "answer": f"{context_prefix}{response_text}",
        "safety_reminder": "Always follow Central Insecticide Board & Registration Committee (CIBRC) guidelines and use proper personal protective equipment (PPE).",
        "suggested_followups": [
            "What organic spray works best for this disease?",
            "Is it safe to spray before rain today?",
            "How should I prune and dispose infected foliage?",
            "Which foliar fertilizer helps leaf recovery?"
        ]
    }
