import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Minus, Filter, Sparkles, AlertCircle,
  BarChart3, RefreshCw
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { api } from '../../services/api';

export const MarketPricesPage = () => {
  const { t } = useTranslation();
  const [prices, setPrices] = useState([]);
  const [trends, setTrends] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [loading, setLoading] = useState(true);

  const loadPricesAndTrends = async () => {
    setLoading(true);
    try {
      const [priceData, trendData] = await Promise.all([
        api.getMarketPrices('all', 'all'),
        api.getPriceTrends(selectedCrop)
      ]);
      setPrices(priceData || []);
      setTrends(trendData || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPricesAndTrends();
  }, [selectedCrop]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
              APMC Mandi Intelligence
            </span>
            <span className="text-xs text-slate-400">Daily Commodity Rates</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {t('market_prices', 'Agricultural Market Prices & AI Trend Projections')}
          </h1>
          <p className="text-xs text-slate-500">
            Real-time simulated APMC market rates across major vegetable, cereal, and cash crop mandis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
          >
            <option value="Tomato">Tomato</option>
            <option value="Potato">Potato</option>
            <option value="Rice">Rice (Paddy)</option>
            <option value="Corn">Corn / Maize</option>
            <option value="Cotton">Cotton</option>
          </select>

          <button
            onClick={loadPricesAndTrends}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* AI Market Price Projection Card (Prompt Spec) */}
      {trends && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                  AI Trend Analysis • {trends.crop}
                </span>
                <h3 className="text-lg font-bold">14-Day Expected Price Trajectory</h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Projected Direction</span>
                <span className="text-base font-extrabold text-emerald-400 flex items-center justify-end gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{trends.expected_trend}</span>
                </span>
              </div>
              <div className="bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-700 text-center">
                <span className="text-[10px] text-slate-400 block">Confidence</span>
                <span className="text-sm font-bold text-white">{trends.confidence_pct}%</span>
              </div>
            </div>
          </div>

          {/* Forecast Range & Rationale */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-slate-400 block font-semibold">Expected Price Range (Next 14 Days)</span>
              <span className="text-xl font-black text-white">{trends.expected_range}</span>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-slate-400 block font-semibold">Market Supply Factor</span>
              <p className="text-slate-300 text-xs leading-relaxed">{trends.rationale}</p>
            </div>
          </div>

          {/* Historical Trend Bar Chart Visualization */}
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 space-y-2">
            <span className="text-[11px] text-slate-400 block font-semibold">Recent vs Projected APMC Rates (Rs/Qtl)</span>
            <div className="grid grid-cols-7 gap-2 text-center pt-2">
              {trends.historical_prices_last_30d?.map((pt, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-20 bg-slate-700/50 rounded-xl flex items-end justify-center p-1">
                    <div
                      className={`w-full rounded-lg transition-all ${
                        pt.date.includes('Est') ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ height: `${(pt.price / 2600) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-300 font-bold block">Rs {pt.price}</span>
                  <span className="text-[9px] text-slate-400 block truncate">{pt.date}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            *{trends.disclaimer}
          </p>
        </div>
      )}

      {/* Mandi Price Comparison Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Nearby APMC Market Rates Comparison (DEMO DATA)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="p-3">Crop Commodity</th>
                <th className="p-3">APMC Mandi</th>
                <th className="p-3">District / State</th>
                <th className="p-3 text-right">Modal Rate</th>
                <th className="p-3 text-right">Min - Max</th>
                <th className="p-3 text-center">Daily Change</th>
                <th className="p-3 text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prices.map((p) => {
                const isUp = p.trend === 'Increasing';
                const isDown = p.trend === 'Decreasing';

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900">{p.crop}</td>
                    <td className="p-3 text-slate-700">{p.market_name}</td>
                    <td className="p-3 text-slate-500">{p.district}, {p.state}</td>
                    <td className="p-3 text-right font-black text-slate-900 text-sm">
                      Rs {p.modal_price} <span className="text-[10px] text-slate-400 font-normal">/ Qtl</span>
                    </td>
                    <td className="p-3 text-right text-slate-600">
                      Rs {p.min_price} - {p.max_price}
                    </td>
                    <td className="p-3 text-center font-bold">
                      <span className={isUp ? 'text-emerald-600' : isDown ? 'text-rose-600' : 'text-slate-600'}>
                        {p.price_change_pct > 0 ? `+${p.price_change_pct}%` : `${p.price_change_pct}%`}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          isUp
                            ? 'bg-emerald-100 text-emerald-800'
                            : isDown
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        <span>{p.trend}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketPricesPage;
