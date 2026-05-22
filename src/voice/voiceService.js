// Speech Recognition & Synthesis service wrapper for PoultryPro

const LANGUAGE_LOCALE_MAP = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  mr: 'mr-IN',
  bn: 'bn-IN'
};

export const getLocaleCode = (langCode) => {
  return LANGUAGE_LOCALE_MAP[langCode] || 'en-IN';
};

// Text-to-Speech (Speech Synthesis)
export const speakText = (text, langCode = 'en', options = {}) => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech Synthesis not supported in this browser.'));
      return;
    }

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const locale = getLocaleCode(langCode);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    
    // Set custom speed/pitch/volume if provided
    utterance.rate = options.rate || parseFloat(localStorage.getItem('poultrypro-speech-rate')) || 0.9;
    utterance.pitch = options.pitch || parseFloat(localStorage.getItem('poultrypro-speech-pitch')) || 1.0;
    utterance.volume = options.volume || parseFloat(localStorage.getItem('poultrypro-speech-volume')) || 1.0;

    // Try to find a matching voice in the browser
    const voices = window.speechSynthesis.getVoices();
    // Search for a voice matching the target locale (e.g. te-IN)
    let selectedVoice = voices.find(voice => voice.lang === locale || voice.lang.startsWith(locale));
    
    // If not found, try to find a voice matching the base language (e.g. hi)
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.startsWith(langCode));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (event) => {
      reject(event);
    };

    window.speechSynthesis.speak(utterance);
  });
};

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Speech-to-Text (Speech Recognition)
export const getSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }
  return SpeechRecognition;
};

export const createSpeechRecognizer = ({
  langCode = 'en',
  onResult,
  onEnd,
  onError,
  onStart,
  continuous = false,
  interimResults = false
}) => {
  const SpeechRecognition = getSpeechRecognition();
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = getLocaleCode(langCode);
  recognition.continuous = continuous;
  recognition.interimResults = interimResults;

  if (onStart) recognition.onstart = onStart;
  
  recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    if (onResult) {
      onResult({ finalTranscript, interimTranscript });
    }
  };

  recognition.onerror = (event) => {
    if (onError) onError(event);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
};
