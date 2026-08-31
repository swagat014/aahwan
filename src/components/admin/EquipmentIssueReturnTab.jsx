import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  RotateCcw, 
  ArrowUpRight, 
  Search, 
  Clock, 
  CheckCircle2, 
  X, 
  Check, 
  User, 
  Building2, 
  AlertTriangle,
  Package,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';

export default function EquipmentIssueReturnTab() {
  const { 
    equipmentList, equipmentLogs, issueEquipment, returnEquipment
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Sports Category Filter inside Modal
  const [modalSportCategory, setModalSportCategory] = useState('all');

  // Issue Form State
  const [issueData, setIssueData] = useState({
    equipmentId: '',
    borrowerName: '',
    rollNo: '',
    branch: 'CSE',
    qty: 1,
    expectedReturn: '',
    notes: ''
  });

  // Return Modal State (Supports Partial Return Quantity)
  const [returnLog, setReturnLog] = useState(null);
  const [returnQty, setReturnQty] = useState(1);
  const [returnCondition, setReturnCondition] = useState('Good Condition');
  const [returnNotes, setReturnNotes] = useState('');

  const activeIssuedLogs = equipmentLogs.filter(log => log.status === 'issued');
  const returnedLogs = equipmentLogs.filter(log => log.status === 'returned');

  // Available sport categories from equipmentList
  const sportCategories = Array.from(new Set(equipmentList.map(e => e.category || 'General')));

  // Filtered list of equipment inside Issue Modal based on selected sport category
  const filteredModalEquipment = equipmentList.filter(item => {
    return modalSportCategory === 'all' || item.category === modalSportCategory;
  });

  const filteredLogs = equipmentLogs.filter(log => {
    const matchesSearch = (log.borrowerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.rollNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.equipmentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.branch || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!issueData.equipmentId || !issueData.borrowerName || !issueData.rollNo) return;

    const targetEquip = equipmentList.find(e => e.id === issueData.equipmentId);
    if (!targetEquip) return;

    const issuedUnitsForThis = activeIssuedLogs
      .filter(l => l.equipmentId === targetEquip.id)
      .reduce((a, b) => a + (Number(b.qty) || 0), 0);
    const availableForThis = Math.max(0, targetEquip.totalQty - issuedUnitsForThis);

    if (Number(issueData.qty) > availableForThis) {
      alert(`Cannot issue ${issueData.qty} units. Only ${availableForThis} available in store!`);
      return;
    }

    issueEquipment({
      equipmentId: targetEquip.id,
      equipmentName: targetEquip.name,
      borrowerName: issueData.borrowerName,
      rollNo: issueData.rollNo,
      branch: issueData.branch,
      qty: Number(issueData.qty),
      expectedReturn: issueData.expectedReturn,
      notes: issueData.notes
    });

    setIssueData({
      equipmentId: '',
      borrowerName: '',
      rollNo: '',
      branch: 'CSE',
      qty: 1,
      expectedReturn: '',
      notes: ''
    });
    setShowIssueModal(false);
  };

  const handleReturnConfirm = () => {
    if (!returnLog) return;
    returnEquipment(returnLog.id, returnCondition, returnNotes, Number(returnQty));
    setReturnLog(null);
  };

  const openReturnModal = (log) => {
    setReturnLog(log);
    setReturnQty(Number(log.qty) || 1); // Default to total currently issued quantity
    setReturnCondition('Good Condition');
    setReturnNotes('');
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <RotateCcw className="text-blue-600" size={24} /> Equipment Issue & Return Register
          </h4>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Issue gear to students, track active borrowers, and log full or partial equipment returns.
          </p>
        </div>

        <button
          onClick={() => {
            if (equipmentList.length > 0) {
              setIssueData(prev => ({ ...prev, equipmentId: equipmentList[0].id }));
            }
            setShowIssueModal(true);
          }}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/25 transition"
        >
          <ArrowUpRight size={18} /> Issue Equipment To Student
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[0.68rem] font-black uppercase tracking-wider mb-1">
            <span>Total Issue Records</span>
            <RotateCcw size={18} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{equipmentLogs.length}</h3>
          <p className="text-[0.62rem] font-bold text-slate-400 mt-0.5">Historical Borrower Logs</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[0.68rem] font-black uppercase tracking-wider mb-1">
            <span>Currently Issued Out</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <h3 className="text-2xl font-black text-amber-600">{activeIssuedLogs.length}</h3>
          <p className="text-[0.62rem] font-bold text-amber-600 mt-0.5">Active Borrowers</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[0.68rem] font-black uppercase tracking-wider mb-1">
            <span>Returned Records</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-emerald-600">{returnedLogs.length}</h3>
          <p className="text-[0.62rem] font-bold text-emerald-600 mt-0.5">Restored to Store</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search student name, roll number, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">All Status</option>
            <option value="issued">Currently Issued</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      {/* Issue & Return Register Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">
            No equipment issue/return logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-300 font-black uppercase text-[0.68rem] tracking-wider">
                <tr>
                  <th className="p-3.5">Issue ID / Date</th>
                  <th className="p-3.5">Equipment Item</th>
                  <th className="p-3.5">Borrower Student</th>
                  <th className="p-3.5">Department / Branch</th>
                  <th className="p-3.5 text-center">Qty Issued</th>
                  <th className="p-3.5 text-center">Returned Count</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredLogs.map((log) => {
                  const hasPartialReturn = Number(log.returnedCount || 0) > 0 && log.status === 'issued';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-mono text-slate-500">
                        <span className="font-bold text-slate-900 block">{log.id}</span>
                        <span className="text-[0.65rem] text-slate-400">{log.issueDate}</span>
                      </td>
                      <td className="p-3.5 font-black text-slate-900">
                        {log.equipmentName}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{log.borrowerName}</span>
                        <span className="font-mono text-slate-400 text-[0.65rem]">Roll: {log.rollNo}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                          {log.branch}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-black text-slate-900 text-sm">
                        {log.qty} {log.status === 'issued' ? 'units out' : 'units'}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-emerald-600 text-xs">
                        {log.returnedCount || (log.status === 'returned' ? log.qty : 0)} units
                      </td>
                      <td className="p-3.5">
                        {log.status === 'issued' ? (
                          hasPartialReturn ? (
                            <span className="px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700 font-bold border border-cyan-200 flex items-center gap-1 w-max">
                              <Clock size={12} /> Partially Returned
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200 flex items-center gap-1 w-max">
                              <Clock size={12} /> Issued Out
                            </span>
                          )
                        ) : log.returnCondition && log.returnCondition.toLowerCase().includes('missing') ? (
                          <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200 flex items-center gap-1 w-max">
                            <AlertTriangle size={12} /> Missing / Lost
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1 w-max">
                            <CheckCircle2 size={12} /> Returned ({log.returnCondition || 'Good'})
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {log.status === 'issued' && (
                          <button
                            onClick={() => openReturnModal(log)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1 ml-auto"
                          >
                            <RotateCcw size={13} /> Return Gear
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ISSUE EQUIPMENT TO STUDENT (WITH SPORTS CATEGORY DROPDOWN) */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <ArrowUpRight className="text-blue-600" size={20} />
                Issue Equipment to Student
              </h3>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-3.5 text-xs font-semibold">
              
              {/* Filter Equipment by Sports Category Dropdown */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1 flex items-center gap-1">
                    <Filter size={11} className="text-blue-600" /> Filter Sport Category
                  </label>
                  <select
                    value={modalSportCategory}
                    onChange={(e) => {
                      setModalSportCategory(e.target.value);
                      const matching = equipmentList.filter(item => e.target.value === 'all' || item.category === e.target.value);
                      if (matching.length > 0) {
                        setIssueData(prev => ({ ...prev, equipmentId: matching[0].id }));
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="all">All Sports Categories</option>
                    {sportCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Quantity Issued *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={issueData.qty}
                    onChange={(e) => setIssueData({ ...issueData, qty: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Equipment Item Selection Dropdown */}
              <div>
                <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Select Equipment Item *</label>
                <select
                  required
                  value={issueData.equipmentId}
                  onChange={(e) => setIssueData({ ...issueData, equipmentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                >
                  {filteredModalEquipment.map(item => {
                    const issuedForThis = activeIssuedLogs
                      .filter(l => l.equipmentId === item.id)
                      .reduce((a, b) => a + (Number(b.qty) || 0), 0);
                    const avail = Math.max(0, item.totalQty - issuedForThis);
                    return (
                      <option key={item.id} value={item.id} disabled={avail === 0}>
                        [{item.category}] {item.name} — ({avail} available)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Student Borrower Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swagat Parida"
                    value={issueData.borrowerName}
                    onChange={(e) => setIssueData({ ...issueData, borrowerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2201105012"
                    value={issueData.rollNo}
                    onChange={(e) => setIssueData({ ...issueData, rollNo: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Student Branch / Department *</label>
                <select
                  value={issueData.branch}
                  onChange={(e) => setIssueData({ ...issueData, branch: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                >
                  <option value="Computer Science & Engg (CSE)">Computer Science & Engg (CSE)</option>
                  <option value="Electrical Engineering (EE)">Electrical Engineering (EE)</option>
                  <option value="Mechanical Engineering (ME)">Mechanical Engineering (ME)</option>
                  <option value="Civil Engineering (CE)">Civil Engineering (CE)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-md"
                >
                  Confirm & Issue Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RETURN EQUIPMENT MODAL (SUPPORTS PARTIAL RETURNS) */}
      {returnLog && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200 text-xs font-semibold">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <RotateCcw className="text-emerald-600" size={20} />
                Return Equipment Log
              </h3>
              <button onClick={() => setReturnLog(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="font-black text-slate-900">{returnLog.equipmentName}</p>
              <p className="text-slate-500">Borrower: {returnLog.borrowerName} ({returnLog.rollNo})</p>
              <p className="text-amber-600 font-bold">Currently Issued Out: {returnLog.qty} units</p>
            </div>

            {/* Quantity Returning Input (For Partial Returns!) */}
            <div>
              <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">
                Quantity Being Returned Today *
              </label>
              <input
                type="number"
                min="1"
                max={returnLog.qty}
                required
                value={returnQty}
                onChange={(e) => setReturnQty(Math.min(returnLog.qty, Math.max(1, Number(e.target.value))))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
              />
              {Number(returnQty) < Number(returnLog.qty) && (
                <p className="text-[0.65rem] text-amber-600 font-bold mt-1">
                  ⚠️ Partial return! {returnLog.qty - returnQty} unit(s) will remain issued to student.
                </p>
              )}
            </div>

            <div>
              <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Returned Item Condition</label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
              >
                <option value="Good Condition">Good Condition</option>
                <option value="Slight Damage">Slight Damage</option>
                <option value="Damaged / Repair Needed">Damaged / Repair Needed</option>
                <option value="Missing / Lost Equipment">Missing / Lost Equipment</option>
              </select>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReturnLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnConfirm}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md flex items-center gap-1.5"
              >
                <Check size={16} /> Confirm Return of {returnQty} Unit(s)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
