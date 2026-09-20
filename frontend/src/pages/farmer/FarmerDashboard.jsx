import React, { useState, useEffect } from 'react';
import {
  Camera, Image as ImageIcon, Mic, AlertTriangle, CloudSun, FlaskConical,
  BookOpen, ShoppingBag, TrendingUp, ShieldAlert, Sparkles, MapPin,
  ChevronRight, ArrowUpRight, Activity, CheckCircle2, Wind
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import SmartAlertsCard from '../../components/farmer/SmartAlertsCard';

export const FarmerDashboard = ({ onNavigate, onTriggerVoice }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [outbreakNotice, setOutbreakNotice] = useState(null);
  const [cropHealth, setCropHealth] = useState(null);
  const [futureRisk, setFutureRisk] = useState(null);
  const [smartAlerts, setSmartAlerts] = useState([]);

  useEffect(() => {
    // Fetch quick surveillance notices
    api.getOutbreaks(7)
      .then(res => {
        if (res.alerts && res.alerts.length > 0) {
          setOutbreakNotice(res.alerts[0]);
        }
      })
      .catch(() => {});

    // Fetch dynamic crop health score & future risk
    api.getCropHealth('Tomato', 'Kolar')
      .then(res => setCropHealth(res))
      .catch(() => {});

    api.getFutureRisk('Tomato', 'Early Blight', 'Moderate', 'Kolar')
      .then(res => setFutureRisk(res))
      .catch(() => {});

    // Fetch smart alerts with "why this alert was generated" logic
    api.getSmartAlerts('Tomato', 'Kolar')
      .then(res => {
        if (res.alerts && res.alerts.length > 0) {
          setSmartAlerts(res.alerts);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Farmer Greeting & Location Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>Srinivaspur, Kolar District • Karnataka</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Namaskara, {user?.full_name || 'Ramesh Gowda'}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            {t('tagline', 'Detect Early. Act Smart. Protect Crops.')} Your farm is actively protected by AgroShield community surveillance.
          </p>
        </div>

        {/* Decorative Leaf Icon Pattern */}
        <div className="absolute -right-6 -bottom-8 opacity-15 pointer-events-none">
          <Sparkles className="w-48 h-48 text-white" />
        </div>
      </div>

      {/* AI Crop Health Summary Card (Per Prompt Spec) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t('crop_health_summary', 'AI Crop Health Summary')}</h2>
              <span className="text-[10px] text-slate-400 font-medium">Field 1 (Tomato Plot A) • Srinivaspur, Kolar</span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {cropHealth?.status || 'Moderate Health'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 font-medium block">Crop Health Score</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600">
              {cropHealth?.crop_health_score || 72}<span className="text-xs text-slate-400">/100</span>
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{cropHealth?.recovery_trend || 'Stable'} Trend</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 font-medium block">Future Risk (3-7d)</span>
            <span className={`text-base sm:text-lg font-black block mt-0.5 ${futureRisk?.risk_level === 'HIGH' ? 'text-rose-600' : 'text-amber-600'}`}>
              {futureRisk?.risk_level || 'HIGH'}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">Expected rain spike</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 font-medium block">Weather Pressure</span>
            <span className="text-base sm:text-lg font-black text-amber-600 block mt-0.5">82% Humidity</span>
            <span className="text-[10px] text-slate-400 block">Rain 65% chance</span>
          </div>
        </div>

        {/* Quick action helper */}
        <div className="flex items-center justify-between bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-emerald-950 font-medium">
              Top improvement action: <strong>Prune diseased lower foliage (+8 to +12 pts)</strong>
            </span>
          </div>
          <button
            onClick={() => onNavigate('result')}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 shrink-0"
          >
            <span>View Full Diagnosis</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 italic text-center pt-0.5">
          *AI-assisted screening indicators. Not guaranteed scientific measurements.
        </p>
      </div>

      {/* Primary Action Buttons: Take Photo & Gallery Upload */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 📷 Scan / Take Photo */}
        <button
          onClick={() => onNavigate('scan')}
          className="group bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-between text-left"
        >
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-emerald-200 tracking-wider">Option 1</span>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Camera className="w-6 h-6 text-lime-300" />
              <span>📷 {t('take_photo', 'Take Photo')}</span>
            </h3>
            <p className="text-xs text-emerald-100">Scan plant leaf directly using phone camera</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition">
            <ChevronRight className="w-6 h-6" />
          </div>
        </button>

        {/* 🖼️ Upload from Gallery */}
        <button
          onClick={() => onNavigate('scan')}
          className="group bg-gradient-to-br from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-between text-left"
        >
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-teal-200 tracking-wider">Option 2</span>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-teal-300" />
              <span>🖼️ {t('upload_image', 'Upload from Gallery')}</span>
            </h3>
            <p className="text-xs text-teal-100">Select existing leaf photos from your phone gallery</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition">
            <ChevronRight className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* Smart Alerts Section with Explicit "Why Generated" Explanations */}
      {smartAlerts.length > 0 && (
        <SmartAlertsCard
          alerts={smartAlerts}
          onDismiss={(idx) => setSmartAlerts(prev => prev.filter((_, i) => i !== idx))}
        />
      )}

      {/* Outbreak Alert Banner if Active and no detailed smart alerts */}
      {outbreakNotice && smartAlerts.length === 0 && (
        <div
          onClick={() => onNavigate('map')}
          className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-4 flex items-start gap-3 cursor-pointer hover:bg-rose-100/70 transition shadow-xs"
        >
          <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-rose-800 uppercase tracking-wide">
                🚨 {t('outbreak_warning', 'POTENTIAL OUTBREAK RISK')}
              </span>
              <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-1.5 py-0.2 rounded">
                {outbreakNotice.growth_rate}% surge
              </span>
            </div>
            <p className="text-xs text-rose-950 mt-1 font-medium leading-relaxed">
              {outbreakNotice.alert_message}
            </p>
            <span className="text-[10px] text-rose-600 font-semibold mt-1 inline-flex items-center gap-1">
              View Regional Map & Protective Guidance <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      )}

      {/* Voice Assistant Floating Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold">{t('voice_report', 'Voice Farming Assistant')}</h3>
            <p className="text-xs text-slate-300">Ask questions in Kannada, Hindi, Telugu, Tamil, Marathi, or English</p>
          </div>
        </div>
        <button
          onClick={onTriggerVoice}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm transition flex items-center gap-1.5"
        >
          <span>Speak Now</span>
        </button>
      </div>

      {/* Quick Access Feature Grid (Mobile-First 2x4 layout) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Agri Modules & Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* My Reports */}
          <button
            onClick={() => onNavigate('reports')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 shadow-xs transition"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">{t('my_reports', 'My Reports')}</span>
              <span className="text-[10px] text-slate-500">Diagnosis history</span>
            </div>
          </button>

          {/* Community Disease Intelligence */}
          <button
            onClick={() => onNavigate('community_intelligence')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 shadow-xs transition"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Community Intel</span>
              <span className="text-[10px] text-slate-500">Privacy-safe regional trends</span>
            </div>
          </button>

          {/* Regional Disease Map */}
          <button
            onClick={() => onNavigate('map')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 shadow-xs transition"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">{t('disease_map', 'Disease Map')}</span>
              <span className="text-[10px] text-slate-500">Live surveillance & vectors</span>
            </div>
          </button>

          {/* Weather & Soil */}
          <button
            onClick={() => onNavigate('weather')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 shadow-xs transition"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <CloudSun className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">{t('weather', 'Weather & Soil')}</span>
              <span className="text-[10px] text-slate-500">Crop risk & fertility</span>
            </div>
          </button>

          {/* Digital Crop Diary */}
          <button
            onClick={() => onNavigate('diary')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 shadow-xs transition"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">{t('crop_diary', 'Crop Diary')}</span>
              <span className="text-[10px] text-slate-500">Farm field records</span>
            </div>
          </button>

          {/* Agri Marketplace */}
          <button
            onClick={() => onNavigate('marketplace')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 shadow-xs transition"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">{t('marketplace', 'Agri Marketplace')}</span>
              <span className="text-[10px] text-slate-500">Seeds, bio-fungicides, tools</span>
            </div>
          </button>

          {/* Mandi Prices */}
          <button
            onClick={() => onNavigate('prices')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 shadow-xs transition"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">{t('market_prices', 'Mandi Prices')}</span>
              <span className="text-[10px] text-slate-500">APMC market intelligence</span>
            </div>
          </button>

          {/* Soil Assistant */}
          <button
            onClick={() => onNavigate('weather')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 shadow-xs transition"
          >
            <div className="w-8 h-8 rounded-xl bg-lime-100 text-lime-700 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">{t('soil_health', 'Soil Assistant')}</span>
              <span className="text-[10px] text-slate-500">NPK test analyzer</span>
            </div>
          </button>

          {/* Officer Connection */}
          <button
            onClick={() => onNavigate('reports')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 shadow-xs transition"
          >
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">{t('expert_help', 'Agri Officer')}</span>
              <span className="text-[10px] text-slate-500">Escalate & verify</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
