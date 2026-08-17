import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Trash2, Printer, Search, Filter, CheckCircle, BookOpen } from 'lucide-react';
import PrintableRosterModal from './PrintableRosterModal';

export default function StudentRegistrationsTab() {
  const { registrations, deleteRegistration, sports } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState('all');
  const [printSportTitle, setPrintSportTitle] = useState(null);

  // Filter Registrations
  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSportFilter === 'all' || r.events.includes(selectedSportFilter);
    const matchesBranch = selectedBranchFilter === 'all' || r.branch.includes(selectedBranchFilter);
    const matchesGender = selectedGenderFilter === 'all' || r.gender === selectedGenderFilter;
    return matchesSearch && matchesSport && matchesBranch && matchesGender;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h4 className="text-xl font-black text-slate-900">Student Registrations & Rosters Manager</h4>
          <p className="text-xs text-slate-500 font-semibold">
            Manage registered student submissions ({registrations.length} total), filter per sport event, and generate official printable officiating rosters.
          </p>
        </div>

        {selectedSportFilter !== 'all' && (
          <button
            onClick={() => setPrintSportTitle(selectedSportFilter)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-full shadow-md flex items-center gap-1.5"
          >
            <Printer size={16} /> Print Roster for {selectedSportFilter}
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-3xl p-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Name or Roll No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Filter by Sport */}
        <div>
          <select
            value={selectedSportFilter}
            onChange={(e) => setSelectedSportFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Sports & Athletics ({sports.length})</option>
            {sports.map(s => (
              <option key={s.id} value={s.title}>{s.title}</option>
            ))}
          </select>
        </div>

        {/* Filter by Branch */}
        <div>
          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Engineering Branches</option>
            <option value="Computer Science">Computer Science & Engg (CSE)</option>
            <option value="Electrical">Electrical Engineering (EE)</option>
            <option value="Mechanical">Mechanical Engineering (ME)</option>
            <option value="Civil">Civil Engineering (CE)</option>
          </select>
        </div>

        {/* Filter by Gender */}
        <div>
          <select
            value={selectedGenderFilter}
            onChange={(e) => setSelectedGenderFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Divisions</option>
            <option value="Boys Division">Boys Division</option>
            <option value="Girls Division">Girls Division</option>
          </select>
        </div>

      </div>

      {/* Registrations Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 font-black text-slate-700 uppercase tracking-wider">
                <th className="p-4">Roll No</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Branch & Year</th>
                <th className="p-4">Division</th>
                <th className="p-4">Selected Sports Events</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">{student.rollNo}</td>
                    <td className="p-4 font-black text-slate-900">{student.name}</td>
                    <td className="p-4 text-slate-600">{student.branch} ({student.year})</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold ${
                        student.gender === 'Boys Division' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {student.events.map((e, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-md text-[0.7rem] font-bold">
                            {e}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteRegistration(student.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors"
                        title="Delete Student Registration"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                    No student registrations found matching the search/filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Roster Modal Trigger */}
      {printSportTitle && (
        <PrintableRosterModal
          sportTitle={printSportTitle}
          onClose={() => setPrintSportTitle(null)}
        />
      )}

    </div>
  );
}
