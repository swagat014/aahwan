import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Trophy, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function PrintableRosterModal({ sportTitle, onClose }) {
  const { registrations, collegeName, collegeLocation, year } = useApp();

  if (!sportTitle) return null;

  // Filter students who registered for this sport
  const registeredStudents = registrations.filter(r => r.events.includes(sportTitle));

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 print:p-0 print:static">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md print:hidden"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl relative z-10 border border-slate-200 print:shadow-none print:border-none print:max-w-none print:w-full print:p-0"
        >
          {/* Action Bar (Hidden during printing) */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 print:hidden">
            <div>
              <h4 className="text-xl font-black text-slate-900">Official Officiating Roster Generator</h4>
              <p className="text-xs font-semibold text-slate-500">Formated for GCEK Referee Desk & Sports Society printing.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-full shadow-lg shadow-blue-500/25 flex items-center gap-2"
              >
                <Printer size={16} /> Print Official Sheet
              </button>
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Printable Letterhead Content */}
          <div className="space-y-6 text-slate-900 font-sans print:p-4">
            
            {/* Header / Letterhead */}
            <div className="text-center pb-6 border-b-2 border-slate-900">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider">{collegeName} {collegeLocation}</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Bhawanipatna, Kalahandi, Odisha - 766002</p>
              <h3 className="text-lg font-black text-blue-800 uppercase tracking-widest mt-2">
                AAHWAN {year} ANNUAL ATHLETIC MEET • OFFICIATING SHEET
              </h3>
            </div>

            {/* Sport Metadata Box */}
            <div className="flex flex-wrap items-center justify-between p-4 bg-slate-100 rounded-2xl border border-slate-300 text-xs font-bold print:bg-white print:border-slate-800">
              <div>
                <span className="text-slate-500 uppercase block text-[0.65rem]">Event Discipline</span>
                <span className="text-base font-black text-slate-900 uppercase">{sportTitle}</span>
              </div>

              <div>
                <span className="text-slate-500 uppercase block text-[0.65rem]">Total Athletes</span>
                <span className="text-base font-black text-blue-700">{registeredStudents.length} Registered</span>
              </div>

              <div>
                <span className="text-slate-500 uppercase block text-[0.65rem]">Officiating Desk</span>
                <span className="text-slate-900">GCEK Athletic Board</span>
              </div>
            </div>

            {/* Athletes Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-900">
                <thead>
                  <tr className="bg-slate-200 print:bg-slate-200 border-b border-slate-900 font-black uppercase">
                    <th className="p-3 border-r border-slate-900 w-12 text-center">S.No</th>
                    <th className="p-3 border-r border-slate-900">Roll / Reg No</th>
                    <th className="p-3 border-r border-slate-900">Athlete Name</th>
                    <th className="p-3 border-r border-slate-900">Branch & Year</th>
                    <th className="p-3 border-r border-slate-900">Division</th>
                    <th className="p-3 border-r border-slate-900">Contact No</th>
                    <th className="p-3 w-28 text-center">Signature / Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {registeredStudents.length > 0 ? (
                    registeredStudents.map((s, idx) => (
                      <tr key={s.id} className="border-b border-slate-900">
                        <td className="p-3 border-r border-slate-900 text-center font-bold">{idx + 1}</td>
                        <td className="p-3 border-r border-slate-900 font-mono font-bold">{s.rollNo}</td>
                        <td className="p-3 border-r border-slate-900 font-black text-slate-900">{s.name}</td>
                        <td className="p-3 border-r border-slate-900 font-semibold">{s.branch} ({s.year})</td>
                        <td className="p-3 border-r border-slate-900 font-bold">{s.gender}</td>
                        <td className="p-3 border-r border-slate-900 font-medium">{s.phone}</td>
                        <td className="p-3 border-slate-900 text-center"></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500 font-bold">
                        No student athletes registered for {sportTitle} yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Signature Block for Referees */}
            <div className="pt-16 grid grid-cols-3 gap-8 text-center text-xs font-bold text-slate-800">
              <div>
                <div className="border-t border-slate-900 pt-2">Student Coordinator</div>
              </div>
              <div>
                <div className="border-t border-slate-900 pt-2">Faculty Convener / Referee</div>
              </div>
              <div>
                <div className="border-t border-slate-900 pt-2">VP Sports / DSW Approval</div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
