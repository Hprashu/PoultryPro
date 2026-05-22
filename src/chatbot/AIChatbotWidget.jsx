import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  MessageSquare, X, Send, Mic, MicOff, Volume2, VolumeX, 
  AlertTriangle, Shield, Phone, Sparkles, RefreshCw, Paperclip, 
  History, Plus, ArrowLeft, Trash2, ShieldAlert, Play, CheckCircle
} from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { addDocument, getDocuments, deleteDocument, COLLECTIONS, where, orderBy } from '../firebase';
import { processAIChatEngine } from './poultryAIEngine';

export default function AIChatbotWidget() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const dragControls = useDragControls();
  const lang = i18n.language || 'en';

  // Toggle widget states
  const [isOpen, setIsOpen] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
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

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Speech Recognition hook
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

  // Load user sessions from Firestore (with localStorage fallback)
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

  // Load messages for active session
  const loadActiveMessages = async (sessionId) => {
    if (!user || !sessionId) return;
    setIsThinking(true);
    try {
      const dbMessages = await getDocuments(COLLECTIONS.chatHistory, [
        where('sessionId', '==', sessionId),
        orderBy('createdAt', 'asc')
      ]);
      setMessages(dbMessages);
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

  // Trigger loading sessions when widget opens
  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, user]);

  // Load message logs when session changes
  useEffect(() => {
    if (activeSessionId) {
      loadActiveMessages(activeSessionId);
    } else {
      setMessages([{
        id: 'welcome',
        sender: 'ai',
        text: t('voice.welcome', 'Hello! I am your AI Poultry Assistant. Ask me anything about farm management or symptoms.'),
        createdAt: new Date().toISOString()
      }]);
    }
  }, [activeSessionId]);

  // Sync state if microphone inputs are received
  useEffect(() => {
    if (fullTranscript) {
      setInputVal(fullTranscript);
    }
  }, [fullTranscript]);

  // Mic permission error notifier
  useEffect(() => {
    if (voiceError === 'not-allowed') {
      showToast(t('voice.mic_permission_denied'), 'error');
    }
  }, [voiceError, showToast, t]);

  // Auto-scroll chat window
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isListening, isThinking, isScanning]);

  // Initialize a new session
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
      // Local session simulation
      sessionObj = { id: `local-session-${Date.now()}`, ...newSession };
      const current = [sessionObj, ...sessions];
      localStorage.setItem(`poultrypro_chatsessions_${user.uid}`, JSON.stringify(current));
    }

    setSessions(prev => [sessionObj, ...prev]);
    setActiveSessionId(sessionObj.id);
    setSessionState({ step: 0, symptoms: [] });
    setMessages([]);
    setShowSessions(false);
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

  // Handle Image Upload Selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedImage(file);
      setAttachedImagePreview(URL.createObjectURL(file));
      showToast("Photo attached. Ready for diagnostics.", "success");
    }
  };

  // Send message
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim() && !attachedImage) return;

    // Check if session exists, create one if not
    let currentSessionId = activeSessionId;
    if (!currentSessionId && user) {
      const tempTitle = text.slice(0, 20) || 'Image Scan';
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

    // Append user message immediately
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    const tempAttachedPreview = attachedImagePreview;
    setAttachedImage(null);
    setAttachedImagePreview('');

    // Save user message to DB/Cache
    saveMessage(userMsg, currentSessionId);

    // Simulate scanning delay if image is sent
    let imageAnalysisText = '';
    if (tempAttachedPreview) {
      setIsScanning(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsScanning(false);
      imageAnalysisText = "Physical abnormalities detected: ruffled feathers and lethargic posture.";
      setSessionState(prev => ({ ...prev, imageAttached: true, imageAnalysisText }));
    }

    // Run AI diagnostic processing
    setIsThinking(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // typing effect delay

    const activeState = {
      ...sessionState,
      imageAttached: !!tempAttachedPreview,
      imageAnalysisText
    };

    const aiResult = processAIChatEngine(text, activeState, lang);
    setSessionState(aiResult.state);

    const aiMsg = {
      id: `msg-ai-${Date.now()}`,
      sessionId: currentSessionId,
      sender: 'ai',
      text: aiResult.text,
      createdAt: new Date().toISOString(),
      structured: aiResult.structured
    };

    if (aiResult.structuredData) {
      aiMsg.structuredData = aiResult.structuredData;
    }

    setMessages(prev => [...prev, aiMsg]);
    setIsThinking(false);

    // Save AI response to DB/Cache
    saveMessage(aiMsg, currentSessionId);

    // Trigger Text-to-Speech
    if (!ttsMuted) {
      const spokenText = aiResult.structuredData
        ? `${aiResult.structuredData.name}. Risk Level: ${aiResult.structuredData.severity}. Immediate Action: ${aiResult.structuredData.action}`
        : aiResult.text;
      speak(spokenText);
    }
  };

  const saveMessage = async (msgObj, sessionId) => {
    if (!user) return;
    try {
      await addDocument(COLLECTIONS.chatHistory, msgObj, user.uid);
    } catch (e) {
      // Offline fallback saving
      const cached = localStorage.getItem(`poultrypro_chatmsg_${sessionId}`);
      const list = cached ? JSON.parse(cached) : [];
      list.push(msgObj);
      localStorage.setItem(`poultrypro_chatmsg_${sessionId}`, JSON.stringify(list));
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

  // Translation helper dictionaries
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300';
      case 'medium': return 'border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300';
      default: return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300';
    }
  };

  const getQuickPrompts = () => {
    switch (lang) {
      case 'te':
        return ['కోళ్ల మోషన్స్ రక్తం', 'వ్యాక్సినేషన్ చార్ట్', 'గాలి ఉష్ణోగ్రత షెడ్'];
      case 'hi':
        return ['खूनी बीट समस्या', 'टीकाकरण अनुसूची', 'ब्रूडिंग तापमान'];
      default:
        return ['Bloody droppings', 'Vaccination guides', 'Climate warnings'];
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
          {isOpen ? <X className="h-6 w-6" /> : (
            <>
              <MessageSquare className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500 text-[8px] font-black text-white items-center justify-center">AI</span>
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* Chat drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragConstraints={{ top: -500, bottom: 200, left: -600, right: 100 }}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 flex h-[620px] w-[390px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-white/60 bg-white/95 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-slate-950/95 overflow-hidden"
          >
            {/* Header bar */}
            <div 
              onPointerDown={(e) => {
                if (!e.target.closest('button')) dragControls.start(e);
              }}
              className="cursor-move flex items-center justify-between border-b border-surface-200 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-4 py-3 dark:border-white/10"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSessions(!showSessions)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-surface-200 bg-white text-surface-500 hover:text-emerald-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                  title="Chat History Sessions"
                >
                  <History className="h-4.5 w-4.5" />
                </button>
                <div>
                  <h3 className="font-heading text-sm font-black text-surface-950 dark:text-white flex items-center gap-1.5">
                    <span>PoultryPro AI</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  </h3>
                  <p className="text-[10px] font-bold text-surface-500 dark:text-slate-400">
                    {t('voice.assistant_title', 'AI Expert Companion')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Speech On/Off Toggle */}
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
                  title={ttsMuted ? "Unmute Speech Answers" : "Mute Speech Answers"}
                >
                  {ttsMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => speak(t('vet_disclaimer.text'))}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-surface-200 bg-white text-surface-500 hover:text-emerald-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                  title="Safety Guidelines"
                >
                  <Shield className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sub-Panel: History/Sessions List Drawer */}
            <AnimatePresence>
              {showSessions && (
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  className="absolute inset-y-0 left-0 w-3/4 z-30 bg-white dark:bg-slate-900 border-r border-surface-200 dark:border-white/10 p-4 shadow-2xl flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-heading text-xs font-black uppercase text-surface-500 dark:text-slate-400">
                      Chat Sessions
                    </h4>
                    <button 
                      onClick={() => setShowSessions(false)}
                      className="text-surface-450 hover:text-surface-950 dark:text-slate-400 dark:hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleCreateNewSession}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white py-2.5 text-xs font-black mb-4 shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Start New Chat</span>
                  </button>

                  <div className="flex-1 overflow-y-auto space-y-2">
                    {sessions.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setActiveSessionId(s.id);
                          setShowSessions(false);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                          activeSessionId === s.id
                            ? 'border-emerald-500/40 bg-emerald-500/5'
                            : 'border-surface-150 bg-surface-50 hover:bg-surface-100 dark:border-white/5 dark:bg-white/2 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="text-xs font-black truncate max-w-[80%] text-surface-850 dark:text-slate-200">
                          {s.title}
                        </span>
                        <button
                          onClick={(e) => handleDeleteSession(s.id, e)}
                          className="p-1 hover:text-red-500 text-surface-400 dark:text-slate-500 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat message timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm relative ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500 text-white rounded-tr-none'
                      : 'bg-surface-100 text-surface-850 dark:bg-white/5 dark:text-slate-100 rounded-tl-none border border-surface-200 dark:border-white/5'
                  }`}>
                    {/* User message Image attachment */}
                    {msg.image && (
                      <img 
                        src={msg.image} 
                        alt="User poultry snap" 
                        className="rounded-lg mb-2 max-h-36 object-cover border border-white/20"
                      />
                    )}

                    {/* Standard Text or Diagnostic structured card */}
                    {!msg.structuredData ? (
                      <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b pb-1.5 border-surface-200 dark:border-white/10">
                          <span className="font-heading font-black text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Diagnostic Analysis
                          </span>
                          <span className="text-[10px] font-bold opacity-80 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Confidence: {msg.structuredData.confidence}
                          </span>
                        </div>

                        {/* Severity Banner */}
                        <div className={`border p-2 rounded-lg text-xs font-bold ${getSeverityColor(msg.structuredData.severity)}`}>
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="capitalize">{msg.structuredData.severity} Threat Condition</span>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-black block text-surface-500 dark:text-slate-400">Possible Cause:</span>
                            <span className="font-semibold">{msg.structuredData.name} ({msg.structuredData.cause})</span>
                          </div>
                          <div>
                            <span className="font-black block text-surface-500 dark:text-slate-400">Symptoms:</span>
                            <span>{msg.structuredData.symptoms}</span>
                          </div>
                          <div>
                            <span className="font-black block text-surface-500 dark:text-slate-400">Immediate Action:</span>
                            <span className="text-amber-700 dark:text-amber-400 font-semibold">{msg.structuredData.action}</span>
                          </div>
                        </div>

                        {/* Emergency Button */}
                        {msg.structuredData.severity === 'critical' && (
                          <a
                            href="tel:+919440123456"
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-1.5 text-center text-xs font-bold text-white hover:bg-red-700 transition"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>Call Vet Dr. Rao</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Footer speech sync icon */}
                    <div className="mt-1 flex items-center justify-between text-[10px] opacity-80">
                      <span>{msg.sender === 'user' ? 'You' : 'PoultryPro AI'}</span>
                      {msg.sender === 'ai' && (
                        <button
                          onClick={() => {
                            const textToSpeak = msg.structuredData 
                              ? `${msg.structuredData.name}. Risk level is ${msg.structuredData.severity}. Recommended Action is: ${msg.structuredData.action}`
                              : msg.text;
                            speak(textToSpeak);
                          }}
                          className="hover:text-emerald-500 p-0.5"
                          title="Speak answer out loud"
                        >
                          <Play className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Laser scanning beam overlay simulation */}
              {isScanning && (
                <div className="relative border border-emerald-500/20 rounded-xl overflow-hidden p-4 bg-emerald-500/5 flex flex-col items-center justify-center">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-[bounce_2s_infinite] shadow-lg shadow-emerald-500/50" />
                  <Sparkles className="h-6 w-6 text-emerald-500 animate-spin mb-2" />
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    Running Biometric Image Scan...
                  </p>
                  <p className="text-[10px] text-surface-450 dark:text-slate-500 font-semibold mt-1">
                    Analyzing physical symptoms & feather alignment
                  </p>
                </div>
              )}

              {/* Bot thinking animation */}
              {isThinking && (
                <div className="flex gap-2 items-center text-surface-400 dark:text-slate-500 p-2 text-xs">
                  <div className="flex space-x-1">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce"></span>
                  </div>
                  <span className="font-bold animate-pulse">PoultryPro is formulating response...</span>
                </div>
              )}

              {/* Voice Listening panel inside chat logs */}
              {isListening && (
                <div className="flex flex-col items-center justify-center py-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">
                      {t('voice.listening', 'Listening...')}
                    </span>
                  </div>
                  {/* Waveform visualizer */}
                  <div className="flex items-center gap-1 h-8">
                    {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                      <motion.div
                        key={bar}
                        animate={{ height: [8, 24, 8] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: bar * 0.08, ease: "easeInOut" }}
                        className="w-1 bg-emerald-500 rounded-full"
                      />
                    ))}
                  </div>
                  {transcript && (
                    <p className="mt-2 text-center text-xs font-semibold italic text-surface-600 dark:text-slate-400 px-4">
                      "{transcript}"
                    </p>
                  )}
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick chips suggested prompts */}
            {messages.length < 3 && !isListening && (
              <div className="px-4 py-2 flex flex-wrap gap-1.5">
                {getQuickPrompts().map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputVal(p);
                      handleSendMessage(p);
                    }}
                    className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-full px-2.5 py-1 border border-emerald-500/10 transition"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Bar: Image selector preview */}
            {attachedImagePreview && (
              <div className="px-4 py-2 border-t bg-surface-50 dark:bg-white/2 border-surface-200 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={attachedImagePreview} className="h-10 w-10 rounded object-cover border border-white/20" alt="attach preview" />
                  <span className="text-[10px] font-bold text-surface-500 dark:text-slate-400">Photo attached for scan</span>
                </div>
                <button 
                  onClick={() => { setAttachedImage(null); setAttachedImagePreview(''); }}
                  className="p-1 hover:text-red-500 text-surface-450 dark:text-slate-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Chat Input panel */}
            <div className="border-t border-surface-200 p-3 bg-white/50 dark:border-white/10 dark:bg-slate-900/60 flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-500 dark:bg-white/5 dark:text-slate-400 transition"
                title="Attach photo of birds"
              >
                <Paperclip className="h-4.5 w-4.5" />
              </button>

              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20' 
                    : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400'
                }`}
                title="Speak question"
              >
                <Mic className="h-4.5 w-4.5" />
              </button>

              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('voice.ask_anything', 'Ask about symptoms...')}
                className="flex-1 rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs text-surface-850 outline-none placeholder:text-surface-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white shadow-md transition hover:opacity-90 active:scale-95"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
