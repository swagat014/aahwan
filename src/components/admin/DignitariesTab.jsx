import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Upload, Plus, Trash2, Save, CheckCircle, UserPlus, Image as ImageIcon } from 'lucide-react';

export default function DignitariesTab() {
  const { dignitaries, updateDignitary, addDignitary, removeDignitary, handlePhotoUpload } = useApp();
  const [activeTier, setActiveTier] = useState('tier1');
  const [uploading, setUploading] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const [newPerson, setNewPerson] = useState({
    name: '',
    role: '',
    dept: '',
    image: '/assets/images/gcek_principal_vp_1786977233454.png',
    quote: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const tierLabels = {
    tier1: "Executive Patronage (Principal & DSW)",
    tier2: "Faculty Leadership (VP Sports & Coordinators)",
    tier3: "Student Body Officers (Sports Sec & Student Leads)"
  };

  const handleImageChange = async (tier, index, file) => {
    if (!file) return;
    setUploading(true);
    const publicUrl = await handlePhotoUpload(file, 'dignitaries');
    setUploading(false);
    updateDignitary(tier, index, { image: publicUrl });
    setSavedMsg('Photo uploaded to Supabase bucket "AWAHAAN" successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addDignitary(activeTier, newPerson);
    setNewPerson({ name: '', role: '', dept: '', image: '/assets/images/gcek_principal_vp_1786977233454.png', quote: '' });
    setShowAddForm(false);
    setSavedMsg('New Coordinator/Leader added successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h4 className="text-xl font-black text-slate-900">Leadership & Coordinators Manager</h4>
          <p className="text-xs text-slate-500 font-semibold">Manage Principal, DSW, VP Sports, Coordinators & upload avatar photos.</p>
        </div>

        {savedMsg && (
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle size={16} /> {savedMsg}
          </div>
        )}
      </div>

      {/* Tier Selector Buttons */}
      <div className="flex flex-wrap gap-3">
        {Object.keys(tierLabels).map(tier => (
          <button
            key={tier}
            onClick={() => setActiveTier(tier)}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all ${activeTier === tier
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            {tierLabels[tier]}
          </button>
        ))}
      </div>

      {/* Person Cards in Active Tier */}
      <div className="space-y-6">
        {dignitaries[activeTier]?.map((person, idx) => (
          <div key={idx} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 relative space-y-4">

            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                #{idx + 1} {person.role || 'Officer'}
              </span>

              <button
                onClick={() => removeDignitary(activeTier, idx)}
                className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-full hover:bg-rose-50"
                title="Remove Officer"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

              {/* Photo & Upload Button */}
              <div className="md:col-span-3 text-center">
                <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-3 relative group">
                  <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                </div>

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600 cursor-pointer transition-all shadow-sm">
                  <Upload size={14} /> Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(activeTier, idx, e.target.files[0])}
                  />
                </label>
              </div>

              {/* Form Fields */}
              <div className="md:col-span-9 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[0.7rem] font-black uppercase text-slate-600 tracking-wider mb-1">
                      Full Name & Title
                    </label>
                    <input
                      type="text"
                      value={person.name}
                      onChange={(e) => updateDignitary(activeTier, idx, { name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.7rem] font-black uppercase text-slate-600 tracking-wider mb-1">
                      Designation / Role Badge
                    </label>
                    <input
                      type="text"
                      value={person.role}
                      onChange={(e) => updateDignitary(activeTier, idx, { role: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.7rem] font-black uppercase text-slate-600 tracking-wider mb-1">
                    Department / Organization Subtitle
                  </label>
                  <input
                    type="text"
                    value={person.dept}
                    onChange={(e) => updateDignitary(activeTier, idx, { dept: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[0.7rem] font-black uppercase text-slate-600 tracking-wider mb-1">
                    Quote / Inspired Message
                  </label>
                  <textarea
                    rows={2}
                    value={person.quote}
                    onChange={(e) => updateDignitary(activeTier, idx, { quote: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs italic focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* Add New Coordinator Button */}
      <div className="pt-4 border-t border-slate-200">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-dashed border-blue-300 font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <UserPlus size={18} /> Add New Coordinator / Leader to {tierLabels[activeTier]}
          </button>
        ) : (
          <form onSubmit={handleAddSubmit} className="bg-blue-50/60 border border-blue-200 rounded-3xl p-6 space-y-4">
            <h5 className="font-black text-base text-slate-900 flex items-center gap-2">
              <UserPlus size={18} className="text-blue-600" /> Add New Officer
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Full Name (e.g. Prof. Faculty Coordinator)"
                value={newPerson.name}
                onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              />
              <input
                type="text"
                required
                placeholder="Role Tag (e.g. Student Coordinator)"
                value={newPerson.role}
                onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value })}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              />
              <input
                type="text"
                required
                placeholder="Department (e.g. CSE Convener)"
                value={newPerson.dept}
                onChange={(e) => setNewPerson({ ...newPerson, dept: e.target.value })}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold"
              />
              <input
                type="text"
                placeholder="Quote / Message"
                value={newPerson.quote}
                onChange={(e) => setNewPerson({ ...newPerson, quote: e.target.value })}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm italic"
              />

              <div className="sm:col-span-2 flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200">
                <img src={newPerson.image} alt="Preview" className="w-12 h-12 rounded-full object-cover border" />
                <label className="px-4 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-black rounded-full cursor-pointer transition-all flex items-center gap-1.5">
                  <Upload size={14} /> Select Officer Photo Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files[0]) {
                        const url = await handlePhotoUpload(e.target.files[0], 'dignitaries');
                        setNewPerson(prev => ({ ...prev, image: url }));
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-bold text-xs rounded-full shadow-md"
              >
                Confirm Add Officer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
