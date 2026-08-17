import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import MouseSpotlight from './components/MouseSpotlight';
import ParallaxWatermark from './components/ParallaxWatermark';
import MarqueeText from './components/MarqueeText';
import Hero from './components/Hero';
import About from './components/About';
import Dignitaries from './components/Dignitaries';
import SportsShowcase from './components/SportsShowcase';
import Schedule from './components/Schedule';
import Leaderboard from './components/Leaderboard';
import Gallery from './components/Gallery';
import SportRuleModal from './components/SportRuleModal';
import Footer from './components/Footer';
import StudentRegistrationModal from './components/StudentRegistrationModal';
import AdminLoginPage from './components/admin/AdminLoginPage';
import AdminDashboardPage from './components/admin/AdminDashboardPage';

function MainAppContent() {
  const { viewMode } = useApp();
  const [selectedSport, setSelectedSport] = useState(null);

  // Render Standalone Admin Login Page
  if (viewMode === 'admin-login') {
    return <AdminLoginPage />;
  }

  // Render Separate Full-Page Admin Dashboard Workspace
  if (viewMode === 'admin-dashboard') {
    return <AdminDashboardPage />;
  }

  // Render Public Sports Website
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* Dynamic Mouse Spotlight Glow */}
      <MouseSpotlight />

      {/* Floating Parallax Stroked Text Background */}
      <ParallaxWatermark />

      {/* Hero Section */}
      <Hero />

      {/* Infinite Moving Marquee Ticker */}
      <MarqueeText />

      {/* Main UI Sections */}
      <About />
      <Dignitaries />
      <SportsShowcase onSelectSport={(sport) => setSelectedSport(sport)} />
      <Schedule />
      <Leaderboard />
      <Gallery />
      <Footer />

      {/* Student Self-Registration Modal */}
      <StudentRegistrationModal />

      {/* Sport Rules Modal */}
      {selectedSport && (
        <SportRuleModal
          sport={selectedSport}
          onClose={() => setSelectedSport(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
