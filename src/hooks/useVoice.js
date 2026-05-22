import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
  getSpeechRecognition
} from '../voice/voiceService';

export function useVoice() {
  const { i18n } = useTranslation();
  const langCode = i18n.language || 'en';
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);

  const recognizerRef = useRef(null);
  const isSupported = !!getSpeechRecognition();

  const handleStart = () => {
    setIsListening(true);
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  };

  const handleResult = ({ finalTranscript, interimTranscript: interim }) => {
    if (finalTranscript) {
      setTranscript(prev => prev + finalTranscript);
    }
    setInterimTranscript(interim);
  };

  const handleEnd = () => {
    setIsListening(false);
  };

  const handleError = (event) => {
    console.error('Speech recognition error:', event.error);
    setError(event.error);
    setIsListening(false);
  };

  // Re-create recognizer when language changes
  useEffect(() => {
    if (!isSupported) return;

    // Clean up current recognizer if it exists
    if (recognizerRef.current) {
      try {
        recognizerRef.current.abort();
      } catch (e) {
        console.error(e);
      }
    }

    recognizerRef.current = createSpeechRecognizer({
      langCode,
      onStart: handleStart,
      onResult: handleResult,
      onEnd: handleEnd,
      onError: handleError,
      continuous: false,
      interimResults: true
    });

    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, [langCode, isSupported]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('speech_not_supported');
      return;
    }
    if (recognizerRef.current && !isListening) {
      try {
        setIsListening(true);
        recognizerRef.current.start();
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
        setError(e.message);
        setIsListening(false);
      }
    }
  }, [isListening, isSupported]);

  const stopListening = useCallback(() => {
    if (recognizerRef.current && isListening) {
      try {
        recognizerRef.current.stop();
      } catch (e) {
        console.error('Failed to stop speech recognition:', e);
      }
    }
  }, [isListening]);

  const speak = useCallback(async (text) => {
    setIsSpeaking(true);
    try {
      await speakText(text, langCode);
    } catch (err) {
      console.error('Speech synthesis error:', err);
      setError(err.message || 'speech_synthesis_failed');
    } finally {
      setIsSpeaking(false);
    }
  }, [langCode]);

  const cancelSpeak = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return {
    isSupported,
    isListening,
    isSpeaking,
    transcript: transcript || interimTranscript,
    fullTranscript: transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    speak,
    cancelSpeak
  };
}
