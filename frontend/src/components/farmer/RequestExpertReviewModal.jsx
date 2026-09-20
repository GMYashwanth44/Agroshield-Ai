import React, { useState } from 'react';
import {
  UserCheck, ShieldCheck, X, Send, Mic, CheckCircle2,
  AlertTriangle, Clock, Sparkles
} from 'lucide-react';
import { api } from '../../services/api';

export const RequestExpertReviewModal = ({
  isOpen,
  onClose,
  report,
  onRequestSubmitted
}) => {
  if (!isOpen || !report) return null;

  const [farmerNotes, setFarmerNotes] = useState(
    'Noticed concentric spots on lower leaves 2 days after rain. Requesting officer field confirmation and dosage verification.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.requestOfficerReview(report.id || 1, farmerNotes);
      setSuccess(true);
      setTimeout(() => {
        if (onRequestSubmitted) onRequestSubmitted();
        onClose();
      }, 1500);
    } catch (err) {
      alert('Failed to submit review request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                Request Agricultural Officer Review
              </h3>
              <p className="text-xs text-slate-500">
                Escalate AI diagnosis to District Krishi Vigyan Kendra (KVK) officer
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6 bg-emerald-50 rounded-2xl text-center space-y-2 border border-emerald-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-bold text-emerald-950">Review Escalation Submitted!</h4>
            <p className="text-xs text-emerald-800">
              Your diagnosis report has been routed to Agricultural Officer Dr. Ananya Sharma (Kolar Jurisdiction). You will receive an alert once reviewed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Target Case Details */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{report.crop || report.crop_name} • {report.disease || report.disease_name}</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded">
                  {report.severity} Severity
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                AI Confidence: {report.confidence_pct ? `${report.confidence_pct}%` : '94.7%'} • Area: Srinivaspur, Kolar
              </p>
            </div>

            {/* Farmer Notes Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Field Observations & Notes for the Officer:
              </label>
              <textarea
                value={farmerNotes}
                onChange={(e) => setFarmerNotes(e.target.value)}
                rows={3}
                placeholder="Describe leaf symptoms, irrigation history, or recent weather..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* Officer Action Stages Info */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block text-xs">Official Officer Review Actions:</span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div>• <strong>Confirmed:</strong> Validates AI diagnosis</div>
                <div>• <strong>Needs More Info:</strong> Requests new photo</div>
                <div>• <strong>Different Diagnosis:</strong> Overrides AI</div>
                <div>• <strong>Resolved:</strong> Case marked recovered</div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit to Officer'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestExpertReviewModal;
