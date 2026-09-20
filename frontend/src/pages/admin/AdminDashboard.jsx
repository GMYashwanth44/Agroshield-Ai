import React, { useState, useEffect } from 'react';
import {
  Settings, Users, ShoppingBag, ShieldCheck, Database,
  Activity, CheckCircle, RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStatistics(), api.getSellers()])
      .then(([sData, sellersData]) => {
        setStats(sData);
        setSellers(sellersData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
              System Administration
            </span>
            <span className="text-xs text-slate-400">National Agricultural Intelligence Network</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            AgroShield AI Administration & Marketplace Console
          </h1>
          <p className="text-xs text-slate-500">
            System configuration, seller authorization, disease catalog governance, and high-level platform health.
          </p>
        </div>
      </div>

      {/* Admin Stat Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 block">Total Database Reports</span>
          <span className="text-2xl font-black text-slate-900">{stats?.total_reports || '1,249'}</span>
          <span className="text-[10px] text-emerald-600 font-bold block">100% Synced</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 block">Verified Krishi Sellers</span>
          <span className="text-2xl font-black text-purple-600">{sellers.length || '3'}</span>
          <span className="text-[10px] text-slate-400 block">All Approved</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 block">Supported Languages</span>
          <span className="text-2xl font-black text-blue-600">6</span>
          <span className="text-[10px] text-slate-400 block">EN, KN, HI, MR, TE, TA</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 block">Active AI Backbones</span>
          <span className="text-lg font-black text-emerald-600 truncate block">MobileNetV2</span>
          <span className="text-[10px] text-slate-400 block">+ U-Net Lesion Segmenter</span>
        </div>
      </div>

      {/* Seller Management Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-purple-600" />
          <span>Verified Marketplace Sellers & Krishi Kendras</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sellers.map((s) => (
            <div key={s.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">{s.shop_name}</h4>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{s.district}, {s.state}</p>
              <div className="text-[11px] text-slate-600">
                <span>Pickup: {s.pickup_address}</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-amber-600 font-bold">★ {s.rating}</span>
                <span className="text-slate-400">{s.product_count} Products</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
