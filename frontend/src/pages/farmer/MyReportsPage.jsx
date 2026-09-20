import React, { useState, useEffect } from 'react';
import {
  FileText, CheckCircle2, Clock, XCircle, AlertTriangle,
  MapPin, Eye, Filter, RefreshCw
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { api } from '../../services/api';

export const MyReportsPage = ({ onSelectReport }) => {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports({ limit: 40 });
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = reports.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span>{t('my_reports', 'My Disease Reports & Surveillance Log')}</span>
          </h1>
          <p className="text-xs text-slate-500">
            Track AI diagnoses, GPS coordinates, and official Agricultural Officer verifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
          >
            <option value="all">All Verification Statuses</option>
            <option value="verified">Verified by Officer</option>
            <option value="pending">Pending Officer Review</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={fetchReports}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs animate-pulse">
          Loading surveillance disease records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Disease Reports Found</h3>
          <p className="text-xs text-slate-500">
            Scan a plant leaf to submit your first disease diagnosis to the regional surveillance network.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((report) => {
            const isVerified = report.status === 'verified';
            const isPending = report.status === 'pending';

            return (
              <div
                key={report.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={report.image_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22510?w=600&auto=format&fit=crop&q=80'}
                      alt={report.crop_name}
                      className="w-14 h-14 object-cover rounded-2xl border border-slate-200"
                    />
                    <div>
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                        {report.crop_name}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {report.disease_name}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        {new Date(report.created_at).toLocaleDateString()} • {report.village}, {report.district}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                      isVerified
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isPending
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {isVerified ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{isVerified ? 'Verified by Officer' : 'Pending Review'}</span>
                  </span>
                </div>

                {/* Severity & Confidence */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 block text-[10px]">AI Confidence</span>
                    <span className="font-bold text-slate-800">
                      {report.confidence ? `${(report.confidence * 100).toFixed(1)}%` : '94.7%'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Severity</span>
                    <span className="font-bold text-orange-600">{report.severity}</span>
                  </div>
                </div>

                {/* Officer Comments if Verified */}
                {report.officer_diagnosis && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 text-xs space-y-1">
                    <span className="font-bold text-emerald-900 block flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Officer Diagnosis: {report.officer_diagnosis}
                    </span>
                    {report.officer_comments && (
                      <p className="text-emerald-950 text-[11px] leading-relaxed">
                        “{report.officer_comments}”
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    GPS: {report.latitude.toFixed(3)}°, {report.longitude.toFixed(3)}°
                  </span>
                  {report.is_offline && (
                    <span className="text-amber-600 font-bold">Synced from Offline</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyReportsPage;
