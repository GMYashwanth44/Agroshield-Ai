import React from 'react';
import {
  TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle,
  Sparkles, Calendar, ArrowRight, ShieldCheck, UserCheck
} from 'lucide-react';

export const RecoveryTracker = ({
  comparison,
  onRequestOfficer = null
}) => {
  if (!comparison) return null;

  const {
    status,
    verdict,
    verdict_color,
    score_delta,
    score_increased,
    area_delta_pct,
    area_reduced,
    action_advice,
    baseline_scan,
    follow_up_scan,
    escalation_needed,
    disclaimer
  } = comparison;

  const isPositive = score_delta > 0;
  const isNeutral = score_delta === 0;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Crop Recovery Progress (Before vs After)
              </h3>
              <span className="text-[10px] uppercase font-extrabold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                Sequential Audit
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Temporal analysis comparing baseline infection against current follow-up scan
            </p>
          </div>
        </div>

        {/* Verdict Badge */}
        <div className={`px-3.5 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 border ${
          verdict_color === 'emerald'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : verdict_color === 'teal'
            ? 'bg-teal-50 text-teal-800 border-teal-300'
            : verdict_color === 'amber'
            ? 'bg-amber-50 text-amber-800 border-amber-300'
            : 'bg-rose-50 text-rose-800 border-rose-300'
        }`}>
          {verdict_color === 'rose' ? (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>{verdict}</span>
        </div>
      </div>

      {/* 3 Metric Delta Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Health Score Change */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Health Score Shift
          </span>
          <div className="flex items-center justify-center gap-1.5">
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
            ) : isNeutral ? (
              <Minus className="w-5 h-5 text-slate-400 stroke-[2.5]" />
            ) : (
              <TrendingDown className="w-5 h-5 text-rose-600 stroke-[2.5]" />
            )}
            <span className={`text-2xl font-black ${isPositive ? 'text-emerald-700' : isNeutral ? 'text-slate-700' : 'text-rose-600'}`}>
              {score_delta > 0 ? `+${score_delta}` : score_delta}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            {baseline_scan?.crop_health_score || 58} pts → {follow_up_scan?.crop_health_score || 74} pts
          </span>
        </div>

        {/* Severity Migration */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Severity Migration
          </span>
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-800 pt-1">
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-xs">
              {baseline_scan?.severity || 'Severe'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs">
              {follow_up_scan?.severity || 'Mild'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block pt-0.5">
            Chlorophyll restoration active
          </span>
        </div>

        {/* Lesion Area Delta */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Lesion Foliage Area
          </span>
          <div className="flex items-center justify-center gap-1.5">
            <span className={`text-2xl font-black ${area_reduced ? 'text-emerald-700' : 'text-slate-800'}`}>
              {area_delta_pct > 0 ? `+${area_delta_pct}%` : `${area_delta_pct}%`}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            {baseline_scan?.affected_area_pct || 37}% → {follow_up_scan?.affected_area_pct || 20}% leaf coverage
          </span>
        </div>
      </div>

      {/* Side-by-Side Visual Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Baseline (Before) */}
        <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-700">
              📸 Baseline Scan (Before)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Scan #{baseline_scan?.id || 'Initial'}
            </span>
          </div>
          <div className="aspect-video w-full rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center relative">
            {baseline_scan?.image_url ? (
              <img
                src={baseline_scan.image_url}
                alt="Baseline leaf scan"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-3 text-slate-400 text-xs font-medium">
                Baseline leaf photo
              </div>
            )}
            <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs">
              {baseline_scan?.disease || 'Infected'} ({baseline_scan?.severity || 'Moderate'})
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span>Score: <strong>{baseline_scan?.crop_health_score || 58}/100</strong></span>
            <span>Lesion: <strong>{baseline_scan?.affected_area_pct || 37}%</strong></span>
          </div>
        </div>

        {/* Follow-up (After) */}
        <div className="p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-emerald-800">
              ✨ Follow-up Scan (After)
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold">
              Day 7 Rescan
            </span>
          </div>
          <div className="aspect-video w-full rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center relative border border-emerald-200">
            {follow_up_scan?.image_url ? (
              <img
                src={follow_up_scan.image_url}
                alt="Follow-up leaf scan"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-3 text-slate-400 text-xs font-medium">
                Follow-up leaf photo
              </div>
            )}
            <span className="absolute bottom-2 left-2 bg-emerald-900/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs">
              {follow_up_scan?.disease || 'Recovered'} ({follow_up_scan?.severity || 'Mild'})
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-900">
            <span>Score: <strong>{follow_up_scan?.crop_health_score || 74}/100</strong></span>
            <span>Lesion: <strong>{follow_up_scan?.affected_area_pct || 20}%</strong></span>
          </div>
        </div>
      </div>

      {/* Action Advice Box */}
      <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 ${
        escalation_needed
          ? 'bg-rose-50 border-rose-200 text-rose-950'
          : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
      }`}>
        {escalation_needed ? (
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <span className="font-bold block">Agronomic Recovery Evaluation:</span>
          <p>{action_advice}</p>
        </div>
      </div>

      {/* Escalation Button if Needed */}
      {escalation_needed && onRequestOfficer && (
        <div className="text-right">
          <button
            onClick={onRequestOfficer}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>Escalate Case to Agricultural Officer</span>
          </button>
        </div>
      )}

      <p className="text-[11px] text-slate-400 italic text-center pt-1 border-t border-slate-100">
        *{disclaimer}
      </p>
    </div>
  );
};

export default RecoveryTracker;
