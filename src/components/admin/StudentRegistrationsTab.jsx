import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, Trash2, Printer, Search, Filter, CheckCircle, BookOpen, 
  ShieldCheck, Mail, Phone, UserCheck, Calendar, Download, X,
  User, Sparkles, ChevronRight, GraduationCap
} from 'lucide-react';
import PrintableRosterModal from './PrintableRosterModal';

export default function StudentRegistrationsTab() {
  const { registrations, deleteRegistration, sports } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState('all');
  const [printSportTitle, setPrintSportTitle] = useState(null);

  // Filter Registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        (r.name && r.name.toLowerCase().includes(term)) || 
        (r.rollNo && r.rollNo.toLowerCase().includes(term)) ||
        (r.phone && r.phone.toLowerCase().includes(term));
      const matchesSport = selectedSportFilter === 'all' || (r.events && r.events.includes(selectedSportFilter));
      const matchesBranch = selectedBranchFilter === 'all' || (r.branch && r.branch.includes(selectedBranchFilter));
      const matchesGender = selectedGenderFilter === 'all' || r.gender === selectedGenderFilter;
      return matchesSearch && matchesSport && matchesBranch && matchesGender;
    });
  }, [registrations, searchTerm, selectedSportFilter, selectedBranchFilter, selectedGenderFilter]);

  // Quick Metrics
  const metrics = useMemo(() => {
    const total = registrations.length;
    const boys = registrations.filter(r => r.gender === 'Boys Division').length;
    const girls = registrations.filter(r => r.gender === 'Girls Division').length;
    return { total, boys, girls };
  }, [registrations]);

  const hasActiveFilters = searchTerm !== '' || selectedSportFilter !== 'all' || selectedBranchFilter !== 'all' || selectedGenderFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSportFilter('all');
    setSelectedBranchFilter('all');
    setSelectedGenderFilter('all');
  };

  // CSV Export for Student Athletes
  const handleExportCSV = () => {
    const headers = ['Roll No', 'Name', 'Division', 'Branch', 'Year', 'Phone', 'Email', 'Events Count', 'Registered Events'];
    const rows = filteredRegistrations.map(r => [
      `"${r.rollNo || ''}"`,
      `"${r.name || ''}"`,
      `"${r.gender || ''}"`,
      `"${r.branch || ''}"`,
      `"${r.year || ''}"`,
      `"${r.phone || ''}"`,
      `"${r.email || ''}"`,
      r.events ? r.events.length : 0,
      `"${(r.events || []).join('; ')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filterSuffix = selectedSportFilter !== 'all' ? `_${selectedSportFilter.replace(/\s+/g, '_')}` : '';
    link.setAttribute('download', `athletes_roster${filterSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3.5 select-none text-slate-800">
      
      {/* 1. COMPACT TELEMETRY & ACTIONS HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
              <Users size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Student Athletes Desk</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-800 text-[0.65rem] font-black">
                  {registrations.length} Total
                </span>
              </div>
              <p className="text-[0.68rem] text-slate-500 font-semibold truncate">
                Roster verification, event registrations, and printable official score-sheets
              </p>
            </div>
          </div>

          {/* Quick Actions (Export & Print) */}
          <div className="flex items-center gap-1.5 self-end sm:self-center w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              disabled={filteredRegistrations.length === 0}
              className="flex-1 sm:flex-initial px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Download CSV Roster"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>

            {selectedSportFilter !== 'all' ? (
              <button
                onClick={() => setPrintSportTitle(selectedSportFilter)}
                className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={13} />
                <span className="truncate max-w-[140px]">Print {selectedSportFilter}</span>
              </button>
            ) : (
              <button
                onClick={() => setPrintSportTitle(sports[0]?.title || '100m Sprint')}
                className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Print Official Match Roster"
              >
                <Printer size={13} />
                <span>Print Roster</span>
              </button>
            )}
          </div>

        </div>

        {/* High-Density Metric Badges */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
          <div className="bg-slate-50/80 rounded-xl p-1.5 border border-slate-200/60">
            <span className="text-[0.62rem] uppercase font-bold text-slate-400 block tracking-wider">Filtered</span>
            <span className="text-sm font-black text-slate-900">{filteredRegistrations.length}</span>
          </div>
          <div className="bg-blue-50/50 rounded-xl p-1.5 border border-blue-100/70">
            <span className="text-[0.62rem] uppercase font-bold text-blue-600 block tracking-wider">Boys Div</span>
            <span className="text-sm font-black text-blue-700">{metrics.boys}</span>
          </div>
          <div className="bg-pink-50/50 rounded-xl p-1.5 border border-pink-100/70">
            <span className="text-[0.62rem] uppercase font-bold text-pink-600 block tracking-wider">Girls Div</span>
            <span className="text-sm font-black text-pink-700">{metrics.girls}</span>
          </div>
        </div>

      </div>

      {/* 2. COMPACT SEARCH & FILTER CONTROLS BAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          
          {/* Search Box */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Name or Roll No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Sport Filter Dropdown */}
          <div>
            <select
              value={selectedSportFilter}
              onChange={(e) => setSelectedSportFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="all">All Sports ({sports.length})</option>
              {sports.map(s => (
                <option key={s.id} value={s.title}>{s.title}</option>
              ))}
            </select>
          </div>

          {/* Branch Filter Dropdown */}
          <div>
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="all">All Branches</option>
              <option value="Computer Science">Computer Science (CSE)</option>
              <option value="Electrical">Electrical Engg (EE)</option>
              <option value="Mechanical">Mechanical Engg (ME)</option>
              <option value="Civil">Civil Engg (CE)</option>
            </select>
          </div>

          {/* Gender / Division Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedGenderFilter}
              onChange={(e) => setSelectedGenderFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="all">All Divisions</option>
              <option value="Boys Division">Boys Division</option>
              <option value="Girls Division">Girls Division</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 3. MOBILE STACKED CARDS VIEW (md:hidden) */}
      <div className="md:hidden space-y-2.5">
        {filteredRegistrations.length > 0 ? (
          filteredRegistrations.map((student) => {
            const isBoys = student.gender === 'Boys Division';
            return (
              <div 
                key={student.id} 
                className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs space-y-2.5 transition-all"
              >
                {/* Card Top Row: Roll badge, Division chip, Delete trigger */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-[0.68rem] text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-lg border border-blue-200/60">
                      {student.rollNo}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[0.62rem] font-bold ${
                      isBoys 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'bg-pink-50 text-pink-700 border border-pink-100'
                    }`}>
                      {isBoys ? "Men's / Boys" : "Women's / Girls"}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Remove registration for ${student.name} (${student.rollNo})?`)) {
                        deleteRegistration(student.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete registration"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Athlete Name & Academic Info */}
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    isBoys ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                  }`}>
                    {student.name ? student.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-xs text-slate-900 leading-snug truncate">
                      {student.name}
                    </h4>
                    <p className="text-[0.65rem] font-semibold text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <GraduationCap size={11} className="text-slate-400 shrink-0" />
                      <span>{student.branch}</span>
                      <span className="text-slate-300">•</span>
                      <span>{student.year}</span>
                    </p>
                  </div>
                </div>

                {/* Contact Pill if available */}
                {(student.phone || student.email) && (
                  <div className="flex items-center gap-2 text-[0.65rem] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                    {student.phone && (
                      <a 
                        href={`tel:${student.phone}`} 
                        className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-mono"
                      >
                        <Phone size={11} className="text-slate-400" />
                        <span>{student.phone}</span>
                      </a>
                    )}
                    {student.email && (
                      <span className="flex items-center gap-1 text-slate-500 truncate">
                        <Mail size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Registered Events Tags */}
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[0.62rem] font-bold text-slate-400">
                    <span className="uppercase tracking-wider">Events</span>
                    <span>{student.events?.length || 0} registered</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {student.events && student.events.length > 0 ? (
                      student.events.map((e, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-0.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-md text-[0.65rem] font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <span className="text-[0.6rem]">🏅</span>
                          <span>{e}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[0.65rem] italic text-slate-400">No events selected</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No athletes match the current search filters.</p>
            <button 
              onClick={clearFilters}
              className="mt-2 text-xs font-black text-blue-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. DESKTOP METALLIC TABULAR VIEW (hidden md:block) */}
      <div className="hidden md:block bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-black uppercase tracking-wider text-[0.68rem]">
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Athlete Name</th>
                <th className="py-2.5 px-3">Division</th>
                <th className="py-2.5 px-3">Branch & Year</th>
                <th className="py-2.5 px-3">Registered Events</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((student) => {
                  const isBoys = student.gender === 'Boys Division';
                  return (
                    <tr key={student.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-black text-blue-600 whitespace-nowrap">
                        {student.rollNo}
                      </td>

                      <td className="py-2.5 px-3 font-black text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[0.65rem] shrink-0 ${
                            isBoys ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {student.name ? student.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <span className="truncate max-w-[150px]">{student.name}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${
                          isBoys 
                            ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                            : 'bg-pink-50 text-pink-700 border border-pink-100'
                        }`}>
                          {isBoys ? "Men's / Boys" : "Women's / Girls"}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                        <div className="truncate max-w-[140px]" title={`${student.branch} (${student.year})`}>
                          {student.branch} <span className="text-slate-400">({student.year})</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {student.events && student.events.length > 0 ? (
                            student.events.map((e, idx) => (
                              <span 
                                key={idx} 
                                className="px-1.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-200/80 rounded-md text-[0.65rem] font-bold whitespace-nowrap"
                              >
                                {e}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[0.65rem]">None</span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete registration for ${student.name} (${student.rollNo})?`)) {
                              deleteRegistration(student.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Registration"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No athlete registrations found matching the search criteria.
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
