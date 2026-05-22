import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Check, ChevronRight, ChevronLeft, Volume2, 
  Mic, Smartphone, Star, Play, CheckCircle2 
} from 'lucide-react';
import { speakText } from '../../voice/voiceService';

export default function FarmerOnboarding({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧', subtitle: 'Global Option' },
    { code: 'te', label: 'తెలుగు', flag: '🇮🇳', subtitle: 'ఆంధ్రప్రదేశ్ & తెలంగాణ' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', subtitle: 'उत्तर भारत' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳', subtitle: 'தமிழ்நாடு' },
    { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳', subtitle: 'ಕರ್ನಾಟಕ' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳', subtitle: 'महाराष्ट्र' },
    { code: 'bn', label: 'বাংলা', flag: '🇮🇳', subtitle: 'পশ্চিমবঙ্গ' }
  ];

  const handleLanguageSelect = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('poultrypro-language', code);
  };

  const testVoiceOutput = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await speakText(t('onboarding.voice_test_success'), i18n.language);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('poultrypro-onboarding-complete', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95"
        >
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 -z-10 h-32 w-32 bg-emerald-500/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -z-10 h-32 w-32 bg-green-500/10 rounded-full blur-2xl" />

          {/* Setup Header */}
          <div className="flex items-center justify-between border-b border-surface-200/50 p-6 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="font-heading text-lg font-black tracking-tight text-surface-950 dark:text-white">
                Farmer Setup Wizard
              </h2>
            </div>
            
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div 
                  key={s} 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step 
                      ? 'w-6 bg-emerald-500' 
                      : s < step 
                        ? 'w-2 bg-emerald-500/50' 
                        : 'w-2 bg-surface-200 dark:bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step Contents */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="font-heading text-2xl font-black text-surface-950 dark:text-white">
                    {t('onboarding.select_language')}
                  </h3>
                  <p className="mt-1.5 text-sm text-surface-550 dark:text-slate-400">
                    {t('onboarding.select_language_desc')}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {languages.map((lang) => {
                    const isSelected = i18n.language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20'
                            : 'border-surface-200 bg-white hover:border-emerald-200 dark:border-white/5 dark:bg-white/2 hover:dark:border-white/15'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl leading-none">{lang.flag}</span>
                          <div>
                            <span className="block text-sm font-bold text-surface-900 dark:text-white">
                              {lang.label}
                            </span>
                            <span className="text-[10px] text-surface-500 dark:text-slate-400">
                              {lang.subtitle}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                  <Mic className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading text-2xl font-black text-surface-950 dark:text-white">
                    {t('onboarding.voice_setup')}
                  </h3>
                  <p className="mx-auto max-w-md text-sm text-surface-550 dark:text-slate-400">
                    {t('onboarding.voice_setup_desc')}
                  </p>
                </div>

                <div className="mx-auto max-w-sm rounded-2xl border border-surface-200 bg-white p-5 dark:border-white/5 dark:bg-white/2 space-y-4">
                  <p className="text-xs text-surface-500 dark:text-slate-400 font-medium">
                    Test the voice synthesizer speaker to check if your audio is working.
                  </p>
                  <button
                    type="button"
                    onClick={testVoiceOutput}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-all ${
                      isPlaying 
                        ? 'bg-emerald-600 shadow-emerald-500/10 cursor-not-allowed' 
                        : 'bg-gradient-to-tr from-emerald-500 to-green-600 hover:shadow-emerald-500/20'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Volume2 className="h-4 w-4 animate-bounce" />
                        {t('onboarding.voice_test_playing')}
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        {t('onboarding.voice_test_btn')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="font-heading text-2xl font-black text-surface-950 dark:text-white">
                    {t('onboarding.navigation_guide')}
                  </h3>
                  <p className="mt-1.5 text-sm text-surface-550 dark:text-slate-400">
                    {t('onboarding.navigation_guide_desc')}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex gap-4 rounded-2xl border border-surface-200 bg-white p-4 dark:border-white/5 dark:bg-white/2">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-surface-950 dark:text-white">Big Controls</h4>
                      <p className="mt-1 text-xs text-surface-500 dark:text-slate-400">
                        Large, tap-friendly buttons designed for wet/muddy hands or low visual precision.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 rounded-2xl border border-surface-200 bg-white p-4 dark:border-white/5 dark:bg-white/2">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                      <Volume2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-surface-950 dark:text-white">Read Aloud Alerts</h4>
                      <p className="mt-1 text-xs text-surface-500 dark:text-slate-400">
                        Important warnings have audio readouts. Simply tap the speaker icon on any screen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading text-2xl font-black text-surface-950 dark:text-white">
                    Setup Complete!
                  </h3>
                  <p className="mx-auto max-w-md text-sm text-surface-550 dark:text-slate-400">
                    Your AI Assistant is ready. Tap the speech bubble in the corner at any time to ask questions.
                  </p>
                </div>
                
                <div className="bg-emerald-500/5 rounded-2xl border border-emerald-500/15 p-4 max-w-sm mx-auto flex items-center gap-3 text-left">
                  <div className="bg-emerald-500 text-white rounded-lg p-2">
                    <Mic className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300">VOICE COMMAND TIP</h4>
                    <p className="text-[10px] text-surface-500 dark:text-slate-400">
                      Try saying: <span className="font-bold">"my birds are sick"</span> or <span className="font-bold">"vaccine details"</span>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Setup Footer */}
          <div className="flex items-center justify-between border-t border-surface-200/50 p-6 dark:border-white/5">
            <button
              type="button"
              onClick={handleComplete}
              className="text-xs font-bold text-surface-500 hover:text-surface-700 dark:text-slate-400 dark:hover:text-white"
            >
              {t('onboarding.skip')}
            </button>

            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-xs font-bold text-surface-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700 dark:border-white/5 dark:bg-white/2 dark:text-slate-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('onboarding.back')}
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/15 hover:opacity-90 active:scale-95"
                >
                  {t('onboarding.next')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 px-5 py-2.5 text-xs font-black text-white shadow-lg hover:opacity-90 active:scale-95"
                >
                  {t('onboarding.get_started')}
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
