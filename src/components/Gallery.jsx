import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Maximize2, Sparkles, Trophy, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Gallery() {
  const { galleryPhotos, year, festivalName } = useApp();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'Athletics', label: 'Track & Athletics' },
    { id: 'Team Sports', label: 'Team Sports' },
    { id: 'Indoor Games', label: 'Indoor & Chess' },
    { id: 'Ceremony', label: 'Dignitaries & Ceremony' },
  ];

  const filteredPhotos = galleryPhotos.filter(p => {
    return activeCategory === 'all' || p.category === activeCategory;
  });

  return (
    <section id="gallery" className="py-28 bg-slate-50/80 relative overflow-hidden select-none">

      {/* Radial Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white text-blue-600 border border-blue-200/90 rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-sm">
            <Camera size={15} className="text-amber-500" /> Photo Highlights & Action Moments
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            {festivalName} {year} Photo Gallery
          </h2>

          <p className="text-slate-600 text-lg">
            High-definition moments celebrating victory, team camaraderie, and athletic excellence at GCEK.
          </p>
        </motion.div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {categories.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`relative px-6 py-2.5 rounded-full font-black text-xs sm:text-sm transition-colors ${activeCategory === tab.id
                ? 'text-white'
                : 'text-slate-700 hover:text-blue-600 bg-white border border-slate-200'
                }`}
            >
              {activeCategory === tab.id && (
                <motion.div
                  layoutId="activeGalleryPillLuxury"
                  className="absolute inset-0 bg-blue-600 rounded-full shadow-lg shadow-blue-500/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Photos Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredPhotos.map((photo) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                key={photo.id}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedPhoto(photo)}
                className="award-glass-card rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-sm hover:shadow-2xl hover:border-blue-500 transition-all duration-500 cursor-pointer group relative"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={photo.image}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Gradient Overlay & Caption */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div className="text-white">
                      <span className="inline-block px-3 py-1 bg-amber-500 text-slate-950 text-[0.65rem] font-black rounded-full uppercase tracking-wider mb-2 shadow-md">
                        {photo.category}
                      </span>
                      <h4 className="font-black text-lg text-white leading-snug">{photo.title}</h4>
                    </div>

                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform">
                      <Maximize2 size={18} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Ultra-Premium Lightbox Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">

              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPhoto(null)}
                className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative z-10 border border-slate-200"
              >
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-950/80 backdrop-blur-md text-white hover:bg-rose-600 flex items-center justify-center transition-colors shadow-lg"
                >
                  <X size={20} />
                </button>

                <div className="max-h-[75vh] overflow-hidden bg-slate-950 flex items-center justify-center">
                  <img src={selectedPhoto.image} alt={selectedPhoto.title} className="w-full h-full object-contain mx-auto" />
                </div>

                <div className="p-6 sm:p-8 bg-white flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="inline-block px-3.5 py-1 bg-amber-100 text-amber-900 border border-amber-200 text-xs font-black rounded-full uppercase tracking-wider mb-2">
                      {selectedPhoto.category}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">{selectedPhoto.title}</h3>
                  </div>

                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                    AWAHAAN {year} • GCEK Kalahandi
                  </span>
                </div>
              </motion.div>

            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
