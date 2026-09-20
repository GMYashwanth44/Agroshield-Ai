import React, { useState } from 'react';
import {
  MessageSquare, Send, Sparkles, X, Globe, ShieldAlert,
  Bot, User, CornerDownRight, Check, AlertCircle
} from 'lucide-react';
import { useTranslation, LANGUAGES } from '../../i18n';
import { api } from '../../services/api';

const QUICK_PROMPTS = [
  'Is organic Trichoderma spray safe with this crop?',
  'Can I spray bio-fungicide if rain is predicted today?',
  'How should I prune and dispose infected leaves properly?',
  'Which foliar fertilizer helps leaf recovery after blight?'
];

export const AskAgroShieldDrawer = ({
  isOpen,
  onClose,
  crop = 'Tomato',
  disease = 'Early Blight',
  severity = 'Moderate',
  healthScore = 72
}) => {
  if (!isOpen) return null;

  const { language: appLang } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(appLang || 'en');
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Namaskara! I am your AI Agronomic Assistant. I am analyzing your ${crop} diagnosis (${severity} ${disease}). What questions do you have regarding bio-fungicide dosage, spray timing, or cultural recovery practices?`
    }
  ]);

  const handleSend = async (queryText = null) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.askFarmerAssistant(
        textToSend,
        crop,
        disease,
        severity,
        healthScore,
        selectedLang
      );
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: res.answer,
        safetyReminder: res.safety_reminder
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: 'Sorry, I encountered an issue connecting to the agronomic knowledge base. Please try again or consult your local Krishi Vigyan Kendra (KVK).'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-lime-300">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">Ask AgroShield AI</h3>
                <span className="text-[10px] bg-emerald-500/40 text-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Multilingual
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Contextual AI Agronomist • 6 Indian Languages
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnosis Context Banner */}
        <div className="bg-emerald-50/80 px-4 py-2.5 border-b border-emerald-100 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-emerald-950 font-medium truncate">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              Grounded on: <strong>{crop}</strong> • {severity} {disease} (Score: {healthScore}/100)
            </span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700"
            >
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Prompt Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-100 flex gap-1.5 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              disabled={loading}
              className="bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition shadow-2xs"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-700 text-white rounded-br-xs shadow-xs'
                      : 'bg-slate-100 text-slate-900 rounded-bl-xs border border-slate-200 shadow-2xs space-y-2'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  {m.safetyReminder && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center gap-1 italic">
                      <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{m.safetyReminder}</span>
                    </div>
                  )}
                </div>
                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>AgroShield AI is synthesizing agronomic advisory...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about dosage, organic sprays, pruning, rain..."
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2.5 rounded-2xl transition shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-slate-400 text-center mt-2">
            Safety Guardrails: ICAR guidelines & CIBRC approved bio-fungicide formulations only.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAgroShieldDrawer;
