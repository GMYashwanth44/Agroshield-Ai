import React, { useState } from 'react';
import {
  Sparkles, X, ChevronRight, ChevronLeft, Play, Pause,
  CheckCircle2, AlertTriangle, Globe, MapPin, ShoppingCart, Mic
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { offlineStore } from '../../services/offlineStore';

export const SIH_STEPS = [
  { step: 1, title: 'Open AgroShield AI', desc: 'Welcome to AgroShield AI: Detect Early, Act Smart, Protect Crops.' },
  { step: 2, title: 'Select Kannada Language', desc: 'Dynamically switch to Kannada without reloading the app.' },
  { step: 3, title: 'Open Scan Crop Feature', desc: 'Navigate to camera and gallery upload interface.' },
  { step: 4, title: 'Show Take Photo & Gallery Upload', desc: 'Prominently display two separate options for farmers.' },
  { step: 5, title: 'Select Tomato Leaf Photo', desc: 'Load high-resolution diseased tomato leaf image.' },
  { step: 6, title: 'Automated Image Quality Pre-Check', desc: 'Verify blur (Laplacian variance), exposure, resolution, and foliage.' },
  { step: 7, title: 'AI Prediction: Tomato Early Blight', desc: 'Model computes calibrated 94.7% confidence.' },
  { step: 8, title: 'Affected Area Estimation', desc: 'Computer vision color-space segmentation detects 37% lesion area.' },
  { step: 9, title: 'Severity Classification', desc: 'Categorized as "Moderate" (20-50% threshold).' },
  { step: 10, title: 'Generate AI Disease Report', desc: 'Complete report with symptoms, date, and disclaimers.' },
  { step: 11, title: 'Display Safe Recommendations', desc: 'Cultural practices, organic Trichoderma, and CIBRC chemical guidance.' },
  { step: 12, title: 'Attach GPS Location Coordinates', desc: 'Tag 13.3392° N, 78.2139° E in Srinivaspur while protecting farmer privacy.' },
  { step: 13, title: 'Submit Report to Surveillance Hub', desc: 'Transmit diagnosis to regional database.' },
  { step: 14, title: 'Simulate Nearby Farmer Cases', desc: 'Inject simulated cluster reports in Srinivaspur block.' },
  { step: 15, title: 'Open Regional Disease Heatmap', desc: 'Display color-coded risk distribution on Leaflet & OpenStreetMap.' },
  { step: 16, title: 'Detect DBSCAN Disease Hotspot', desc: 'Geographic clustering flags Village C / Srinivaspur hotspot.' },
  { step: 17, title: 'Analyze Disease Velocity Trajectory', desc: 'Day 1: 2 -> Day 2: 5 -> Day 3: 12 -> Day 4: 26.' },
  { step: 18, title: 'Trigger POTENTIAL OUTBREAK Risk Alert', desc: 'Surge velocity warning generated for local farmers.' },
  { step: 19, title: 'Switch to Agricultural Officer Dashboard', desc: 'Dr. Ananya Sharma reviews regional surveillance data.' },
  { step: 20, title: 'Officer Inspects Incoming Case', desc: 'Review farmer leaf photo, AI prediction, confidence, and GPS.' },
  { step: 21, title: 'Officer Verifies & Diagnoses Report', desc: 'Confirm Alternaria solani diagnosis and add advisory field notes.' },
  { step: 22, title: 'Farmer Receives Verification Notification', desc: 'Instant notification dispatched to farmer device.' },
  { step: 23, title: 'Open Agriculture Marketplace', desc: 'Browse certified seeds, bio-fungicides, and sprayers.' },
  { step: 24, title: 'Search Bio-Inputs for Early Blight', desc: 'Find Trichoderma viride and cold-pressed neem oil.' },
  { step: 25, title: 'Demonstrate Product Comparison', desc: 'Compare prices, active ingredients, and safety labels side-by-side.' },
  { step: 26, title: 'Add Recommended Product to Cart', desc: 'Add Bio-Shield Trichoderma Viride to cart.' },
  { step: 27, title: 'Demo Checkout & Order Fulfillment', desc: 'Choose Farm Delivery or Local Pickup and generate digital invoice.' },
  { step: 28, title: 'Open Weather & Crop Risk Engine', desc: 'Check microclimate humidity and calculated disease risk.' },
  { step: 29, title: 'Open Soil Health Assistant', desc: 'Enter NPK and pH values for plain-language interpretation.' },
  { step: 30, title: 'Open Digital Crop Diary', desc: 'Inspect chronological field records and growth stages.' },
  { step: 31, title: 'Ask Farming Question via Voice', desc: 'Voice query: "My tomato leaves are turning brown, what should I do?".' },
  { step: 32, title: 'Switch Language to Telugu (తెలుగు)', desc: 'Instant UI translation across all farmer screens.' },
  { step: 33, title: 'Inspect Telugu Advisory Information', desc: 'Full vernacular accessibility for Andhra & Telangana farmers.' },
  { step: 34, title: 'Switch Language to Tamil (தமிழ்)', desc: 'Dynamic localization for Tamil Nadu agricultural belts.' },
  { step: 35, title: 'Inspect Tamil Advisory Information', desc: 'Complete seamless multi-state compatibility.' },
  { step: 36, title: 'Demonstrate Offline Report Creation', desc: 'Save report locally to IndexedDB during offline conditions.' },
  { step: 37, title: 'Reconnect & Automatic Synchronization', desc: 'Internet restored: local reports sync automatically to server.' }
];

export const SIHDemoRunner = ({ isOpen, onClose, onExecuteStepAction }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { setLanguage } = useTranslation();
  const { switchRole } = useAuth();

  if (!isOpen) return null;

  const currentStep = SIH_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < SIH_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      triggerStepEffects(nextIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      triggerStepEffects(prevIdx + 1);
    }
  };

  const triggerStepEffects = (stepNum) => {
    if (onExecuteStepAction) {
      onExecuteStepAction(stepNum);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[480px] z-50 bg-slate-900/95 text-white rounded-3xl p-5 shadow-2xl border border-slate-700 backdrop-blur-xl animate-in slide-in-from-bottom-5">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-black flex items-center justify-center font-black text-xs">
            ★
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wider uppercase text-amber-400">
              SIH 37-Step Presentation Tour
            </h4>
            <span className="text-[10px] text-slate-400">
              Step {currentStep.step} of {SIH_STEPS.length}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step Content */}
      <div className="space-y-2 my-3">
        <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
          <span className="text-amber-400 font-extrabold">{currentStep.step}.</span>
          <span>{currentStep.title}</span>
        </h5>
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
          {currentStep.desc}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
        <div
          className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / SIH_STEPS.length) * 100}%` }}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={() => triggerStepEffects(currentStep.step)}
          className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold px-3 py-2 rounded-xl flex items-center gap-1"
        >
          <span>Run Step {currentStep.step}</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentStepIndex === SIH_STEPS.length - 1}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-slate-950 text-xs font-extrabold px-3 py-2 rounded-xl flex items-center gap-1"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SIHDemoRunner;
