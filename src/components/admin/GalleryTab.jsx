import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Image as ImageIcon, Upload, Plus, Trash2, CheckCircle, Camera } from 'lucide-react';

export default function GalleryTab() {
  const { galleryPhotos, addGalleryPhoto, deleteGalleryPhoto, handlePhotoUpload } = useApp();
  const [savedMsg, setSavedMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newPhoto, setNewPhoto] = useState({
    title: '',
    category: 'Athletics',
    image: '/assets/images/hero_sports_banner_1786976961106.png',
    timestamp: 'Day 1'
  });

  const handleGalleryUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const publicUrl = await handlePhotoUpload(file, 'gallery');
    setUploading(false);
    setNewPhoto(prev => ({ ...prev, image: publicUrl }));
    setSavedMsg('Photo uploaded to Supabase storage bucket "aahwan" successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newPhoto.title) return;
    addGalleryPhoto(newPhoto);
    setNewPhoto({ title: '', category: 'Athletics', image: '/assets/images/hero_sports_banner_1786976961106.png', timestamp: 'Day 1' });
    setShowAddForm(false);
    setSavedMsg('New photo highlight added to gallery successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h4 className="text-xl font-black text-slate-900">Photo Highlights Gallery Manager</h4>
          <p className="text-xs text-slate-500 font-semibold">
            Manage high-definition sports photo highlights. Upload photos directly to Supabase storage bucket "aahwan".
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedMsg && (
            <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle size={16} /> {savedMsg}
            </div>
          )}

          <button
            onClick={() => setShowAddForm(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-full shadow-md flex items-center gap-1.5"
          >
            <Plus size={16} /> Add Photo Highlight
          </button>
        </div>
      </div>

      {/* Add Photo Form Overlay */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-blue-50/80 border border-blue-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h5 className="font-black text-base text-slate-900 flex items-center gap-2">
            <Camera size={18} className="text-blue-600" /> Upload New Photo Highlight to Supabase
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Image Preview & Upload Dropzone */}
            <div className="md:col-span-4 text-center">
              <div className="w-full h-40 rounded-2xl overflow-hidden border-2 border-blue-300 mb-3 relative bg-slate-200">
                <img src={newPhoto.image} alt="Preview" className="w-full h-full object-cover" />
                {uploading && (
                  <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 font-black text-xs rounded-full cursor-pointer hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <Upload size={14} /> Upload Image to Supabase
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleGalleryUpload(e.target.files[0])}
                />
              </label>
            </div>

            {/* Inputs */}
            <div className="md:col-span-8 space-y-3">
              <div>
                <label className="block text-[0.7rem] font-black uppercase text-slate-700 tracking-wider mb-1">
                  Photo Highlight Caption / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100m Sprint Grand Final Finish"
                  value={newPhoto.title}
                  onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.7rem] font-black uppercase text-slate-700 tracking-wider mb-1">
                    Event Category
                  </label>
                  <select
                    value={newPhoto.category}
                    onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-xs"
                  >
                    <option value="Athletics">Athletics (Track & Field)</option>
                    <option value="Team Sports">Team Sports (Cricket, Football, Kabaddi)</option>
                    <option value="Indoor Games">Indoor Games (Chess, TT, Badminton)</option>
                    <option value="Ceremony">Ceremony & March Past</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[0.7rem] font-black uppercase text-slate-600 tracking-wider mb-1">
                    Tag Day (e.g. Day 1)
                  </label>
                  <input
                    type="text"
                    value={newPhoto.timestamp}
                    onChange={(e) => setNewPhoto({ ...newPhoto, timestamp: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
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
                  Save Photo to Gallery
                </button>
              </div>
            </div>

          </div>
        </form>
      )}

      {/* Photo Highlights Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryPhotos.map((photo) => (
          <div key={photo.id} className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden relative shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="h-44 overflow-hidden relative">
              <img src={photo.image} alt={photo.title} className="w-full h-full object-cover" />
              <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-[0.65rem] font-black px-3 py-1 rounded-full uppercase">
                {photo.category}
              </span>
            </div>

            <div className="p-4 flex flex-col justify-between flex-grow">
              <h5 className="font-extrabold text-sm text-slate-900 mb-2">{photo.title}</h5>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-bold text-slate-500 mt-auto">
                <span>{photo.timestamp}</span>
                <button
                  onClick={() => deleteGalleryPhoto(photo.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors"
                  title="Delete Photo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
