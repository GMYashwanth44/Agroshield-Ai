import React, { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Calendar, Sprout, ShieldAlert, Droplets,
  FlaskConical, CheckCircle2, FileText, Image as ImageIcon
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { api } from '../../services/api';

export const CropDiaryPage = () => {
  const { t } = useTranslation();
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New entry form
  const [newEntry, setNewEntry] = useState({
    entry_type: 'observation',
    title: '',
    notes: ''
  });

  const loadFieldsAndEntries = async () => {
    setLoading(true);
    try {
      const fList = await api.getFields();
      setFields(fList || []);
      if (fList && fList.length > 0) {
        const fId = selectedFieldId || fList[0].id;
        setSelectedFieldId(fId);
        const eList = await api.getDiaryEntries(fId);
        setEntries(eList || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFieldsAndEntries();
  }, [selectedFieldId]);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!newEntry.title || !newEntry.notes) return;
    try {
      await api.createDiaryEntry({
        field_id: selectedFieldId,
        ...newEntry
      });
      setModalOpen(false);
      setNewEntry({ entry_type: 'observation', title: '', notes: '' });
      const eList = await api.getDiaryEntries(selectedFieldId);
      setEntries(eList || []);
    } catch (err) {
      alert('Failed to save diary entry: ' + err.message);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId) || fields[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <span>{t('crop_diary', 'Digital Crop Diary')}</span>
          </h1>
          <p className="text-xs text-slate-500">
            Field-by-field chronological log: planting, growth stages, fertilizer, disease scans & photos
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Diary Note</span>
        </button>
      </div>

      {/* Field Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div
            key={f.id}
            onClick={() => setSelectedFieldId(f.id)}
            className={`p-4 rounded-3xl border cursor-pointer transition space-y-2 ${
              selectedFieldId === f.id
                ? 'bg-emerald-50/80 border-emerald-500 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {f.name}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">{f.area_acres} Acres</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{f.crop_name}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
              <span>Stage: <strong>{f.growth_stage}</strong></span>
              <span>•</span>
              <span>Planted: {f.planting_date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Field Timeline Entries */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Timeline for {selectedField?.name} ({selectedField?.crop_name})</span>
        </h3>

        {entries.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No diary entries logged yet for this field.</p>
        ) : (
          <div className="relative pl-6 border-l-2 border-emerald-200 space-y-6">
            {entries.map((entry) => {
              let Icon = FileText;
              let iconBg = 'bg-blue-100 text-blue-700';
              if (entry.entry_type === 'planting') {
                Icon = Sprout;
                iconBg = 'bg-emerald-100 text-emerald-700';
              } else if (entry.entry_type === 'fertilizer') {
                Icon = FlaskConical;
                iconBg = 'bg-purple-100 text-purple-700';
              } else if (entry.entry_type === 'disease') {
                Icon = ShieldAlert;
                iconBg = 'bg-rose-100 text-rose-700';
              }

              return (
                <div key={entry.id} className="relative space-y-1.5">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full ${iconBg} flex items-center justify-center border-2 border-white shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{entry.title}</span>
                      <span className="text-[10px] font-semibold text-slate-400">{entry.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{entry.notes}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddEntry} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Crop Diary Note</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Entry Category</label>
                <select
                  value={newEntry.entry_type}
                  onChange={(e) => setNewEntry({ ...newEntry, entry_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="observation">Foliage / Crop Observation</option>
                  <option value="fertilizer">Fertilizer / Nutrition Applied</option>
                  <option value="disease">Disease / Pest Scouting</option>
                  <option value="irrigation">Irrigation Event</option>
                  <option value="harvest">Harvesting Output</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Applied 19:19:19 via Drip Fertigation"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Field Notes</label>
                <textarea
                  placeholder="Describe dosages, weather during application, plant appearance..."
                  rows={3}
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Save to Diary
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CropDiaryPage;
