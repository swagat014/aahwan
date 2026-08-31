import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  PackageCheck, 
  PackagePlus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Filter, 
  X, 
  User, 
  Building2, 
  FileText,
  RotateCcw,
  Check
} from 'lucide-react';

export default function EquipmentInventoryTab() {
  const { 
    equipmentList, addEquipment, updateEquipment, deleteEquipment,
    equipmentLogs, issueEquipment, returnEquipment
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('stocks'); // 'stocks' | 'issues'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // New Equipment Form State
  const [newEquip, setNewEquip] = useState({
    name: '',
    category: 'Cricket',
    totalQty: 10,
    condition: 'Good Condition',
    location: 'Main Sports Store',
    notes: ''
  });

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

  // Return Modal State
  const [returnLog, setReturnLog] = useState(null);
  const [returnCondition, setReturnCondition] = useState('Good Condition');
  const [returnNotes, setReturnNotes] = useState('');

  // Calculate Summary Stats
  const totalItems = equipmentList.length;
  const totalUnits = equipmentList.reduce((acc, curr) => acc + (Number(curr.totalQty) || 0), 0);
  
  // Calculate total currently issued units from active issue logs
  const activeIssuedLogs = equipmentLogs.filter(log => log.status === 'issued');
  const totalIssuedUnits = activeIssuedLogs.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);
  const availableUnits = Math.max(0, totalUnits - totalIssuedUnits);

  // Filtered Stocks
  const filteredStocks = equipmentList.filter(item => {
    const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Filtered Issue Logs
  const filteredLogs = equipmentLogs.filter(log => {
    const matchesSearch = (log.borrowerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.rollNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.equipmentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.branch || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newEquip.name) return;

    if (editingItem) {
      updateEquipment(editingItem.id, newEquip);
      setEditingItem(null);
    } else {
      addEquipment(newEquip);
    }

    setNewEquip({
      name: '',
      category: 'Cricket',
      totalQty: 10,
      condition: 'Good Condition',
      location: 'Main Sports Store',
      notes: ''
    });
    setShowAddModal(false);
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!issueData.equipmentId || !issueData.borrowerName || !issueData.rollNo) return;

    const targetEquip = equipmentList.find(e => e.id === issueData.equipmentId);
    if (!targetEquip) return;

    // Check available stock
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
    returnEquipment(returnLog.id, returnCondition, returnNotes);
    setReturnLog(null);
  };

  const categories = Array.from(new Set(equipmentList.map(e => e.category || 'General')));

  return (
    <div className="space-y-6 select-none">
      
      {/* Header & Sub-Tab Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Package className="text-blue-600" size={22} /> Sports Equipment Inventory & Issue Control
          </h4>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Manage available equipment stocks, issue items to student athletes, and track returns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setEditingItem(null);
              setNewEquip({ name: '', category: 'Cricket', totalQty: 10, condition: 'Good Condition', location: 'Main Sports Store', notes: '' });
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md transition"
          >
            <Plus size={16} /> Add Equipment Stock
          </button>

          <button
            onClick={() => {
              if (equipmentList.length > 0) {
                setIssueData(prev => ({ ...prev, equipmentId: equipmentList[0].id }));
              }
              setShowIssueModal(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md transition"
          >
            <ArrowUpRight size={16} /> Issue Equipment
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[0.68rem] font-black uppercase tracking-wider mb-1">
            <span>Total Item Types</span>
            <Package size={18} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{totalItems}</h3>
          <p className="text-[0.62rem] font-bold text-slate-400 mt-0.5">Registered Categories</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[0.68rem] font-black uppercase tracking-wider mb-1">
            <span>Total Units In Store</span>
            <PackageCheck size={18} className="text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{totalUnits}</h3>
          <p className="text-[0.62rem] font-bold text-slate-400 mt-0.5">Total Physical Units</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[0.68rem] font-black uppercase tracking-wider mb-1">
            <span>Currently Issued</span>
            <ArrowUpRight size={18} className="text-amber-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{totalIssuedUnits}</h3>
          <p className="text-[0.62rem] font-bold text-amber-600 mt-0.5">{activeIssuedLogs.length} Active Borrowers</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[0.68rem] font-black uppercase tracking-wider mb-1">
            <span>Available In Store</span>
            <CheckCircle2 size={18} className="text-teal-600" />
          </div>
          <h3 className="text-2xl font-black text-emerald-600">{availableUnits}</h3>
          <p className="text-[0.62rem] font-bold text-emerald-600 mt-0.5">Ready for Issue</p>
        </div>
      </div>

      {/* Main Mode Toggle: Available Stocks vs Issue & Return Register */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-black">
          <button
            onClick={() => setActiveSubTab('stocks')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeSubTab === 'stocks' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package size={15} /> Equipment Inventory Stocks ({equipmentList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('issues')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeSubTab === 'issues' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <RotateCcw size={15} /> Issue & Return Register ({equipmentLogs.length})
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={activeSubTab === 'stocks' ? "Search equipment name, category..." : "Search student name, roll no, item..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white transition"
            />
          </div>

          {activeSubTab === 'stocks' && categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          )}

          {activeSubTab === 'issues' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="issued">Currently Issued</option>
              <option value="returned">Returned</option>
            </select>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: STOCKS INVENTORY TABLE */}
      {activeSubTab === 'stocks' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {filteredStocks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              No equipment stock items found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-300 font-black uppercase text-[0.68rem] tracking-wider">
                  <tr>
                    <th className="p-3.5">Equipment Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-center">Total Stock</th>
                    <th className="p-3.5 text-center">Issued Out</th>
                    <th className="p-3.5 text-center">Available Stock</th>
                    <th className="p-3.5">Condition</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredStocks.map((item) => {
                    const issuedForThis = activeIssuedLogs
                      .filter(l => l.equipmentId === item.id)
                      .reduce((a, b) => a + (Number(b.qty) || 0), 0);
                    const availForThis = Math.max(0, item.totalQty - issuedForThis);
                    const isLow = availForThis <= 2;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-black text-slate-900 flex items-center gap-2">
                          <Package size={16} className="text-blue-600 shrink-0" />
                          <span>{item.name}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-slate-900 text-sm">
                          {item.totalQty}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-amber-600 text-sm">
                          {issuedForThis}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-md font-mono font-bold text-xs ${
                            availForThis === 0 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : isLow 
                                ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {availForThis} units
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-slate-600">{item.condition || 'Good Condition'}</span>
                        </td>
                        <td className="p-3.5 text-slate-500">{item.location || 'Store Room'}</td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setNewEquip(item);
                              setShowAddModal(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Stock"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete ${item.name} from inventory?`)) {
                                deleteEquipment(item.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Stock"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ISSUE & RETURN REGISTER TABLE */}
      {activeSubTab === 'issues' && (
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
                    <th className="p-3.5">Equipment Name</th>
                    <th className="p-3.5">Borrower Student</th>
                    <th className="p-3.5">Branch</th>
                    <th className="p-3.5 text-center">Qty</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Return Info</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredLogs.map((log) => (
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
                        {log.qty}
                      </td>
                      <td className="p-3.5">
                        {log.status === 'issued' ? (
                          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200 flex items-center gap-1 w-max">
                            <Clock size={12} /> Issued Out
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1 w-max">
                            <CheckCircle2 size={12} /> Returned
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {log.status === 'returned' ? (
                          <div>
                            <span className="text-slate-800 font-bold block">{log.returnDate}</span>
                            <span className="text-[0.65rem] text-slate-400">Cond: {log.returnCondition || 'Good'}</span>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-medium">Pending Return</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {log.status === 'issued' && (
                          <button
                            onClick={() => {
                              setReturnLog(log);
                              setReturnCondition('Good Condition');
                              setReturnNotes('');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1 ml-auto"
                          >
                            <RotateCcw size={13} /> Mark Returned
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT EQUIPMENT STOCK */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Package className="text-blue-600" size={20} />
                {editingItem ? 'Edit Equipment Stock' : 'Add New Equipment Stock'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Equipment Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cricket Leather Balls (Pack of 6)"
                  value={newEquip.name}
                  onChange={(e) => setNewEquip({ ...newEquip, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Category</label>
                  <select
                    value={newEquip.category}
                    onChange={(e) => setNewEquip({ ...newEquip, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="Cricket">Cricket</option>
                    <option value="Football">Football</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Athletics">Athletics</option>
                    <option value="Indoor Games">Indoor Games</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Total Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newEquip.totalQty}
                    onChange={(e) => setNewEquip({ ...newEquip, totalQty: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Condition</label>
                  <input
                    type="text"
                    placeholder="Good Condition"
                    value={newEquip.condition}
                    onChange={(e) => setNewEquip({ ...newEquip, condition: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Store Location</label>
                  <input
                    type="text"
                    placeholder="Main Sports Store"
                    value={newEquip.location}
                    onChange={(e) => setNewEquip({ ...newEquip, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-md"
                >
                  {editingItem ? 'Save Stock Changes' : 'Add Stock Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ISSUE EQUIPMENT TO STUDENT */}
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
              <div>
                <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Select Equipment Item *</label>
                <select
                  required
                  value={issueData.equipmentId}
                  onChange={(e) => setIssueData({ ...issueData, equipmentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                >
                  {equipmentList.map(item => {
                    const issuedForThis = activeIssuedLogs
                      .filter(l => l.equipmentId === item.id)
                      .reduce((a, b) => a + (Number(b.qty) || 0), 0);
                    const avail = Math.max(0, item.totalQty - issuedForThis);
                    return (
                      <option key={item.id} value={item.id} disabled={avail === 0}>
                        {item.name} ({avail} available in store)
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Branch</label>
                  <select
                    value={issueData.branch}
                    onChange={(e) => setIssueData({ ...issueData, branch: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="Computer Science & Engg (CSE)">CSE</option>
                    <option value="Electrical Engineering (EE)">EE</option>
                    <option value="Mechanical Engineering (ME)">ME</option>
                    <option value="Civil Engineering (CE)">CE</option>
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

      {/* MODAL 3: MARK AS RETURNED MODAL */}
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
              <p className="text-blue-600 font-bold">Qty Returned: {returnLog.qty} units</p>
            </div>

            <div>
              <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Return Condition</label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
              >
                <option value="Good Condition">Good Condition</option>
                <option value="Slight Damage">Slight Damage</option>
                <option value="Damaged / Needs Repair">Damaged / Needs Repair</option>
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
                <Check size={16} /> Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
