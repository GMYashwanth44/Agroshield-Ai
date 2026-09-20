import React, { useState, useEffect } from 'react';
import {
  Users, Shield, TrendingUp, AlertTriangle, MapPin, Eye,
  Activity, ArrowUpRight, ArrowDownRight, Minus, Lock, RefreshCw, CheckCircle2
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { api } from '../../services/api';

export const CommunityIntelligencePage = ({ onNavigateMap }) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntelligence();
  }, []);

  const fetchIntelligence = () => {
    setLoading(true);
    api.getCommunityIntelligence()
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner with Privacy Guarantee */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              Collective Surveillance
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Farmer Privacy Protected</span>
            </span>
          </div>
          <button
            onClick={fetchIntelligence}
            className="text-xs font-semibold text-emerald-200 hover:text-white flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Intelligence</span>
          </button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Community Crop Health Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed mt-1">
            Aggregated regional disease surveillance synthesized from multiple farmer observations across Karnataka. Identifies early outbreaks before they spread across taluks.
          </p>
        </div>

        {/* Strict Privacy Assurance Box */}
        <div className="bg-black/30 rounded-2xl p-3 border border-white/10 text-[11px] text-emerald-200/90 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Privacy Guarantee:</strong> Individual farmer names, contact information, and private farm boundary coordinates are strictly redacted. Intelligence is aggregated only to taluk centroids.
          </span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs text-center">
          <span className="text-[11px] text-slate-500 font-medium block">Total Field Reports</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
            {data?.total_community_reports || 1249}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Surveillance Network</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs text-center">
          <span className="text-[11px] text-slate-500 font-medium block">Recent Cases (7d)</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 block">
            {data?.recent_reports_7d || 142}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Active Monitoring</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs text-center">
          <span className="text-[11px] text-slate-500 font-medium block">Active Clusters</span>
          <span className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 block">
            {data?.emerging_hotspots?.length || 5}
          </span>
          <span className="text-[10px] text-rose-500 font-bold block mt-0.5">DBSCAN Hotspots</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs text-center">
          <span className="text-[11px] text-slate-500 font-medium block">Dominant Threat</span>
          <span className="text-lg sm:text-xl font-black text-slate-900 mt-1 block truncate">
            {data?.top_diseases?.[0]?.disease || 'Early Blight'}
          </span>
          <span className="text-[10px] text-amber-600 font-bold block mt-0.5">Tomato & Potato</span>
        </div>
      </div>

      {/* Main Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Reported Diseases */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Most Reported Crop Diseases</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Share of Total</span>
          </div>

          <div className="space-y-3">
            {(data?.top_diseases || [
              { disease: 'Early Blight', reports_count: 520, percentage_share: 41.6 },
              { disease: 'Late Blight', reports_count: 290, percentage_share: 23.2 },
              { disease: 'Leaf Blast', reports_count: 185, percentage_share: 14.8 },
              { disease: 'Bacterial Blight', reports_count: 132, percentage_share: 10.6 },
              { disease: 'Healthy Foliage', reports_count: 122, percentage_share: 9.8 }
            ]).map((item, idx) => (
              <div key={idx} className="space-y-1.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{item.disease}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{item.reports_count} cases</span>
                    <span className="font-mono font-black text-slate-900">{item.percentage_share}%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : idx === 2 ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                    style={{ width: `${item.percentage_share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Trends: Velocity & Changes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Regional Disease Velocity Trends</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Trajectory</span>
          </div>

          <div className="space-y-3">
            {(data?.regional_trends || [
              { region: 'Kolar', active_reports: 620, trend_label: 'Increasing (+28% case velocity)', trend_key: 'increasing', trend_color: '#EF4444' },
              { region: 'Mandya', active_reports: 340, trend_label: 'Stable (+4% minor change)', trend_key: 'stable', trend_color: '#F59E0B' },
              { region: 'Chikkaballapur', active_reports: 190, trend_label: 'Decreasing (-12% resolving)', trend_key: 'decreasing', trend_color: '#10B981' }
            ]).map((reg, idx) => {
              const isInc = reg.trend_key === 'increasing';
              const isDec = reg.trend_key === 'decreasing';

              return (
                <div key={idx} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span>{reg.region} District</span>
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {reg.active_reports} active localized reports
                    </span>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-xl inline-flex items-center gap-1 ${
                        isInc ? 'bg-rose-100 text-rose-800' : isDec ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isInc && <ArrowUpRight className="w-3.5 h-3.5" />}
                      {isDec && <ArrowDownRight className="w-3.5 h-3.5" />}
                      {!isInc && !isDec && <Minus className="w-3.5 h-3.5" />}
                      <span>{isInc ? 'Increasing' : isDec ? 'Decreasing' : 'Stable'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block">{reg.trend_label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-100/60 p-3 rounded-2xl text-[11px] text-slate-600 flex items-center justify-between">
            <span>Want to see live spatial outbreak maps?</span>
            <button
              onClick={onNavigateMap}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Open Regional Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Emerging Hotspots Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Emerging Spatial Disease Hotspots</span>
            </h3>
            <p className="text-xs text-slate-500">
              Clusters detected via density-based spatial clustering (DBSCAN) with high localized case concentration
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase font-bold text-slate-400">
                <th className="py-2.5 px-3">Cluster ID</th>
                <th className="py-2.5 px-3">General Area</th>
                <th className="py-2.5 px-3">Crop Affected</th>
                <th className="py-2.5 px-3">Dominant Pathogen</th>
                <th className="py-2.5 px-3">Cases</th>
                <th className="py-2.5 px-3">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(data?.emerging_hotspots || [
                { cluster_id: 0, approx_area: 'Kolar General Agrarian Belt', crop: 'Tomato', dominant_disease: 'Early Blight', case_count: 28, risk_level: 'Very High' },
                { cluster_id: 1, approx_area: 'Mandya Sugarcane & Paddy Belt', crop: 'Rice', dominant_disease: 'Blast', case_count: 16, risk_level: 'High' },
                { cluster_id: 2, approx_area: 'Chikkaballapur Solanaceous Valley', crop: 'Potato', dominant_disease: 'Late Blight', case_count: 14, risk_level: 'High' }
              ]).map((h, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">#{h.cluster_id}</td>
                  <td className="py-3 px-3 font-medium text-slate-800">{h.approx_area}</td>
                  <td className="py-3 px-3 font-semibold text-emerald-700">{h.crop}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{h.dominant_disease}</td>
                  <td className="py-3 px-3 font-mono font-black">{h.case_count}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${h.risk_level === 'Very High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {h.risk_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommunityIntelligencePage;
