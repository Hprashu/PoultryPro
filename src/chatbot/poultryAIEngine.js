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
  const lower = symptomsText.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;

  // Search through diseases and count matching keywords
  for (const disease of POULTRY_KNOWLEDGE.diseases) {
    let score = 0;
    // Score based on English and active language keywords
    const langKeywords = disease.keywords[lang] || [];
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

  // Fallback to Coccidiosis if keywords match general diarrhea/blood, or Ranikhet for neck twisting/paralysis
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
  const text = userInput.trim();
  const lower = text.toLowerCase();

  // 1. Check Domain Restriction
  if (checkOffTopic(text)) {
    return {
      text: POULTRY_KNOWLEDGE.generalGuides[lang]?.offTopic || POULTRY_KNOWLEDGE.generalGuides.en.offTopic,
      state: sessionState, // state unchanged
      structured: false
    };
  }

  // Retrieve templates
  const guides = POULTRY_KNOWLEDGE.generalGuides[lang] || POULTRY_KNOWLEDGE.generalGuides.en;

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

  // 2. Identify if this is a health/disease query or general topic
  const { disease, score } = diagnoseDisease(text + ' ' + state.symptoms.join(' '), lang);

  // If user explicitly asks about vaccination, feed, or climate separately without symptoms
  const isVaccineQuery = lower.includes('vaccine') || lower.includes('vaccination') || lower.includes('schedule') || lower.includes('టీకా') || lower.includes('टीकाकरण');
  const isFeedQuery = lower.includes('feed') || lower.includes('moisture') || lower.includes('eat') || lower.includes('మేత') || lower.includes('चारा');
  const isClimateQuery = lower.includes('temp') || lower.includes('temperature') || lower.includes('ammonia') || lower.includes('ventilation') || lower.includes('ఉష్ణోగ్రత') || lower.includes('तापमान');

  if (isVaccineQuery && state.step === 0) {
    const vaccineResponse = {
      en: "Standard Poultry Vaccination Schedule:\n• Day 1: HVT (Marek's Disease) at hatchery\n• Day 7: Lasota Vaccine (Ranikhet / Newcastle disease) in eye/nasal drop\n• Day 14: Gumboro / IBD Vaccine in drinking water\n• Day 21: Lasota Booster in drinking water\nKeep drinkers clean and disinfect 24 hours prior to administration.",
      te: "పౌల్ట్రీ టీకాల పట్టిక:\n• 1వ రోజు: హేచరీ వద్ద HVT (మారెక్స్ వ్యాధి)\n• 7వ రోజు: కంటి లేదా ముక్కు చుక్కల ద్వారా లాసోటా వ్యాక్సిన్ (రాణీకేట్ వ్యాధి)\n• 14వ రోజు: తాగే నీటిలో గుంబోరో / IBD వ్యాక్సిన్\n• 21వ రోజు: తాగే నీటిలో లాసోటా బూస్టర్ డోస్\nవ్యాక్సిన్ వేసే ముందు నీటి తొట్టెలను 24 గంటల ముందే కడిగి ఉంచండి.",
      hi: "मुर्गियों के लिए मानक टीकाकरण अनुसूची:\n• दिन 1: हैचरी पर HVT (मारेक्स रोग) का टीका\n• दिन 7: आँख या नाक में लासोटा टीका (रानीखेत रोग से बचाव)\n• दिन 14: पीने के पानी में गंबोरो / IBD टीका\n• दिन 21: पीने के पानी में लासोटा बूस्टर डोज़\nटीका देने से 24 घंटे पहले पानी के बर्तनों को अच्छी तरह साफ कर लें।"
    };
    return {
      text: vaccineResponse[lang] || vaccineResponse.en,
      state: { ...state, step: 0 },
      structured: false
    };
  }

  if (isFeedQuery && state.step === 0) {
    const feedResponse = {
      en: "Feed Management Guidelines:\n• Keep feed moisture below 12% to prevent mold (Aflatoxins).\n• Broiler chicks require Broiler Starter (high protein) for 1-14 days, followed by Broiler Finisher.\n• Ensure feeding space of 2.5 inches per bird.\n• Add toxin binders to feed if humidity is above 75%.",
      te: "మేత నిర్వహణ మార్గదర్శకాలు:\n• మేతలో బూజు (అఫ్లాటాక్సిన్) రాకుండా తేమ శాతం 12% లోపు ఉంచండి.\n• మొదటి 14 రోజులు బ్రాయిలర్ స్టార్టర్ (అధిక ప్రొటీన్) మేత వేయాలి, ఆ తర్వాత ఫినిషర్ వేయాలి.\n• ప్రతి కోడికి మేత తొట్టె వద్ద 2.5 అంగుళాల స్థలం ఉండేలా చూసుకోండి.\n• వాతావరణంలో తేమ 75% దాటినప్పుడు మేతలో టాక్సిన్ బైండర్లను కలపండి.",
      hi: "चारा प्रबंधन के निर्देश:\n• फंगस (अफ़लाटॉक्सिन) से बचाने के लिए चारे में नमी का स्तर 12% से कम रखें।\n• ब्रूडिंग चूजों को पहले 1-14 दिन ब्रायलर स्टार्टर (उच्च प्रोटीन) दें, उसके बाद फिनिशर दें।\n• प्रति पक्षी कम से कम 2.5 इंच चारे के बर्तन की जगह दें।\n• हवा में आर्द्रता 75% से अधिक होने पर चारे में टॉक्सिन बाइंडर मिलाएं।"
    };
    return {
      text: feedResponse[lang] || feedResponse.en,
      state: { ...state, step: 0 },
      structured: false
    };
  }

  if (isClimateQuery && state.step === 0) {
    const climateResponse = {
      en: "Shed Environment Guidelines:\n• Ideal Brooding Temp: 33°C-35°C in Week 1, reducing by 2°C weekly until 22°C.\n• Ammonia levels must stay below 20 ppm. (Strong smell indicates dangerous ammonia levels).\n• Keep humidity around 50%-60%.\n• Provide 24-hour ventilation without letting direct cold air drafts hit the chicks.",
      te: "షెడ్ వాతావరణ మార్గదర్శకాలు:\n• మొదటి వారం బ్రూడింగ్ ఉష్ణోగ్రత: 33°C-35°C ఉండాలి, ప్రతి వారం 2°C చొప్పున 22°C వరకు తగ్గించాలి.\n• అమ్మోనియా వాయువు స్థాయిలు 20 ppm లోపు ఉండాలి. (తీవ్రమైన ఘాటు వాసన ఉంటే విషపూరిత అమ్మోనియా ఉన్నట్లు అర్థం).\n• తేమ శాతం 50%-60% మధ్య ఉంచండి.\n• కోడి పిల్లలపై నేరుగా చల్లని గాలి కొట్టకుండా నిరంతరం వెంటిలేషన్ అందించండి.",
      hi: "शेड पर्यावरण के निर्देश:\n• ब्रूडिंग तापमान: पहले सप्ताह 33°C-35°C, फिर हर हफ्ते 2°C घटाकर 22°C तक लाएं।\n• अमोनिया का स्तर 20 ppm से कम होना चाहिए। (तीखी गंध खतरनाक अमोनिया का संकेत है)।\n• आर्द्रता 50%-60% के बीच रखें।\n• चूजों पर सीधे ठंडी हवा के झोंके न आने दें, लेकिन वेंटिलेशन चालू रखें।"
    };
    return {
      text: climateResponse[lang] || climateResponse.en,
      state: { ...state, step: 0 },
      structured: false
    };
  }

  // 3. Multi-Step Diagnostic Flow for Sick/Health Queries
  if (disease || lower.includes('sick') || lower.includes('ill') || lower.includes('weak') || lower.includes('die') || lower.includes('జబ్బు') || lower.includes('బీమార్') || state.step > 0) {
    
    // Save symptoms if mentioned
    if (disease && !state.symptoms.includes(disease.id)) {
      state.symptoms.push(disease.id);
      state.activeDiseaseId = disease.id;
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
      // User replied with symptoms. Transition to Step 2: Ask for Duration/Age
      state.step = 2;
      return {
        text: guides.durationPrompt,
        state,
        structured: false
      };
    }

    if (state.step === 2) {
      // User replied with duration/age. Transition to Step 3: Ask for Isolation & Image
      state.step = 3;
      // Capture age/duration from text if possible
      state.duration = text;
      return {
        text: guides.isolationPrompt,
        state,
        structured: false
      };
    }

    if (state.step === 3) {
      // User replied to isolation. Generate structured diagnostic report.
      const selectedDisease = POULTRY_KNOWLEDGE.diseases.find(d => d.id === state.activeDiseaseId) || POULTRY_KNOWLEDGE.diseases[0];
      const details = selectedDisease.content[lang] || selectedDisease.content.en;

      // Complete visual scan data
      const structuredReport = {
        name: details.name,
        confidence: selectedDisease.confidence + (state.imageAttached ? 4 : 0) + '%',
        severity: selectedDisease.severity,
        cause: details.cause,
        symptoms: details.symptoms + (state.imageAttached ? ` (Verified via physical scan: ${state.imageAnalysisText || 'Physical abnormalities detected'})` : ''),
        action: details.action,
        monitoring: details.monitoring,
        vetRecommendation: details.vetRecommendation
      };

      // Reset state
      const nextState = {
        step: 0,
        symptoms: [],
        duration: '',
        age: '',
        activeDiseaseId: null,
        imageAttached: false,
        imageAnalysisText: ''
      };

      return {
        text: `${details.name} identified.`,
        state: nextState,
        structured: true,
        structuredData: structuredReport
      };
    }
  }

  // Default response
  const textMap = POULTRY_KNOWLEDGE.generalGuides[lang] || POULTRY_KNOWLEDGE.generalGuides.en;
  return {
    text: textMap.welcome,
    state: { ...state, step: 0 },
    structured: false
  };
}
