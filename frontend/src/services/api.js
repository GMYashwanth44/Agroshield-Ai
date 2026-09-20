const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')
  : '/api';

export const getAuthToken = () => localStorage.getItem('agroshield_token');
export const setAuthToken = (token) => localStorage.setItem('agroshield_token', token);
export const removeAuthToken = () => localStorage.removeItem('agroshield_token');

export async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {})
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errMsg = errorData.detail || errorData.message || `Request failed with status ${response.status}`;
    if (Array.isArray(errMsg)) {
      errMsg = errMsg.map(e => (typeof e === 'object' ? (e.msg || JSON.stringify(e)) : e)).join(', ');
    } else if (typeof errMsg === 'object') {
      errMsg = JSON.stringify(errMsg);
    }
    throw new Error(errMsg);
  }

  return response.json();
}

// Auth API
export const api = {
  // Auth
  login: (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: formData
    }).then(res => {
      if (!res.ok) throw new Error('Invalid credentials');
      return res.json();
    });
  },
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  updateLang: (lang) => request(`/auth/update-lang?lang=${lang}`, { method: 'POST' }),

  // AI & Vision
  checkQuality: (imageFile) => {
    const fd = new FormData();
    fd.append('image', imageFile);
    return request('/check-quality', { method: 'POST', body: fd });
  },
  predictDisease: (imageFile) => {
    const fd = new FormData();
    fd.append('image', imageFile);
    return request('/predict', { method: 'POST', body: fd });
  },
  getSeverity: (imageFile) => {
    const fd = new FormData();
    fd.append('image', imageFile);
    return request('/severity', { method: 'POST', body: fd });
  },

  // Disease Reports & Surveillance
  getReports: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/reports?${params}`);
  },
  getReportById: (id) => request(`/reports/${id}`),
  createReport: (reportData) => request('/reports', { method: 'POST', body: JSON.stringify(reportData) }),
  getNearbyReports: (lat, lng, radiusKm = 30) => request(`/reports/nearby?latitude=${lat}&longitude=${lng}&radius_km=${radiusKm}`),
  syncOfflineReports: (reports) => request('/reports/sync', { method: 'POST', body: JSON.stringify(reports) }),
  simulateCluster: (district = 'Kolar', disease = 'Early Blight', crop = 'Tomato') =>
    request(`/reports/simulate-cluster?district=${district}&disease=${encodeURIComponent(disease)}&crop=${encodeURIComponent(crop)}`, { method: 'POST' }),

  // Surveillance & Outbreaks
  getHeatmapData: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/heatmap?${params}`);
  },
  getHotspots: (epsKm = 15, minSamples = 5) => request(`/hotspots?eps_km=${epsKm}&min_samples=${minSamples}`),
  getOutbreaks: (daysWindow = 7) => request(`/outbreaks?days_window=${daysWindow}`),
  getStatistics: () => request('/statistics'),

  // Officer Verification
  getPendingReports: () => request('/expert/pending-reports'),
  submitExpertReview: (reviewData) => request('/expert/review', { method: 'POST', body: JSON.stringify(reviewData) }),
  broadcastOfficerAlert: (title, message, district = 'Kolar') =>
    request(`/expert/send-farmer-alert?title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}&district=${district}`, { method: 'POST' }),

  // Marketplace
  getProducts: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/marketplace/products?${params}`);
  },
  getProductById: (id) => request(`/marketplace/products/${id}`),
  getSellers: () => request('/marketplace/sellers'),
  getCart: () => request('/marketplace/cart'),
  addToCart: (productId, quantity = 1) => request('/marketplace/cart', { method: 'POST', body: JSON.stringify({ product_id: productId, quantity }) }),
  removeFromCart: (cartItemId) => request(`/marketplace/cart/${cartItemId}`, { method: 'DELETE' }),
  placeOrder: (orderData) => request('/marketplace/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getOrders: () => request('/marketplace/orders'),

  // Advisory & Weather & Soil
  getWeather: (district = 'Kolar', crop = 'Tomato') => request(`/weather?district=${district}&crop=${encodeURIComponent(crop)}`),
  analyzeSoil: (soilData) => request('/soil', { method: 'POST', body: JSON.stringify(soilData) }),
  recommendCrop: (criteria) => request('/crop-recommendation', { method: 'POST', body: JSON.stringify(criteria) }),
  getMarketPrices: (crop, district) => {
    const params = new URLSearchParams({ crop: crop || 'all', district: district || 'all' }).toString();
    return request(`/market-prices?${params}`);
  },
  getPriceTrends: (crop = 'Tomato') => request(`/market-prices/trends?crop=${encodeURIComponent(crop)}`),

  // Digital Diary
  getFields: () => request('/diary/fields'),
  createField: (fieldData) => request('/diary/fields', { method: 'POST', body: JSON.stringify(fieldData) }),
  getDiaryEntries: (fieldId) => request(`/diary/entries/${fieldId}`),
  createDiaryEntry: (entryData) => request('/diary/entries', { method: 'POST', body: JSON.stringify(entryData) }),

  // Voice Query
  queryVoiceAssistant: (query, language = 'en') => request('/voice-query', { method: 'POST', body: JSON.stringify({ query, language }) }),

  // AgroShield V2 Intelligence
  getFutureRisk: (crop = 'Tomato', disease = 'Early Blight', severity = 'Moderate', district = 'Kolar', affectedAreaPct = 37.0) => {
    const params = new URLSearchParams({
      crop, disease, severity, district, affected_area_pct: affectedAreaPct
    }).toString();
    return request(`/intelligence/future-risk?${params}`);
  },
  getCropHealth: (crop = 'Tomato', district = 'Kolar', farmerId = null) => {
    const params = new URLSearchParams({
      crop, district, ...(farmerId ? { farmer_id: farmerId } : {})
    }).toString();
    return request(`/intelligence/crop-health?${params}`);
  },
  calculateHealthScore: (data) => request('/intelligence/calculate-health-score', { method: 'POST', body: JSON.stringify(data) }),

  // Phase 2: Community Intelligence, Spread Projections & Smart Alerts
  getCommunityIntelligence: () => request('/intelligence/community-intelligence'),
  getSpreadProjections: (windDirectionDeg = 65, windSpeedKmh = 14) =>
    request(`/intelligence/spread-projections?wind_direction_deg=${windDirectionDeg}&wind_speed_kmh=${windSpeedKmh}`),
  getSmartAlerts: (crop = 'Tomato', district = 'Kolar') =>
    request(`/intelligence/smart-alerts?crop=${encodeURIComponent(crop)}&district=${encodeURIComponent(district)}`),

  // Phase 3: Action Plan, Recovery Tracking, Expert Review & Assistant
  getActionPlan: (payload) => request('/intelligence/action-plan', { method: 'POST', body: JSON.stringify(payload) }),
  getActionPlanForReport: (reportId) => request(`/intelligence/action-plan/${reportId}`),
  toggleActionPlanDay: (reportId, dayNumber, completed) =>
    request(`/intelligence/action-plan/${reportId}/day/${dayNumber}`, { method: 'PATCH', body: JSON.stringify({ completed }) }),
  getRecoveryComparison: (currentReportId = null, previousReportId = null, crop = 'Tomato') => {
    const params = new URLSearchParams({
      crop,
      ...(currentReportId ? { current_report_id: currentReportId } : {}),
      ...(previousReportId ? { previous_report_id: previousReportId } : {})
    }).toString();
    return request(`/intelligence/recovery-comparison?${params}`);
  },
  askFarmerAssistant: (question, crop = 'Tomato', disease = 'Early Blight', severity = 'Moderate', healthScore = 72, language = 'en') =>
    request('/intelligence/ask-assistant', {
      method: 'POST',
      body: JSON.stringify({ question, crop, disease, severity, health_score: healthScore, language })
    }),
  requestOfficerReview: (reportId, notes = '') =>
    request(`/expert/request-review/${reportId}`, { method: 'POST', body: JSON.stringify({ farmer_notes: notes }) }),
  reviewReportDecision: (reportId, decision, confirmedDiagnosis, comments, recommendedAction = '') =>
    request('/expert/review', {
      method: 'POST',
      body: JSON.stringify({
        report_id: reportId,
        decision,
        confirmed_diagnosis: confirmedDiagnosis,
        comments,
        recommended_action: recommendedAction
      })
    })
};

export default api;
