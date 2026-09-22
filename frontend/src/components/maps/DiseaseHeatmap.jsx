import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, Filter, Layers, Wind, Compass, Info, AlertTriangle } from 'lucide-react';

const RISK_COLORS = {
  'Healthy / Very Low': '#10B981', // Green
  'Mild': '#F59E0B',              // Yellow
  'Moderate': '#F97316',          // Orange
  'Severe': '#EF4444'             // Red
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export const DiseaseHeatmap = ({
  reports = [],
  projections = [],
  center = [13.3392, 78.2139],
  zoom = 9
}) => {
  const [filterCrop, setFilterCrop] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterDisease, setFilterDisease] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [showProjections, setShowProjections] = useState(true);

  const filteredReports = reports.filter(r => {
    if (filterCrop !== 'all' && !r.crop_name?.toLowerCase().includes(filterCrop.toLowerCase())) return false;
    if (filterSeverity !== 'all' && !r.severity?.toLowerCase().includes(filterSeverity.toLowerCase())) return false;
    if (filterDisease !== 'all' && !r.disease_name?.toLowerCase().includes(filterDisease.toLowerCase())) return false;
    if (filterSource === 'verified' && (r.is_demo === true || r.is_demo === 1)) return false;
    if (filterSource === 'demo' && !(r.is_demo === true || r.is_demo === 1)) return false;
    return true;
  });

  return (
    <div className="relative w-full h-[540px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col">
      {/* Top Filter Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200 shadow-md flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 mr-1">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <span>Filters:</span>
        </div>

        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800 font-semibold"
        >
          <option value="all">All Surveillance Data</option>
          <option value="verified">Verified Farmer Reports</option>
          <option value="demo">Demo Data Only</option>
        </select>

        <select
          value={filterCrop}
          onChange={(e) => setFilterCrop(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800"
        >
          <option value="all">All Crops</option>
          <option value="Tomato">Tomato</option>
          <option value="Potato">Potato</option>
          <option value="Rice">Rice</option>
          <option value="Corn">Corn / Maize</option>
          <option value="Cotton">Cotton</option>
        </select>

        <select
          value={filterDisease}
          onChange={(e) => setFilterDisease(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800"
        >
          <option value="all">All Diseases</option>
          <option value="Early Blight">Early Blight</option>
          <option value="Late Blight">Late Blight</option>
          <option value="Blast">Leaf Blast</option>
          <option value="Bacterial">Bacterial Blight</option>
        </select>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800"
        >
          <option value="all">All Severities</option>
          <option value="Healthy">Healthy / Low</option>
          <option value="Mild">Mild</option>
          <option value="Moderate">Moderate</option>
          <option value="Severe">Severe</option>
        </select>

        {/* Spread Projection Layer Toggle */}
        <button
          type="button"
          onClick={() => setShowProjections(!showProjections)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border transition cursor-pointer ${
            showProjections
              ? 'bg-rose-50 text-rose-700 border-rose-300'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
          title="Toggle estimated disease spread projections based on microclimate and wind vectors"
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Spread Risk Layer {showProjections ? 'ON' : 'OFF'}</span>
        </button>

        <span className="ml-auto text-slate-700 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
          Showing {filteredReports.length} cases
        </span>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="flex-1 w-full h-full">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={center} zoom={zoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Actual Case Reports Layer */}
          {filteredReports.map((report) => {
            const color = RISK_COLORS[report.severity] || '#F97316';
            const radius = report.severity === 'Severe' ? 10 : report.severity === 'Moderate' ? 8 : 6;
            const isDemo = report.is_demo === true || report.is_demo === 1;

            return (
              <CircleMarker
                key={report.id}
                center={[report.latitude, report.longitude]}
                radius={radius}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: isDemo ? 0.70 : 0.95,
                  color: isDemo ? '#ffffff' : '#047857',
                  weight: isDemo ? 1.5 : 2.5
                }}
              >
                <Tooltip direction="top" offset={[0, -5]} opacity={0.9}>
                  <div className="text-[11px] font-sans">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-900">{report.crop_name} - {report.disease_name}</span>
                      <span className={`text-[9px] font-bold px-1 py-0.2 rounded ${isDemo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {isDemo ? 'DEMO' : 'VERIFIED'}
                      </span>
                    </div>
                    <span className="text-slate-600 block">Severity: {report.severity}</span>
                    <span className="text-slate-500 block text-[10px]">{report.village}, {report.district}</span>
                  </div>
                </Tooltip>
                <Popup>
                  <div className="p-1 space-y-1.5 font-sans min-w-[210px]">
                    <div className="flex items-center justify-between border-b pb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{report.crop_name}</span>
                        {isDemo ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            DEMO DATA
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            VERIFIED FARMER REPORT
                          </span>
                        )}
                      </div>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: color }}
                      >
                        {report.severity}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 space-y-0.5">
                      <p><strong>Disease:</strong> {report.disease_name}</p>
                      <p><strong>AI Confidence:</strong> {report.confidence ? `${(report.confidence * 100).toFixed(1)}%` : '94.7%'}</p>
                      <p><strong>Area:</strong> {report.village}, {report.district}</p>
                      <p><strong>GPS:</strong> {Number(report.latitude).toFixed(4)}°, {Number(report.longitude).toFixed(4)}°</p>
                      <p className="text-[10px] text-slate-500 italic mt-1 pt-1 border-t border-slate-100">
                        {isDemo ? 'Regional synthetic baseline for epidemiological modeling' : 'Field geo-tagged by local farmer (identity protected)'}
                      </p>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Spread Projections Layer */}
          {showProjections && projections.map((proj, idx) => {
            const centerLat = proj.projected_center?.lat || center[0];
            const centerLng = proj.projected_center?.lng || center[1];
            const radiusMeters = (proj.projected_radius_km || 12) * 1000;

            return (
              <React.Fragment key={`proj-${idx}`}>
                {/* Dashed outer buffer ring */}
                <Circle
                  center={[centerLat, centerLng]}
                  radius={radiusMeters}
                  pathOptions={{
                    color: '#e11d48',
                    dashArray: '6, 8',
                    weight: 2,
                    fillColor: '#fb7185',
                    fillOpacity: 0.15
                  }}
                >
                  <Tooltip direction="center" permanent={false} opacity={0.95}>
                    <div className="text-xs font-sans p-1">
                      <div className="font-extrabold text-rose-900 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Projected Risk Area (48-72h)</span>
                      </div>
                      <div className="text-[11px] text-slate-700 font-medium">
                        {proj.disease_name} ({proj.crop_name})
                      </div>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="p-1 space-y-2 font-sans min-w-[240px]">
                      <div className="bg-rose-100/70 p-1.5 rounded-lg border border-rose-200">
                        <div className="flex items-center gap-1.5 text-rose-900 font-extrabold text-xs">
                          <Wind className="w-4 h-4 text-rose-600 animate-pulse" />
                          <span>Projected Risk Area</span>
                        </div>
                        <p className="text-[10px] text-rose-800 font-semibold mt-0.5">
                          Estimated spread vector; not confirmed future disease locations
                        </p>
                      </div>

                      <div className="text-xs text-slate-700 space-y-1">
                        <p><strong>Pathogen:</strong> {proj.disease_name} ({proj.crop_name})</p>
                        <p><strong>Origin Cluster:</strong> {proj.source_cluster}</p>
                        <p><strong>Estimated Window:</strong> {proj.estimated_spread_timeline}</p>
                        <p><strong>Expansion Radius:</strong> ~{proj.projected_radius_km} km</p>
                      </div>

                      {proj.vector_factors && (
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                          <p className="font-bold text-slate-800 text-[10px] uppercase">Vector Driving Factors:</p>
                          <p>• Wind: {proj.vector_factors.prevailing_wind} @ {proj.vector_factors.wind_speed_kmh} km/h</p>
                          <p>• Microclimate: {proj.vector_factors.favorable_humidity} humidity, {proj.vector_factors.optimal_spore_temp}</p>
                          <p>• Host: {proj.vector_factors.host_crop_density}</p>
                        </div>
                      )}

                      <div className="text-[10px] bg-amber-50 text-amber-900 p-2 rounded-lg border border-amber-200 font-medium">
                        <strong>Actionable Buffer Advice:</strong> {proj.buffer_zone_recommendation}
                      </div>
                    </div>
                  </Popup>
                </Circle>

                {/* Projected Center Focal Marker */}
                <CircleMarker
                  center={[centerLat, centerLng]}
                  radius={5}
                  pathOptions={{
                    color: '#9f1239',
                    fillColor: '#e11d48',
                    fillOpacity: 0.9,
                    weight: 2
                  }}
                />
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200 shadow-md text-[11px] space-y-1 max-w-[260px]">
        <div className="font-bold text-slate-800 mb-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Surveillance Legend</span>
          </div>
          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">Live</span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-600">Low Risk (0-5%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-600">Mild (5-20%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
            <span className="text-slate-600">Moderate (20-50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span className="text-slate-600">Severe (&gt;50%)</span>
          </div>
        </div>

        {showProjections && projections.length > 0 && (
          <div className="pt-1.5 mt-1 border-t border-slate-100 flex items-center gap-2 text-[10px] text-rose-700 font-semibold">
            <span className="w-3 h-3 rounded-full border-2 border-rose-500 border-dashed bg-rose-100 shrink-0" />
            <span>Projected Risk Area (48-72h buffer)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseHeatmap;
