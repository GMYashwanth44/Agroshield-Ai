import React, { useState } from 'react';
import {
  Activity, ArrowUpRight, TrendingDown, TrendingUp,
  AlertCircle, CheckCircle, HelpCircle, Sparkles, ChevronRight
} from 'lucide-react';
import { useTranslation } from '../../i18n';

export const CropHealthScoreCard = ({ healthData, onImproveClick }) => {
  const { t } = useTranslation();
  const [showTips, setShowTips] = useState(false);

  const data = healthData || {
    crop_health_score: 72,
    status: 'Moderate Health',
    status_key: 'moderate',
    status_color: '#F59E0B',
    badge: 'Moderate',
    recovery_trend: 'Stable',
    deductions: [
      {
        factor: 'Moderate Disease Lesions (37% leaf area)',
        points_lost: 22,
        explanation: 'Necrotic foliar lesions reduce active chlorophyll photosynthetic area.'
      },
      {
        factor: 'Unfavorable Microclimate (High Humidity)',
        points_lost: 6,
        explanation: 'Relative humidity >80% elevates pathogen pressure.'
      }
    ],
    improvement_actions: [
      { action: 'Prune and safely destroy lower diseased foliage', potential_points: '+8 to +12 pts' },
      { action: 'Apply certified bio-fungicide (Trichoderma viride)', potential_points: '+10 to +15 pts' },
      { action: 'Switch to root-zone drip irrigation to reduce leaf wetness', potential_points: '+5 to +8 pts' },
      { action: 'Perform follow-up scan in 4 days with AgroShield', potential_points: '+5 pts' }
    ],
    score_history: [
      { date: 'Sep 06', score: 88, disease: 'Healthy Foliage' },
      { date: 'Sep 12', score: 79, disease: 'Early Spots' },
      { date: 'Sep 16', score: 68, disease: 'Early Blight' },
      { date: 'Today', score: 72, disease: 'Early Blight (Treatment started)' }
    ]
  };

  const score = data.crop_health_score || 72;
  const isOptimal = score >= 85;
  const isModerate = score >= 65 && score < 85;
  const isAtRisk = score >= 45 && score < 65;
  const isCritical = score < 45;

  const scoreColor = isOptimal ? 'text-emerald-600' : isModerate ? 'text-amber-500' : isAtRisk ? 'text-orange-500' : 'text-rose-600';
  const progressBg = isOptimal ? 'bg-emerald-500' : isModerate ? 'bg-amber-500' : isAtRisk ? 'bg-orange-500' : 'bg-rose-500';

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Crop Health Score
              </h3>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                0–100 Index
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Holistic index combining disease severity, scan history & weather risk
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black px-3 py-1 rounded-xl bg-slate-100 ${scoreColor}`}>
            {data.status}
          </span>
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
            {data.recovery_trend === 'Improving' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> : <Activity className="w-3.5 h-3.5 text-slate-400" />}
            <span>{data.recovery_trend}</span>
          </span>
        </div>
      </div>

      {/* Main Score & Progress Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Big Number */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center sm:text-left">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Current Score</span>
          <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-1">
            <span className={`text-4xl sm:text-5xl font-black ${scoreColor}`}>{score}</span>
            <span className="text-sm font-bold text-slate-400">/100</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Status: <strong className="text-slate-800">{data.status}</strong>
          </span>
        </div>

        {/* Score Bar & Scale */}
        <div className="sm:col-span-2 space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Critical (&lt;40)</span>
            <span>At Risk (40-64)</span>
            <span>Moderate (65-84)</span>
            <span>Optimal (85+)</span>
          </div>
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
            <div
              className={`h-full ${progressBg} transition-all duration-500 rounded-full`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Factors Reducing the Score */}
      {data.deductions && data.deductions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <span>Factors Reducing the Score</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {data.deductions.map((ded, idx) => (
              <div key={idx} className="bg-rose-50/50 border border-rose-100 p-3 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-950 truncate">{ded.factor}</span>
                  <span className="text-[11px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-lg shrink-0">
                    -{ded.points_lost} pts
                  </span>
                </div>
                <p className="text-[10px] text-rose-900 leading-snug">{ded.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How the Farmer Can Improve It */}
      <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>How to Improve Your Crop Health Score</span>
          </h4>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
            Action Steps
          </span>
        </div>

        <ul className="space-y-2 text-xs">
          {data.improvement_actions?.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between gap-2 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-slate-800 font-medium">{item.action}</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                {item.potential_points}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Score History Over Time */}
      {data.score_history && data.score_history.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Score Progression Over Time
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            {data.score_history.map((h, idx) => (
              <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 block">{h.date}</span>
                <span className="text-sm font-black text-slate-800 block">{h.score} pts</span>
                <span className="text-[10px] text-slate-500 truncate block">{h.disease}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[11px] text-slate-400 italic text-center">
        *Crop Health Score is an advisory diagnostic indicator calculated from visual lesion severity, weather stress, and scan history.
      </p>
    </div>
  );
};

export default CropHealthScoreCard;
