import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Mic, MicOff, Send, Volume2, VolumeX, Shield, 
  AlertTriangle, Phone, Clock, ArrowRight, User, Heart, Info, Check, HelpCircle,
  Camera, RefreshCw, Paperclip, Plus, Trash2, Play, CheckCircle2, FileText, Image, Search, X,
  History, MessageSquare, ShieldAlert, Activity
} from 'lucide-react';
import AppShell from '../components/ui/AppShell.jsx';
import { useVoice } from '../hooks/useVoice';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { addDocument, deleteDocument, getDocuments, COLLECTIONS, where, orderBy } from '../firebase';
import { cn } from '../lib/ui.js';
import { processAIChatEngine } from '../chatbot/poultryAIEngine';

export default function AIAssistant() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const lang = i18n.language || 'en';

  // Toggle & mobile layout states
  const [activeMobileTab, setActiveMobileTab] = useState('chat'); // 'history', 'chat', 'telemetry'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Session states
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  
  // Message states
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [sessionState, setSessionState] = useState({ step: 0, symptoms: [] });
  const [isThinking, setIsThinking] = useState(false);
  const [ttsMuted, setTtsMuted] = useState(false);

  // Vision scan simulation states
  const [attachedImage, setAttachedImage] = useState(null);
  const [attachedImagePreview, setAttachedImagePreview] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Web Speech Config Sliders
  const [speechSpeed, setSpeechSpeed] = useState(() => parseFloat(localStorage.getItem('poultrypro-speech-rate')) || 0.9);
  const [speechVolume, setSpeechVolume] = useState(() => parseFloat(localStorage.getItem('poultrypro-speech-volume')) || 1.0);

  // Webcam states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const processedQueryRef = useRef(null);

  // Voice recognition / synthesis hook
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

  // Load chat sessions on mount / login
  const loadSessions = async () => {
    if (!user) return;
    try {
      const dbSessions = await getDocuments(COLLECTIONS.chatSessions, [
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      ]);
      setSessions(dbSessions);
      if (dbSessions.length > 0 && !activeSessionId) {
        setActiveSessionId(dbSessions[0].id);
      }
    } catch (err) {
      console.warn("Firestore sessions loading failed, loading from local cache:", err);
      const local = localStorage.getItem(`poultrypro_chatsessions_${user.uid}`);
      if (local) {
        const parsed = JSON.parse(local);
        setSessions(parsed);
        if (parsed.length > 0 && !activeSessionId) {
          setActiveSessionId(parsed[0].id);
        }
      }
    }
  };

  // Load messages for the selected session
  const loadActiveMessages = async (sessionId) => {
    if (!user || !sessionId) return;
    setIsThinking(true);
    try {
      const dbMessages = await getDocuments(COLLECTIONS.chatHistory, [
        where('sessionId', '==', sessionId),
        orderBy('createdAt', 'asc')
      ]);
      setMessages(dbMessages);
      
      // Attempt to restore conversational step state by looking at the last message state info
      const lastAiMsg = [...dbMessages].reverse().find(m => m.sender === 'ai');
      if (lastAiMsg && lastAiMsg.state) {
        setSessionState(lastAiMsg.state);
      } else {
        setSessionState({ step: 0, symptoms: [] });
      }
    } catch (err) {
      console.warn("Firestore messages loading failed, loading from local cache:", err);
      const localMsg = localStorage.getItem(`poultrypro_chatmsg_${sessionId}`);
      if (localMsg) {
        setMessages(JSON.parse(localMsg));
      }
    } finally {
      setIsThinking(false);
    }
  };

  // Sync speech config adjustments to localStorage
  useEffect(() => {
    localStorage.setItem('poultrypro-speech-rate', speechSpeed.toString());
  }, [speechSpeed]);

  useEffect(() => {
    localStorage.setItem('poultrypro-speech-volume', speechVolume.toString());
  }, [speechVolume]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  // Load message logs when active session changes
  useEffect(() => {
    if (activeSessionId) {
      loadActiveMessages(activeSessionId);
    } else {
      setMessages([{
        id: 'welcome',
        sender: 'ai',
        text: t('voice.welcome', 'Hello! I am your AI Poultry Assistant. Speak to me about symptoms, vaccination, feed, or temperature. How can I help your farm today?'),
        createdAt: new Date().toISOString()
      }]);
      setSessionState({ step: 0, symptoms: [] });
    }
  }, [activeSessionId]);

  // Handle URL templates query processing (e.g. ?q=sick)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryKey = searchParams.get('q');
    if (queryKey && processedQueryRef.current !== queryKey) {
      processedQueryRef.current = queryKey;
      const queryTemplates = {
        en: {
          sick: "My birds are sick",
          vaccine: "What is the vaccination schedule?",
          feed: "How should I feed broilers?"
        },
        te: {
          sick: "నా కోళ్లకు జబ్బు చేసింది",
          vaccine: "లసానియా టీకా షెడ్యూల్",
          feed: "మేతలో తేమ శాతం ఎంత ఉండాలి?"
        },
        hi: {
          sick: "मेरी मुर्गियाँ बीमार हैं",
          vaccine: "टीकाकरण समय सारिणी",
          feed: "चारे में नमी कितनी होनी चाहिए?"
        },
        ta: {
          sick: "என் பறவைகள் நோய்வாய்ப்பட்டுள்ளன",
          vaccine: "தடுப்பூசி அட்டவணை என்ன?",
          feed: "தீவன ஈரப்பதம் எவ்வளவு இருக்க வேண்டும்?"
        },
        kn: {
          sick: "ನನ್ನ ಕೋಳಿಗಳು ಅನಾರೋಗ್ಯದಿಂದ ಇವೆ",
          vaccine: "ಲಸಿಕೆ ವೇಳಾಪಟ್ಟಿ ಏನು?",
          feed: "ಆಹಾರದ ತೇವಾಂಶ ಎಷ್ಟಿರಬೇಕು?"
        },
        mr: {
          sick: "माझ्या कोंबड्या आजारी आहेत",
          vaccine: "लसीकरणाचे वेळापत्रक काय आहे?",
          feed: "खाद्यातील ओलावा किती असावा?"
        },
        bn: {
          sick: "আমার মুরগিগুলি অসুস্থ",
          vaccine: "টিকা দেওয়ার সময়সূচী কী?",
          feed: "খাবারের আর্দ্রতা কত হওয়া উচিত?"
        }
      };

      const langMap = queryTemplates[lang] || queryTemplates.en;
      const textToExecute = langMap[queryKey] || queryKey;
      
      setTimeout(() => {
        handleSendMessage(textToExecute);
      }, 1000);
    }
  }, [location.search, lang]);

  // Sync mic transcript to text input
  useEffect(() => {
    if (fullTranscript) {
      setInputVal(fullTranscript);
    }
  }, [fullTranscript]);

  // Show mic permission error alerts
  useEffect(() => {
    if (voiceError === 'not-allowed') {
      showToast(t('voice.mic_permission_denied'), 'error');
    }
  }, [voiceError, showToast, t]);

  // Scroll timeline to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isListening, isThinking, isScanning]);

  // Create a new session
  const handleCreateNewSession = async () => {
    if (!user) return;
    const newSession = {
      title: 'New Discussion',
      userId: user.uid,
      updatedAt: new Date().toISOString()
    };

    let sessionObj = null;
    try {
      const ref = await addDocument(COLLECTIONS.chatSessions, newSession, user.uid);
      sessionObj = { id: ref.id, ...newSession };
    } catch (e) {
      sessionObj = { id: `local-session-${Date.now()}`, ...newSession };
      const current = [sessionObj, ...sessions];
      localStorage.setItem(`poultrypro_chatsessions_${user.uid}`, JSON.stringify(current));
    }

    setSessions(prev => [sessionObj, ...prev]);
    setActiveSessionId(sessionObj.id);
    setSessionState({ step: 0, symptoms: [] });
    setMessages([]);
    setActiveMobileTab('chat');
  };

  // Delete a session
  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await deleteDocument(COLLECTIONS.chatSessions, sessionId);
    } catch (err) {
      console.warn("Delete from DB failed, updating cache:", err);
    }
    const filtered = sessions.filter(s => s.id !== sessionId);
    setSessions(filtered);
    localStorage.setItem(`poultrypro_chatsessions_${user?.uid}`, JSON.stringify(filtered));
    localStorage.removeItem(`poultrypro_chatmsg_${sessionId}`);
    
    if (activeSessionId === sessionId) {
      setActiveSessionId(filtered[0]?.id || null);
    }
  };

  // Save message helper
  const saveMessage = async (msgObj, sessionId) => {
    if (!user) return;
    try {
      await addDocument(COLLECTIONS.chatHistory, msgObj, user.uid);
    } catch (e) {
      const cached = localStorage.getItem(`poultrypro_chatmsg_${sessionId}`);
      const list = cached ? JSON.parse(cached) : [];
      list.push(msgObj);
      localStorage.setItem(`poultrypro_chatmsg_${sessionId}`, JSON.stringify(list));
    }
  };

  // Send message
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim() && !attachedImage) return;

    let currentSessionId = activeSessionId;
    
    // Create new session if none is active
    if (!currentSessionId && user) {
      const tempTitle = text.slice(0, 20) || 'Image Diagnostic';
      const newSession = {
        title: tempTitle,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      };
      try {
        const ref = await addDocument(COLLECTIONS.chatSessions, newSession, user.uid);
        currentSessionId = ref.id;
        setActiveSessionId(ref.id);
        setSessions(prev => [{ id: ref.id, ...newSession }, ...prev]);
      } catch (err) {
        currentSessionId = `local-session-${Date.now()}`;
        setActiveSessionId(currentSessionId);
        const list = [{ id: currentSessionId, ...newSession }];
        localStorage.setItem(`poultrypro_chatsessions_${user.uid}`, JSON.stringify(list));
        setSessions(list);
      }
    }

    const messageId = `msg-user-${Date.now()}`;
    const userMsg = {
      id: messageId,
      sessionId: currentSessionId,
      sender: 'user',
      text: text,
      createdAt: new Date().toISOString()
    };

    if (attachedImagePreview) {
      userMsg.image = attachedImagePreview;
    }

    // Add to chat list and reset inputs
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    const tempAttachedPreview = attachedImagePreview;
    setAttachedImage(null);
    setAttachedImagePreview('');

    // Save user message to database
    saveMessage(userMsg, currentSessionId);

    // Image scan simulation overlay delay (2 seconds)
    let imageAnalysisText = '';
    if (tempAttachedPreview) {
      setIsScanning(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsScanning(false);
      imageAnalysisText = "Physical abnormalities detected: ruffled feathers, drooping wings, and lethargic posture.";
      setSessionState(prev => ({ ...prev, imageAttached: true, imageAnalysisText }));
    }

    // Thinking state loading
    setIsThinking(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const activeState = {
      ...sessionState,
      imageAttached: !!tempAttachedPreview,
      imageAnalysisText
    };

    // Process diagnostic engine
    const aiResult = processAIChatEngine(text, activeState, lang);
    setSessionState(aiResult.state);

    const aiMsg = {
      id: `msg-ai-${Date.now()}`,
      sessionId: currentSessionId,
      sender: 'ai',
      text: aiResult.text,
      createdAt: new Date().toISOString(),
      structured: aiResult.structured,
      state: aiResult.state
    };

    if (aiResult.structuredData) {
      aiMsg.structuredData = aiResult.structuredData;
    }

    setMessages(prev => [...prev, aiMsg]);
    setIsThinking(false);

    // Save AI response
    saveMessage(aiMsg, currentSessionId);

    // Trigger Text-to-Speech synthesis
    if (!ttsMuted) {
      const spokenText = aiResult.structuredData
        ? `${aiResult.structuredData.name}. Risk level is ${aiResult.structuredData.severity}. Recommended immediate action is: ${aiResult.structuredData.action}`
        : aiResult.text;
      speak(spokenText);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      cancelSpeak();
      startListening();
    }
  };

  // Image upload selector
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedImage(file);
      setAttachedImagePreview(URL.createObjectURL(file));
      showToast("Photo attached. Ready for diagnostics.", "success");
    }
  };

  // Webcam stream handlers
  const startCamera = async () => {
    setAttachedImage(null);
    setAttachedImagePreview('');
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      });
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 300);
    } catch (err) {
      console.error("Camera access failed: ", err);
      showToast("Could not access camera. Please upload file instead.", "error");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg');
    setAttachedImagePreview(dataUrl);
    setAttachedImage(dataUrl);
    stopCamera();
    showToast("Photo captured successfully!", "success");
  };

  // Fetch localized guides and quick chips
  const getQuickCommands = () => {
    switch (lang) {
      case 'te':
        return [
          { text: "నా కోళ్లకు జబ్బు చేసింది", label: "కోళ్ల అనారోగ్యం" },
          { text: "లసానియా టీకా షెడ్యూల్", label: "టీకాల పట్టిక" },
          { text: "మేతలో తేమ శాతం ఎంత ఉండాలి?", label: "కోళ్ల మేత నియమాలు" },
          { text: "షెడ్డు ఉష్ణోగ్రత ఎంత ఉండాలి?", label: "ఉష్ణోగ్రత మార్గదర్శకాలు" }
        ];
      case 'hi':
        return [
          { text: "मेरी मुर्गियाँ बीमार हैं", label: "मुर्गी रोग सहायता" },
          { text: "टीकाकरण समय सारिणी", label: "वैक्सीन गाइड" },
          { text: "चारे में नमी कितनी होनी चाहिए?", label: "चारा प्रबंधन" },
          { text: "ब्रूडर का सही तापमान क्या है?", label: "तापमान नियम" }
        ];
      default:
        return [
          { text: "My birds are sick", label: "Poultry Disease" },
          { text: "What is the vaccination schedule?", label: "Vaccines Info" },
          { text: "How should I feed broilers?", label: "Feed Standards" },
          { text: "What is the ideal brooder temp?", label: "Climate Control" }
        ];
    }
  };

  // Sync Telemetry metrics based on current active diagnosed disease
  const activeDisease = useMemo(() => {
    if (sessionState.activeDiseaseId) return sessionState.activeDiseaseId;
    
    // Scan messages backwards for diagnostic cards
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'ai' && messages[i].structuredData) {
        return messages[i].structuredData.name?.toLowerCase() || '';
      }
    }
    return '';
  }, [sessionState.activeDiseaseId, messages]);

  const telemetry = useMemo(() => {
    const isCoccidiosis = activeDisease.includes('coccidiosis') || activeDisease.includes('protozoal') || activeDisease.includes('కాక్సిడియోసిస్') || activeDisease.includes('कोक्सीडियोसिस');
    const isHeatStress = activeDisease.includes('heat') || activeDisease.includes('stress') || activeDisease.includes('ఎండ') || activeDisease.includes('गर्मी');
    const isNewcastle = activeDisease.includes('ranikhet') || activeDisease.includes('newcastle') || activeDisease.includes('రాణీకేట్') || activeDisease.includes('रानीखेत');
    const isCoryza = activeDisease.includes('coryza') || activeDisease.includes('కోరిజా') || activeDisease.includes('कोरिजा');

    return {
      temp: isHeatStress ? { value: '37.8°C', status: 'critical', desc: 'Critical: Extreme Heat' } : { value: '33.2°C', status: 'optimal', desc: 'Optimal Brooding Temp' },
      moisture: isCoccidiosis ? { value: '14.9%', status: 'warning', desc: 'Warning: Mold Risk' } : { value: '11.2%', status: 'optimal', desc: 'Safe (<12% Moisture)' },
      ammonia: (isNewcastle || isCoryza) ? { value: '26 ppm', status: 'critical', desc: 'Danger: Poor Ventilation' } : { value: '12 ppm', status: 'optimal', desc: 'Safe (<20 ppm Ammonia)' }
    };
  }, [activeDisease]);

  const getSeverityBadge = (sev) => {
    if (sev === 'critical') return 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400';
    if (sev === 'medium') return 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400';
    return 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => 
      s.title && s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sessions, searchQuery]);

  return (
    <AppShell>
      <div className="relative min-h-[calc(100vh-4rem)] p-4 lg:p-6 bg-surface-50 dark:bg-slate-950">
        {/* Holographic glowing backgrounds */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-20 right-1/4 h-80 w-80 rounded-full bg-green-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl relative z-10 flex flex-col gap-6">
          
          {/* Top Panel Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-black text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  {t('voice.assistant_title', 'AI Voice Companion')}
                </span>
                <h1 className="font-heading text-xl font-black text-surface-950 dark:text-white mt-0.5">
                  PoultryPro AI Assistant
                </h1>
                <p className="text-xs font-semibold text-surface-500 dark:text-slate-400">
                  Indian village-friendly smart diagnostic voice guide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <button
                onClick={() => {
                  setTtsMuted(!ttsMuted);
                  if (!ttsMuted) cancelSpeak();
                }}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black shadow-sm transition",
                  ttsMuted 
                    ? "border-red-200 bg-red-50 text-red-500 dark:border-red-500/20 dark:bg-red-500/10" 
                    : "border-surface-200 bg-white text-surface-600 hover:text-emerald-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                )}
              >
                {ttsMuted ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5" />
                    <span>Muted</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Voice Answers On</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile responsive navigation tabs */}
          <div className="flex lg:hidden border-b border-surface-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveMobileTab('history')}
              className={cn(
                "flex-1 text-center py-2 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5",
                activeMobileTab === 'history' ? 'bg-emerald-500 text-white' : 'text-surface-600 dark:text-slate-400'
              )}
            >
              <History className="h-3.5 w-3.5" />
              <span>History</span>
            </button>
            <button
              onClick={() => setActiveMobileTab('chat')}
              className={cn(
                "flex-1 text-center py-2 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5",
                activeMobileTab === 'chat' ? 'bg-emerald-500 text-white' : 'text-surface-600 dark:text-slate-400'
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Assistant</span>
            </button>
            <button
              onClick={() => setActiveMobileTab('telemetry')}
              className={cn(
                "flex-1 text-center py-2 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5",
                activeMobileTab === 'telemetry' ? 'bg-emerald-500 text-white' : 'text-surface-600 dark:text-slate-400'
              )}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Telemetry & Tips</span>
            </button>
          </div>

          {/* Core Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Left Pane (Sidebar): Sessions History */}
            <div className={cn(
              "lg:col-span-1 flex flex-col h-[620px] rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/50 overflow-hidden",
              activeMobileTab === 'history' ? 'flex' : 'hidden lg:flex'
            )}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading text-xs font-black uppercase text-surface-400 dark:text-slate-500 tracking-wider">
                  Discussions
                </h2>
                <button
                  onClick={handleCreateNewSession}
                  className="flex items-center gap-1 text-[11px] font-black text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Chat</span>
                </button>
              </div>

              {/* Session Search Bar */}
              <div className="relative mb-3.5">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-surface-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-white/50 pl-9 pr-4 py-2 text-xs text-surface-850 outline-none focus:border-emerald-500 dark:border-white/5 dark:bg-slate-950/40 dark:text-white"
                />
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-surface-400 dark:text-slate-500">
                    No discussions found.
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => {
                        setActiveSessionId(session.id);
                        setActiveMobileTab('chat');
                      }}
                      className={cn(
                        "group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition",
                        activeSessionId === session.id
                          ? "border-emerald-500/40 bg-emerald-500/5 dark:border-emerald-500/20"
                          : "border-surface-150 bg-white/40 hover:bg-white/90 dark:border-white/5 dark:bg-slate-950/10 dark:hover:bg-slate-950/30"
                      )}
                    >
                      <div className="flex flex-col min-w-0 flex-1 mr-2">
                        <span className="text-xs font-black truncate text-surface-850 dark:text-slate-200">
                          {session.title || 'Untitled Session'}
                        </span>
                        <span className="text-[10px] text-surface-400 dark:text-slate-500 font-semibold mt-0.5">
                          {session.updatedAt ? new Date(session.updatedAt).toLocaleDateString() : 'Active now'}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-surface-400 dark:text-slate-500 transition shrink-0"
                        title="Delete session"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Center Pane: Active Diagnostic Chatroom */}
            <div className={cn(
              "lg:col-span-2 flex flex-col h-[620px] rounded-2xl border border-white/60 bg-white/70 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/50 overflow-hidden relative",
              activeMobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
            )}>
              {/* Scan beam CSS keyframes injection */}
              <style>{`
                @keyframes scanner-laser {
                  0% { top: 0%; opacity: 0.8; }
                  50% { top: 100%; opacity: 1; }
                  100% { top: 0%; opacity: 0.8; }
                }
                .scanner-beam-line {
                  animation: scanner-laser 2.2s ease-in-out infinite;
                }
              `}</style>

              {/* Live Webcam Streaming Capture overlay */}
              {cameraActive && (
                <div className="absolute inset-0 bg-slate-950/95 z-40 flex flex-col items-center justify-center p-6">
                  <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-72 object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-emerald-500/40 pointer-events-none rounded-2xl m-4" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                      <button
                        onClick={capturePhoto}
                        className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black px-4 py-2.5 text-xs shadow-lg transition"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Take Photo</span>
                      </button>
                      <button
                        onClick={stopCamera}
                        className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black px-4 py-2.5 text-xs border border-white/10 transition"
                      >
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold mt-4 text-center">
                    Align chicken droppings or physical lesions within the frame
                  </p>
                </div>
              )}

              {/* Message History timeline screen */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* Vet warning banner */}
                <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl flex gap-3 text-xs text-amber-800 dark:text-amber-300">
                  <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
                  <div>
                    <span className="font-black block uppercase tracking-wider text-[10px]">Biosecurity advisory</span>
                    <p className="font-semibold leading-normal mt-0.5">
                      Check symptoms carefully. This assistant provides automated biometric advice. Call a veterinarian if bird mortality exceeds 2%.
                    </p>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        msg.sender === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.sender === 'ai' && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 mt-1">
                          <Sparkles className="h-4.5 w-4.5" />
                        </div>
                      )}

                      <div className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm relative leading-relaxed",
                        msg.sender === 'user'
                          ? "bg-emerald-500 text-white rounded-tr-none"
                          : "bg-surface-100 text-surface-850 dark:bg-white/5 dark:text-slate-100 rounded-tl-none border border-surface-200 dark:border-white/5"
                      )}>
                        
                        {/* Attached Image preview in message bubble */}
                        {msg.image && (
                          <div className="rounded-lg overflow-hidden border border-white/20 mb-2 max-w-[200px]">
                            <img src={msg.image} alt="Biometric preview" className="w-full object-cover max-h-36" />
                          </div>
                        )}

                        {/* Text reply or diagnostic structured report */}
                        {!msg.structuredData ? (
                          <p className="whitespace-pre-line">{msg.text}</p>
                        ) : (
                          <div className="space-y-3.5">
                            <div className="flex items-center justify-between border-b pb-1.5 border-surface-200 dark:border-white/10">
                              <span className="font-heading font-black text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Diagnostic Audit
                              </span>
                              <span className="text-[10px] font-black bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-600 dark:text-emerald-400">
                                Confidence: {msg.structuredData.confidence}
                              </span>
                            </div>

                            {/* Alert risk level card */}
                            <div className={cn(
                              "border p-2.5 rounded-lg text-xs font-bold flex items-center gap-2",
                              getSeverityBadge(msg.structuredData.severity)
                            )}>
                              <AlertTriangle className="h-4 w-4 shrink-0" />
                              <span className="capitalize">{msg.structuredData.severity} Threat Alarm</span>
                            </div>

                            {/* Diagnostic data indices */}
                            <div className="space-y-2.5 text-xs">
                              <div>
                                <span className="font-black text-surface-450 dark:text-slate-500 block uppercase text-[10px]">Diagnosed Condition:</span>
                                <span className="font-semibold text-surface-950 dark:text-slate-100">{msg.structuredData.name}</span>
                              </div>
                              <div>
                                <span className="font-black text-surface-450 dark:text-slate-500 block uppercase text-[10px]">Observed Pathogenesis:</span>
                                <span className="text-surface-800 dark:text-slate-350">{msg.structuredData.cause}</span>
                              </div>
                              <div>
                                <span className="font-black text-surface-450 dark:text-slate-500 block uppercase text-[10px]">Reported Symptoms:</span>
                                <span className="text-surface-800 dark:text-slate-350">{msg.structuredData.symptoms}</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-red-500/5 dark:bg-red-500/10 border border-red-500/10">
                                <span className="font-black text-red-600 dark:text-red-400 block uppercase text-[10px]">Immediate Biosecurity Actions:</span>
                                <span className="font-semibold text-red-700 dark:text-red-300 leading-normal">{msg.structuredData.action}</span>
                              </div>
                              <div>
                                <span className="font-black text-surface-450 dark:text-slate-500 block uppercase text-[10px]">Shed Monitoring:</span>
                                <span className="text-surface-800 dark:text-slate-350">{msg.structuredData.monitoring}</span>
                              </div>
                              <div>
                                <span className="font-black text-surface-450 dark:text-slate-500 block uppercase text-[10px]">Veterinary Prescription:</span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{msg.structuredData.vetRecommendation}</span>
                              </div>
                            </div>

                            {/* Call Vet Action */}
                            {msg.structuredData.severity === 'critical' && (
                              <a
                                href="tel:+919440123456"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 py-2.5 text-center text-xs font-black text-white shadow-lg transition"
                              >
                                <Phone className="h-4 w-4" />
                                <span>Call Emergency Vet (Dr. Rao)</span>
                              </a>
                            )}
                          </div>
                        )}

                        {/* Speech output trigger */}
                        <div className="mt-2 flex items-center justify-between text-[10px] text-surface-400 dark:text-slate-500 border-t pt-1.5 border-surface-200/40 dark:border-white/5">
                          <span>{msg.sender === 'user' ? 'You' : 'AI Companion'}</span>
                          {msg.sender === 'ai' && (
                            <button
                              onClick={() => {
                                const textToSpeak = msg.structuredData 
                                  ? `${msg.structuredData.name}. Risk level is ${msg.structuredData.severity}. Immediate Action: ${msg.structuredData.action}. Veterinary advice is: ${msg.structuredData.vetRecommendation}`
                                  : msg.text;
                                speak(textToSpeak);
                              }}
                              className="flex items-center gap-1 hover:text-emerald-500 transition text-[10px] font-bold p-0.5"
                              title="Listen to response"
                            >
                              <Play className="h-3 w-3" />
                              <span>Listen</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {msg.sender === 'user' && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md mt-1">
                          <User className="h-4.5 w-4.5" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Laser image scanner active overlay animation */}
                {isScanning && (
                  <div className="relative border border-emerald-500/25 rounded-2xl overflow-hidden p-6 bg-emerald-500/5 flex flex-col items-center justify-center">
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent scanner-beam-line shadow-md shadow-emerald-400" />
                    <Sparkles className="h-8 w-8 text-emerald-500 animate-spin mb-2" />
                    <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Biometric Computer Vision Scan...
                    </h4>
                    <p className="text-[10px] text-surface-500 dark:text-slate-400 font-bold mt-1 text-center leading-normal">
                      Scanning photo for lesions, feces moisture levels, and posture indices
                    </p>
                  </div>
                )}

                {/* AI thinking state indicator */}
                {isThinking && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <Sparkles className="h-4.5 w-4.5 animate-spin" />
                    </div>
                    <div className="bg-surface-100 text-surface-850 dark:bg-white/5 dark:text-slate-100 rounded-2xl rounded-tl-none px-4 py-3 text-xs font-semibold shadow-sm border border-surface-200 dark:border-white/5 flex items-center gap-2">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-1 text-[11px] text-surface-450 dark:text-slate-400 font-bold uppercase">AI is analyzing...</span>
                    </div>
                  </div>
                )}

                {/* Speech to text waveform guides */}
                {isListening && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Listening to farmer voice input...
                      </span>
                    </div>

                    {/* Speech animated visualizer waveform */}
                    <div className="flex items-center gap-1 h-8 my-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((bar) => (
                        <motion.div
                          key={bar}
                          animate={{ height: [6, 26, 6] }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            delay: bar * 0.05,
                            ease: "easeInOut"
                          }}
                          className="w-1 bg-emerald-500 rounded-full"
                        />
                      ))}
                    </div>

                    {transcript && (
                      <p className="mt-2 text-center text-xs font-semibold italic text-surface-600 dark:text-slate-300 px-6 line-clamp-2">
                        "{transcript}"
                      </p>
                    )}
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Bot footer disclaimer */}
              <div className="border-t border-surface-150 bg-surface-50 px-5 py-3 dark:border-white/5 dark:bg-white/2">
                <div className="flex gap-2.5 items-start text-[11px] text-surface-500 dark:text-slate-400 leading-normal">
                  <Shield className="h-4.5 w-4.5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <p>
                    <span className="font-black text-emerald-700 dark:text-emerald-300 uppercase">
                      {t('vet_disclaimer.title')}:
                    </span>{' '}
                    {t('vet_disclaimer.text')}
                  </p>
                </div>
              </div>

              {/* Message composition / attachments area */}
              <div className="border-t border-surface-200 dark:border-white/10 p-3 bg-white/50 dark:bg-slate-900/60 flex flex-col gap-2.5">
                
                {/* Attached image preview chips */}
                {attachedImagePreview && (
                  <div className="flex items-center gap-2 bg-emerald-500/5 dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/10 self-start">
                    <Image className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">Photo attached</span>
                    <button 
                      onClick={() => {
                        setAttachedImage(null);
                        setAttachedImagePreview('');
                      }} 
                      className="p-0.5 hover:text-red-500 text-surface-400 dark:text-slate-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleVoiceToggle}
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-xl transition shadow-sm shrink-0",
                      isListening 
                        ? "bg-red-500 text-white animate-pulse shadow-red-500/20" 
                        : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400"
                    )}
                    title="Speak into Microphone"
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>

                  <button
                    onClick={startCamera}
                    className="grid h-11 w-11 place-items-center rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-600 dark:bg-white/5 dark:text-slate-350 dark:hover:bg-white/10 transition shadow-sm shrink-0"
                    title="Open Camera"
                  >
                    <Camera className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="grid h-11 w-11 place-items-center rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-600 dark:bg-white/5 dark:text-slate-350 dark:hover:bg-white/10 transition shadow-sm shrink-0"
                    title="Attach Image file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask AI or speak about chickens..."
                    className="flex-1 rounded-xl border border-surface-200 bg-white px-4 py-3 text-xs text-surface-850 outline-none placeholder:text-surface-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white focus:dark:bg-slate-900 focus:ring-1 focus:ring-emerald-500"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white shadow-md transition hover:opacity-95 active:scale-95 shrink-0"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Pane: Telemetry Panels & Farmer Guides */}
            <div className={cn(
              "lg:col-span-1 flex flex-col gap-6",
              activeMobileTab === 'telemetry' ? 'flex' : 'hidden lg:flex'
            )}>
              
              {/* Contextual Smart Telemetry Widgets */}
              <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/50 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-2.5 border-surface-200 dark:border-white/10">
                  <h3 className="font-heading text-xs font-black text-surface-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    <span>Shed Telemetry</span>
                  </h3>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Brooder Temperature widget */}
                <div className="rounded-xl border border-surface-150 bg-white/40 p-3 dark:border-white/5 dark:bg-slate-900/20">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-surface-500 dark:text-slate-400">Brooder Temperature</span>
                    <span className={cn(
                      "px-1.5 py-0.2 rounded text-[9px] font-black uppercase",
                      telemetry.temp.status === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                    )}>
                      {telemetry.temp.status}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-surface-950 dark:text-white">{telemetry.temp.value}</span>
                    <span className="text-[10px] font-bold text-surface-450 dark:text-slate-500">{telemetry.temp.desc}</span>
                  </div>
                </div>

                {/* Feed Moisture widget */}
                <div className="rounded-xl border border-surface-150 bg-white/40 p-3 dark:border-white/5 dark:bg-slate-900/20">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-surface-500 dark:text-slate-400">Feed Moisture Level</span>
                    <span className={cn(
                      "px-1.5 py-0.2 rounded text-[9px] font-black uppercase",
                      telemetry.moisture.status === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                    )}>
                      {telemetry.moisture.status}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-surface-950 dark:text-white">{telemetry.moisture.value}</span>
                    <span className="text-[10px] font-bold text-surface-450 dark:text-slate-500">{telemetry.moisture.desc}</span>
                  </div>
                </div>

                {/* Ammonia level widget */}
                <div className="rounded-xl border border-surface-150 bg-white/40 p-3 dark:border-white/5 dark:bg-slate-900/20">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-surface-500 dark:text-slate-400">Ammonia Index</span>
                    <span className={cn(
                      "px-1.5 py-0.2 rounded text-[9px] font-black uppercase",
                      telemetry.ammonia.status === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                    )}>
                      {telemetry.ammonia.status}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-surface-950 dark:text-white">{telemetry.ammonia.value}</span>
                    <span className="text-[10px] font-bold text-surface-450 dark:text-slate-500">{telemetry.ammonia.desc}</span>
                  </div>
                </div>
              </div>

              {/* Speech rate/volume slider adjustments for farmers */}
              <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/50 flex flex-col gap-4">
                <h3 className="font-heading text-xs font-black text-surface-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4 text-emerald-500" />
                  <span>Voice Settings</span>
                </h3>
                
                {/* Speech rate/speed slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-surface-550 dark:text-slate-400">
                    <span>Speech Speed</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {speechSpeed <= 0.85 ? 'Slow' : speechSpeed >= 1.15 ? 'Fast' : 'Normal'} ({speechSpeed.toFixed(1)}x)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.4"
                    step="0.1"
                    value={speechSpeed}
                    onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-surface-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Speech volume slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-surface-550 dark:text-slate-400">
                    <span>Speech Volume</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{Math.round(speechVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.1"
                    value={speechVolume}
                    onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-surface-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>

              {/* Quick suggestion chips */}
              <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/50">
                <h3 className="font-heading text-xs font-black text-surface-900 dark:text-white mb-3.5 flex items-center gap-1.5 uppercase tracking-wider">
                  <HelpCircle className="h-4 w-4 text-emerald-500" />
                  <span>Farmer Quick Guides</span>
                </h3>
                
                <div className="space-y-2.5">
                  {getQuickCommands().map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputVal(cmd.text);
                        handleSendMessage(cmd.text);
                      }}
                      className="w-full flex items-center justify-between text-left p-3 rounded-xl border border-surface-150 bg-white hover:border-emerald-500 hover:bg-emerald-500/5 text-xs text-surface-700 dark:border-white/5 dark:bg-slate-950/10 dark:text-slate-350 dark:hover:bg-emerald-500/10 transition group"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-black text-surface-900 dark:text-white block truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-xs">
                          {cmd.label}
                        </span>
                        <span className="font-semibold text-[10px] block mt-0.5 opacity-80 text-surface-500 dark:text-slate-400 truncate">
                          "{cmd.text}"
                        </span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-surface-400 group-hover:translate-x-1 transition-transform shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Emergency Call center quick button */}
              <div className="rounded-2xl border border-red-200 bg-gradient-to-tr from-red-500/5 to-red-500/10 p-5 dark:border-red-500/15">
                <h4 className="font-heading text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 animate-bounce" />
                  <span>Emergency Line</span>
                </h4>
                <p className="text-[11px] font-semibold text-red-600/90 dark:text-red-300/80 mb-3 leading-normal">
                  If you observe sudden gasping, heavy diarrhea, or deaths, call the veterinary team instantly.
                </p>
                <a
                  href="tel:+919440123456"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 py-2 text-center text-xs font-black text-white shadow-md transition"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call Vet (+91 94401 23456)</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
