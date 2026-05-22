import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Mic, MicOff, Volume2, VolumeX, 
  AlertTriangle, Shield, Phone, Sparkles, RefreshCw 
} from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

// Localized responses based on user keywords
const LOCALIZED_RESPONSES = {
  en: {
    welcome: "Hello! I am your AI Poultry Assistant. Speak to me about symptoms, vaccination, feed, or temperature. How can I help your farm today?",
    default: "I understand you are asking about your poultry. Could you specify if they are showing symptoms like coughing, diarrhea, or lethargy? Or ask about vaccine schedules.",
    sick: "Critical Alert: Your flock may be showing signs of Newcastle Disease (Ranikhet) or Coccidiosis. Common signs include green diarrhea, coughing, and paralysis. You must separate sick birds immediately, disinfect the shelter, and contact our vet Dr. Rao at +91 94401 23456.",
    sick_severity: "critical",
    vaccine: "Low Risk: Make sure your broiler chicks receive the LaSota vaccine on day 7 (against Ranikhet disease) and the IBD (Gumboro) vaccine on day 14. Keep their drinker disinfected before administering.",
    vaccine_severity: "low",
    feed: "Medium Risk: Ensure feed moisture is below 12% to prevent aflatoxins. Clean drinkers daily. If temperature is above 35°C, add vitamin C or electrolytes to water to prevent heat stress.",
    feed_severity: "medium",
    climate: "Medium Risk: Ideal brooding temperature is 32-35°C in week 1, dropping by 2°C weekly until 21-24°C. Ensure good cross-ventilation to prevent ammonia buildup.",
    climate_severity: "medium"
  },
  te: {
    welcome: "నమస్కారం! నేను మీ పౌల్ట్రీ AI సహాయకుడిని. కోళ్ల వ్యాధులు, టీకాలు, ఫీడ్ లేదా ఉష్ణోగ్రత గురించి మాట్లాడండి. ఈరోజు నేను మీ ఫామ్‌కు ఎలా సహాయపడగలను?",
    default: "మీరు కోళ్ల సమాచారం గురించి అడుగుతున్నారని నేను గ్రహించాను. దయచేసి వాటికి దగ్గు, విరేచనాలు లేదా బద్ధకం వంటి లక్షణాలు ఉన్నాయో లేదా టీకా షెడ్యూల్స్ గురించి చెప్పండి.",
    sick: "తీవ్రమైన హెచ్చరిక: మీ కోళ్లకు రాణీకేట్ వ్యాధి లేదా కాక్సిడియోసిస్ సోకే అవకాశం ఉంది. పచ్చటి విరేచనాలు, శ్వాస ఇబ్బందులు దీని ముఖ్య లక్షణాలు. వెంటనే అనారోగ్యంతో ఉన్న కోళ్లను వేరు చేయండి మరియు పశువైద్యుడు డాక్టర్ రావును +91 94401 23456 లో సంప్రదించండి.",
    sick_severity: "critical",
    vaccine: "తక్కువ ప్రమాదం: మీ కోళ్లకు 7వ రోజు లాసోటా వ్యాక్సిన్ (రాణీకేట్ వ్యాధి నివారణకు), 14వ రోజు ఐబిడి వ్యాక్సిన్ అందేలా చూడండి. వ్యాక్సిన్ ఇచ్చే ముందు నీటి తొట్టెలను శుభ్రం చేయండి.",
    vaccine_severity: "low",
    feed: "మధ్యస్థ ప్రమాదం: ఫీడ్‌లో తేమ శాతం 12% కంటే తక్కువ ఉండేలా చూసుకోండి. ప్రతిరోజూ నీటి తొట్టెలను కడగండి. ఉష్ణోగ్రత 35°C కంటే ఎక్కువ ఉంటే నీటిలో ఎలక్ట्रोలైట్స్ మరియు విటమిన్ C కలపండి.",
    feed_severity: "medium",
    climate: "మధ్యస్థ ప్రమాదం: మొదటి వారంలో ఉష్ణోగ్రత 32-35°C ఉండాలి. ప్రతి వారం 2°C తగ్గించాలి. అమ్మోనియా గ్యాస్ పేరుకుపోకుండా వెంటిలేషన్ బాగుండాలి.",
    climate_severity: "medium"
  },
  hi: {
    welcome: "नमस्ते! मैं आपका पोल्ट्री एआई सहायक हूँ। अपने मुर्गों के रोग, टीकाकरण, चारा या तापमान के बारे में बताएं। मैं आपकी क्या मदद कर सकता हूँ?",
    default: "मुझे समझ आया कि आप पोल्ट्री के बारे में पूछ रहे हैं। क्या वे खांसने, दस्त या सुस्ती जैसे लक्षण दिखा रहे हैं? या फिर टीकाकरण समय सारिणी के बारे में पूछें।",
    sick: "गंभीर चेतावनी: आपके झुंड में रानीखेत रोग या कोक्सीडियोसिस हो सकता है। लक्षणों में हरे दस्त, सांस लेने में कठिनाई और कमजोरी शामिल है। तुरंत बीमार पक्षियों को अलग करें और हमारे पशु चिकित्सक डॉ. राव से +91 94401 23456 पर संपर्क करें।",
    sick_severity: "critical",
    vaccine: "कम जोखिम: सुनिश्चित करें कि चूजों को 7वें दिन लासोटा टीका (रानीखेत से बचाव) और 14वें दिन आईबीडी टीका मिले। दवा देने से पहले बर्तनों को साफ करें।",
    vaccine_severity: "low",
    feed: "सामान्य जोखिम: चारे में नमी का स्तर 12% से कम रखें ताकि फंगस न लगे। गर्मी 35°C से अधिक होने पर पानी में इलेक्ट्रोलाइट्स या विटामिन सी मिलाएं।",
    feed_severity: "medium",
    climate: "सामान्य जोखिम: ब्रूडिंग तापमान पहले सप्ताह 32-35°C रखें और फिर धीरे-धीरे कम करें। अमोनिया गैस से बचाने के लिए उचित हवा की व्यवस्था रखें।",
    climate_severity: "medium"
  },
  ta: {
    welcome: "வணக்கம்! நான் உங்கள் கோழி வளர்ப்பு AI உதவியாளர். நோய் அறிகுறிகள், தடுப்பூசிகள், தீவனம் அல்லது வெப்பநிலை பற்றி பேசலாம். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    default: "கோழிகளைப் பற்றி கேட்கிறீர்கள் என புரிகிறது. இருமல், வயிற்றுப்போக்கு அல்லது சோர்வு உள்ளதா என்று குறிப்பிடவும். அல்லது தடுப்பூசி அட்டவணை பற்றி கேட்கலாம்.",
    sick: "தீவிர எச்சரிக்கை: உங்கள் பறவைகளுக்கு இராணிகேட் நோய் அல்லது காக்சிடியோசிஸ் இருக்கலாம். பச்சை நிற வயிற்றுப்போக்கு, இருமல் இதன் அறிகுறிகள். உடனே நோயுற்ற பறவைகளைப் பிரித்து, கால்நடை மருத்துவர் டாக்டர் ராவை +91 94401 23456 இல் தொடர்பு கொள்ளவும்.",
    sick_severity: "critical",
    vaccine: "குறைந்த ஆபத்து: உங்கள் கோழிகளுக்கு 7 ஆம் நாளில் லாசோட்டா தடுப்பூசியும், 14 ஆம் நாளில் ஐபிடி தடுப்பூசியும் வழங்கப்படுவதை உறுதி செய்யவும்.",
    vaccine_severity: "low",
    feed: "நடுத்தர ஆபத்து: தீவன ஈரப்பதம் 12% க்கும் குறைவாக இருப்பதை உறுதி செய்யவும். வெப்பநிலை 35°C க்கு மேல் இருந்தால் நீரில் எலக்ட்ரோலைட்டுகளை சேர்க்கலாம்.",
    feed_severity: "medium",
    climate: "நடுத்தர ஆபத்து: முதல் வாரம் வெப்பநிலை 32-35°C ஆக இருக்க வேண்டும். அமோனியா வாயு உருவாவதைத் தடுக்க நல்ல காற்றோட்டம் தேவை.",
    climate_severity: "medium"
  },
  kn: {
    welcome: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಪೌಲ್ಟ್ರಿ AI ಸಹಾಯಕ. ಕಾಯಿಲೆಗಳು, ಲಸಿಕೆಗಳು, ಆಹಾರ ಅಥವಾ ತಾಪಮಾನದ ಬಗ್ಗೆ ನನ್ನೊಂದಿಗೆ ಮಾತನಾಡಿ. ಇವತ್ತು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    default: "ನೀವು ಕೋಳಿಗಳ ಬಗ್ಗೆ ಕೇಳುತ್ತಿದ್ದೀರಿ ಎಂದು ತಿಳಿಯಿತು. ಅವು ಕೆಮ್ಮು, ಅತಿಸಾರ ಅಥವಾ ಸುಸ್ತು ತೋರಿಸುತ್ತಿವೆಯೇ ಎಂದು ಸ್ಪಷ್ಟಪಡಿಸಿ ಅಥವಾ ಲಸಿಕೆ ವೇಳಾಪಟ್ಟಿ ಕೇಳಿ.",
    sick: "ತೀವ್ರ ಎಚ್ಚರಿಕೆ: ನಿಮ್ಮ ಕೋಳಿಗಳಿಗೆ ರಾಣಿಕೇಟ್ ರೋಗ ಅಥವಾ ಕಾಕ್ಸಿಡಿಯೋಸಿಸ್ ಇರಬಹುದು. ಹಸಿರು ಅತಿಸಾರ ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ ಇದರ ಲಕ್ಷಣಗಳು. ತಕ್ಷಣ ಅನಾರೋಗ್ಯದ ಕೋಳಿಗಳನ್ನು ಬೇರ್ಪಡಿಸಿ ಮತ್ತು ಪಶುವೈದ್ಯರಾದ ಡಾ. ರಾವ್ ಅವರನ್ನು +91 94401 23456 ಸಂಪರ್ಕಿಸಿ.",
    sick_severity: "critical",
    vaccine: "ಕಡಿಮೆ ಅಪಾಯ: 7ನೇ ದಿನದಲ್ಲಿ ಲಸೋಟಾ (ರಾಣಿಕೇಟ್ ತಡೆಗೆ) ಮತ್ತು 14ನೇ ದಿನದಲ್ಲಿ ಐಬಿಡಿ ಲಸಿಕೆಯನ್ನು ನೀಡುವುದನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
    vaccine_severity: "low",
    feed: "ಮಧ್ಯಮ ಅಪಾಯ: ಆಹಾರದಲ್ಲಿ ತೇವಾಂಶ 12% ಕ್ಕಿಂತ ಕಡಿಮೆ ಇರಲಿ. ತಾಪಮಾನ 35°C ಗಿಂತ ಹೆಚ್ಚಿದ್ದರೆ ನೀರಿಗೆ ಎಲೆಕ್ಟ್ರೋಲೈಟ್‌ಗಳನ್ನು ಸೇರಿಸಿ.",
    feed_severity: "medium",
    climate: "ಮಧ್ಯಮ ಅಪಾಯ: ಮೊದಲ ವಾರ ಬ್ರೂಡಿಂಗ್ ತಾಪಮಾನ 32-35°C ಇರಬೇಕು. ಅಮೋನಿಯಾ ಅನಿಲವನ್ನು ತಡೆಯಲು ಉತ್ತಮ ಗಾಳಿಯಾಡುವಿಕೆ ಇರಲಿ.",
    climate_severity: "medium"
  },
  mr: {
    welcome: "नमस्कार! मी आपला पोल्ट्री एआय सहाय्यक आहे. कोंबड्यांचे आजार, लसीकरण, चारा किंवा तापमानाबद्दल बोला. मी आज काय मदत करू शकतो?",
    default: "आपण कोंबड्यांविषयी विचारत आहात. त्यांना खोकला, जुलाब किंवा सुस्ती आहे का ते सांगा. किंवा लसीकरणाच्या वेळापत्रकाविषयी विचारा.",
    sick: "गंभीर चेतावणी: आपल्या कोंबड्यांना राणीखेत रोग किंवा कॉक्सिडायोसिस असू शकतो. हिरवी संडास आणि श्वास घेण्यास त्रास होणे ही याची लक्षणे आहेत. आजारी कोंबड्यांना त्वरित वेगळे करा आणि डॉक्टर डॉ. राव यांच्याशी +91 94401 23456 वर संपर्क साधा.",
    sick_severity: "critical",
    vaccine: "कमी जोखीम: आपल्या कोंबड्यांना ७ व्या दिवशी लासोटा आणि १४ व्या दिवशी आयबीडी लस मिळाल्याची खात्री करा.",
    vaccine_severity: "low",
    feed: "मध्यम जोखीम: खाद्यातील ओलावा १२% पेक्षा कमी ठेवा. तापमान ३५ डिग्री पेक्षा जास्त असल्यास पाण्यात इलेक्ट्रोलाइट्स द्या.",
    feed_severity: "medium",
    climate: "मध्यम जोखीम: पहिल्या आठवड्यात ब्रूडिंगचे तापमान ३२-३५ डिग्री सेल्सिअस असावे. अमोनिया वायू होऊ नये म्हणून खेळती हवा ठेवा.",
    climate_severity: "medium"
  },
  bn: {
    welcome: "নমস্কার! আমি আপনার পোল্ট্রি এআই সহকারী। মুরগির রোগ, টিকা, খাদ্য বা তাপমাত্রা সম্পর্কে কথা বলুন। আজ আমি কীভাবে সাহায্য করতে পারি?",
    default: "পোল্ট্রি সম্পর্কে আপনার জিজ্ঞাসা বুঝতে পেরেছি। মুরগির কাশি, ডায়রিয়া বা অলসতা আছে কিনা তা বলুন বা টিকার বিবরণ জানতে চান।",
    sick: "গুরুতর সতর্কতা: আপনার মুরগির রানিক্ষেত রোগ বা কক্সিডিওসিস হতে পারে। সবুজ ডায়রিয়া এবং শ্বাসকষ্ট এর লক্ষণ। অবিলম্বে অসুস্থ পাখি আলাদা করুন এবং আমাদের পশুচিকিত্সক ডাঃ রাও এর সাথে +91 94401 23456 নম্বরে যোগাযোগ করুন।",
    sick_severity: "critical",
    vaccine: "স্বল্প ঝুঁকি: ৭ম দিনে লাসোটা (রানিক্ষেত প্রতিরোধে) এবং ১৪তম দিনে আইবিডি টিকা দেওয়া নিশ্চিত করুন।",
    vaccine_severity: "low",
    feed: "মাঝারি ঝুঁকি: খাদ্যের আর্দ্রতা ১২% এর নিচে রাখুন। তাপমাত্রা ৩৫° সেলসিয়াসের বেশি হলে জলে ইলেক্ট্রোলাইট যোগ করুন।",
    feed_severity: "medium",
    climate: "মাঝারি ঝুঁকি: প্রথম সপ্তাহে ব্রুডিং তাপমাত্রা ৩২-৩৫° সেলসিয়াস বজায় রাখুন। ঘরে পর্যাপ্ত আলো-বাতাস রাখুন যেন অ্যামোনিয়া গ্যাস না জমে।",
    climate_severity: "medium"
  }
};

export default function AIChatbotWidget() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [ttsMuted, setTtsMuted] = useState(false);
  const [activeSeverity, setActiveSeverity] = useState(null); // 'low', 'medium', 'critical'

  const {
    isSupported: voiceSupported,
    isListening,
    isSpeaking,
    transcript,
    fullTranscript,
    startListening,
    stopListening,
    speak,
    cancelSpeak,
    error: voiceError
  } = useVoice();

  const chatEndRef = useRef(null);

  // Load welcome message when widget is opened or language changes
  useEffect(() => {
    const textMap = LOCALIZED_RESPONSES[lang] || LOCALIZED_RESPONSES.en;
    setMessages([
      { id: 'welcome', sender: 'ai', text: textMap.welcome, time: new Date() }
    ]);
    setActiveSeverity(null);
  }, [lang, isOpen]);

  // Handle Speech Recognition transcript changes
  useEffect(() => {
    if (fullTranscript) {
      setInputVal(fullTranscript);
    }
  }, [fullTranscript]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isListening]);

  // Trigger TTS voice when AI sends a message
  const speakAIResponse = (text) => {
    if (!ttsMuted) {
      speak(text);
    }
  };

  // Match keyword to find appropriate AI reply
  const processAIResponse = (userInput) => {
    const textMap = LOCALIZED_RESPONSES[lang] || LOCALIZED_RESPONSES.en;
    const lowerInput = userInput.toLowerCase();

    // Check keywords (translated keywords or English keywords)
    const sickKeywords = ['sick', 'ill', 'cough', 'diarrhea', 'green', 'die', 'dead', 'paralysis', 'లక్షణాలు', 'అనారోగ్య', 'దగ్గు', 'విరేచనాలు', 'బీమార్', 'खांसी', 'दस्त', 'मरण', 'नొప్పి', 'நோய்', 'இருமல்', 'காய்ச்சல்', 'ಜ್ವರ', 'ಕೆಮ್ಮು', 'ಅತಿಸಾರ', 'खोकला', 'ताप', 'অসুখ', 'কাশি', 'ডায়রিয়া'];
    const vaccineKeywords = ['vaccine', 'vaccination', 'lasota', 'ibd', 'gumboro', 'injection', 'టీకా', 'వ్యాక్సిన్', 'टीकाकरण', 'सुई', 'தடுப்பூசி', 'ಲಸಿಕೆ', 'लस', 'টিকা'];
    const feedKeywords = ['feed', 'water', 'eat', 'drink', 'food', 'aflatoxin', 'humidity', 'కోత', 'మేత', 'నీరు', 'चारा', 'पानी', 'भोजन', 'தீவனம்', 'தண்ணீர்', 'ಆಹಾರ', 'ನೀರು', 'चारा', 'पाणी', 'খাবার', 'জল'];
    const climateKeywords = ['temp', 'temperature', 'weather', 'cold', 'hot', 'heat', 'brooder', 'brooding', 'ammonia', 'ventilation', 'గాలి', 'వేడి', 'ఉష్ణోగ్రత', 'तापमान', 'गर्मी', 'ठंड', 'வெப்பநிலை', 'காற்று', 'ತಾಪಮಾನ', 'ಹವೆ', 'हवामान', 'উষ্ণতা', 'আবহাওয়া'];

    let replyText = textMap.default;
    let severity = null;

    if (sickKeywords.some(kw => lowerInput.includes(kw))) {
      replyText = textMap.sick;
      severity = textMap.sick_severity;
    } else if (vaccineKeywords.some(kw => lowerInput.includes(kw))) {
      replyText = textMap.vaccine;
      severity = textMap.vaccine_severity;
    } else if (feedKeywords.some(kw => lowerInput.includes(kw))) {
      replyText = textMap.feed;
      severity = textMap.feed_severity;
    } else if (climateKeywords.some(kw => lowerInput.includes(kw))) {
      replyText = textMap.climate;
      severity = textMap.climate_severity;
    }

    return { replyText, severity };
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    // User Message
    const userMsg = { id: Date.now().toString(), sender: 'user', text: text, time: new Date() };
    
    // Process response
    const { replyText, severity } = processAIResponse(text);
    
    // AI Message
    const aiMsg = { 
      id: (Date.now() + 1).toString(), 
      sender: 'ai', 
      text: replyText, 
      time: new Date(),
      severity: severity
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInputVal('');
    setActiveSeverity(severity);
    
    // Trigger Synthesis Speech Output
    speakAIResponse(replyText);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      cancelSpeak();
      startListening();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 ${
            isOpen 
              ? 'bg-slate-900 dark:bg-white dark:text-slate-900' 
              : 'bg-gradient-to-tr from-emerald-500 to-green-600 hover:shadow-emerald-500/20'
          }`}
          aria-label="Toggle AI Assistant"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <MessageSquare className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500 text-[8px] font-bold text-white items-center justify-center">AI</span>
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-24 right-6 z-50 flex h-[580px] w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-white/60 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-surface-200 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-4 py-3.5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-black text-surface-950 dark:text-white">
                    {t('voice.assistant_title')}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-surface-500 dark:text-slate-400">
                      AI Voice Active
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {/* TTS Volume Mute/Unmute */}
                <button
                  onClick={() => {
                    setTtsMuted(!ttsMuted);
                    if (!ttsMuted) cancelSpeak();
                  }}
                  className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
                    ttsMuted 
                      ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-500/20 dark:bg-red-500/10' 
                      : 'border-surface-200 bg-white text-surface-500 hover:text-emerald-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
                  }`}
                  title={ttsMuted ? "Unmute Voice Answers" : "Mute Voice Answers"}
                >
                  {ttsMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                {/* Speak active alerts */}
                <button
                  onClick={() => speak(t('vet_disclaimer.text'))}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-surface-200 bg-white text-surface-500 hover:text-emerald-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                  title="Read Disclaimer"
                >
                  <Shield className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Severity Banner */}
            {activeSeverity && (
              <div className={`flex items-center gap-2 px-4 py-2 text-xs font-bold ${
                activeSeverity === 'critical' 
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                  : activeSeverity === 'medium'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}>
                <AlertTriangle className="h-4 w-4" />
                <span>
                  {activeSeverity === 'critical' ? t('severity.critical') : activeSeverity === 'medium' ? t('severity.medium') : t('severity.low')}
                </span>
                {activeSeverity === 'critical' && (
                  <a href="tel:+919440123456" className="ml-auto flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[10px] font-black text-white hover:bg-red-700">
                    <Phone className="h-3 w-3" /> Call Vet
                  </a>
                )}
              </div>
            )}

            {/* Chat Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500 text-white rounded-tr-none'
                      : 'bg-surface-100 text-surface-800 dark:bg-white/5 dark:text-slate-200 rounded-tl-none border border-surface-200 dark:border-white/5'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.sender === 'ai' && (
                      <div className="mt-1 flex items-center justify-between text-[10px] text-surface-400 dark:text-slate-500">
                        <span>AI Assistant</span>
                        {isSpeaking && (
                          <span className="flex items-center gap-1 text-emerald-500">
                            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span> Speaking
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Listening Indicator overlay */}
              {isListening && (
                <div className="flex flex-col items-center justify-center py-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {t('voice.listening')}
                    </span>
                  </div>
                  {/* Waveform Animation */}
                  <div className="flex items-center gap-1 h-8">
                    {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                      <motion.div
                        key={bar}
                        animate={{ height: [8, 24, 8] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: bar * 0.08,
                          ease: "easeInOut"
                        }}
                        className="w-1.5 bg-emerald-500 rounded-full"
                      />
                    ))}
                  </div>
                  {transcript && (
                    <p className="mt-2 text-center text-xs font-medium px-4 text-surface-600 dark:text-slate-400 italic">
                      "{transcript}"
                    </p>
                  )}
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Vet Disclaimer Alert */}
            <div className="px-4 py-2 border-t border-surface-100 bg-surface-50 dark:border-white/5 dark:bg-white/2">
              <div className="flex gap-2 items-start text-[10px] text-surface-500 dark:text-slate-400">
                <Shield className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <p className="leading-normal">
                  <span className="font-black text-emerald-700 dark:text-emerald-300">
                    {t('vet_disclaimer.title')}:
                  </span>{' '}
                  {t('vet_disclaimer.text')}
                </p>
              </div>
            </div>

            {/* Chat Input / Mic Control Bar */}
            <div className="border-t border-surface-200 p-3.5 dark:border-white/10 flex items-center gap-2">
              {/* Mic Button */}
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition ${
                  isListening 
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                    : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400'
                }`}
                title={isListening ? "Stop Listening" : "Start Listening"}
              >
                {voiceSupported ? (
                  isListening ? <MicOff className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5 opacity-40" />
                )}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('voice.ask_anything')}
                className="flex-1 rounded-xl border border-surface-200 bg-white px-3 py-2.5 text-sm text-surface-850 outline-none placeholder:text-surface-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white shadow-md transition hover:opacity-90 active:scale-95"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
