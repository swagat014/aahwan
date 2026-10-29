import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Upload, Plus, Trash2, Save, CheckCircle, UserPlus, 
  Award, Crown, Shield, Users, Edit3, X, Sparkles, ExternalLink 
} from 'lucide-react';

export default function DignitariesTab() {
  const { dignitaries, updateDignitary, addDignitary, removeDignitary, handlePhotoUpload, saveToCloud } = useApp();
  const [activeTier, setActiveTier] = useState('tier1');
  const [uploading, setUploading] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null); // { tier, index, data }

  const [newPerson, setNewPerson] = useState({
    name: '',
    role: '',
    dept: '',
    image: '/assets/images/gcek_principal_vp_1786977233454.png',
    quote: ''
  });

  const tierMeta = {
    tier1: {
      label: "Executive Patronage",
      sub: "Principal & DSW Leadership",
      icon: <Crown size={14} className="text-amber-500" />,
      color: "text-amber-500 bg-amber-50 border-amber-200",
      pillColor: "bg-amber-100 text-amber-800 border-amber-200"
    },
    tier2: {
      label: "Faculty Leadership",
      sub: "VP Sports & Faculty Coordinators",
      icon: <Shield size={14} className="text-blue-500" />,
      color: "text-blue-500 bg-blue-50 border-blue-200",
      pillColor: "bg-blue-100 text-blue-800 border-blue-200"
    },
    tier3: {
      label: "Student Body Officers & Conveners",
      sub: "Sports Secretary & Branch Conveners",
      icon: <Users size={14} className="text-emerald-500" />,
      color: "text-emerald-500 bg-emerald-50 border-emerald-200",
      pillColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
    }
  };

  const handleImageUpload = async (file, onComplete) => {
    if (!file) return;
    setUploading(true);
    try {
      const publicUrl = await handlePhotoUpload(file, 'dignitaries');
      onComplete(publicUrl);
      setSavedMsg('Photo uploaded successfully!');
      setTimeout(() => setSavedMsg(''), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newPerson.name || !newPerson.role) return;
    addDignitary(activeTier, newPerson);
    setNewPerson({ 
      name: '', 
      role: '', 
      dept: '', 
      image: '/assets/images/gcek_principal_vp_1786977233454.png', 
      quote: '' 
    });
    setShowAddModal(false);
    setSavedMsg('Officer added & saved to live website!');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingPerson) return;
    updateDignitary(editingPerson.tier, editingPerson.index, editingPerson.data);
    setEditingPerson(null);
    setSavedMsg('Officer details updated & saved to live website!');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const currentOfficers = dignitaries[activeTier] || [];

  return (
    <div className="space-y-3.5 select-none text-slate-800">

      {/* 1. COMPACT TELEMETRY & CONTROLS HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200/70 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
              <Award size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Officers & Leadership Desk</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[0.65rem] font-black">
                  {Object.values(dignitaries).reduce((acc, curr) => acc + (curr?.length || 0), 0)} Total
                </span>
              </div>
              <p className="text-[0.68rem] text-slate-500 font-semibold truncate">
                Configure Principal patronage, Faculty VP Sports coordinators, and Student leadership council
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {savedMsg && (
              <span className="text-[0.68rem] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl animate-in fade-in flex items-center gap-1">
                <CheckCircle size={12} /> {savedMsg}
              </span>
            )}

            <button
              onClick={async () => {
                setUploading(true);
                await saveToCloud({ dignitaries });
                setUploading(false);
                setSavedMsg('Synced to Live Website!');
                setTimeout(() => setSavedMsg(''), 2500);
              }}
              disabled={uploading}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sync current officer roster to Supabase and live website"
            >
              <Save size={13} />
              <span>Sync Live Site</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus size={13} />
              <span>Add Officer</span>
            </button>
          </div>

        </div>

        {/* 2. COMPACT SEGMENTED TIER SELECTOR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-100">
          {Object.keys(tierMeta).map(tierKey => {
            const meta = tierMeta[tierKey];
            const isSelected = activeTier === tierKey;
            const count = (dignitaries[tierKey] || []).length;

            return (
              <button
                key={tierKey}
                onClick={() => setActiveTier(tierKey)}
                className={`flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100/80 text-slate-700 border-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`p-1 rounded-lg ${isSelected ? 'bg-white/10 text-white' : 'bg-white text-slate-600 shadow-2xs'}`}>
                    {meta.icon}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-black block truncate leading-tight">{meta.label}</span>
                    <span className={`text-[0.62rem] truncate block ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {meta.sub}
                    </span>
                  </div>
                </div>

                <span className={`text-[0.65rem] font-black px-1.5 py-0.5 rounded-full shrink-0 ml-1.5 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 3. HIGH-DENSITY OFFICERS CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {currentOfficers.map((person, idx) => (
          <div 
            key={idx}
            className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-3 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Card Header: Role & Quick Actions */}
              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
                <span className="text-[0.62rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 truncate">
                  {person.role || 'Officer'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingPerson({ tier: activeTier, index: idx, data: { ...person } })}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Officer"
                  >
                    <Edit3 size={13} />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Remove ${person.name} from ${tierMeta[activeTier].label}?`)) {
                        removeDignitary(activeTier, idx);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Officer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Avatar & Main Info */}
              <div className="flex items-start gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs group/img">
                  <img 
                    src={person.image} 
                    alt={person.name} 
                    className="w-full h-full object-cover" 
                  />
                  <label className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                    <Upload size={13} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleImageUpload(e.target.files[0], (url) => {
                            updateDignitary(activeTier, idx, { image: url });
                          });
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-xs text-slate-900 leading-snug truncate" title={person.name}>
                    {person.name}
                  </h4>
                  <p className="text-[0.65rem] font-bold text-slate-500 truncate mt-0.5" title={person.dept}>
                    {person.dept || 'GCEK Sports Body'}
                  </p>
                </div>
              </div>

              {/* Quote Snippet */}
              {person.quote && (
                <div className="mt-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-[0.68rem] italic text-slate-600 line-clamp-2 leading-relaxed">
                  "{person.quote}"
                </div>
              )}
            </div>

            {/* Quick Change Avatar Trigger */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[0.62rem] text-slate-400 font-semibold">
              <span className="font-mono">#{idx + 1}</span>
              <label className="text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer flex items-center gap-1">
                <Upload size={11} />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleImageUpload(e.target.files[0], (url) => {
                        updateDignitary(activeTier, idx, { image: url });
                      });
                    }
                  }}
                />
              </label>
            </div>

          </div>
        ))}

        {currentOfficers.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No officers listed in {tierMeta[activeTier].label}.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-xs font-black text-blue-600 hover:underline"
            >
              + Add First Officer
            </button>
          </div>
        )}
      </div>

      {/* 4. MODAL: ADD NEW OFFICER */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 sm:p-5 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-3.5 border border-slate-200 text-xs">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <UserPlus size={16} className="text-blue-600" />
                <span>Add Officer to {tierMeta[activeTier].label}</span>
              </h4>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 font-semibold">
              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Full Name & Honorific *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Faculty Coordinator"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Role Title / Designation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vice-President Sports Society"
                  value={newPerson.role}
                  onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Department / Unit Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dept of Mechanical Engg"
                  value={newPerson.dept}
                  onChange={(e) => setNewPerson({ ...newPerson, dept: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Message / Quote
                </label>
                <textarea
                  rows={2}
                  placeholder="Inspiring quote for athletes..."
                  value={newPerson.quote}
                  onChange={(e) => setNewPerson({ ...newPerson, quote: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 italic focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Photo Upload Row */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <img 
                  src={newPerson.image} 
                  alt="Preview" 
                  className="w-10 h-10 rounded-xl object-cover border border-slate-300 shrink-0" 
                />
                <div className="min-w-0 flex-1">
                  <label className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs">
                    <Upload size={12} />
                    <span>{uploading ? 'Uploading...' : 'Choose Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleImageUpload(e.target.files[0], (url) => {
                            setNewPerson(prev => ({ ...prev, image: url }));
                          });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Save Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: EDIT OFFICER */}
      {editingPerson && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 sm:p-5 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-3.5 border border-slate-200 text-xs">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Edit3 size={16} className="text-blue-600" />
                <span>Edit Officer Details</span>
              </h4>
              <button 
                onClick={() => setEditingPerson(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 font-semibold">
              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Full Name & Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingPerson.data.name}
                  onChange={(e) => setEditingPerson({
                    ...editingPerson,
                    data: { ...editingPerson.data, name: e.target.value }
                  })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingPerson.data.role}
                  onChange={(e) => setEditingPerson({
                    ...editingPerson,
                    data: { ...editingPerson.data, role: e.target.value }
                  })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Department / Subtitle
                </label>
                <input
                  type="text"
                  value={editingPerson.data.dept}
                  onChange={(e) => setEditingPerson({
                    ...editingPerson,
                    data: { ...editingPerson.data, dept: e.target.value }
                  })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Quote / Message
                </label>
                <textarea
                  rows={2}
                  value={editingPerson.data.quote}
                  onChange={(e) => setEditingPerson({
                    ...editingPerson,
                    data: { ...editingPerson.data, quote: e.target.value }
                  })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 italic focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Photo Upload Row */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <img 
                  src={editingPerson.data.image} 
                  alt="Preview" 
                  className="w-10 h-10 rounded-xl object-cover border border-slate-300 shrink-0" 
                />
                <div className="min-w-0 flex-1">
                  <label className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs">
                    <Upload size={12} />
                    <span>{uploading ? 'Uploading...' : 'Replace Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleImageUpload(e.target.files[0], (url) => {
                            setEditingPerson(prev => ({
                              ...prev,
                              data: { ...prev.data, image: url }
                            }));
                          });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPerson(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
