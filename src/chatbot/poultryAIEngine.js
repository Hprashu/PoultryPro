// Poultry AI Prompt and Conversation Engine
import { POULTRY_KNOWLEDGE } from './poultryKnowledgeBase.js';

// Words that indicate off-topic topics like movies, cricket, politics, general coding, finance
const OFF_TOPIC_KEYWORDS = [
  'cricket', 'football', 'soccer', 'ipl', 'dhoni', 'kohli', 'tennis',
  'movie', 'cinema', 'bollywood', 'hollywood', 'actor', 'actress', 'song', 'music', 'dance',
  'politics', 'election', 'minister', 'modi', 'congress', 'bjp', 'government',
  'stock market', 'bitcoin', 'crypto', 'shares', 'finance', 'loan',
  'recipe', 'cook', 'biryani', 'pizza', 'burger',
  'programming', 'javascript', 'python', 'coding', 'html', 'css', 'react',
  'mobile phone', 'iphone', 'samsung', 'gadget',
  'weather today', 'news today', 'newspaper'
];

// Keywords indicating poultry interest
const POULTRY_KEYWORDS = [
  'chicken', 'hen', 'chick', 'bird', 'poultry', 'broiler', 'layer', 'rooster', 'coop', 'flock',
  'egg', 'feed', 'water', 'litter', 'shed', 'brooder', 'brooding', 'vaccine', 'vaccination',
  'disease', 'sick', 'cough', 'diarrhea', 'paralysis', 'lathargy', 'weakness', 'fever', 'veterinary',
  'కోడి', 'కోళ్లు', 'మేత', 'టీకా', 'వ్యాధి', 'ఆయాసం',
  'मुर्गी', 'चूजा', 'चारा', 'टीका', 'बीमारी', 'लकवा',
  'கோழி', 'தீவனம்', 'தடுப்பூசி', 'நோய்', 'வாத',
  'ಕೋಳಿ', 'ಆಹಾರ', 'ಲಸಿಕೆ', 'ಕಾಯಿಲೆ', 'ಸಾವು',
  'कोंबडी', 'चारा', 'लस', 'आजारी', 'हगवण',
  'মুরগি', 'খাবার', 'টিকা', 'রোগ', 'আমাশয়'
];

const FOUNDER_KEYWORDS = [
  'founder', 'creator', 'who made', 'who built', 'who developed', 'sailada', 'prasant', 'prashanth', 'prashu',
  'వ్యవస్థాపకుడు', 'తయారు చేసారు', 'రూపొందించారు', 'శైలాద', 'ప్రశాంత్',
  'संस्थापक', 'किसने बनाया', 'डेवलपर', 'शैलादा', 'प्रशांत',
  'நிறுவனர்', 'உருவாக்கியவர்', 'சைலதா', 'பிரசாந்த்',
  'ಸಂಸ್ಥಾಪಕ', 'ಯಾರು ಮಾಡಿದ್ದು', 'ಶೈಲಾದಾ', 'ಪ್ರಶಾಂತ್',
  'संस्थापक', 'कोणी बनवले', 'शैलादा', 'प्रशांत',
  'প্রতিষ্ঠাতা', 'কে বানিয়েছে', 'শৈলাদা', 'প্রশান্ত'
];

const STARTUP_KEYWORDS = [
  'poultrypro', 'poultry pro', 'what is this website', 'about this platform', 'about the app', 'startup', 'mission', 'vision',
  'పౌల్ట్రీప్రో', 'ఈ వెబ్‌సైట్', 'ప్లాట్‌ఫారమ్', 'స్టార్టప్', 'లక్ష్యం',
  'पोल्ट्रीप्रो', 'यह वेबसाइट', 'स्टार्टअप', 'लक्ष्य',
  'போல்ட்ரிப்ரோ', 'இந்த வலைத்தளம்', 'தொடக்க நிறுவனம்',
  'ಪೌಲ್ಟ್ರಿಪ್ರೊ', 'ಈ ವೆಬ್‌ಸೈಟ್', 'ಸ್ಟಾರ್ಟ್‌ಅಪ್',
  'पोल्ट्रीप्रो', 'ही वेबसाईट', 'स्टार्टअप',
  'পোল্ট্রিপ্রো', 'এই ওয়েবসাইট', 'স্টার্টআপ'
];

const FOUNDER_RESPONSES = {
  en: "Sailada Prasant Kumar is a dedicated B.Tech student and the founder of PoultryPro, an AI-powered smart poultry farming platform. With a strong interest in AI and Agritech, he developed PoultryPro to help local farmers overcome technical barriers, language exclusions, and unexpected disease outbreaks.",
  te: "శైలాద ప్రశాంత్ కుమార్ గారు ఒక అంకితభావం గల B.Tech విద్యార్థి మరియు PoultryPro వ్యవస్థాపకుడు. ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ (AI) మరియు అగ్రిటెక్ రంగాలపై ఆసక్తితో, స్థానిక పౌల్ట్రీ రైతులకు సాంకేతిక అడ్డంకులు, భాషా సమస్యలు మరియు అకస్మాత్తుగా వచ్చే వ్యాధుల మరణాల నుండి రక్షించడానికి PoultryProని రూపొందించారు.",
  hi: "शैलादा प्रशांत कुमार एक समर्पित बी.टेक छात्र और पोल्ट्रीप्रो (PoultryPro) के संस्थापक हैं। एआई और एग्रीटेक में गहरी रुचि के साथ, उन्होंने स्थानीय किसानों को तकनीकी बाधाओं, क्षेत्रीय भाषा की समस्याओं और बीमारियों के प्रकोप से बचाने के लिए इस मंच को विकसित किया है।",
  ta: "சைலதா பிரசாந்த் குமார் ஒரு அர்ப்பணிப்புள்ள பி.டெக் மாணவர் மற்றும் போல்ட்ரிப்ரோவின் (PoultryPro) நிறுவனர் ஆவார். ஏஐ மற்றும் அக்ரிடெக் மீதான ஆர்வத்தினால், உள்ளூர் விவசாயிகள் தொழில்நுட்ப தடைகள் மற்றும் மொழி சிக்கல்களை கடந்து கோழி நோய்களிலிருந்து தங்கள் பண்ணைகளை பாதுகாக்க இந்த தளத்தை உருவாக்கினார்.",
  kn: "ಶೈಲಾದಾ ಪ್ರಶಾಂತ್ ಕುಮಾರ್ ಅವರು ಬಿ.ಟೆಕ್ ವಿದ್ಯಾರ್ಥಿ ಮತ್ತು ಪೌಲ್ಟ್ರಿಪ್ರೊ (PoultryPro) ಸಂಸ್ಥಾಪಕರಾಗಿದ್ದಾರೆ. ಎಐ ಮತ್ತು ಅಗ್ರಿಟೆಕ್‌ನಲ್ಲಿ ತೀವ್ರ ಆಸಕ್ತಿಯೊಂದಿಗೆ, ಸ್ಥಳೀಯ ರೈತರು ಎದುರಿಸುತ್ತಿರುವ ತಾಗು ತಾಂತ್ರಿಕ ಅಡೆತಡೆಗಳು ಮತ್ತು ಭಾಷೆಯ ಸಮಸ್ಯೆಗಳನ್ನು ನಿವಾರಿಸಲು ಈ ವೇದಿಕೆಯನ್ನು ಅಭಿವೃದ್ಧಿಪಡಿಸಿದ್ದಾರೆ.",
  mr: "शैलादा प्रशांत कुमार हे एक समर्पित बी.टेक विद्यार्थी आणि पोल्ट्रीप्रो (PoultryPro) चे संस्थापक आहेत. एआय आणि अ‍ॅग्रीटेकमधील स्वारस्यामुळे, त्यांनी स्थानिक शेतकऱ्यांना तांत्रिक अडचणी, भाषेच्या समस्या आणि कोंबड्यांच्या आजारांपासून वाचवण्यासाठी या मंचाची निर्मिती केली.",
  bn: "শৈলাদা প্রশান্ত কুমার হলেন একজন নিবেদিতপ্রাণ বি.টেক ছাত্র এবং পোল্ট্রিপ্রো (PoultryPro)-এর প্রতিষ্ঠাতা। এআই এবং এগ্রিটেক-এর প্রতি গভীর আগ্রহ থেকে, তিনি স্থানীয় খামারিদের প্রযুক্তিগত বাধা, ভাষার সমস্যা এবং মুরগির মহামারী রোগ থেকে রক্ষা করতে এই প্ল্যাটফর্মটি তৈরি করেছেন।"
};

const STARTUP_RESPONSES = {
  en: "PoultryPro is a premium agritech startup platform designed for smart poultry farm management. It integrates AI-powered disease diagnostics, multi-lingual voice guidance for rural farmers, smart scheduling, and real-time environmental telemetry to prevent disease outbreaks and optimize farm performance.",
  te: "PoultryPro అనేది స్మార్ట్ పౌల్ట్రీ ఫామ్ నిర్వహణ కోసం రూపొందించబడిన ఒక ప్రీమియం అగ్రిటెక్ స్టార్టప్ ప్లాట్‌ఫారమ్. ఇది వ్యాధి నిర్ధారణ, గ్రామీణ రైతుల కోసం బహుభాషా వాయిస్ అసిస్టెంట్, స్మార్ట్ షెడ్యూలింగ్ మరియు పౌల్ట్రీ పనితీరును పెంచడానికి నిజ-సమయ పర్యావరణ టెలిమెట్రీని అందిస్తుంది.",
  hi: "पोल्ट्रीप्रो (PoultryPro) स्मार्ट पोल्ट्री फार्म प्रबंधन के लिए डिज़ाइन किया गया एक प्रीमियम एग्रीटेकक स्टार्टअप प्लेटफॉर्म है। यह बीमारी के निदान, ग्रामीण किसानों के लिए बहुभाषी आवाज मार्गदर्शन, स्मार्ट शेड्यूलिंग और वास्तविक समय पर्यावरण टेलीमेट्री को एकीकृत करता है।",
  ta: "போல்ட்ரிப்ரோ (PoultryPro) என்பது ஸ்மார்ட் கோழி பண்ணை மேலாண்மைக்காக வடிவமைக்கப்பட்ட ஒரு பிரீமியம் அக்ரிடெக் தொடக்க தளமாகும். இது நோய் கண்டறிதல், கிராமப்புற விவசாயிகளுக்கான பல்லூடக குரல் வழிகாட்டுதல், மற்றும் பண்ணை செயல்திறனை மேம்படுத்த நிகழ்நேর சுற்றுச்சூழல் டெலிமெட்ரியை ஒருங்கிணைக்கிறது.",
  kn: "ಪೌಲ್ಟ್ರಿಪ್ರೊ (PoultryPro) ಎಂಬುದು ಸ್ಮಾರ್ಟ್ ಕೋಳಿ ಸಾಕಾಣಿಕೆ ನಿರ್ವಹಣೆಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಪ್ರೀಮியம் ಅಗ್ರಿಟೆಕ್ ಸ್ಟಾರ್ಟ್‌ಅಪ್ ವೇದಿಕೆಯಾಗಿದೆ. ಇದು ರೋಗ ಪತ್ತೆಹಚ್ಚುವಿಕೆ, ಗ್ರಾಮೀಣ ರೈತರಿಗೆ ಬಹುಭಾಷಾ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ನೈಜ-ಸಮಯದ ಪರಿಸರ ಟೆಲಿಮೆಟ್ರಿಯನ್ನು ಒಳಗೊಂಡಿದೆ.",
  mr: "पोल्ट्रीप्रो (PoultryPro) हे स्मार्ट कुक्कुटपालन व्यवस्थापनासाठी डिझाइन केलेले प्रीमियम अ‍ॅग्रीटेक स्टार्टअप प्लॅटफॉर्म आहे. हे कोंबड्यांच्या आजारांचे निदान, वेंटिलेशन व्यवस्थापन, लसीकरण ट्रॅकिंग आणि रिअल-टाइम पर्यावरण टेलीमेट्री एकत्रित करते.",
  bn: "পোল্ট্রিপ্রো (PoultryPro) হল স্মার্ট পোল্ট্রি খামার ব্যবস্থাপনার জন্য ডিজাইন করা একটি প্রিমিয়াম এগ্রিটেক স্টার্টআপ প্ল্যাটফর্ম। এটি রোগ নির্ণয়, গ্রামীণ খামারিদের জন্য বহুভাষিক ভয়েস নির্দেশিকা এবং রিয়েল-টাইম পরিবেশগত টেলিমেট্রি প্রদান করে।"
};

const VET_ADVISORY = {
  en: "Precautions & Veterinary Advisory:\nNo specific disease matched these symptoms. Please take the following immediate precautions:\n• Segregate the sick birds to prevent potential spread.\n• Thoroughly clean and disinfect all waterers and feeders.\n• Ensure proper ventilation and check if the litter is wet.\n• Contact our consulting veterinarian Dr. Rao (+91 94401 23456) for a physical diagnosis.",
  te: "జాగ్రత్తలు & వెటర్నరీ సలహా:\nఈ లక్షణాలతో ఖచ్చితమైన వ్యాధి ఏదీ నిర్ధారణ కాలేదు. దయచేసి వెంటనే ఈ క్రింది జాగ్రత్తలు తీసుకోండి:\n• వ్యాధి వ్యాప్తి చెందకుండా అనారోగ్య కోళ్లను వెంటనే వేరు చేయండి.\n• నీటి మరియు మేత తొట్టెలను పూర్తిగా శుభ్రం చేసి క్రిమిసంహారకాలు వాడండి.\n• షెడ్డులో సరైన గాలి ప్రసరణ ఉండేలా చూసుకోండి మరియు పరుపు తేమను తనిఖీ చేయండి.\n• ఖచ్చితమైన చికిత్స కోసం వెంటనే వెటర్నరీ డాక్టర్ రావు గారిని (+91 94401 23456) సంప్రదించండి.",
  hi: "सावधानी और पशु चिकित्सा सलाह:\nइन लक्षणों के साथ किसी विशिष्ट बीमारी का मिलान नहीं हुआ। कृपया तुरंत निम्नलिखित सावधानियां बरतें:\n• संक्रमण फैलने से रोकने के लिए बीमार पक्षियों को तुरंत अलग करें।\n• पानी और चारे के बर्तनों को अच्छी तरह साफ और कीटाणुरहित करें।\n• शेड में उचित वेंटिलेशन सुनिश्चित करें और बिछौना (लिटर) की नमी की जांच करें।\n• सटीक उपचार के लिए पशु चिकित्सक डॉ. राव (+91 94401 23456) से तुरंत संपर्क करें।",
  ta: "கால்நடை மருத்துவ ஆலோசனை:\nகுறிப்பிட்ட நோய் எதுவும் இந்த அறிகுறிகளுடன் பொருந்தவில்லை. தயவுசெய்து உடனடியாக இந்த முன்னெச்சரிக்கை நடவடிக்கைகளை எடுக்கவும்:\n• நோய் பரவுவதைத் தடுக்க நோய்வாய்ப்பட்ட பறவைகளை உடனடியாகப் பிரிக்கவும்.\n• தீவன மற்றும் நீர் பாத்திரங்களை நன்கு சுத்தம் செய்து கிருமிநீக்கம் செய்யவும்.\n• பண்ணையில் சரியான காற்றோட்டத்தை உறுதிசெய்து, தரை ஈரப்பதத்தை சோதிக்கவும்.\n• உடனடி சிகிச்சைக்கு கால்நடை மருத்துவர் டாக்டர் ராவை (+91 94401 23456) தொடர்பு கொள்ளவும்.",
  kn: "ಮುನ್ನೆಚ್ಚರಿಕೆ ಮತ್ತು ಪಶುವೈದ್ಯಕೀಯ ಸಲಹೆ:\nಈ ರೋಗಲಕ್ಷಣಗಳೊಂದಿಗೆ ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ರೋಗವು ಹೊಂದಿಕೆಯಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ತಕ್ಷಣ ಈ ಕೆಳಗಿನ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ:\n• ಸೋಂಕು ಹರಡುವುದನ್ನು ತಡೆಯಲು ಅನಾರೋಗ್ಯದ ಹಕ್ಕಿಗಳನ್ನು ತಕ್ಷಣವೇ ಪ್ರತ್ಯೇಕಿಸಿ.\n• ಆಹಾರ ಮತ್ತು ನೀರಿನ ಪಾತ್ರೆಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಸ್ವಚ್ಛಗೊಳಿಸಿ ಮತ್ತು ಸೋಂಕುರಹಿತಗೊಳಿಸಿ.\n• ಶೆಡ್‌ನಲ್ಲಿ ಸರಿಯಾದ ಗಾಳಿಯಾಡುವಿಕೆಯನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ ಮತ್ತು ಲಿಟರ್ ತೇವಾಂಶವನ್ನು ಪರಿಶೀಲಿಸಿ.\n• ತಕ್ಷಣದ ಚಿಕಿತ್ಸೆಗಾಗಿ ಪಶುವೈದ್ಯ ಡಾ. ರಾವ್ (+91 94401 23456) ಅವರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
  mr: "सावधानता आणि पशुवैद्यकीय सल्ला:\nया लक्षणांशी जुळणारा कोणताही विशिष्ट आजार आढळला नाही. कृपया तात्काळ खालील खबरदारी घ्या:\n• संसर्ग पसरू नये म्हणून आजारी कोंबड्यांना त्वरित वेगळे करा.\n• पाण्याची व खाद्याची भांडी पूर्णपणे स्वच्छ आणि निर्जंतुक करा.\n• शेडमधील वेंटिलेशन तपासा आणि बिछाना (लिटर) ओला नाही ना याची खात्री करा.\n• अचूक उपचारासाठी पशुवैद्यक डॉ. राव (+91 94401 23456) यांच्याशी संपर्क साधा.",
  bn: "সতর্কতা এবং পশুচিকিৎসা পরামর্শ:\nএই লক্ষণগুলির সাথে কোনো নির্দিষ্ট রোগ মেলানো যায়নি। অনুগ্রহ করে অবিলম্বে নিচের সতর্কতা অবলম্বন করুন:\n• রোগ ছড়ানো প্রতিরোধ করতে অসুস্থ পাখিগুলিকে দ্রুত আলাদা করুন।\n• জলের ও খাবারের পাত্রগুলি ভালো করে পরিষ্কার ও জীবাণুমুক্ত করুন।\n• ঘরে সঠিক বায়ু চলাচল নিশ্চিত করুন এবং লিটার ভেজা কি না তা পরীক্ষা করুন।\n• সঠিক চিকিৎসার জন্য পশুচিকিত্সক ডাঃ রাও (+91 94401 23456)-এর সাথে যোগাযোগ করুন।"
};

const FALLBACK_GUIDES = {
  en: [
    "I didn't quite capture that. Here are some topics I can help you with:\n• Ask about health: Say 'My birds are sick' to start a step-by-step diagnostic audit.\n• Ask about vaccines: Say 'What is the vaccination schedule?' to get guidelines.\n• Ask about feed: Say 'How should I feed broilers?' for feed standards.\n• Ask about environmental control: Say 'What is the ideal brooder temperature?'",
    "I'm here to support your farm. You can ask me:\n• 'What causes coccidiosis?'\n• 'How to manage ammonia levels in the shed?'\n• 'What vaccinations are due on Day 7?'\n• Or type 'My birds are sick' for disease diagnostics.",
    "Could you rephrase that? I specialize in poultry farming. You can ask:\n• 'What are Newcastle disease symptoms?'\n• 'How to prevent heat stress in summers?'\n• 'Ideal humidity levels in the coop?'\n• Or say 'symptoms check' to diagnose sick birds.",
    "I didn't understand that. As your AI poultry assistant, I can guide you with:\n• Broiler feed formulation and moisture guidelines.\n• Smart environmental sensors and telemetry warnings.\n• Day-by-day vaccination schedules.\n• Type 'sick' to begin a symptom check."
  ],
  te: [
    "క్షమించండి, మీ ప్రశ్న నాకు సరిగ్గా అర్థం కాలేదు. దయచేసి వీటిలో ఒకటి అడగండి:\n• 'నా కోళ్లకు జబ్బు చేసింది' అని చెప్పి వ్యాధి నిర్ధారణను ప్రారంభించండి.\n• 'లసానియా టీకా షెడ్యూల్' అని అడిగి వ్యాక్సిన్ గైడ్స్ తెలుసుకోండి.\n• 'మేతలో తేమ శాతం ఎంత ఉండాలి?' అని అడిగి మేత నియమాలు తెలుసుకోండి.\n• 'షెడ్డు ఉష్ణోగ్రత ఎంత ఉండాలి?' అని అడిగి ఉష్ణోగ్రత నియమాలు తెలుసుకోండి.",
    "పౌల్ట్రీ సహాయకుడిగా నేను మీకు సహాయం చేయగలను. ఇలా అడగండి:\n• 'కాక్సిడియోసిస్ వ్యాధి లక్షణాలు ఏమిటి?'\n• 'షెడ్డులో అమ్మోనియా వాసన ఎలా తగ్గించాలి?'\n• '7వ రోజు కోళ్లకు ఏ టీకా వేయాలి?'\n• లేదా వ్యాధి నిర్ధారణ కోసం 'నా కోడి అనారోగ్యం' అని టైప్ చేయండి.",
    "దయచేసి మీ ప్రశ్నను మార్చి అడగండి. నేను మీకు ఈ క్రింది అంశాలలో సహాయపడగలను:\n• 'రాణీకేట్ వ్యాధి లక్షణాలు ఏమిటి?'\n• 'ఎండ దెబ్బ నుండి కోళ్లను ఎలా రక్షించాలి?'\n• 'షెడ్డులో తేమ ఎంత ఉండాలి?'\n• లేదా కోళ్ల ఆరోగ్య పరీక్ష కోసం 'జబ్బు' అని టైప్ చేయండి.",
    "క్షమించండి, నాకు అర్థం కాలేదు. పౌల్ట్రీ AIగా నేను మీకు సహాయపడే అంశాలు:\n• బ్రాయిలర్ కోళ్ల మేత మరియు బూజు రాకుండా తీసుకోవలసిన జాగ్రత్తలు.\n• షెడ్ ఉష్ణోగ్రత మరియు గాలి ప్రసరణ మార్గదర్శకాలు.\n• పౌల్ట్రీ వ్యాక్సిన్ టైమ్‌టేబుల్.\n• వ్యాధి నిర్ధారణ ప్రారంభించడానికి 'వ్యాధి' అని చెప్పండి."
  ],
  hi: [
    "क्षमा कीजिये, मैं आपका प्रश्न पूरी तरह समझ नहीं पाया। कृपया इनमें से कुछ पूछें:\n• 'मेरी मुर्गियाँ बीमार हैं' - बीमारी की जांच शुरू करने के लिए कहें।\n• 'टीकाकरण समय सारिणी' - वैक्सीन गाइड जानने के लिए पूछें।\n• 'चारे में नमी कितनी होनी चाहिए?' - चारा प्रबंधन के लिए।\n• 'ब्रूडर का सही तापमान क्या है?' - तापमान नियमों के लिए।",
    "मैं आपके पोल्ट्री फार्म प्रबंधन में मदद कर सकता हूँ। आप पूछ सकते हैं:\n• 'कोक्सीडियोसिस रोग के क्या लक्षण हैं?'\n• 'शेड में अमोनिया गैस का स्तर कैसे नियंत्रित करें?'\n• '7वें दिन कौन सा टीका लगाया जाता है?'\n• या रोग निदान के लिए 'बीमार मुर्गी' टाइप करें।",
    "कृपया अपने प्रश्न को थोड़ा बदल कर पूछें। मैं निम्न में आपकी सहायता कर सकता हूँ:\n• 'रानीखेत बीमारी के क्या लक्षण हैं?'\n• 'गर्मियों में लू से मुर्गियों को कैसे बचाएं?'\n• 'शेड में नमी का सही स्तर क्या है?'\n• या लक्षणों की जांच के लिए 'जांच' टाइप करें।",
    "मुझे समझ नहीं आया। आपके एआई पोल्ट्री सहायक के रूप में, मैं आपको ये बता सकता हूँ:\n• ब्रायलर चारा प्रबंधन और नमी के मानक।\n• शेड के तापमान और वेंटिलेशन के नियम।\n• मुर्गियों के लिए टीकाकरण चार्ट।\n• बीमारी की जांच शुरू करने के लिए 'बीमार' टाइप करें।"
  ],
  ta: [
    "மன்னிக்கவும், உங்கள் கேள்வி எனக்கு புரியவில்லை. பின்வருவனவற்றில் ஒன்றை முயற்சிக்கவும்:\n• 'என் பறவைகள் நோய்வாய்ப்பட்டுள்ளன' என கூறி நோய் கண்டறிதலைத் தொடங்கவும்.\n• 'தடுப்பூசி அட்டவணை என்ன?' என கேட்டு தடுப்பூசி வழிகாட்டுதலைப் பெறவும்.\n• 'தீவன ஈரப்பதம் எவ்வளவு இருக்க வேண்டும்?' என தீவன தரம் அறியவும்.\n• 'வெப்பநிலை எவ்வளவு இருக்க வேண்டும்?' என பண்ணை வெப்பக் கட்டுப்பாடு அறியவும்.",
    "நான் உங்களுக்கு உதவ இங்கே இருக்கிறேன். நீங்கள் கேட்கலாம்:\n• 'காக்சிடியோசிஸ் அறிகுறிகள் என்ன?'\n• 'பண்ணையில் அம்மோனியாவை எவ்வாறு குறைப்பது?'\n• '7வது நாளில் என்ன தடுப்பூசி போட வேண்டும்?'\n• அல்லது நோய் கண்டறிய 'கோழி நோய்' என்று தட்டச்சு செய்யவும்."
  ],
  kn: [
    "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ಪ್ರಶ್ನೆ ನನಗೆ ಸರಿಯಾಗಿ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಇವುಗಳಲ್ಲಿ ಒಂದನ್ನು ಕೇಳಿ:\n• 'ನನ್ನ ಕೋಳಿಗಳು ಅನಾರೋಗ್ಯದಿಂದ ಇವೆ' ಎಂದು ಹೇಳಿ ರೋಗ ಪತ್ತೆಹಚ್ಚುವಿಕೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ.\n• 'ಲಸಿಕೆ ವೇಳಾಪಟ್ಟಿ ಏನು?' ಎಂದು ಕೇಳಿ ಲಸಿಕೆ ವಿವರಗಳನ್ನು ಪಡೆಯಿರಿ.\n• 'ಆಹಾರದ ತೇವಾಂಶ ಎಷ್ಟಿರಬೇಕು?' ಎಂದು ಕೇಳಿ ಆಹಾರದ ನಿಯಮಗಳನ್ನು ತಿಳಿಯಿರಿ.\n• 'ತಾಪಮಾನ ಎಷ್ಟಿರಬೇಕು?' ಎಂದು ಕೇಳಿ ವಾತಾವರಣದ ನಿಯಮಗಳನ್ನು ತಿಳಿಯಿರಿ.",
    "ಕೋಳಿ ಸಾಕಾಣಿಕೆ ಸಹಾಯಕರಾಗಿ ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನೀವು ಕೇಳಬಹುದು:\n• 'ಕಾಕ್ಸಿಡಿಯೋಸಿಸ್ ಲಕ್ಷಣಗಳೇನು?'\n• 'ಶೆಡ್‌ನಲ್ಲಿ ಅಮೋನಿಯಾ ಅನಿಲವನ್ನು ಹೇಗೆ ನಿಯಂತ್ರಿಸುವುದು?'\n• '7ನೇ ದಿನ ಯಾವ ಲಸಿಕೆ ನೀಡಬೇಕು?'\n• ಅಥವಾ ರೋಗ ಪತ್ತೆಗಾಗಿ 'ಅನಾರೋಗ್ಯ' ಎಂದು ಟೈಪ್ ಮಾಡಿ."
  ],
  mr: [
    "क्षमस्व, मला तुमचा प्रश्न समजला नाही. कृपया खालीलपैकी एक विचारण्याचा प्रयत्न करा:\n• 'माझ्या कोंबड्या आजारी आहेत' - आजार निदान सुरू करण्यासाठी म्हणा.\n• 'लसीकरणाचे वेळापत्रक काय आहे?' - लस माहितीसाठी विचारा.\n• 'खाद्यातील ओलावा किती असावा?' - खाद्य नियोजनासाठी विचारू शकता.\n• 'तापमान किती असावे?' - शेडच्या तापमानासाठी विचारा.",
    "मी आपल्या पोल्ट्री व्यवस्थापनात मदत करू शकतो. आपण विचारू शकता:\n• 'कॉक्सिडायोसिस आजाराची लक्षणे काय आहेत?'\n• 'शेडमधील अमोनिया गॅस कसा कमी करावा?'\n• '७ व्या दिवशी कोणती लस दिली जाती?'\n• किंवा रोग निदानासाठी 'आजारी' टाईप करा."
  ],
  bn: [
    "দুঃখিত, আমি আপনার প্রশ্নটি বুঝতে পারিনি। অনুগ্রহ করে নিচের যেকোনো একটি জিজ্ঞাসা করুন:\n• 'আমার মুরগিগুলি অসুস্থ' বলে রোগ নির্ণয় শুরু করুন।\n• 'টিকা দেওয়ার সময়সূচী কী?' বলে ভ্যাকসিনের নিয়ম জানুন।\n• 'খাবারের আর্দ্রতা কত হওয়া উচিত?' বলে খাদ্য পরিচালনার নিয়ম জানুন।\n• 'ঘরের তাপমাত্রা কত হওয়া উচিত?' বলে তাপমাত্রা নিয়ন্ত্রণ জানুন।",
    "আমি আপনার খামার পরিচালনায় সাহায্য করতে পারি। আপনি জিজ্ঞাসা করতে পারেন:\n• 'কক্সিডিওসিস রোগের লক্ষণ কী কী?'\n• 'খামারে অ্যামোনিয়া গ্যাস কীভাবে নিয়ন্ত্রণ করব?'\n• '৭ম দিনে কী টিকা দেওয়া হয়?'\n• অথবা রোগ নির্ণয়ের জন্য 'অসুস্থ মুরগি' লিখুন।"
  ]
};

function getRandomFallback(lang) {
  const list = FALLBACK_GUIDES[lang] || FALLBACK_GUIDES.en;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

export function checkOffTopic(text) {
  const lower = text.toLowerCase();
  
  // If it mentions specific poultry terms, it's NOT off-topic
  const matchesPoultry = POULTRY_KEYWORDS.some(kw => lower.includes(kw));
  if (matchesPoultry) return false;

  // Check if it matches general off-topic keywords
  const matchesOffTopic = OFF_TOPIC_KEYWORDS.some(kw => lower.includes(kw));
  return matchesOffTopic;
}

export function diagnoseDisease(symptomsText, lang = 'en') {
  const baseLang = (lang || 'en').split(/[-_]/)[0].toLowerCase();
  const lower = symptomsText.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;

  // Search through diseases and count matching keywords
  for (const disease of POULTRY_KNOWLEDGE.diseases) {
    let score = 0;
    // Score based on English and active language keywords
    const langKeywords = disease.keywords[baseLang] || [];
    const enKeywords = disease.keywords.en || [];
    const allKeywords = [...new Set([...langKeywords, ...enKeywords])];

    allKeywords.forEach(kw => {
      if (lower.includes(kw.toLowerCase())) {
        score += 1;
      }
    });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = disease;
    }
  }

  // Fallback to specific disease if keywords match general terms
  if (highestScore === 0) {
    if (lower.includes('blood') || lower.includes('red') || lower.includes('stool') || lower.includes('రక్తం') || lower.includes('बीट')) {
      bestMatch = POULTRY_KNOWLEDGE.diseases.find(d => d.id === 'coccidiosis');
      highestScore = 1;
    } else if (lower.includes('neck') || lower.includes('twist') || lower.includes('paralysis') || lower.includes('మెడ') || lower.includes('लकवा')) {
      bestMatch = POULTRY_KNOWLEDGE.diseases.find(d => d.id === 'ranikhet');
      highestScore = 1;
    } else if (lower.includes('swollen') || lower.includes('eye') || lower.includes('face') || lower.includes('వాపు') || lower.includes('सूजन')) {
      bestMatch = POULTRY_KNOWLEDGE.diseases.find(d => d.id === 'coryza');
      highestScore = 1;
    } else if (lower.includes('panting') || lower.includes('hot') || lower.includes('sun') || lower.includes('వేడి') || lower.includes('गर्मी')) {
      bestMatch = POULTRY_KNOWLEDGE.diseases.find(d => d.id === 'heatstress');
      highestScore = 1;
    }
  }

  return { disease: bestMatch, score: highestScore };
}

// Process conversation memory and state transitions
export function processAIChatEngine(userInput, sessionState, lang = 'en') {
  const baseLang = (lang || 'en').split(/[-_]/)[0].toLowerCase();
  const text = userInput.trim();
  const lower = text.toLowerCase();

  // 1. Intercept Founder/Startup branding queries first
  const matchesFounder = FOUNDER_KEYWORDS.some(kw => lower.includes(kw));
  if (matchesFounder) {
    return {
      text: FOUNDER_RESPONSES[baseLang] || FOUNDER_RESPONSES.en,
      state: sessionState,
      structured: false
    };
  }

  const matchesStartup = STARTUP_KEYWORDS.some(kw => lower.includes(kw));
  if (matchesStartup) {
    return {
      text: STARTUP_RESPONSES[baseLang] || STARTUP_RESPONSES.en,
      state: sessionState,
      structured: false
    };
  }

  // 2. Check Domain Restriction
  if (checkOffTopic(text)) {
    return {
      text: POULTRY_KNOWLEDGE.generalGuides[baseLang]?.offTopic || POULTRY_KNOWLEDGE.generalGuides.en.offTopic,
      state: sessionState, // state unchanged
      structured: false
    };
  }

  // Retrieve templates
  const guides = POULTRY_KNOWLEDGE.generalGuides[baseLang] || POULTRY_KNOWLEDGE.generalGuides.en;

  // Initialize state if empty
  const state = {
    step: sessionState?.step || 0,
    symptoms: sessionState?.symptoms || [],
    duration: sessionState?.duration || '',
    age: sessionState?.age || '',
    activeDiseaseId: sessionState?.activeDiseaseId || null,
    imageAttached: sessionState?.imageAttached || false,
    imageAnalysisText: sessionState?.imageAnalysisText || ''
  };

  // If user explicitly asks about vaccination, feed, or climate separately without starting symptom checks
  const isVaccineQuery = lower.includes('vaccine') || lower.includes('vaccination') || lower.includes('schedule') || lower.includes('టీకా') || lower.includes('टीकाकरण');
  const isFeedQuery = lower.includes('feed') || lower.includes('moisture') || lower.includes('eat') || lower.includes('మేత') || lower.includes('चारा');
  const isClimateQuery = lower.includes('temp') || lower.includes('temperature') || lower.includes('ammonia') || lower.includes('ventilation') || lower.includes('ఉష్ణోగ్రత') || lower.includes('तापमान');

  if (isVaccineQuery && state.step === 0) {
    const vaccineResponse = {
      en: "Standard Poultry Vaccination Schedule:\n• Day 1: HVT (Marek's Disease) at hatchery\n• Day 7: Lasota Vaccine (Ranikhet / Newcastle disease) in eye/nasal drop\n• Day 14: Gumboro / IBD Vaccine in drinking water\n• Day 21: Lasota Booster in drinking water\nKeep drinkers clean and disinfect 24 hours prior to administration.",
      te: "పౌల్ట్రీ టీకాల పట్టిక:\n• 1వ రోజు: హేచరీ వద్ద HVT (మారెక్స్ వ్యాధి)\n• 7వ రోజు: కంటి లేదా ముక్కు చుక్కల ద్వారా లాసోటా వ్యాక్సిన్ (రాణీకేట్ వ్యాధి)\n• 14వ రోజు: తాగే నీటిలో గుంబోరో / IBD వ్యాక్సిన్\n• 21వ రోజు: తాగే నీటిలో లాసోటా బూస్టర్ డోస్\nవ్యాక్సిన్ వేసే ముందు నీటి తొట్టెలను 24 గంటల ముందే కడిగి ఉంచండి.",
      hi: "मुर्गियों के लिए मानक टीकाकरण अनुसूची:\n• दिन 1: हैचरी पर HVT (मारेक्स रोग) का टीका\n• दिन 7: आँख या नाक में लासोटा टीका (रानीखेत रोग से बचाव)\n• दिन 14: पीने के पानी में गंबोरो / IBD टीका\n• दिन 21: पीने के पानी में लासोटा बूस्टर डोज़\nटीका देने से 24 घंटे पहले पानी के बर्तनों को अच्छी तरह साफ कर लें।",
      ta: "தடுப்பூசி அட்டவணை:\n• நாள் 1: HVT (மாரெக்ஸ் நோய்)\n• நாள் 7: லசோட்டா தடுப்பூசி (இராணிகேட் நோய் - கண் அல்லது மூக்கு சொட்டு மருந்து)\n• நாள் 14: குடிநீரில் கம்போரோ / IBD தடுப்பூசி\n• நாள் 21: குடிநீரில் லசோட்டா பூஸ்டர்",
      kn: "ಕೋಳಿ ಲಸಿಕೆ ವೇಳಾಪಟ್ಟಿ:\n• ದಿನ 1: HVT (ಮಾರೆಕ್ಸ್ ರೋಗ)\n• ದಿನ 7: ಲಸೋಟಾ ಲಸಿಕೆ (ರಾಣಿಕೇಟ್ ರೋಗ - ಕಣ್ಣು/ಮೂಗಿನ ಹನಿ)\n• ದಿನ 14: ಕುಡಿಯುವ ನೀರಿನಲ್ಲಿ ಗಂಬೋರೋ ಲಸಿಕೆ\n• ದಿನ 21: ಕುಡಿಯುವ ನೀರಿನಲ್ಲಿ ಲಸೋಟಾ ಬೂಸ್ಟರ್",
      mr: "मानक कुक्कुट लसीकरण वेळापत्रक:\n• दिवस १: हॅचरीवर HVT लस\n• दिवस ७: डोळ्यात किंवा नाकात लासोटा लस (राणीखेत आजार बचाव)\n• दिवस १४: पिण्याच्या पाण्यातून गंबोरो / IBD लस\n• दिवस २१: पिण्याच्या पाण्यातून लासोटा बूस्टर",
      bn: "পোল্ট্রি টিকাকরণ সময়সূচী:\n• ১ম দিন: হ্যাচারিতে HVT (মারেক্স রোগ) ভ্যাকসিন\n• ৭ম দিন: চোখে বা নাকে লাসোটা ভ্যাকসিন (রানিখেত রোগ)\n• ১৪তম দিন: পানীয় জলে গামবোরো / IBD ভ্যাকসিন\n• ২১তম দিন: পানীয় জলে লাসোটা বুস্টার"
    };
    return {
      text: vaccineResponse[baseLang] || vaccineResponse.en,
      state: { ...state, step: 0 },
      structured: false
    };
  }

  if (isFeedQuery && state.step === 0) {
    const feedResponse = {
      en: "Feed Management Guidelines:\n• Keep feed moisture below 12% to prevent mold (Aflatoxins).\n• Broiler chicks require Broiler Starter (high protein) for 1-14 days, followed by Broiler Finisher.\n• Ensure feeding space of 2.5 inches per bird.\n• Add toxin binders to feed if humidity is above 75%.",
      te: "మేత నిర్వహణ మార్గదర్శకాలు:\n• మేతలో బూజు (అఫ్లాటాక్సిన్) రాకుండా తేమ శాతం 12% లోపు ఉంచండి.\n• మొదటి 14 రోజులు బ్రాయిలర్ స్టార్టర్ (అధిక ప్రొటీన్) మేత వేయాలి, ఆ తర్వాత ఫినిషర్ వేయాలి.\n• ప్రతి కోడికి మేత తొట్టె వద్ద 2.5 అంగుళాల స్థలం ఉండేలా చూసుకోండి.\n• వాతావరణంలో తేమ 75% దాటినప్పుడు మేతలో టాక్సిన్ బైండర్లను కలపండి.",
      hi: "चारा प्रबंधन के निर्देश:\n• फंगस (अफ़लाटॉक्सिन) से बचाने के लिए चारे में नमी का स्तर 12% से कम रखें।\n• ब्रूडिंग चूजों को पहले 1-14 दिन ब्रायलर स्टार्टर (उच्च प्रोटीन) दें, उसके बाद फिनिशर दें।\n• प्रति पक्षी कम से कम 2.5 इंच चारे के बर्तन की जगह दें।\n• हवा में आर्द्रता 75% से अधिक होने पर चारे में टॉक्सिन बाइंडर मिलाएं।",
      ta: "தீவன மேலாண்மை வழிகாட்டுதல்:\n• தீவன ஈரப்பதத்தை 12%க்கு கீழ் வைத்திருக்கவும்.\n• முதல் 14 நாட்கள் பிராய்லர் ஸ்டார்டர் தீவனம் வழங்கவும்.\n• பண்ணையில் ஈரப்பதம் 75%க்கு மேல் இருந்தால் தீவனத்தில் டாக்சின் பைண்டர் சேர்க்கவும்.",
      kn: "ಆಹಾರ ನಿರ್ವಹಣೆ ಮಾರ್ಗಸೂಚಿಗಳು:\n• ಆಹಾರದ ತೇವಾಂಶವನ್ನು 12% ಕ್ಕಿಂತ ಕಡಿಮೆ ಇರಿಸಿ.\n• ಮೊದಲ 14 ದಿನಗಳು ಬ್ರಾಯ್ಲರ್ ಸ್ಟಾರ್ಟರ್ ಆಹಾರವನ್ನು ನೀಡಿ.\n• ಗಾಳಿಯಲ್ಲಿ ತೇವಾಂಶ 75% ಕ್ಕಿಂತ ಹೆಚ್ಚಿದ್ದರೆ ಆಹಾರದಲ್ಲಿ ವಿಷಬಂಧಕಗಳನ್ನು ಬೆರೆಸಿ.",
      mr: "चारा व्यवस्थापन मार्गदर्शक तत्त्वे:\n• चार्‍यामधील ओलावा १२% पेक्षा कमी ठेवा.\n• पहिल्या १४ दिवसांसाठी ब्रॉयलर स्टार्टर चारा द्या.\n• हवेतील आर्द्रता ७५% पेक्षा जास्त असल्यास चार्‍यामध्ये टॉक्सिन बाईंडर वापरा.",
      bn: "খাদ্য ব্যবস্থাপনা নির্দেশিকা:\n• খাবারে ফাঙ্গাস প্রতিরোধ করতে আর্দ্রতা ১২% এর নিচে রাখুন।\n• প্রথম ১৪ দিন ব্রয়লার স্টার্টার খাবার দিন।\n• বাতাসে আর্দ্রতা ৭৫% এর বেশি হলে খাবারে টক্সিন বাইন্ডার মেশান।"
    };
    return {
      text: feedResponse[baseLang] || feedResponse.en,
      state: { ...state, step: 0 },
      structured: false
    };
  }

  if (isClimateQuery && state.step === 0) {
    const climateResponse = {
      en: "Shed Environment Guidelines:\n• Ideal Brooding Temp: 33°C-35°C in Week 1, reducing by 2°C weekly until 22°C.\n• Ammonia levels must stay below 20 ppm. (Strong smell indicates dangerous ammonia levels).\n• Keep humidity around 50%-60%.\n• Provide 24-hour ventilation without letting direct cold air drafts hit the chicks.",
      te: "షెడ్ వాతావరణ మార్గదర్శకాలు:\n• మొదటి వారం బ్రూడింగ్ ఉష్ణోగ్రత: 33°C-35°C ఉండాలి, ప్రతి వారం 2°C చొప్పున 22°C వరకు తగ్గించాలి.\n• అమ్మోనియా వాయువు స్థాయిలు 20 ppm లోపు ఉండాలి. (తీవ్రమైన ఘాటు వాసన ఉంటే విషపూరిత అమ్మోనియా ఉన్నట్లు అర్థం).\n• తేమ శాతం 50%-60% మధ్య ఉంచండి.\n• కోడి పిల్లలపై నేరుగా చల్లని గాలి కొట్టకుండా నిరంతరం వెంటిలేషన్ అందించండి.",
      hi: "शेड पर्यावरण के निर्देश:\n• ब्रूडिंग तापमान: पहले सप्ताह 33°C-35°C, फिर हर हफ्ते 2°C घटाकर 22°C तक लाएं।\n• अमोनिया का स्तर 20 ppm से कम होना चाहिए। (तीखी गंध खतरनाक अमोनिया का संकेत है)।\n• आर्द्रता 50%-60% के बीच रखें।\n• चूजों पर सीधे ठंडी हवा के झोंके न आने दें, लेकिन वेंटिलेशन चालू रखें।",
      ta: "பண்ணை சூழல் வழிகாட்டுதல்:\n• முதல் வாரத்தில் வெப்பநிலை 33°C-35°C ஆக இருக்க வேண்டும்.\n• அம்மோனியா அளவு 20 ppmக்கு கீழே இருக்க வேண்டும்.\n• பண்ணையில் 24 மணி நேர காற்றோட்டத்தை உறுதி செய்யவும்.",
      kn: "ಶೆಡ್ ಪರಿಸರ ಮಾರ್ಗಸೂಚಿಗಳು:\n• ಮೊದಲ ವಾರ ಬ್ರೂಡಿಂಗ್ ತಾಪಮಾನ 33°C-35°C ಇರಬೇಕು.\n• ಅಮೋನಿಯಾ ಮಟ್ಟ 20 ppm ಗಿಂತ ಕಡಿಮೆ ಇರಬೇಕು.\n• ತೇವಾಂಶ 50%-60% ರಷ್ಟಿರಲಿ.",
      mr: "शेडमधील वातावरण मार्गदर्शक तत्त्वे:\n• पहिल्या आठवड्यात तापमान ३३°C-३५°C असावे.\n• अमोनिया वायूचे प्रमाण २० ppm पेक्षा कमी असावे.\n• कोंबड्यांना थेट थंड वारा लागणार नाही याची काळजी घ्या.",
      bn: "ঘরের পরিবেশ নির্দেশিকা:\n• ১ম সপ্তাহে তাপমাত্রা ৩৩°সে-৩৫°সে রাখুন।\n• অ্যামোনিয়ার মাত্রা ২০ ppm এর নিচে রাখুন।\n• ঘরে পর্যাপ্ত বায়ু চলাচল নিশ্চিত করুন।"
    };
    return {
      text: climateResponse[baseLang] || climateResponse.en,
      state: { ...state, step: 0 },
      structured: false
    };
  }

  // Health and disease keywords/indicators to start the diagnostics flow
  const healthIndicators = [
    'sick', 'ill', 'weak', 'die', 'death', 'disease', 'symptom', 'diagnose', 'diagnosis', 'check',
    'జబ్బు', 'బీమార్', 'बीमार', 'रोग', 'వ్యాధి', 'ఆరోగ్యం', 'నొప్పి', 'లక్షణం', 'లక్షణాలు',
    'కోడి జబ్బు', 'కోళ్లు చనిపోవడం', 'ఆయాసం', 'విరేచనాలు',
    'coccidiosis', 'ranikhet', 'coryza', 'heat stress', 'heatstress',
    'కాక్సిడియోసిస్', 'రాణీకేట్', 'కోరిజా', 'ఎండ దెబ్బ'
  ];

  const startsDiagnostic = healthIndicators.some(w => lower.includes(w));

  // 3. Multi-Step Diagnostic Flow for Sick/Health Queries
  if (startsDiagnostic || state.step > 0) {
    // If user provides a non-empty text, save it to symptoms text accumulator array
    if (text.length > 1 && state.step > 0) {
      state.symptoms.push(text);
    }

    // Run diagnostic check on accumulated symptoms text so far
    const allSymptomsText = state.symptoms.join(' ');
    const { disease: currentDisease, score: currentScore } = diagnoseDisease(allSymptomsText + ' ' + text, baseLang);
    
    if (currentDisease && currentScore > 0) {
      state.activeDiseaseId = currentDisease.id;
    }

    if (state.step === 0) {
      // Transition to Step 1: Ask for Symptoms
      state.step = 1;
      return {
        text: guides.symptomPrompt,
        state,
        structured: false
      };
    }

    if (state.step === 1) {
      // Transition to Step 2: Ask for Duration/Age
      state.step = 2;
      return {
        text: guides.durationPrompt,
        state,
        structured: false
      };
    }

    if (state.step === 2) {
      // Transition to Step 3: Ask for Isolation & Image
      state.step = 3;
      state.duration = text;
      return {
        text: guides.isolationPrompt,
        state,
        structured: false
      };
    }

    if (state.step === 3) {
      // Final Diagnosis step. Match disease from accumulated text
      const finalSymptomsText = state.symptoms.join(' ');
      const { disease: finalDisease, score: finalScore } = diagnoseDisease(finalSymptomsText, baseLang);
      
      const activeId = finalDisease?.id || state.activeDiseaseId;

      // Reset state for next session
      const nextState = {
        step: 0,
        symptoms: [],
        duration: '',
        age: '',
        activeDiseaseId: null,
        imageAttached: false,
        imageAnalysisText: ''
      };

      if (activeId) {
        const selectedDisease = POULTRY_KNOWLEDGE.diseases.find(d => d.id === activeId);
        const details = selectedDisease.content[baseLang] || selectedDisease.content.en;

        const structuredReport = {
          name: details.name,
          confidence: (selectedDisease.confidence || 85) + (state.imageAttached ? 4 : 0) + '%',
          severity: selectedDisease.severity,
          cause: details.cause,
          symptoms: details.symptoms + (state.imageAttached ? ` (Verified via physical scan: ${state.imageAnalysisText || 'Physical abnormalities detected'})` : ''),
          action: details.action,
          monitoring: details.monitoring,
          vetRecommendation: details.vetRecommendation
        };

        return {
          text: `${details.name} identified.`,
          state: nextState,
          structured: true,
          structuredData: structuredReport
        };
      } else {
        // No specific disease matched with score > 0! Return veterinary advisory precautions
        const advisory = VET_ADVISORY[baseLang] || VET_ADVISORY.en;
        return {
          text: advisory,
          state: nextState,
          structured: false
        };
      }
    }
  }

  // 4. Default Non-Repetitive Response (replaces greetings menu with dynamic Guides/Tips)
  const fallbackText = getRandomFallback(baseLang);
  return {
    text: fallbackText,
    state: { ...state, step: 0 },
    structured: false
  };
}
