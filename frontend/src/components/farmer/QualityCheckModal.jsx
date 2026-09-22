import React from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, ArrowRight,
  Sun, Eye, Focus, Smartphone, Compass
} from 'lucide-react';

export const QualityCheckModal = ({ isOpen, onClose, result, onProceed, onRetry }) => {
  if (!isOpen || !result) return null;

  const isPassed = result.passed !== undefined ? Boolean(result.passed) : Boolean(result.is_valid);
  const issues = result.issues || [];
  const guidance = result.guidance || [];
  const metrics = result.metrics || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          {isPassed ? (
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <XCircle className="w-7 h-7" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isPassed ? 'Smart Quality Check Passed' : 'Image Quality Needs Adjustment'}
            </h3>
            <p className="text-xs text-slate-500">
              {isPassed ? 'Ready for calibrated diagnostic inference' : 'Field Assistant Guidance'}
            </p>
          </div>
        </div>

        <p className={`text-xs p-3 rounded-xl border font-medium ${isPassed ? 'bg-emerald-50 text-emerald-950 border-emerald-200' : 'bg-rose-50 text-rose-950 border-rose-200'}`}>
          {result.message}
        </p>

        {/* Detected Issues List if failed */}
        {!isPassed && issues.length > 0 && (
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-1 text-xs">
            <span className="font-bold text-rose-900 block">Issues Detected:</span>
            <ul className="space-y-1 text-rose-800 text-[11px]">
              {issues.map((issue, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quality Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Sharpness / Focus</span>
            <span className="font-bold text-slate-800">
              {metrics.blur_score ? `${metrics.blur_score} (Score)` : 'Optimal'}
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Lighting Luminance</span>
            <span className="font-bold text-slate-800">
              {metrics.mean_luminance ? `${metrics.mean_luminance} / 255` : 'Balanced'}
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Resolution</span>
            <span className="font-bold text-slate-800">
              {metrics.width && metrics.height ? `${metrics.width} × ${metrics.height}` : 'HD'}
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Leaf Foliage Ratio</span>
            <span className="font-bold text-slate-800">
              {metrics.foliage_ratio !== undefined ? `${metrics.foliage_ratio}% of frame` : 'Verified'}
            </span>
          </div>
        </div>

        {/* Actionable Photography Assistant Guidance */}
        {guidance.length > 0 && (
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span>Smart Capture Guidance:</span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px]">
              {guidance.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {isPassed ? (
            <button
              onClick={onProceed}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition text-xs"
            >
              <span>Run AI Disease Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-full flex gap-2">
              <button
                onClick={onRetry}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Photo / Upload New Image</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityCheckModal;
