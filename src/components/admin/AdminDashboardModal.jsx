import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, Users, Trophy, Calendar, LogOut, FileText, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import SettingsTab from './SettingsTab';
import DignitariesTab from './DignitariesTab';
import SportsTab from './SportsTab';
import ScheduleLeaderboardTab from './ScheduleLeaderboardTab';
import StudentRegistrationsTab from './StudentRegistrationsTab';

export default function AdminDashboardModal() {
  const { showAdminDashboard, setShowAdminDashboard, logoutAdmin, registrations } = useApp();
  const [activeTab, setActiveTab] = useState('registrations');

  if (!showAdminDashboard) return null;

  const tabs = [
    { id: 'registrations', label: `Student Submissions (${registrations.length})`, icon: <FileText size={16} /> },
    { id: 'dignitaries', label: 'Leadership & Coordinators', icon: <Users size={16} /> },
    { id: 'sports', label: 'Sports & Rules', icon: <Trophy size={16} /> },
    { id: 'schedule', label: 'Schedule & Tally', icon: <Calendar size={16} /> },
    { id: 'settings', label: 'General Settings', icon: <Sliders size={16} /> },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowAdminDashboard(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 border border-slate-200"
        >
          {/* Close Button */}
          <button
            onClick={() => setShowAdminDashboard(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-700 flex items-center justify-center transition-colors shadow-sm"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-wider mb-1">
                Admin Portal • Supabase Connected
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">AAHWAN Admin Control Center</h3>
              <p className="text-xs text-slate-500 font-semibold">Government College of Engineering Kalahandi</p>
            </div>

            <button
              onClick={logoutAdmin}
              className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold text-xs rounded-full transition-all flex items-center gap-1.5 border border-slate-200"
            >
              <LogOut size={14} /> Exit Admin
            </button>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex flex-wrap gap-2 pb-6 border-b border-slate-200 mb-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-102'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === 'registrations' && <StudentRegistrationsTab />}
            {activeTab === 'dignitaries' && <DignitariesTab />}
            {activeTab === 'sports' && <SportsTab />}
            {activeTab === 'schedule' && <ScheduleLeaderboardTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
