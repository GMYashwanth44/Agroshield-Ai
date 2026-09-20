import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { api } from '../../services/api';

const LANG_SPEECH_MAP = {
  en: 'en-IN',
  kn: 'kn-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  te: 'te-IN',
  ta: 'ta-IN'
};

export const VoiceAssistantModal = ({ isOpen, onClose, onActionTrigger }) => {
  const { t, language } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = LANG_SPEECH_MAP[language] || 'en-IN';

      recognition.onresult = (event) => {
        const text = Array.from(event.results)
          .map(r => r[0].transcript)
          .join('');
        setTranscript(text);
        setInputText(text);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use text input below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponse(null);
      try {
        recognitionRef.current.lang = LANG_SPEECH_MAP[language] || 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleSendQuery = async (queryToSubmit) => {
    const q = queryToSubmit || inputText;
    if (!q.trim()) return;

    setLoading(true);
    setResponse(null);
    try {
      const res = await api.queryVoiceAssistant(q, language);
      setResponse(res);
      // Play audio speech synthesis
      speakResponse(res.answer);
    } catch (err) {
      setResponse({
        answer: 'Failed to process voice query. Please check your internet connection.',
        language
      });
    } finally {
      setLoading(false);
    }
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_SPEECH_MAP[language] || 'en-IN';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t('voice_report', 'Voice Farming Assistant')}</h3>
              <p className="text-[11px] text-slate-500">Language: {LANG_SPEECH_MAP[language] || 'en-IN'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Interactive Mic Pulse */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <button
            onClick={toggleListening}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              isListening
                ? 'bg-rose-500 text-white scale-105 ring-8 ring-rose-200 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <span className="text-xs font-semibold text-slate-600">
            {isListening ? t('voice_listening', 'Listening in your language... Speak now') : 'Tap microphone to speak'}
          </span>
        </div>

        {/* Live Transcript / Prompt */}
        <div className="min-h-[60px] bg-slate-50 rounded-xl p-3 border border-slate-200 text-sm text-slate-700 flex items-center justify-center text-center">
          {transcript ? (
            <p className="font-medium italic text-slate-900">“{transcript}”</p>
          ) : (
            <p className="text-slate-600 text-xs">
              {t('voice_ask_prompt', 'Ask anything: "My tomato leaves are turning brown, what should I do?"')}
            </p>
          )}
        </div>

        {/* Fallback Text Input & Send */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
            placeholder="Or type your question here..."
            className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={() => handleSendQuery()}
            disabled={loading || !inputText.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        {/* AI Answer Card */}
        {response && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2.5 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                AI Agro-Advisory Guidance
              </span>
              <button
                onClick={() => speakResponse(response.answer)}
                className={`p-1 rounded-md text-emerald-700 hover:bg-emerald-100 ${isSpeaking ? 'animate-bounce text-emerald-900' : ''}`}
                title="Speak again"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-emerald-950 leading-relaxed">{response.answer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistantModal;
