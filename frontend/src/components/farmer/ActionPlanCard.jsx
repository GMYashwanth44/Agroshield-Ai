import React, { useState } from 'react';
import {
  Calendar, CheckCircle2, Circle, Clock, ChevronDown, ChevronUp,
  Sparkles, AlertCircle, ShieldCheck, Check, ArrowRight, Wrench
} from 'lucide-react';
import { api } from '../../services/api';

export const ActionPlanCard = ({
  actionPlan,
  reportId = null,
  onDayToggled = null
}) => {
  if (!actionPlan || !actionPlan.days || actionPlan.days.length === 0) return null;

  const [days, setDays] = useState(actionPlan.days);
  const [expandedDay, setExpandedDay] = useState(1);
  const [toggling, setToggling] = useState(false);

  const completedCount = days.filter(d => d.completed).length;
  const progressPct = Math.round((completedCount / days.length) * 100);

  const handleToggle = async (dayNumber) => {
    const updated = days.map(d => {
      if (d.day_number === dayNumber) {
        return { ...d, completed: !d.completed };
      }
      return d;
    });
    setDays(updated);

    if (reportId) {
      setToggling(true);
      try {
        const target = updated.find(d => d.day_number === dayNumber);
        await api.toggleActionPlanDay(reportId, dayNumber, target.completed);
        if (onDayToggled) onDayToggled(dayNumber, target.completed);
      } catch (err) {
        console.error('Failed to sync day toggle:', err);
      } finally {
        setToggling(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Personalized 7-Day Crop Action Plan
              </h3>
              <span className="text-[10px] uppercase font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                ICAR Guided
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {actionPlan.summary || `Tailored recovery protocol for ${actionPlan.crop}`}
            </p>
          </div>
        </div>

        {/* Potential points gain badge */}
        {actionPlan.potential_health_gain && (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-2xl text-xs font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>+{actionPlan.potential_health_gain} Pts Potential Recovery</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700">Protocol Progress</span>
          <span className="text-emerald-700">{completedCount} of 7 Days Completed ({progressPct}%)</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Days List / Accordion */}
      <div className="space-y-2.5">
        {days.map((d) => {
          const isExpanded = expandedDay === d.day_number;
          const isDone = d.completed;

          return (
            <div
              key={d.day_number}
              className={`rounded-2xl border transition-all ${
                isDone
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : isExpanded
                  ? 'bg-white border-slate-300 shadow-sm'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {/* Day Header */}
              <div className="p-3.5 flex items-center gap-3">
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggle(d.day_number)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border-2 border-slate-300 hover:border-emerald-500 bg-white text-transparent'
                  }`}
                  title={isDone ? 'Mark as incomplete' : 'Mark task completed'}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>

                {/* Day Badge & Title */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setExpandedDay(isExpanded ? null : d.day_number)}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                      Day {d.day_number}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                      {d.phase}
                    </span>
                    {d.estimated_points_gain && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded ml-auto sm:ml-0">
                        +{d.estimated_points_gain} pts
                      </span>
                    )}
                  </div>
                  <h4 className={`text-xs sm:text-sm font-bold truncate mt-0.5 ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {d.title}
                  </h4>
                </div>

                {/* Expand / Collapse Button */}
                <button
                  type="button"
                  onClick={() => setExpandedDay(isExpanded ? null : d.day_number)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Day Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs space-y-2.5">
                  <div className="text-slate-700 leading-relaxed">
                    <p>{d.action}</p>
                  </div>

                  {d.critical_instruction && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2 text-amber-900 text-[11px]">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Critical Agronomic Rule:</strong> {d.critical_instruction}
                      </div>
                    </div>
                  )}

                  {d.equipment_needed && d.equipment_needed.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Wrench className="w-3 h-3" /> Equipment:
                      </span>
                      {d.equipment_needed.map((eq, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md">
                          {eq}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center pt-1 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 italic">
          *{actionPlan.disclaimer || 'Advisory aligns with Indian Council of Agricultural Research (ICAR) recommendations.'}
        </p>
      </div>
    </div>
  );
};

export default ActionPlanCard;
