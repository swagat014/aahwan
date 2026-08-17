import React, { useState, useEffect } from 'react';
import { Trophy, Menu, X, Flame } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Leadership', href: '#dignitaries' },
    { name: 'Sports & Events', href: '#sports' },
    { name: 'Fixtures', href: '#schedule' },
    { name: 'Tally', href: '#leaderboard' },
    { name: 'Gallery', href: '#gallery' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3 border-b border-slate-200' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & College Badge */}
          <a href="#home" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl flex items-center justify-center font-extrabold text-xl shadow-md">
              A
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-slate-900 leading-none tracking-tight">AAHWAN 2026</h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">GCEK Kalahandi</p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="font-semibold text-sm text-slate-700 hover:text-blue-600 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          {/* Right Action & Live Badge */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-600 -ml-4"></span>
              LIVE MEET
            </div>

            <a
              href="#sports"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
            >
              Explore Events
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-blue-600 focus:outline-none"
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block font-semibold text-slate-800 hover:text-blue-600 py-2 border-b border-slate-100"
            >
              {link.name}
            </a>
          ))}
          <a
            href="#sports"
            onClick={() => setMobileOpen(false)}
            className="block text-center mt-4 w-full py-2.5 bg-blue-600 text-white font-bold rounded-full shadow-md"
          >
            Explore Events
          </a>
        </div>
      )}
    </header>
  );
}
