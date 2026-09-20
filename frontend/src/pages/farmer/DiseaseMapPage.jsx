import React, { useState, useEffect } from 'react';
import {
  MapPin, ShieldAlert, Sparkles, Activity, Filter, RefreshCw,
  Layers, ArrowUpRight, CheckCircle2, AlertTriangle, Wind, Compass, Info
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { api } from '../../services/api';
import DiseaseHeatmap from '../../components/maps/DiseaseHeatmap';

export const DiseaseMapPage = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [outbreaks, setOutbreaks] = useState([]);
  const [spreadProjections, setSpreadProjections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('clusters'); // 'clusters' | 'projections'

  const loadSurveillanceData = async () => {
    setLoading(true);
    try {
      const [repsData, hotData, outData, projData] = await Promise.all([
        api.getReports({ limit: 400 }),
        api.getHotspots(15, 5),
        api.getOutbreaks(7),
        api.getSpreadProjections(3).catch(() => ({ projections: [] }))
      ]);
      setReports(repsData || []);
      setHotspots(hotData.hotspots || []);
      setOutbreaks(outData.alerts || []);
      setSpreadProjections(projData.projections || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveillanceData();
  }, []);

  // Simulate nearby burst for SIH demonstration
  const handleSimulateCluster = async () => {
    setSimulating(true);
    try {
      await api.simulateCluster('Kolar', 'Early Blight', 'Tomato');
      await loadSurveillanceData();
      alert('Simulated 15 new local Early Blight cases in Srinivaspur cluster. Heatmap, DBSCAN hotspots, and Spread Projections refreshed!');
    } catch (err) {
      alert('Cluster simulation failed: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-md">
              Regional Surveillance
            </span>
            <span className="text-xs text-slate-400">OpenStreetMap + DBSCAN + Microclimate Wind Vectors</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {t('disease_map', 'Regional Crop Disease Surveillance & Spread Projections')}
          </h1>
          <p className="text-xs text-slate-500">
            Transforms individual farmer smartphone diagnoses into community-level early warning intelligence with privacy-safe aggregation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateCluster}
            disabled={simulating}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition"
            title="Inject simulated nearby reports to demonstrate live DBSCAN clustering"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{simulating ? 'Simulating...' : 'Simulate Nearby Surge (SIH)'}</span>
          </button>

          <button
            onClick={loadSurveillanceData}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Outbreak Warnings Bar */}
      {outbreaks.length > 0 && (
        <div className="space-y-2">
          {outbreaks.slice(0, 2).map((alertItem, idx) => (
            <div
              key={idx}
              className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3 shadow-xs"
            >
              <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-rose-900 uppercase tracking-wide">
                    🚨 {alertItem.status_label || 'POTENTIAL OUTBREAK RISK'}
                  </span>
                  <span className="text-[10px] bg-rose-200 text-rose-950 font-extrabold px-2 py-0.5 rounded">
                    +{alertItem.growth_rate}% 3-Day Velocity
                  </span>
                  <span className="text-[10px] text-slate-500 ml-auto hidden sm:inline">
                    Confidence: {(alertItem.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-rose-950 font-medium leading-relaxed">
                  {alertItem.alert_message}
                </p>
                <p className="text-[10px] text-slate-500 italic">
                  *{alertItem.disclaimer || 'AI-assisted risk indicator. Never confirmed without field validation.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Map with Spread Projections */}
      <DiseaseHeatmap
        reports={reports}
        projections={spreadProjections}
        center={[13.3392, 78.2139]}
        zoom={9}
      />

      {/* Surveillance Deep-Dive Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('clusters')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'clusters'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>DBSCAN Confirmed Clusters ({hotspots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('projections')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'projections'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>Spread-Risk Projections ({spreadProjections.length})</span>
          </button>
        </div>

        {activeTab === 'clusters' ? (
          /* DBSCAN Hotspots Detection Panel */
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span>DBSCAN Geographic Hotspots ({hotspots.length} Clusters Detected)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  <strong>Hotspot = statistically high concentration of disease reports within a density radius.</strong>
                </p>
              </div>

              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Epsilon: 15 km • Min Samples: 5
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hotspots.map((h, i) => {
                const isVeryHigh = h.risk_level === 'Very High';
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border space-y-2 transition ${
                      isVeryHigh
                        ? 'bg-rose-50/70 border-rose-300'
                        : 'bg-amber-50/70 border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                        Cluster #{h.cluster_id}: {h.district}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isVeryHigh ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                        }`}
                      >
                        {h.risk_level} Risk
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <p><strong>Primary Crop:</strong> {h.crop}</p>
                      <p><strong>Dominant Disease:</strong> {h.dominant_disease}</p>
                      <p><strong>Concentrated Reports:</strong> <span className="font-bold text-rose-600">{h.case_count} cases</span></p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Center: {h.center_lat?.toFixed(3)}° N, {h.center_lng?.toFixed(3)}° E
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-600 italic bg-white/70 p-2 rounded-xl border border-slate-200">
                      {h.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Spread-Risk Projections Panel */
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wind className="w-5 h-5 text-rose-600" />
                  <span>Disease Spread-Risk Projections (Next 48–72 Hours)</span>
                </h3>
                <p className="text-xs text-rose-700 font-semibold mt-0.5">
                  ⚠️ Projected Risk Area (Estimated spread vector; not confirmed future disease locations)
                </p>
              </div>

              <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                Physics & Microclimate Dispersion Model
              </span>
            </div>

            {spreadProjections.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No active disease clusters currently exceeding the high spread threshold.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spreadProjections.map((proj, i) => (
                  <div key={i} className="p-5 rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50/50 to-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-slate-900">
                          {proj.source_cluster} Corridor
                        </span>
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                          {proj.estimated_spread_timeline}
                        </span>
                      </div>
                      <span className="text-[10px] bg-rose-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                        {proj.risk_tier} RISK
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Pathogen</span>
                        <span className="font-bold text-slate-900">{proj.disease_name}</span>
                        <span className="text-slate-500 text-[11px] block">{proj.crop_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Estimated Buffer Radius</span>
                        <span className="font-bold text-rose-600">+{proj.projected_radius_km} km</span>
                        <span className="text-slate-500 text-[11px] block">downstream</span>
                      </div>
                    </div>

                    {proj.vector_factors && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Projection Factors:
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-700">
                          <div><strong>Wind:</strong> {proj.vector_factors.prevailing_wind}</div>
                          <div><strong>Velocity:</strong> {proj.vector_factors.wind_speed_kmh} km/h</div>
                          <div><strong>RH:</strong> {proj.vector_factors.favorable_humidity}</div>
                          <div><strong>Temp:</strong> {proj.vector_factors.optimal_spore_temp}</div>
                        </div>
                        <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                          Host Density: {proj.vector_factors.host_crop_density}
                        </p>
                      </div>
                    )}

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-0.5">
                      <div className="font-bold text-[11px] flex items-center gap-1 text-amber-950">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Buffer Zone Actionable Recommendation</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {proj.buffer_zone_recommendation}
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-400 italic">
                      *{proj.disclaimer}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseMapPage;
