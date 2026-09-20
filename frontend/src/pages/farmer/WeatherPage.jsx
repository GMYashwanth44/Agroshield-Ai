import React, { useState, useEffect } from 'react';
import {
  CloudSun, Droplets, Wind, Thermometer, AlertTriangle, FlaskConical,
  Sprout, CheckCircle2, ChevronRight, Sparkles, Send, RefreshCw
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { api } from '../../services/api';

export const WeatherPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('weather'); // 'weather', 'soil', 'crop_rec'
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Soil Form State
  const [soilForm, setSoilForm] = useState({
    ph: 6.4,
    nitrogen: 210,
    phosphorus: 28.5,
    potassium: 195,
    organic_carbon: 0.55
  });
  const [soilResult, setSoilResult] = useState(null);
  const [soilLoading, setSoilLoading] = useState(false);

  // Crop Recommendation Form State
  const [cropForm, setCropForm] = useState({
    soil_type: 'Red Loam',
    water_availability: 'moderate',
    season: 'kharif',
    previous_crop: 'Pulses'
  });
  const [cropResult, setCropResult] = useState(null);
  const [cropLoading, setCropLoading] = useState(false);

  useEffect(() => {
    api.getWeather('Kolar', 'Tomato')
      .then(res => setWeatherData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSoilSubmit = async (e) => {
    e.preventDefault();
    setSoilLoading(true);
    try {
      const res = await api.analyzeSoil(soilForm);
      setSoilResult(res);
    } catch (err) {
      alert('Soil analysis failed: ' + err.message);
    } finally {
      setSoilLoading(false);
    }
  };

  const handleCropRecSubmit = async (e) => {
    e.preventDefault();
    setCropLoading(true);
    try {
      const res = await api.recommendCrop(cropForm);
      setCropResult(res);
    } catch (err) {
      alert('Crop recommendation failed: ' + err.message);
    } finally {
      setCropLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-amber-500" />
            <span>Weather, Soil Health & Smart Crop Advisory</span>
          </h1>
          <p className="text-xs text-slate-500">
            Microclimate risk index, laboratory soil test interpreter, and agro-climatic crop matching
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'weather' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🌤️ Weather & Crop Risk
          </button>
          <button
            onClick={() => setActiveTab('soil')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'soil' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🧪 Soil Assistant
          </button>
          <button
            onClick={() => setActiveTab('crop_rec')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'crop_rec' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🌱 Crop Recommender
          </button>
        </div>
      </div>

      {/* TAB 1: Weather & Crop Risk */}
      {activeTab === 'weather' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {weatherData && (
            <>
              {/* Main Weather Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                      Microclimate Observation • {weatherData.district}
                    </span>
                    <h2 className="text-xl font-bold mt-0.5">Agricultural Weather & Disease Pressure</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-white">{weatherData.temperature_c}°C</span>
                    <span className="text-[10px] text-slate-400 block">Current Ambient Temp</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                    <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Relative Humidity</span>
                    <span className="text-base font-bold">{weatherData.humidity_pct}%</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                    <CloudSun className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Precipitation</span>
                    <span className="text-base font-bold">{weatherData.rainfall_mm} mm</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                    <Wind className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Wind Velocity</span>
                    <span className="text-base font-bold">{weatherData.wind_speed_kmh} km/h</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                    <AlertTriangle className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Fungal Blight Risk</span>
                    <span className="text-base font-bold text-rose-400">{weatherData.disease_risk_index}</span>
                  </div>
                </div>

                {/* Advisory Notice */}
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs space-y-1">
                  <span className="font-bold text-rose-300 block uppercase tracking-wide">
                    Meteorological Disease Risk Advisory ({weatherData.crop})
                  </span>
                  <p className="text-slate-200 leading-relaxed">{weatherData.risk_advisory}</p>
                </div>
              </div>

              {/* 5-Day Forecast Cards */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  5-Day Agro-Weather Forecast
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {weatherData.forecast?.map((day, idx) => (
                    <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center space-y-1">
                      <span className="text-xs font-bold text-slate-800 block">{day.day}</span>
                      <span className="text-lg font-black text-slate-900 block">{day.temp}</span>
                      <span className="text-[10px] text-slate-500 block line-clamp-1">{day.condition}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                        Risk: {day.risk}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: Soil Health Assistant */}
      {activeTab === 'soil' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Input Form */}
            <form onSubmit={handleSoilSubmit} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-emerald-600" />
                  <span>Enter Soil Test Report Parameters</span>
                </h3>
                <p className="text-xs text-slate-500">Parameters from your soil health card (Kisan Soil Health Card)</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Soil pH (Reaction)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="3"
                    max="10"
                    value={soilForm.ph}
                    onChange={(e) => setSoilForm({ ...soilForm, ph: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Normal range: 6.0 - 7.5</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nitrogen (N)</label>
                    <input
                      type="number"
                      value={soilForm.nitrogen}
                      onChange={(e) => setSoilForm({ ...soilForm, nitrogen: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <span className="text-[10px] text-slate-400">kg/ha</span>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phosphorus (P)</label>
                    <input
                      type="number"
                      value={soilForm.phosphorus}
                      onChange={(e) => setSoilForm({ ...soilForm, phosphorus: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <span className="text-[10px] text-slate-400">kg/ha</span>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Potassium (K)</label>
                    <input
                      type="number"
                      value={soilForm.potassium}
                      onChange={(e) => setSoilForm({ ...soilForm, potassium: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <span className="text-[10px] text-slate-400">kg/ha</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Organic Carbon (%)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="5"
                    value={soilForm.organic_carbon}
                    onChange={(e) => setSoilForm({ ...soilForm, organic_carbon: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Desirable: &gt; 0.75%</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={soilLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>{soilLoading ? 'Analyzing Soil Fertility...' : 'Analyze Soil Health & Suggest Fertilizer'}</span>
              </button>
            </form>

            {/* Right: Results & Recommendations */}
            <div className="space-y-4">
              {soilResult ? (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Soil Health Evaluation</h4>
                      <span className="text-[10px] text-slate-400">Standard Agricultural ICAR Fertility Index</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-600">
                        {soilResult.soil_health_score}<span className="text-xs text-slate-400">/100</span>
                      </span>
                      <span className="text-[10px] text-slate-500 block">Fertility Index</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="font-bold text-slate-800 block mb-1">Interpretation</span>
                      <p className="text-slate-600 leading-relaxed">{soilResult.interpretation}</p>
                    </div>

                    <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-1">
                      <span className="font-bold text-emerald-900 block">Recommended Soil Management & Fertilization</span>
                      <p className="text-emerald-950 leading-relaxed">{soilResult.soil_management_recommendations}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 text-center space-y-2 h-full flex flex-col items-center justify-center">
                  <FlaskConical className="w-10 h-10 text-slate-300" />
                  <span className="text-sm font-bold text-slate-700">Enter test values to view plain-language analysis</span>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Provides safe soil-management suggestions and certified fertilizer categories. Never provides unsupported hazardous chemical recipes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Smart Crop Recommender */}
      {activeTab === 'crop_rec' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <form onSubmit={handleCropRecSubmit} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <span>Smart Crop Recommendation</span>
              </h3>
              <p className="text-xs text-slate-500">
                AI crop selection matching soil type, water availability, and season
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Soil Texture</label>
                <select
                  value={cropForm.soil_type}
                  onChange={(e) => setCropForm({ ...cropForm, soil_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="Red Loam">Red Sandy Loam</option>
                  <option value="Black Cotton">Black Clay Soil</option>
                  <option value="Alluvial">Alluvial Soil</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Water Availability</label>
                <select
                  value={cropForm.water_availability}
                  onChange={(e) => setCropForm({ ...cropForm, water_availability: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="high">High (Assured Canal / Borewell)</option>
                  <option value="moderate">Moderate (Drip / Seasonal Borewell)</option>
                  <option value="low">Low (Rainfed / Dryland)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Season</label>
                <select
                  value={cropForm.season}
                  onChange={(e) => setCropForm({ ...cropForm, season: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="kharif">Kharif (Monsoon)</option>
                  <option value="rabi">Rabi (Winter)</option>
                  <option value="summer">Summer</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={cropLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Recommend</span>
                </button>
              </div>
            </div>
          </form>

          {/* Recommended Crops Display */}
          {cropResult && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recommended Crop Cultivations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {cropResult.recommended_crops?.map((c, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {c.suitability} Match
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{c.duration_days} Days</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{c.crop}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.reason}</p>
                    <div className="border-t pt-2 text-xs font-bold text-emerald-700">
                      Mandi Modal: {c.estimated_mandi_rate}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 italic">
                *{cropResult.disclaimer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherPage;
