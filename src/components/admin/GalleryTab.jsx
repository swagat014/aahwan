import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Camera, Upload, Plus, Trash2, CheckCircle, Search, 
  X, Image as ImageIcon, Eye, Sparkles, Filter 
} from 'lucide-react';

export default function GalleryTab() {
  const { galleryPhotos, addGalleryPhoto, deleteGalleryPhoto, handlePhotoUpload } = useApp();
  const [savedMsg, setSavedMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newPhoto, setNewPhoto] = useState({
    title: '',
    category: 'Athletics',
    image: '/assets/images/hero_sports_banner_1786976961106.png',
    timestamp: 'Day 1'
  });

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'Athletics', label: 'Athletics' },
    { id: 'Team Sports', label: 'Team Sports' },
    { id: 'Indoor Games', label: 'Indoors' },
    { id: 'Ceremony', label: 'Ceremony' }
  ];

  const filteredPhotos = useMemo(() => {
    return galleryPhotos.filter(photo => {
      const matchesCategory = activeCategory === 'all' || photo.category === activeCategory;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        (photo.title && photo.title.toLowerCase().includes(term)) || 
        (photo.timestamp && photo.timestamp.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [galleryPhotos, activeCategory, searchTerm]);

  const handleGalleryUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const publicUrl = await handlePhotoUpload(file, 'gallery');
      setNewPhoto(prev => ({ ...prev, image: publicUrl }));
      setSavedMsg('Photo uploaded to storage!');
      setTimeout(() => setSavedMsg(''), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newPhoto.title) return;
    addGalleryPhoto(newPhoto);
    setNewPhoto({ 
      title: '', 
      category: 'Athletics', 
      image: '/assets/images/hero_sports_banner_1786976961106.png', 
      timestamp: 'Day 1' 
    });
    setShowAddModal(false);
    setSavedMsg('New photo highlight added to gallery!');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  return (
    <div className="space-y-3.5 select-none text-slate-800">

      {/* 1. COMPACT TELEMETRY & CONTROLS HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-200/70 text-pink-600 flex items-center justify-center shrink-0 shadow-xs">
              <Camera size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Photo Highlights Desk</h3>
                <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[0.65rem] font-black">
                  {galleryPhotos.length} Photos
                </span>
              </div>
              <p className="text-[0.68rem] text-slate-500 font-semibold truncate">
                Curate high-definition photo action moments displayed on the festival gallery
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
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>Upload Photo</span>
            </button>
          </div>

        </div>

        {/* 2. COMPACT SEARCH & CATEGORY FILTER STRIP */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100">
          
          {/* Category Pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
            {categories.map(cat => {
              const isSelected = activeCategory === cat.id;
              const count = cat.id === 'all' 
                ? galleryPhotos.length 
                : galleryPhotos.filter(p => p.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs font-black'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`px-1 py-0.2 rounded-full text-[0.6rem] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[180px] sm:w-56">
            <Search size={13} className="absolute left-2.5 top-2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search photo caption..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-6 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-700"
              >
                <X size={11} />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* 3. HIGH-DENSITY PHOTO HIGHLIGHTS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredPhotos.map((photo) => (
          <div 
            key={photo.id}
            className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col group"
          >
            {/* Image Preview Container (16:9 aspect ratio) */}
            <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
              <img 
                src={photo.image} 
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              
              {/* Category Badge */}
              <span className="absolute top-2 left-2 bg-slate-950/75 backdrop-blur-md text-white text-[0.6rem] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                {photo.category}
              </span>

              {/* Day Tag */}
              <span className="absolute bottom-2 left-2 bg-slate-950/70 backdrop-blur-md text-amber-400 text-[0.6rem] font-bold px-1.5 py-0.5 rounded-md">
                {photo.timestamp || 'Day 1'}
              </span>

              {/* Quick Actions Hover Overlay */}
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setPreviewPhoto(photo)}
                  className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                  title="View full image"
                >
                  <Eye size={13} />
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete photo "${photo.title}"?`)) {
                      deleteGalleryPhoto(photo.id);
                    }
                  }}
                  className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                  title="Delete photo"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Bottom Caption & Day */}
            <div className="p-2.5 flex items-center justify-between gap-2">
              <span className="font-bold text-xs text-slate-900 truncate leading-snug" title={photo.title}>
                {photo.title}
              </span>

              <button
                onClick={() => {
                  if (window.confirm(`Delete photo "${photo.title}"?`)) {
                    deleteGalleryPhoto(photo.id);
                  }
                }}
                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer sm:hidden"
                title="Delete photo"
              >
                <Trash2 size={13} />
              </button>
            </div>

          </div>
        ))}

        {filteredPhotos.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200">
            <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No photos found matching the selected filter.</p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchTerm(''); }}
              className="mt-2 text-xs font-black text-blue-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. MODAL: ADD / UPLOAD PHOTO HIGHLIGHT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 sm:p-5 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-3.5 border border-slate-200 text-xs">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Camera size={16} className="text-pink-600" />
                <span>Upload Photo Highlight</span>
              </h4>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 font-semibold">
              
              {/* Image Preview & Upload Dropzone */}
              <div className="space-y-1.5">
                <label className="block text-[0.65rem] uppercase font-black text-slate-600">
                  Photo Asset *
                </label>
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center">
                  <img src={newPhoto.image} alt="Preview" className="w-full h-full object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <label className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                  <Upload size={13} />
                  <span>{uploading ? 'Uploading to storage...' : 'Select File from Device'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleGalleryUpload(e.target.files[0])}
                  />
                </label>
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Highlight Caption / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100m Sprint Grand Final Finish"
                  value={newPhoto.title}
                  onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                    Category *
                  </label>
                  <select
                    value={newPhoto.category}
                    onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Athletics">Athletics</option>
                    <option value="Team Sports">Team Sports</option>
                    <option value="Indoor Games">Indoor Games</option>
                    <option value="Ceremony">Ceremony</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                    Day Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Day 1"
                    value={newPhoto.timestamp}
                    onChange={(e) => setNewPhoto({ ...newPhoto, timestamp: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
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
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. LIGHTBOX PREVIEW MODAL */}
      {previewPhoto && (
        <div 
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative"
          >
            <div className="relative aspect-video w-full bg-black">
              <img 
                src={previewPhoto.image} 
                alt={previewPhoto.title} 
                className="w-full h-full object-contain" 
              />
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3.5 flex items-center justify-between gap-3 text-white">
              <div>
                <h4 className="font-black text-sm">{previewPhoto.title}</h4>
                <p className="text-[0.68rem] text-slate-400 font-semibold">
                  {previewPhoto.category} • {previewPhoto.timestamp || 'Day 1'}
                </p>
              </div>

              <button
                onClick={() => {
                  if (window.confirm(`Delete photo "${previewPhoto.title}"?`)) {
                    deleteGalleryPhoto(previewPhoto.id);
                    setPreviewPhoto(null);
                  }
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
