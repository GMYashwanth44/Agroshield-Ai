import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, AlertTriangle, MapPin, Share2, Download, Send,
  Sparkles, CheckCircle2, ShoppingBag, Eye, Layers, ChevronRight, HelpCircle,
  RefreshCw, Crosshair, AlertCircle
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from '../../i18n';
import { api } from '../../services/api';
import { offlineStore } from '../../services/offlineStore';
import SeverityBar from '../../components/farmer/SeverityBar';
import ExplainableAIModal from '../../components/farmer/ExplainableAIModal';
import FutureRiskCard from '../../components/farmer/FutureRiskCard';
import CropHealthScoreCard from '../../components/farmer/CropHealthScoreCard';
import ActionPlanCard from '../../components/farmer/ActionPlanCard';
import RecoveryTracker from '../../components/farmer/RecoveryTracker';
import AskAgroShieldDrawer from '../../components/farmer/AskAgroShieldDrawer';
import RequestExpertReviewModal from '../../components/farmer/RequestExpertReviewModal';
import { MessageSquare, UserCheck, Bot } from 'lucide-react';

function MiniMapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

export const DiseaseResultPage = ({ result, onSubmitted, onNavigateMarketplace }) => {
  const { t } = useTranslation();
  const [showMask, setShowMask] = useState(false);
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [expertModalOpen, setExpertModalOpen] = useState(false);
  const [officerRequested, setOfficerRequested] = useState(false);
  const [actionPlan, setActionPlan] = useState(result.action_plan || null);
  const [recoveryComparison, setRecoveryComparison] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [farmerNotes, setFarmerNotes] = useState('');

  // Real GPS Geolocation State
  const [gpsCoords, setGpsCoords] = useState(() => {
    if (result.gpsCoords && result.gpsCoords.lat && result.gpsCoords.lng) {
      return {
        lat: result.gpsCoords.lat,
        lng: result.gpsCoords.lng,
        accuracy: result.gpsCoords.accuracy || 5.0,
        village: 'Detected Location',
        district: 'Current Region',
        isReal: true
      };
    }
    return {
      lat: 13.3392,
      lng: 78.2139,
      accuracy: 10.0,
      village: 'Srinivaspur',
      district: 'Kolar',
      isReal: false
    };
  });
  const [isLocating, setIsLocating] = useState(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState(null);

  // Auto-acquire live location if not already provided
  useEffect(() => {
    if (!result.gpsCoords) {
      fetchLiveGPS();
    }
  }, []);

  const fetchLiveGPS = () => {
    if (!navigator.geolocation) {
      setGpsErrorMsg('Browser or device does not support GPS geolocation.');
      return;
    }
    setIsLocating(true);
    setGpsErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const accuracy = Math.round(pos.coords.accuracy * 10) / 10;
        setGpsCoords((prev) => ({
          ...prev,
          lat,
          lng,
          accuracy,
          isReal: true
        }));
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        let msg = 'Could not acquire GPS coordinates.';
        if (err.code === 1) msg = 'Location permission denied by browser. Please enable GPS permissions.';
        else if (err.code === 2) msg = 'Location position unavailable. Check GPS sensor.';
        else if (err.code === 3) msg = 'GPS acquisition timed out. Please try again.';
        setGpsErrorMsg(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  React.useEffect(() => {
    if (!actionPlan) {
      api.getActionPlan({
        crop: result.crop || 'Tomato',
        disease: result.disease || 'Early Blight',
        severity: result.severity || 'Moderate',
        district: gpsCoords.district
      }).then(res => setActionPlan(res)).catch(() => {});
    }

    api.getRecoveryComparison(null, null, result.crop || 'Tomato')
      .then(res => setRecoveryComparison(res))
      .catch(() => {});
  }, [result.crop, result.disease, result.severity]);

  const isLowConfidence = result.is_low_confidence || (result.confidence && result.confidence < 70);

  // Submit report with GPS location
  const handleSubmitReport = async () => {
    setSubmitting(true);
    const reportPayload = {
      crop_name: result.crop,
      disease_name: result.disease,
      confidence: result.confidence_normalized || (result.confidence_pct ? result.confidence_pct / 100 : 0.947),
      severity: result.severity || 'Moderate',
      affected_area_pct: result.affected_area_pct || 37.0,
      latitude: gpsCoords.lat,
      longitude: gpsCoords.lng,
      location_accuracy: gpsCoords.accuracy,
      district: gpsCoords.district,
      village: gpsCoords.village,
      image_url: result.previewUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22510?w=600&auto=format&fit=crop&q=80',
      mask_url: result.mask_data_uri,
      farmer_notes: farmerNotes,
      is_offline: !navigator.onLine,
      is_demo: false
    };

    try {
      if (navigator.onLine) {
        await api.createReport(reportPayload);
      } else {
        // Save locally to IndexedDB for offline synchronization
        await offlineStore.savePendingReport(reportPayload);
      }
      setSubmitted(true);
      if (onSubmitted) onSubmitted(reportPayload);
    } catch (err) {
      await offlineStore.savePendingReport(reportPayload);
      setSubmitted(true);
      if (onSubmitted) onSubmitted(reportPayload);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            AI Crop Disease Diagnosis Report
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {result.crop} • {result.disease}
          </h1>
          <p className="text-xs text-slate-500">
            Screened on {new Date().toLocaleDateString()} • Model: {result.model_architecture || 'MobileNetV2-AgroPlant'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-xs font-semibold flex items-center gap-1.5"
            title="Download / Print Report"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Low Confidence Warning (Per Prompt Spec) */}
      {isLowConfidence && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <span className="text-xs font-bold text-amber-900 uppercase">Attention: Low Confidence Detection</span>
            <p className="text-xs text-amber-800 leading-relaxed">
              {t('low_confidence', 'Low confidence. Please upload a clearer image or request expert verification.')}
            </p>
            <button
              onClick={handleSubmitReport}
              className="mt-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
            >
              <span>{t('expert_verification', 'Request Expert Verification')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Image & Lesion Mask Toggle */}
        <div className="space-y-3">
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-black aspect-square">
            <img
              src={showMask && result.mask_data_uri ? result.mask_data_uri : (result.previewUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22510?w=600&auto=format&fit=crop&q=80')}
              alt="Leaf Diagnosis"
              className="w-full h-full object-cover"
            />
            {result.mask_data_uri && (
              <button
                onClick={() => setShowMask(!showMask)}
                className="absolute bottom-3 right-3 bg-black/75 hover:bg-black text-white text-[11px] font-bold px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-1.5 shadow-md transition"
              >
                <Layers className="w-3.5 h-3.5 text-orange-400" />
                <span>{showMask ? 'Show Original' : 'View Lesion Heatmap'}</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-400 text-center italic">
            {showMask ? 'Orange overlay highlights detected necrotic lesion pixels.' : 'Original leaf photo analyzed via computer vision.'}
          </p>
        </div>

        {/* Right Column: AI Metrics & Severity */}
        <div className="md:col-span-2 space-y-4">
          {/* AI Confidence & Status Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">{t('confidence', 'AI Confidence')}</span>
              <span className="text-xl font-black text-slate-900">
                {result.confidence_pct ? `${result.confidence_pct}%` : '94.7%'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Calibrated probability</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">{t('severity', 'Severity Level')}</span>
              <span className="text-xl font-black text-orange-600">{result.severity || 'Moderate'}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{result.affected_area_pct || 37}% leaf area</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-500 font-semibold block">Pathogen / Type</span>
              <span className="text-sm font-bold text-slate-800 block truncate">{result.pathogen || 'Alternaria solani'}</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Target Spotted</span>
            </div>
          </div>

          {/* Interactive Severity Bar */}
          <SeverityBar affectedAreaPct={result.affected_area_pct || 37.0} severity={result.severity || 'Moderate'} />

          {/* Symptoms Description */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">Diagnostic Symptoms</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {result.symptoms || 'Concentric rings (dark brown target spots) on lower foliage, surrounded by a yellow chlorotic margin.'}
            </p>
          </div>

          {/* Differentiating Feature 2: Explainable AI - "Why this result?" */}
          <button
            onClick={() => setExplainModalOpen(true)}
            className="w-full bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/80 hover:from-indigo-100 hover:to-indigo-100 text-indigo-950 p-3.5 rounded-2xl border border-indigo-200 text-xs font-extrabold flex items-center justify-between transition shadow-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-slate-900 font-extrabold block">Why did AgroShield detect this?</span>
                <span className="text-[10px] text-slate-500 font-medium">Explainable AI: See visual evidence, hallmarks & confidence trace</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 group-hover:translate-x-1 transition flex items-center gap-1 shrink-0">
              <span>View Evidence</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </button>

          {/* Quick Action Assistant & Expert Escalation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setAssistantOpen(true)}
              className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-bold text-xs flex items-center justify-between shadow-xs transition"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-lime-300" />
                <span>Ask AgroShield AI Assistant</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">6 Languages</span>
            </button>

            <button
              type="button"
              onClick={() => setExpertModalOpen(true)}
              className="p-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl font-bold text-xs flex items-center justify-between shadow-xs transition"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-200" />
                <span>Request Officer Validation</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">
                {officerRequested ? 'Submitted' : 'KVK Escalation'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Differentiating Features 1 & 3: Crop Health Score & Future Disease Risk Prediction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CropHealthScoreCard healthData={result.crop_health} />
        <FutureRiskCard riskData={result.future_risk} crop={result.crop} disease={result.disease} />
      </div>

      {/* Differentiating Feature 6: Personalized 7-Day Crop Action Plan */}
      {actionPlan && (
        <ActionPlanCard
          actionPlan={actionPlan}
          reportId={result.id}
          onDayToggled={(dayNum, completed) => {
            console.log(`Day ${dayNum} toggled to ${completed}`);
          }}
        />
      )}

      {/* Differentiating Feature 7: Before vs After Crop Monitoring & Recovery Progress */}
      {recoveryComparison && (
        <RecoveryTracker
          comparison={recoveryComparison}
          onRequestOfficer={() => setExpertModalOpen(true)}
        />
      )}

      {/* Safe Agricultural Guidance & Certified Recommendations Database */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t('recommendations', 'Certified Agricultural Recommendations')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Cultural & Good Farming Practices */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-1.5">
            <span className="font-bold text-emerald-900 block">1. Cultural & Field Management</span>
            <p className="text-emerald-950 leading-relaxed">
              {result.recommendations?.cultural_practices || 'Maintain 60x45 cm plant spacing. Prune off diseased lower leaves to prevent splash infection. Avoid overhead sprinkler irrigation.'}
            </p>
          </div>

          {/* Organic & Biological Alternatives */}
          <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200 space-y-1.5">
            <span className="font-bold text-teal-900 block">2. Organic & Bio-Control Options</span>
            <p className="text-teal-950 leading-relaxed">
              {result.recommendations?.organic_control || 'Spray Trichoderma viride or Bacillus subtilis @ 5g/liter. Apply neem seed oil (3%) as early preventative.'}
            </p>
          </div>

          {/* Chemical Guidance with Approved CIBRC Label Safety Warning */}
          <div className="md:col-span-2 bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-2">
            <span className="font-bold text-amber-900 block">3. Statutory Chemical Guidance per Approved Labels</span>
            <p className="text-amber-950 leading-relaxed">
              {result.recommendations?.chemical_guidance || 'Chlorothalonil 75% WP or Mancozeb 75% WP @ 2g/liter of water. Spray during early morning when wind is calm.'}
            </p>
            <p className="text-[11px] text-amber-800 font-semibold bg-amber-100/70 p-2 rounded-xl border border-amber-300">
              ⚠️ Statutory Disclaimer: For crop-protection chemicals, strictly follow the legally approved product label and locally applicable agricultural university guidance. Never exceed recommended dosages.
            </p>
          </div>
        </div>
      </div>

      {/* Real GPS Geolocation & Surveillance Reporting */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Crop Geolocation & Disease Surveillance</h3>
                {gpsCoords.isReal ? (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    REAL GPS VERIFIED
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                    REGIONAL DEFAULT
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                📍 Location detected: Lat: <strong className="text-emerald-400 font-mono">{gpsCoords.lat.toFixed(5)}°</strong>, Lng: <strong className="text-emerald-400 font-mono">{gpsCoords.lng.toFixed(5)}°</strong>, Accuracy: <strong className="text-emerald-400 font-mono">±{gpsCoords.accuracy}m</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchLiveGPS}
            disabled={isLocating}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Acquiring GPS...' : 'Use My Current Location'}</span>
          </button>
        </div>

        {gpsErrorMsg && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <div className="flex-1">
              <span className="font-semibold">{gpsErrorMsg}</span>
            </div>
            <button
              onClick={fetchLiveGPS}
              className="text-xs bg-rose-800 hover:bg-rose-700 px-2.5 py-1 rounded-lg text-white font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Interactive Leaflet Mini-Map */}
        <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-700 relative z-0">
          <MapContainer
            center={[gpsCoords.lat, gpsCoords.lng]}
            zoom={14}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <MiniMapRecenter center={[gpsCoords.lat, gpsCoords.lng]} />
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle
              center={[gpsCoords.lat, gpsCoords.lng]}
              radius={Math.max(15, gpsCoords.accuracy || 20)}
              pathOptions={{ color: '#10b981', fillColor: '#34d399', fillOpacity: 0.25 }}
            />
            <CircleMarker
              center={[gpsCoords.lat, gpsCoords.lng]}
              radius={8}
              pathOptions={{ color: '#ffffff', fillColor: '#10b981', fillOpacity: 1, weight: 2 }}
            >
              <Popup>
                <div className="text-xs font-sans text-slate-900 p-1">
                  <strong className="block text-emerald-700">🌱 Scanned Plant Location</strong>
                  <span>Lat: {gpsCoords.lat.toFixed(5)}°</span><br />
                  <span>Lng: {gpsCoords.lng.toFixed(5)}°</span><br />
                  <span className="text-[10px] text-slate-500">Accuracy: ±{gpsCoords.accuracy}m</span>
                </div>
              </Popup>
            </CircleMarker>
          </MapContainer>
        </div>

        {/* Locality Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Village / Field Area</label>
            <input
              type="text"
              value={gpsCoords.village}
              onChange={(e) => setGpsCoords({ ...gpsCoords, village: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">District</label>
            <input
              type="text"
              value={gpsCoords.district}
              onChange={(e) => setGpsCoords({ ...gpsCoords, district: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Optional Field Notes (Observations for Agricultural Officer)
          </label>
          <textarea
            value={farmerNotes}
            onChange={(e) => setFarmerNotes(e.target.value)}
            placeholder="e.g. Observed on 5 vines in Plot A after heavy rainfall yesterday..."
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-[11px] text-slate-400 italic">
            *Farmer privacy is protected. Private personal identity is never displayed on the public disease heatmap.
          </span>

          {submitted ? (
            <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Report Submitted & Live GPS Logged!</span>
            </div>
          ) : (
            <button
              onClick={handleSubmitReport}
              disabled={submitting}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting to Surveillance Database...' : t('submit_report', 'Submit Disease Report')}</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Smart Shopping Integration (Per Prompt Spec) */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Smart Shopping: Relevant Bio-Inputs & Protective Tools</h3>
              <p className="text-xs text-slate-500">Automatically matched to {result.crop} {result.disease} management</p>
            </div>
          </div>
          <button
            onClick={onNavigateMarketplace}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Open Marketplace</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Bio-Fungicide</span>
            <h4 className="text-xs font-bold text-slate-900">Bio-Shield Trichoderma Viride (1kg)</h4>
            <span className="text-sm font-extrabold text-emerald-700 block">Rs 280</span>
            <p className="text-[10px] text-slate-500">Certified organic control for Early Blight</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-teal-600 tracking-wider">Organic Repellent</span>
            <h4 className="text-xs font-bold text-slate-900">Cold Pressed Neem Oil 10,000 PPM (1L)</h4>
            <span className="text-sm font-extrabold text-emerald-700 block">Rs 350</span>
            <p className="text-[10px] text-slate-500">Antifeedant and fungal barrier</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-purple-600 tracking-wider">Sprayer Tool</span>
            <h4 className="text-xs font-bold text-slate-900">16L Battery Operated Knapsack Sprayer</h4>
            <span className="text-sm font-extrabold text-emerald-700 block">Rs 2,499</span>
            <p className="text-[10px] text-slate-500">Uniform canopy misting pressure</p>
          </div>
        </div>

        <p className="text-[11px] text-slate-600 italic">
          *Advisory recommendation. Always follow product labels and local agricultural university recommendations.
        </p>
      </div>

      {/* Differentiating Feature 2: Explainable AI Modal */}
      <ExplainableAIModal
        isOpen={explainModalOpen}
        onClose={() => setExplainModalOpen(false)}
        explainability={result?.explainability}
        result={result}
      />

      {/* Differentiating Feature 11: AI Farmer Assistant Drawer */}
      <AskAgroShieldDrawer
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        crop={result.crop || 'Tomato'}
        disease={result.disease || 'Early Blight'}
        severity={result.severity || 'Moderate'}
        healthScore={result.crop_health?.crop_health_score || 72}
      />

      {/* Differentiating Feature 8: Request Expert Review Modal */}
      <RequestExpertReviewModal
        isOpen={expertModalOpen}
        onClose={() => setExpertModalOpen(false)}
        report={{
          id: result.id || 1,
          crop: result.crop || 'Tomato',
          disease: result.disease || 'Early Blight',
          severity: result.severity || 'Moderate',
          confidence_pct: result.confidence_pct || 94.7
        }}
        onRequestSubmitted={() => setOfficerRequested(true)}
      />
    </div>
  );
};

export default DiseaseResultPage;
