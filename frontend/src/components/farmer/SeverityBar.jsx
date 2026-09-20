import React from 'react';

export const SeverityBar = ({ affectedAreaPct = 37.0, severity = 'Moderate' }) => {
  // 0-5% Healthy, 5-20% Mild, 20-50% Moderate, >50% Severe
  const pct = Math.min(100, Math.max(0, affectedAreaPct));

  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (pct > 50) badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
  else if (pct > 20) badgeColor = 'bg-orange-100 text-orange-800 border-orange-300';
  else if (pct > 5) badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Estimated Affected Area
          </span>
          <span className="text-base font-bold text-slate-900">{pct}%</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
          Severity: {severity}
        </span>
      </div>

      {/* Multi-segment progress bar */}
      <div className="relative w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex">
        {/* Healthy: 0-5% */}
        <div className="h-full bg-emerald-400" style={{ width: '5%' }} title="Healthy (0-5%)" />
        {/* Mild: 5-20% (width 15%) */}
        <div className="h-full bg-amber-400" style={{ width: '15%' }} title="Mild (5-20%)" />
        {/* Moderate: 20-50% (width 30%) */}
        <div className="h-full bg-orange-400" style={{ width: '30%' }} title="Moderate (20-50%)" />
        {/* Severe: 50-100% (width 50%) */}
        <div className="h-full bg-rose-500" style={{ width: '50%' }} title="Severe (>50%)" />

        {/* Current position needle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-black shadow-md transition-all duration-500"
          style={{ left: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-600 font-medium px-0.5">
        <span>0% (Healthy)</span>
        <span>5% (Mild)</span>
        <span>20% (Mod)</span>
        <span>50% (Severe)</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default SeverityBar;
