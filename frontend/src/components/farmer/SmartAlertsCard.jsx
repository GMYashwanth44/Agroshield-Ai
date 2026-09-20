import React, { useState } from 'react';
import {
  Bell, ShieldAlert, AlertTriangle, Info, ChevronRight,
  ExternalLink, CheckCircle2, Sparkles, HelpCircle
} from 'lucide-react';
import { useTranslation } from '../../i18n';

export const SmartAlertsCard = ({ alerts, onNavigateTab }) => {
  const { t } = useTranslation();
  const [expandedAlert, setExpandedAlert] = useState(null);

  const alertList = alerts && alerts.length > 0 ? alerts : [
    {
      id: 'alert-1',
      type: 'community_surge',
      priority: 'HIGH',
      title: 'Community Surge: Rapid Rise in Early Blight',
      message: '28 reports of Early Blight detected across Kolar with a +45% case velocity over the past 4 days.',
      why_generated: 'Surveillance DBSCAN clustering observed rapid case acceleration in Srinivaspur & Kolar taluks, indicating elevated airborne fungal spore density.',
      action_label: 'Inspect Spread Map',
      action_tab: 'map'
    },
    {
      id: 'alert-2',
      type: 'future_risk',
      priority: 'HIGH',
      title: 'High Risk Alert: Favorable Pathogen Weather Approaching',
      message: 'Expected risk period: Next 2–4 Days. Relative humidity >82% and overcast skies favor spore germination.',
      why_generated: 'Generated because localized weather sensors predict a 48-hour moisture spike matching optimal Alternaria solani germination thresholds.',
      action_label: 'View Preventive Actions',
      action_tab: 'result'
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Smart Alert System</span>
              <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                {alertList.length} Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Intelligent notifications with explicit reasoning for every advisory
            </p>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alertList.map((alert) => {
          const isCritical = alert.priority === 'CRITICAL';
          const isHigh = alert.priority === 'HIGH';

          const borderStyle = isCritical
            ? 'border-rose-300 bg-rose-50/40'
            : isHigh
            ? 'border-amber-300 bg-amber-50/40'
            : 'border-slate-200 bg-slate-50/60';

          const badgeBg = isCritical
            ? 'bg-rose-600 text-white'
            : isHigh
            ? 'bg-amber-600 text-white'
            : 'bg-blue-600 text-white';

          return (
            <div key={alert.id} className={`rounded-2xl p-4 border shadow-xs transition space-y-3 ${borderStyle}`}>
              {/* Alert Title & Priority */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 flex-1">
                  <div className="mt-0.5 shrink-0">
                    {isCritical ? (
                      <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {alert.title}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${badgeBg}`}>
                  {alert.priority}
                </span>
              </div>

              {/* Explicit "WHY THIS ALERT WAS GENERATED" Reasoning Box */}
              <div className="bg-white/90 rounded-xl p-3 border border-slate-200/80 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="uppercase text-[10px] tracking-wider text-indigo-900 font-extrabold">
                    Why was this alert generated?
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-5 font-medium">
                  {alert.why_generated}
                </p>
              </div>

              {/* Action Button */}
              {alert.action_label && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onNavigateTab && onNavigateTab(alert.action_tab || 'dashboard')}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{alert.action_label}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SmartAlertsCard;
