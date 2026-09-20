import React, { useState } from 'react';
import { LanguageProvider, useTranslation } from './i18n';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import DisclaimerBanner from './components/common/DisclaimerBanner';
import VoiceAssistantModal from './components/voice/VoiceAssistantModal';
import SIHDemoRunner from './components/demo/SIHDemoRunner';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import ScanCropPage from './pages/farmer/ScanCropPage';
import DiseaseResultPage from './pages/farmer/DiseaseResultPage';
import MyReportsPage from './pages/farmer/MyReportsPage';
import DiseaseMapPage from './pages/farmer/DiseaseMapPage';
import WeatherPage from './pages/farmer/WeatherPage';
import CropDiaryPage from './pages/farmer/CropDiaryPage';
import CommunityIntelligencePage from './pages/farmer/CommunityIntelligencePage';
import MarketplacePage from './pages/farmer/MarketplacePage';
import CartOrdersPage from './pages/farmer/CartOrdersPage';
import MarketPricesPage from './pages/farmer/MarketPricesPage';

// Officer & Admin Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

import { api } from './services/api';
import { offlineStore } from './services/offlineStore';

function MainApp() {
  const { language, setLanguage } = useTranslation();
  const { user, switchRole } = useAuth();

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [demoTourOpen, setDemoTourOpen] = useState(false);
  const [cartCount, setCartCount] = useState(1);
  const [activeScanResult, setActiveScanResult] = useState({
    crop: 'Tomato',
    disease: 'Early Blight',
    pathogen: 'Alternaria solani (Fungal)',
    confidence: 0.947,
    confidence_pct: 94.7,
    status: 'confident',
    severity: 'Moderate',
    affected_area_pct: 37.0,
    symptoms: 'Concentric rings ("target board" dark brown spots) on lower foliage, surrounded by a yellow chlorotic margin.',
    previewUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22510?w=600&auto=format&fit=crop&q=80',
    mask_data_uri: null,
    model_architecture: 'MobileNetV2-AgroPlant2026-Transfer',
    explainability: {
      title: 'Why did AgroShield detect Early Blight?',
      detected_disease: 'Early Blight',
      crop: 'Tomato',
      confidence_pct: 94.7,
      visual_evidence: [
        'Concentric target-board ring patterns identified on lower foliage.',
        'Yellow chlorotic halo border surrounding necrotic brown lesions.',
        'Necrotic tissue primarily concentrated on lower and middle foliar lamina.'
      ],
      reasoning_steps: [
        '1. Computer-vision color segmentation detected localized chlorophyll degradation.',
        '2. Lesion geometry matching Alternaria solani circular concentric conidiophores.',
        '3. Foliage morphology validated as Solanaceae leaf architecture.',
        '4. Calibrated confidence rating (94.7%) validated against regional field benchmarks.'
      ],
      important_symptoms: {
        visible_symptoms: 'Concentric dark brown target spots with chlorotic yellow borders.',
        distinguishing_hallmarks: 'Target-ring ridges distinguish Early Blight from Septoria leaf spot and Late Blight.',
        absent_symptoms: 'No white fuzzy mold on leaf underside (distinguishes from Late Blight).'
      },
      data_to_improve_confidence: [
        'Capture a photo of the leaf underside to verify absence of white mold spores.',
        'Photograph petiole and main stem to check for dark collar rot lesions.',
        'Capture under diffused morning sunlight to eliminate harsh shadow reflections.'
      ],
      alternative_hypotheses: [
        { disease: 'Tomato Late Blight', probability: 0.038, reason: 'Water-soaked margins sometimes resemble early lesion edges.' },
        { disease: 'Septoria Leaf Spot', probability: 0.021, reason: 'Multiple small foliar spots can precede concentric expansion.' },
        { disease: 'Nutritional Deficiency', probability: 0.015, reason: 'Interveinal yellowing can resemble chlorotic halos.' }
      ]
    },
    future_risk: {
      crop: 'Tomato',
      disease: 'Early Blight',
      district: 'Kolar',
      risk_level: 'HIGH',
      risk_score: 75,
      expected_risk_period: 'Next 2–4 Days (Immediate High Risk Window)',
      main_reasons: [
        'Elevated relative humidity (82%) strongly accelerates fungal spore germination and lesion expansion.',
        'Ambient temperature (24.5°C) falls right within optimal thermal band (20–28°C).',
        'High precipitation probability (65%) causes prolonged leaf wetness.',
        '18 similar disease detections reported in Kolar over past 4 days.'
      ],
      preventive_actions: [
        'Apply prophylactic bio-fungicide (Trichoderma viride) before rain onset.',
        'Ensure 60x45 cm row spacing and remove lower infected leaves immediately.',
        'Discontinue overhead sprinkling; switch to root-zone drip irrigation.',
        'Schedule follow-up scan with AgroShield in 3–4 days.'
      ],
      input_factors: {
        temperature_c: 24.5,
        relative_humidity_pct: 82.0,
        rain_probability_pct: 65.0,
        nearby_community_cases: 18
      }
    },
    crop_health: {
      crop_health_score: 72,
      status: 'Moderate Health',
      status_key: 'moderate',
      recovery_trend: 'Stable',
      deductions: [
        {
          factor: 'Moderate Disease Lesions (37% leaf area)',
          points_lost: 22,
          explanation: 'Necrotic foliar lesions reduce active chlorophyll photosynthetic area.'
        },
        {
          factor: 'Unfavorable Microclimate (High Humidity)',
          points_lost: 6,
          explanation: 'Relative humidity >80% elevates pathogen pressure.'
        }
      ],
      improvement_actions: [
        { action: 'Prune and safely destroy lower diseased foliage', potential_points: '+8 to +12 pts' },
        { action: 'Apply certified bio-fungicide (Trichoderma viride)', potential_points: '+10 to +15 pts' },
        { action: 'Switch to root-zone drip irrigation to reduce leaf wetness', potential_points: '+5 to +8 pts' },
        { action: 'Perform follow-up scan in 4 days with AgroShield', potential_points: '+5 pts' }
      ],
      score_history: [
        { date: 'Sep 06', score: 88, disease: 'Healthy Foliage' },
        { date: 'Sep 12', score: 79, disease: 'Early Spots' },
        { date: 'Sep 16', score: 68, disease: 'Early Blight' },
        { date: 'Today', score: 72, disease: 'Early Blight (Treatment started)' }
      ]
    },
    action_plan: {
      crop: 'Tomato',
      disease: 'Early Blight',
      severity: 'Moderate',
      district: 'Kolar',
      summary: '7-Day Scientific Protocol for Early Blight in Tomato',
      expected_duration_days: 7,
      potential_health_gain: 50,
      days: [
        {
          day_number: 1,
          phase: 'Immediate Triage & Sanitation',
          title: 'Mechanical Pruning & Spore Quarantine (Tomato)',
          action: 'Carefully snip off lower 3-4 sets of infected foliage showing concentric target spots using sterilized secateurs. Immediately bag and dispose away from plots to halt local spore dispersal.',
          critical_instruction: 'Sterilize shears with 70% alcohol or 1% sodium hypochlorite solution between each crop row.',
          estimated_points_gain: 8,
          equipment_needed: ['Sterilized shears/secateurs', 'Disposal trash bag', 'Protective gloves'],
          completed: true
        },
        {
          day_number: 2,
          phase: 'Targeted Treatment',
          title: 'Primary Protective Spray Application',
          action: 'Spray Trichoderma viride @ 5g/L or Copper Oxychloride 50 WP @ 2.5g/L during early morning (6:30 AM – 9:00 AM) or overcast hours. Ensure complete coverage of both upper leaf surfaces and undersides.',
          critical_instruction: 'Wear face mask and safety goggles. Never spray directly against prevailing wind direction.',
          estimated_points_gain: 12,
          equipment_needed: ['Knapsack / battery sprayer', 'N95 safety mask', 'Measuring cylinder'],
          completed: true
        },
        {
          day_number: 3,
          phase: 'Microclimate & Irrigation Adjustment',
          title: 'Leaf Wetness Reduction Protocol',
          action: 'Cease overhead sprinklers; switch strictly to morning drip irrigation. Weed canopy perimeters to improve cross-ventilation and drop micro-humidity.',
          critical_instruction: 'Avoid any evening overhead irrigation. Leaves must go into the night dry to prevent fungal germination.',
          estimated_points_gain: 5,
          equipment_needed: ['Drip lateral inspection tool', 'Hand weeder'],
          completed: false
        },
        {
          day_number: 4,
          phase: 'Nutritional Resilience',
          title: 'Foliar Tissue Hardening & Micronutrients',
          action: 'Apply Potassium sulfate (0-0-50) @ 4g/L foliar spray. Strengthens cell walls and stimulates systemic resistance against necrotic expansion.',
          critical_instruction: 'Do not apply excess synthetic nitrogen (Urea) at this stage as succulent soft tissue invites re-infection.',
          estimated_points_gain: 6,
          equipment_needed: ['Clean sprayer tank', 'Foliar nutrient solution'],
          completed: false
        },
        {
          day_number: 5,
          phase: 'Mid-Cycle AgroShield Diagnostic',
          title: 'Interim Camera Rescan & Lesion Audit',
          action: 'Use AgroShield camera to capture a new photo of previously tagged infected leaves. Inspect whether lesion edges have dried into inactive dark borders or continue expanding.',
          critical_instruction: 'If disease coverage has grown despite Days 1-3 sprays, request immediate Agricultural Officer field consultation.',
          estimated_points_gain: 4,
          equipment_needed: ['AgroShield Smartphone App', 'Reference plant tag'],
          completed: false
        },
        {
          day_number: 6,
          phase: 'Secondary Biological Shield',
          title: 'Organic Spore Suppressant Spray',
          action: 'Apply cold-pressed Neem Oil (10,000 ppm @ 2ml/L) with mild surfactant in late afternoon (after 4:30 PM) to eliminate remaining secondary spores.',
          critical_instruction: 'Do not spray during peak midday sunshine (12:00-3:00 PM) to avoid leaf scorching.',
          estimated_points_gain: 5,
          equipment_needed: ['Sprayer with fine atomizing nozzle'],
          completed: false
        },
        {
          day_number: 7,
          phase: 'Final Recovery Evaluation',
          title: 'Full Field Rescan & Recovery Audit',
          action: 'Perform comprehensive follow-up AgroShield scan. The system will compute your Before vs After Crop Recovery Progress and update your permanent Crop Diary.',
          critical_instruction: 'If Health Score gained >12 points and lesions are dry, mark protocol as RESOLVED.',
          estimated_points_gain: 10,
          equipment_needed: ['AgroShield App', 'Field diary log'],
          completed: false
        }
      ]
    },
    recommendations: {
      cultural_practices: 'Ensure optimal plant spacing (60x45 cm) for ventilation. Stake plants to prevent foliage contacting wet soil. Avoid overhead sprinkler irrigation.',
      organic_control: 'Foliar spray with Bacillus subtilis or Trichoderma viride. Remove diseased lower leaves.',
      chemical_guidance: 'Chlorothalonil or Mancozeb 75% WP @ 2g/liter of water. Follow statutory CIBRC label directions and wear personal protective gear.'
    }
  });

  // Handle Scan Crop completion
  const handleScanComplete = (scanData) => {
    setActiveScanResult(scanData);
    setCurrentTab('result');
  };

  // Add to cart handler
  const handleAddToCart = async (prod) => {
    try {
      await api.addToCart(prod.id, 1);
      setCartCount(prev => prev + 1);
      alert(`${prod.title} added to cart!`);
    } catch (e) {
      setCartCount(prev => prev + 1);
      alert(`${prod.title} added to demo cart!`);
    }
  };

  // Execute Step Actions for the 37-Step SIH Demo Runner
  const handleExecuteStepAction = async (stepNum) => {
    switch (stepNum) {
      case 1:
        switchRole('farmer');
        setCurrentTab('dashboard');
        setLanguage('en');
        break;
      case 2:
        setLanguage('kn');
        setCurrentTab('dashboard');
        break;
      case 3:
      case 4:
        setCurrentTab('scan');
        break;
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        setCurrentTab('result');
        break;
      case 13:
        alert('Disease report for Tomato Early Blight (94.7% confidence, 37% affected area) submitted to surveillance database with GPS coordinates!');
        setCurrentTab('reports');
        break;
      case 14:
        await api.simulateCluster('Kolar', 'Early Blight', 'Tomato').catch(() => {});
        alert('Simulated 15 new local disease reports from nearby farmers in Srinivaspur.');
        setCurrentTab('map');
        break;
      case 15:
      case 16:
      case 17:
      case 18:
        setCurrentTab('map');
        break;
      case 19:
      case 20:
        switchRole('officer');
        setCurrentTab('officer_dashboard');
        break;
      case 21:
      case 22:
        alert('Officer Dr. Ananya Sharma verified Case #1 (Tomato Early Blight). Confirmed diagnosis & advisory dispatched to farmer device!');
        switchRole('farmer');
        setCurrentTab('reports');
        break;
      case 23:
      case 24:
      case 25:
        setCurrentTab('marketplace');
        break;
      case 26:
      case 27:
        setCurrentTab('cart');
        break;
      case 28:
        setCurrentTab('weather');
        break;
      case 29:
        setCurrentTab('weather');
        break;
      case 30:
        setCurrentTab('diary');
        break;
      case 31:
        setVoiceOpen(true);
        break;
      case 32:
      case 33:
        setLanguage('te');
        setCurrentTab('dashboard');
        break;
      case 34:
      case 35:
        setLanguage('ta');
        setCurrentTab('dashboard');
        break;
      case 36:
        await offlineStore.savePendingReport({
          crop_name: 'Tomato',
          disease_name: 'Early Blight',
          confidence: 0.947,
          severity: 'Moderate',
          affected_area_pct: 37.0,
          latitude: 13.3392,
          longitude: 78.2139,
          village: 'Srinivaspur Block C',
          district: 'Kolar',
          farmer_notes: 'Created during field offline demo'
        });
        alert('Simulated offline report created and saved to IndexedDB storage!');
        break;
      case 37:
        const pending = await offlineStore.getPendingReports();
        if (pending.length > 0) {
          await api.syncOfflineReports(pending).catch(() => {});
          await offlineStore.clearAll();
          alert(`Successfully synchronized ${pending.length} offline reports to the server!`);
        }
        setCurrentTab('reports');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <DisclaimerBanner />
      <Navbar
        onOpenDemoTour={() => setDemoTourOpen(true)}
        onOpenCart={() => setCurrentTab('cart')}
        cartCount={cartCount}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 pb-16">
        {currentTab === 'dashboard' && (
          <FarmerDashboard
            onNavigate={(tab) => setCurrentTab(tab)}
            onTriggerVoice={() => setVoiceOpen(true)}
          />
        )}

        {currentTab === 'scan' && (
          <ScanCropPage
            onScanComplete={handleScanComplete}
            onCancel={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'result' && (
          <DiseaseResultPage
            result={activeScanResult}
            onSubmitted={() => setCurrentTab('reports')}
            onNavigateMarketplace={() => setCurrentTab('marketplace')}
          />
        )}

        {currentTab === 'reports' && (
          <MyReportsPage />
        )}

        {currentTab === 'community_intelligence' && (
          <CommunityIntelligencePage />
        )}

        {currentTab === 'map' && (
          <DiseaseMapPage />
        )}

        {currentTab === 'weather' && (
          <WeatherPage />
        )}

        {currentTab === 'diary' && (
          <CropDiaryPage />
        )}

        {currentTab === 'marketplace' && (
          <MarketplacePage
            onAddToCart={handleAddToCart}
            onOpenCart={() => setCurrentTab('cart')}
          />
        )}

        {currentTab === 'cart' && (
          <CartOrdersPage />
        )}

        {currentTab === 'prices' && (
          <MarketPricesPage />
        )}

        {currentTab === 'officer_dashboard' && (
          <OfficerDashboard />
        )}

        {currentTab === 'admin_dashboard' && (
          <AdminDashboard />
        )}
      </main>

      {/* Multilingual Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
      />

      {/* Guided 37-Step SIH Demonstration Controller */}
      <SIHDemoRunner
        isOpen={demoTourOpen}
        onClose={() => setDemoTourOpen(false)}
        onExecuteStepAction={handleExecuteStepAction}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
