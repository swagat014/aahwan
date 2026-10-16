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
    <section id="gallery" className="py-14 sm:py-20 bg-slate-50/80 relative overflow-hidden select-none">

      {/* Radial Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 bg-white text-blue-600 border border-blue-200/90 rounded-full text-[0.68rem] sm:text-xs font-black uppercase tracking-widest mb-3 shadow-xs">
            <Camera size={14} className="text-amber-500" /> Photo Highlights & Action Moments
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2 sm:mb-3">
            {festivalName} {year} Photo Gallery
          </h2>

          <p className="text-slate-600 text-sm sm:text-base font-medium">
            High-definition moments celebrating victory, team camaraderie, and athletic excellence at GCEK.
          </p>
        </motion.div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 sm:mb-10">
          {categories.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`relative px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-black text-xs transition-colors cursor-pointer ${activeCategory === tab.id
                ? 'text-white'
                : 'text-slate-700 hover:text-blue-600 bg-white border border-slate-200'
                }`}
            >
              {activeCategory === tab.id && (
                <motion.div
                  layoutId="activeGalleryPillLuxury"
                  className="absolute inset-0 bg-blue-600 rounded-full shadow-md shadow-blue-500/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Photos Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence>
            {filteredPhotos.map((photo) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                key={photo.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedPhoto(photo)}
                className="award-glass-card rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-xs hover:shadow-xl hover:border-blue-500 transition-all duration-300 cursor-pointer group relative"
              >
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img
                    src={photo.image}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Gradient Overlay & Caption */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-4 sm:p-5">
                    <div className="text-white min-w-0 flex-1">
                      <span className="inline-block px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[0.62rem] font-black rounded-full uppercase tracking-wider mb-1.5 shadow-xs">
                        {photo.category}
                      </span>
                      <h4 className="font-black text-sm sm:text-base text-white leading-snug truncate">{photo.title}</h4>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-md border border-white/30 group-hover:scale-110 transition-transform shrink-0 ml-2">
                      <Maximize2 size={15} />
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
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">

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
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative z-10 border border-slate-200"
              >
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-3.5 right-3.5 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/80 backdrop-blur-md text-white hover:bg-rose-600 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                >
                  <X size={18} />
                </button>

                <div className="max-h-[70vh] overflow-hidden bg-slate-950 flex items-center justify-center">
                  <img src={selectedPhoto.image} alt={selectedPhoto.title} className="w-full h-full object-contain mx-auto" />
                </div>

                <div className="p-4 sm:p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 text-[0.68rem] font-black rounded-full uppercase tracking-wider mb-1.5">
                      {selectedPhoto.category}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900">{selectedPhoto.title}</h3>
                  </div>

                  <span className="text-[0.68rem] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 shrink-0">
                    AWAHAAN {year} • GCEK
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
