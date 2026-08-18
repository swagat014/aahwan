import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Trash2, Printer, Search, Filter, CheckCircle, BookOpen, ShieldCheck, Mail, Phone, UserCheck, Calendar } from 'lucide-react';
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
    <div className="space-y-6 select-none">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h4 className="text-xl font-black text-slate-900">Student Submissions & Official Rosters</h4>
          <p className="text-xs text-slate-500 font-semibold">
            Manage registered student athletes ({registrations.length} total), filter per sport event, and generate printable rosters.
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

      {/* Filter & Search Controls */}
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
            <option value="all">All Sports Events ({sports.length})</option>
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
            <option value="Computer Science">Computer Science (CSE)</option>
            <option value="Electrical">Electrical Engg (EE)</option>
            <option value="Mechanical">Mechanical Engg (ME)</option>
            <option value="Civil">Civil Engg (CE)</option>
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

      {/* MOBILE STACKED CARDS VIEW (Visible < md) */}
      <div className="md:hidden space-y-3">
        {filteredRegistrations.length > 0 ? (
          filteredRegistrations.map((student) => (
            <div key={student.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-mono font-black text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {student.rollNo}
                </span>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-black ${
                    student.gender === 'Boys Division' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                  }`}>
                    {student.gender}
                  </span>

                  <button
                    onClick={() => deleteRegistration(student.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-100"
                    title="Delete Registration"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <h5 className="font-black text-base text-slate-900">{student.name}</h5>
                <p className="text-xs font-bold text-slate-500">{student.branch} ({student.year})</p>
              </div>

              {/* Selected Events */}
              <div className="space-y-1 pt-1">
                <span className="text-[0.65rem] font-black uppercase text-slate-400 block tracking-wider">
                  Registered Events ({student.events.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {student.events.map((e, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white text-slate-800 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs">
                      🏆 {e}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500 font-bold bg-white rounded-2xl border border-slate-200">
            No student registrations found.
          </div>
        )}
      </div>

      {/* DESKTOP METALLIC TABLE VIEW (Visible >= md) */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-black uppercase tracking-wider text-[0.7rem]">
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
                    <td className="p-4 font-mono font-black text-blue-600">{student.rollNo}</td>
                    <td className="p-4 font-black text-slate-900">{student.name}</td>
                    <td className="p-4 text-slate-600 font-bold">{student.branch} ({student.year})</td>
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
