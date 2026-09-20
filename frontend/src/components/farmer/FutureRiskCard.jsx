import React, { useState } from 'react';
import {
  TrendingUp, AlertTriangle, CheckCircle, ShieldAlert,
  Calendar, CloudRain, Thermometer, Droplets, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import { useTranslation } from '../../i18n';

export const FutureRiskCard = ({ riskData, crop = 'Tomato', disease = 'Early Blight' }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const data = riskData || {
    crop,
    disease,
    district: 'Kolar',
    risk_level: 'HIGH',
    risk_score: 75,
    risk_color: '#EF4444',
    expected_risk_period: 'Next 2–4 Days (Immediate High Risk Window)',
    main_reasons: [
      'Elevated relative humidity (82%) strongly accelerates fungal spore germination and lesion expansion.',
      'Ambient temperature (24.5°C) falls right within the optimal thermal band (20–28°C) for Early Blight development.',
      'High precipitation probability (65%) causes prolonged leaf wetness and rainwater splash dispersal.',
      'High localized surveillance activity: 18 similar disease detections reported within your taluk/district.'
    ],
    preventive_actions: [
      'Apply a prophylactic foliar protective spray (e.g. bio-fungicide Trichoderma viride or approved contact fungicide) before rain onset.',
      'Ensure 60x45 cm row spacing and remove severely infected lower leaves immediately to interrupt spore splash.',
      'Discontinue overhead irrigation immediately; switch to root-zone drip to eliminate leaf moisture.',
      'Schedule a follow-up scan with AgroShield in 3–4 days to verify containment.'
    ],
    input_factors: {
      temperature_c: 24.5,
      relative_humidity_pct: 82.0,
      rain_probability_pct: 65.0,
      nearby_community_cases: 18
    },
    is_estimate: true,
    disclaimer: 'Future Disease Risk Estimate is a predictive heuristic based on weather, pathogen biology, and local case density. Clearly labeled as an advisory estimate; never claim laboratory-validated certainty.'
  };

  const isHigh = data.risk_level === 'HIGH';
  const isMed = data.risk_level === 'MEDIUM';

  const badgeBg = isHigh ? 'bg-rose-100 text-rose-800 border-rose-300' : isMed ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300';
  const borderCard = isHigh ? 'border-rose-200 bg-gradient-to-br from-rose-50/40 via-white to-orange-50/30' : isMed ? 'border-amber-200 bg-gradient-to-br from-amber-50/40 via-white to-yellow-50/30' : 'border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30';

  return (
    <div className={`rounded-3xl p-6 border shadow-sm space-y-4 ${borderCard}`}>
      {/* Title & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold ${isHigh ? 'bg-rose-500 text-white' : isMed ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Future Disease Risk Prediction
              </h3>
              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                Advisory Estimate
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Anticipating crop vulnerability for {data.crop} over the coming week
            </p>
          </div>
        </div>

        {/* Risk Level Badge */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black px-3.5 py-1.5 rounded-xl border ${badgeBg} shadow-xs`}>
            {data.risk_level} RISK
          </span>
        </div>
      </div>

      {/* Expected Risk Window */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/70 text-xs">
        <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
        <span className="text-slate-500 font-medium">Expected Risk Period:</span>
        <span className="font-bold text-slate-900">{data.expected_risk_period}</span>
      </div>

      {/* Microclimate Input Factors */}
      {data.input_factors && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" />
              <span>Temp</span>
            </div>
            <span className="font-extrabold text-slate-800 mt-0.5 block">{data.input_factors.temperature_c}°C</span>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>Humidity</span>
            </div>
            <span className="font-extrabold text-slate-800 mt-0.5 block">{data.input_factors.relative_humidity_pct}%</span>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
              <CloudRain className="w-3.5 h-3.5 text-indigo-500" />
              <span>Rain Chance</span>
            </div>
            <span className="font-extrabold text-slate-800 mt-0.5 block">{data.input_factors.rain_probability_pct}%</span>
          </div>
        </div>
      )}

      {/* Main Reasons for the Risk */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>Primary Drivers for {data.risk_level} Risk</span>
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-700">
          {data.main_reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-slate-100">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
              <span className="leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Preventive Actions */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <span>Recommended Preventive Actions (Immediate)</span>
        </h4>
        <ul className="space-y-2 text-xs text-slate-800">
          {data.preventive_actions.map((act, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{act}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Transparency Disclaimer */}
      <p className="text-[11px] text-slate-500 italic text-center">
        *Disclaimer: Future disease risk prediction is an algorithmic prototype estimate based on weather forecasts, pathogen susceptibility, and community reports. Never claim laboratory certainty.
      </p>
    </div>
  );
};

export default FutureRiskCard;
