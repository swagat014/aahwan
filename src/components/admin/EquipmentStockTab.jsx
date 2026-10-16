import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  PackageCheck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowUpRight,
  Minus,
  Trophy,
  Filter,
  FolderPlus,
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle,
  Download,
  Printer,
  Zap,
  ChevronDown,
  ChevronRight,
  MapPin,
  RotateCcw,
  User,
  SlidersHorizontal,
  CheckSquare,
  Square
} from 'lucide-react';

export default function EquipmentStockTab() {
  const { 
    equipmentList, 
    addEquipment, 
    updateEquipment, 
    deleteEquipment, 
    equipmentLogs,
    issueEquipment,
    returnEquipment
  } = useApp();

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // 'all' | 'available' | 'low' | 'out' | 'loaned'
  const [conditionFilter, setConditionFilter] = useState('all');
  
  // Table Sorting State
  const [sortField, setSortField] = useState('category'); // 'name' | 'category' | 'location' | 'totalQty' | 'loaned' | 'available'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Multi-Selection State
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  
  // Row Expansion State for details / active loans
  const [expandedRowIds, setExpandedRowIds] = useState([]);

  // Direct Inline Edit State { [itemId]: true }
  const [inlineEditingId, setInlineEditingId] = useState(null);
  const [inlineQtyValue, setInlineQtyValue] = useState('');

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Quick Issue Direct Modal State
  const [quickIssueItem, setQuickIssueItem] = useState(null);
  const [quickIssueData, setQuickIssueData] = useState({
    borrowerName: '',
    rollNo: '',
    branch: 'CSE',
    qty: 1,
    expectedReturn: '',
    notes: ''
  });
  const [quickIssueSuccessMsg, setQuickIssueSuccessMsg] = useState('');

  // Dynamic Sports Categories State
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('aahwan_custom_sport_categories');
    return saved ? JSON.parse(saved) : [
      { id: 'Cricket', name: 'Cricket', icon: '🏏', color: 'bg-emerald-600' },
      { id: 'Football', name: 'Football', icon: '⚽', color: 'bg-amber-600' },
      { id: 'Volleyball', name: 'Volleyball', icon: '🏐', color: 'bg-indigo-600' },
      { id: 'Badminton', name: 'Badminton', icon: '🏸', color: 'bg-pink-600' },
      { id: 'Athletics', name: 'Athletics', icon: '🏃', color: 'bg-cyan-600' },
      { id: 'Indoor Games', name: 'Indoor Games', icon: '♟️', color: 'bg-purple-600' }
    ];
  });

  // Category Add Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🏆');

  // Equipment Form State
  const [newEquip, setNewEquip] = useState({
    name: '',
    category: 'Cricket',
    totalQty: 10,
    condition: 'Good Condition',
    location: 'Main Sports Store',
    notes: ''
  });

  // Save custom categories to local storage
  useEffect(() => {
    localStorage.setItem('aahwan_custom_sport_categories', JSON.stringify(customCategories));
  }, [customCategories]);

  // Combined Category List
  const allCategoryObjects = useMemo(() => {
    const list = [
      { id: 'all', name: 'All Disciplines', icon: '🏆', color: 'bg-blue-600' },
      ...customCategories
    ];

    equipmentList.forEach(item => {
      if (item.category && !list.some(c => c.id === item.category)) {
        list.push({
          id: item.category,
          name: item.category,
          icon: '🥇',
          color: 'bg-slate-700'
        });
      }
    });

    return list;
  }, [customCategories, equipmentList]);

  // Active Loans Helper
  const activeIssuedLogs = useMemo(() => {
    return (equipmentLogs || []).filter(log => log.status === 'issued');
  }, [equipmentLogs]);

  // Metric Computations
  const totalItemsCount = equipmentList.length;
  const totalPhysicalUnits = equipmentList.reduce((acc, curr) => acc + (Number(curr.totalQty) || 0), 0);
  const totalIssuedUnits = activeIssuedLogs.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);
  const totalAvailableUnits = Math.max(0, totalPhysicalUnits - totalIssuedUnits);
  
  // Status Counts for Interactive KPI Filters
  const stockMetrics = useMemo(() => {
    let availableCount = 0;
    let lowCount = 0;
    let outCount = 0;
    let loanedItemsCount = 0;

    equipmentList.forEach(item => {
      const issued = activeIssuedLogs
        .filter(l => l.equipmentId === item.id)
        .reduce((a, b) => a + (Number(b.qty) || 0), 0);
      const avail = Math.max(0, (Number(item.totalQty) || 0) - issued);

      if (issued > 0) loanedItemsCount++;
      if (avail === 0) outCount++;
      else if (avail <= 2) lowCount++;
      else availableCount++;
    });

    return { availableCount, lowCount, outCount, loanedItemsCount };
  }, [equipmentList, activeIssuedLogs]);

  // Sort Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Quick Inline Quantity Adjustment (+ / -)
  const handleQuickQtyChange = (item, delta) => {
    const current = Number(item.totalQty) || 0;
    const newQty = Math.max(1, current + delta);
    updateEquipment(item.id, { ...item, totalQty: newQty });
  };

  // Save Inline Direct Edit
  const handleSaveInlineQty = (item) => {
    const parsed = parseInt(inlineQtyValue, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      updateEquipment(item.id, { ...item, totalQty: parsed });
    }
    setInlineEditingId(null);
  };

  // Toggle Row Expansion
  const toggleRowExpand = (itemId) => {
    setExpandedRowIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // Toggle Selection
  const toggleSelectItem = (itemId) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // Filter & Sort Equipment Data
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(item => {
      // Category Match
      const matchesCategory = selectedSport === 'all' || item.category === selectedSport;

      // Search Match (name, category, condition, location, notes)
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        (item.name || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.condition || '').toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q);

      // Stock Status Match
      const issued = activeIssuedLogs
        .filter(l => l.equipmentId === item.id)
        .reduce((a, b) => a + (Number(b.qty) || 0), 0);
      const avail = Math.max(0, (Number(item.totalQty) || 0) - issued);

      let matchesStatus = true;
      if (stockStatusFilter === 'available') matchesStatus = avail > 2;
      else if (stockStatusFilter === 'low') matchesStatus = avail > 0 && avail <= 2;
      else if (stockStatusFilter === 'out') matchesStatus = avail === 0;
      else if (stockStatusFilter === 'loaned') matchesStatus = issued > 0;

      // Condition Match
      const matchesCondition = conditionFilter === 'all' || item.condition === conditionFilter;

      return matchesCategory && matchesSearch && matchesStatus && matchesCondition;
    }).sort((a, b) => {
      let valA, valB;

      if (sortField === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortField === 'category') {
        valA = (a.category || '').toLowerCase();
        valB = (b.category || '').toLowerCase();
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortField === 'location') {
        valA = (a.location || '').toLowerCase();
        valB = (b.location || '').toLowerCase();
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortField === 'totalQty') {
        valA = Number(a.totalQty) || 0;
        valB = Number(b.totalQty) || 0;
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      if (sortField === 'loaned') {
        valA = activeIssuedLogs.filter(l => l.equipmentId === a.id).reduce((s, x) => s + (Number(x.qty) || 0), 0);
        valB = activeIssuedLogs.filter(l => l.equipmentId === b.id).reduce((s, x) => s + (Number(x.qty) || 0), 0);
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      if (sortField === 'available') {
        const issuedA = activeIssuedLogs.filter(l => l.equipmentId === a.id).reduce((s, x) => s + (Number(x.qty) || 0), 0);
        const issuedB = activeIssuedLogs.filter(l => l.equipmentId === b.id).reduce((s, x) => s + (Number(x.qty) || 0), 0);
        valA = Math.max(0, (Number(a.totalQty) || 0) - issuedA);
        valB = Math.max(0, (Number(b.totalQty) || 0) - issuedB);
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });
  }, [equipmentList, selectedSport, searchTerm, stockStatusFilter, conditionFilter, sortField, sortDirection, activeIssuedLogs]);

  // Select All Toggle
  const isAllSelected = filteredEquipment.length > 0 && selectedItemIds.length === filteredEquipment.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredEquipment.map(i => i.id));
    }
  };

  // Bulk Operations
  const handleBulkDelete = () => {
    if (selectedItemIds.length === 0) return;
    if (confirm(`Permanently remove ${selectedItemIds.length} selected equipment items from inventory?`)) {
      selectedItemIds.forEach(id => deleteEquipment(id));
      setSelectedItemIds([]);
    }
  };

  const handleBulkQtyAdjust = (delta) => {
    selectedItemIds.forEach(id => {
      const item = equipmentList.find(e => e.id === id);
      if (item) {
        const newQty = Math.max(1, (Number(item.totalQty) || 0) + delta);
        updateEquipment(id, { ...item, totalQty: newQty });
      }
    });
  };

  // CSV Export
  const handleExportCSV = (itemsToExport = filteredEquipment) => {
    if (!itemsToExport.length) {
      alert('No equipment items to export.');
      return;
    }
    const headers = ['Item ID', 'Gear Name', 'Discipline', 'Total Units', 'Active Loans', 'Available Units', 'Condition', 'Storage Location', 'Notes'];
    const rows = itemsToExport.map(item => {
      const issued = activeIssuedLogs
        .filter(l => l.equipmentId === item.id)
        .reduce((a, b) => a + (Number(b.qty) || 0), 0);
      const avail = Math.max(0, (Number(item.totalQty) || 0) - issued);
      return [
        `"${item.id}"`,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${(item.category || '').replace(/"/g, '""')}"`,
        item.totalQty || 0,
        issued,
        avail,
        `"${(item.condition || 'Good Condition').replace(/"/g, '""')}"`,
        `"${(item.location || 'Main Sports Store').replace(/"/g, '""')}"`,
        `"${(item.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvString = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AAHWAN_Stock_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Inventory Sheet
  const handlePrintSheet = () => {
    window.print();
  };

  // Modal Open Handlers
  const openAddModal = (catName = 'Cricket') => {
    setEditingItem(null);
    setNewEquip({
      name: '',
      category: catName !== 'all' ? catName : (customCategories[0]?.name || 'Cricket'),
      totalQty: 10,
      condition: 'Good Condition',
      location: 'Main Sports Store',
      notes: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setNewEquip({
      name: item.name || '',
      category: item.category || 'Cricket',
      totalQty: item.totalQty || 1,
      condition: item.condition || 'Good Condition',
      location: item.location || 'Main Sports Store',
      notes: item.notes || ''
    });
    setShowAddModal(true);
  };

  // Open Quick Issue Modal
  const openQuickIssue = (item) => {
    const issued = activeIssuedLogs
      .filter(l => l.equipmentId === item.id)
      .reduce((a, b) => a + (Number(b.qty) || 0), 0);
    const avail = Math.max(0, (Number(item.totalQty) || 0) - issued);

    if (avail <= 0) {
      alert(`"${item.name}" has 0 units available in stock. All are currently loaned out!`);
      return;
    }

    setQuickIssueItem(item);
    setQuickIssueData({
      borrowerName: '',
      rollNo: '',
      branch: 'CSE',
      qty: 1,
      expectedReturn: '',
      notes: ''
    });
    setQuickIssueSuccessMsg('');
  };

  // Handle Quick Issue Submit
  const handleQuickIssueSubmit = (e) => {
    e.preventDefault();
    if (!quickIssueItem || !quickIssueData.borrowerName.trim() || !quickIssueData.rollNo.trim()) return;

    const issued = activeIssuedLogs
      .filter(l => l.equipmentId === quickIssueItem.id)
      .reduce((a, b) => a + (Number(b.qty) || 0), 0);
    const avail = Math.max(0, (Number(quickIssueItem.totalQty) || 0) - issued);

    if (Number(quickIssueData.qty) > avail) {
      alert(`Cannot issue ${quickIssueData.qty} units. Only ${avail} available!`);
      return;
    }

    issueEquipment({
      equipmentId: quickIssueItem.id,
      equipmentName: quickIssueItem.name,
      borrowerName: quickIssueData.borrowerName.trim(),
      rollNo: quickIssueData.rollNo.trim().toUpperCase(),
      branch: quickIssueData.branch,
      qty: Number(quickIssueData.qty),
      expectedReturn: quickIssueData.expectedReturn,
      notes: quickIssueData.notes
    });

    setQuickIssueSuccessMsg(`Successfully issued ${quickIssueData.qty}x ${quickIssueItem.name} to ${quickIssueData.borrowerName}!`);
    setTimeout(() => {
      setQuickIssueItem(null);
      setQuickIssueSuccessMsg('');
    }, 1200);
  };

  // Handle Equipment Add/Edit Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newEquip.name.trim()) return;

    if (editingItem) {
      updateEquipment(editingItem.id, newEquip);
      setEditingItem(null);
    } else {
      addEquipment(newEquip);
    }

    setShowAddModal(false);
  };

  // Handle Category Add
  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    if (customCategories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      alert(`Discipline "${trimmed}" already exists.`);
      return;
    }

    const colors = ['bg-emerald-600', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-pink-600', 'bg-amber-600', 'bg-rose-600', 'bg-cyan-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newCategory = {
      id: trimmed,
      name: trimmed,
      icon: newCatIcon || '🏆',
      color: randomColor
    };

    setCustomCategories(prev => [...prev, newCategory]);
    setSelectedSport(trimmed);
    setNewCatName('');
    setNewCatIcon('🏆');
    setShowAddCategoryModal(false);
  };

  const emojiOptions = ['🏏', '⚽', '🏐', '🏸', '🏃', '♟️', '🏓', '🏀', '🤼', '🏊', '🏋️', '🎯', '🥇', '🏆', '🥊', '🥋', '👟', '⛳'];

  const hasActiveFilters = searchTerm || selectedSport !== 'all' || stockStatusFilter !== 'all' || conditionFilter !== 'all';

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedSport('all');
    setStockStatusFilter('all');
    setConditionFilter('all');
  };

  return (
    <div className="space-y-3.5 select-none text-slate-800">
      
      {/* 1. TOP HEADER & INSTANT ACTIONS BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Package size={17} />
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Stock Inventory Grid</span>
              <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-black bg-amber-100 text-amber-800 border border-amber-200">
                {totalItemsCount} Gear Items
              </span>
            </h3>
          </div>
          <p className="text-[0.68rem] font-semibold text-slate-500 mt-0.5 ml-8">
            High-density tabular control for physical stock units, active student loans, locations, and instant issue desk.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleExportCSV()}
            title="Export full inventory as CSV"
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download size={13} className="text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handlePrintSheet}
            title="Print inventory sheet"
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer size={13} className="text-slate-500" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <FolderPlus size={13} className="text-amber-400" />
            <span>New Category</span>
          </button>

          <button
            onClick={() => openAddModal(selectedSport)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition transform active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* 2. INTERACTIVE KPI METRIC FILTER TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Metric 1: Total Gear */}
        <button
          onClick={() => { setStockStatusFilter('all'); setSelectedSport('all'); }}
          className={`text-left p-2.5 rounded-xl border transition cursor-pointer ${
            stockStatusFilter === 'all' && selectedSport === 'all'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[0.6rem] font-bold uppercase tracking-wider">
            <span>All Gear</span>
            <Package size={13} className="text-slate-400" />
          </div>
          <div className="text-lg font-black text-slate-900 mt-0.5">{totalItemsCount}</div>
          <p className="text-[0.58rem] font-semibold text-slate-400 truncate">Total SKUs Tracked</p>
        </button>

        {/* Metric 2: Total Units */}
        <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-[0.6rem] font-bold uppercase tracking-wider">
            <span>Total Units</span>
            <PackageCheck size={13} className="text-blue-500" />
          </div>
          <div className="text-lg font-black text-slate-900 mt-0.5">{totalPhysicalUnits}</div>
          <p className="text-[0.58rem] font-semibold text-slate-400 truncate">Physical Pieces</p>
        </div>

        {/* Metric 3: In Stock Ready */}
        <button
          onClick={() => setStockStatusFilter(prev => prev === 'available' ? 'all' : 'available')}
          className={`text-left p-2.5 rounded-xl border transition cursor-pointer ${
            stockStatusFilter === 'available'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[0.6rem] font-bold uppercase tracking-wider">
            <span>In Store</span>
            <CheckCircle2 size={13} className="text-emerald-500" />
          </div>
          <div className="text-lg font-black text-emerald-600 mt-0.5">{totalAvailableUnits}</div>
          <p className="text-[0.58rem] font-bold text-emerald-600 truncate">{stockMetrics.availableCount} types ready</p>
        </button>

        {/* Metric 4: Low Stock */}
        <button
          onClick={() => setStockStatusFilter(prev => prev === 'low' ? 'all' : 'low')}
          className={`text-left p-2.5 rounded-xl border transition cursor-pointer ${
            stockStatusFilter === 'low'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[0.6rem] font-bold uppercase tracking-wider">
            <span>Low Stock</span>
            <AlertTriangle size={13} className="text-amber-500" />
          </div>
          <div className="text-lg font-black text-amber-600 mt-0.5">{stockMetrics.lowCount}</div>
          <p className="text-[0.58rem] font-bold text-amber-600 truncate">≤ 2 units remain</p>
        </button>

        {/* Metric 5: Depleted */}
        <button
          onClick={() => setStockStatusFilter(prev => prev === 'out' ? 'all' : 'out')}
          className={`text-left p-2.5 rounded-xl border transition cursor-pointer ${
            stockStatusFilter === 'out'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/30'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[0.6rem] font-bold uppercase tracking-wider">
            <span>Out of Stock</span>
            <AlertCircle size={13} className="text-rose-500" />
          </div>
          <div className="text-lg font-black text-rose-600 mt-0.5">{stockMetrics.outCount}</div>
          <p className="text-[0.58rem] font-bold text-rose-600 truncate">0 available</p>
        </button>

        {/* Metric 6: Loaned Out */}
        <button
          onClick={() => setStockStatusFilter(prev => prev === 'loaned' ? 'all' : 'loaned')}
          className={`text-left p-2.5 rounded-xl border transition cursor-pointer ${
            stockStatusFilter === 'loaned'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-[0.6rem] font-bold uppercase tracking-wider">
            <span>On Loan</span>
            <ArrowUpRight size={13} className="text-amber-500" />
          </div>
          <div className="text-lg font-black text-amber-700 mt-0.5">{totalIssuedUnits}</div>
          <p className="text-[0.58rem] font-bold text-amber-700 truncate">{activeIssuedLogs.length} active loans</p>
        </button>
      </div>

      {/* 3. FILTER & SEARCH CONTROL BAR */}
      <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-2.5 space-y-2.5 shadow-2xs">
        
        {/* Row 1: Search + Dropdown Filters + Clear */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search gear name, category, location, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition placeholder:text-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Secondary Controls: Status, Condition & Sort */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Status Dropdown */}
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Stock Status</option>
              <option value="available">In Stock Ready (&gt;2)</option>
              <option value="low">⚠️ Low Stock (1-2)</option>
              <option value="out">⛔ Out of Stock (0)</option>
              <option value="loaned">⚡ Currently on Loan</option>
            </select>

            {/* Condition Dropdown */}
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Conditions</option>
              <option value="Brand New">Brand New</option>
              <option value="Good Condition">Good Condition</option>
              <option value="Fair / Used">Fair / Used</option>
              <option value="Needs Maintenance">Needs Maintenance</option>
            </select>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="px-2.5 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg flex items-center gap-1 transition cursor-pointer"
                title="Clear all active filters"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          {allCategoryObjects.map(cat => {
            const count = cat.id === 'all' 
              ? equipmentList.length 
              : equipmentList.filter(e => e.category === cat.id).length;
            const isSelected = selectedSport === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedSport(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-amber-500 text-slate-950 font-black shadow-2xs ring-1 ring-amber-600/30' 
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[0.58rem] font-black ${
                  isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. PREMIUM UNIFIED TABULAR GRID */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs relative">
        
        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Table Header with Clickable Column Sorters */}
            <thead className="bg-slate-900 text-white uppercase text-[0.62rem] font-black tracking-wider border-b border-slate-800 sticky top-0 z-10">
              <tr>
                {/* Select All Checkbox */}
                <th className="py-2.5 px-3 w-8 text-center">
                  <button 
                    onClick={toggleSelectAll} 
                    className="p-1 hover:text-amber-400 text-slate-400 transition cursor-pointer flex items-center justify-center mx-auto"
                    title={isAllSelected ? 'Deselect all' : 'Select all'}
                  >
                    {isAllSelected ? (
                      <CheckSquare size={14} className="text-amber-400" />
                    ) : selectedItemIds.length > 0 ? (
                      <div className="w-3.5 h-3.5 bg-amber-500 rounded-xs flex items-center justify-center text-slate-950 text-[10px] font-black">
                        -
                      </div>
                    ) : (
                      <Square size={14} />
                    )}
                  </button>
                </th>

                {/* Column: Equipment Gear */}
                <th 
                  onClick={() => handleSort('name')}
                  className="py-2.5 px-3 cursor-pointer hover:text-amber-400 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Equipment Gear & Notes</span>
                    {sortField === 'name' ? (
                      sortDirection === 'asc' ? <ArrowUp size={11} className="text-amber-400" /> : <ArrowDown size={11} className="text-amber-400" />
                    ) : (
                      <ArrowUpDown size={10} className="text-slate-500 opacity-60" />
                    )}
                  </div>
                </th>

                {/* Column: Discipline */}
                <th 
                  onClick={() => handleSort('category')}
                  className="py-2.5 px-3 cursor-pointer hover:text-amber-400 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Discipline</span>
                    {sortField === 'category' ? (
                      sortDirection === 'asc' ? <ArrowUp size={11} className="text-amber-400" /> : <ArrowDown size={11} className="text-amber-400" />
                    ) : (
                      <ArrowUpDown size={10} className="text-slate-500 opacity-60" />
                    )}
                  </div>
                </th>

                {/* Column: Location */}
                <th 
                  onClick={() => handleSort('location')}
                  className="py-2.5 px-3 cursor-pointer hover:text-amber-400 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Storage Location</span>
                    {sortField === 'location' ? (
                      sortDirection === 'asc' ? <ArrowUp size={11} className="text-amber-400" /> : <ArrowDown size={11} className="text-amber-400" />
                    ) : (
                      <ArrowUpDown size={10} className="text-slate-500 opacity-60" />
                    )}
                  </div>
                </th>

                {/* Column: Total Units (Stepper) */}
                <th 
                  onClick={() => handleSort('totalQty')}
                  className="py-2.5 px-3 text-center cursor-pointer hover:text-amber-400 transition select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Total Stock</span>
                    {sortField === 'totalQty' ? (
                      sortDirection === 'asc' ? <ArrowUp size={11} className="text-amber-400" /> : <ArrowDown size={11} className="text-amber-400" />
                    ) : (
                      <ArrowUpDown size={10} className="text-slate-500 opacity-60" />
                    )}
                  </div>
                </th>

                {/* Column: On Loan */}
                <th 
                  onClick={() => handleSort('loaned')}
                  className="py-2.5 px-3 text-center cursor-pointer hover:text-amber-400 transition select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Loaned</span>
                    {sortField === 'loaned' ? (
                      sortDirection === 'asc' ? <ArrowUp size={11} className="text-amber-400" /> : <ArrowDown size={11} className="text-amber-400" />
                    ) : (
                      <ArrowUpDown size={10} className="text-slate-500 opacity-60" />
                    )}
                  </div>
                </th>

                {/* Column: Available in Store */}
                <th 
                  onClick={() => handleSort('available')}
                  className="py-2.5 px-3 text-center cursor-pointer hover:text-amber-400 transition select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Available In Store</span>
                    {sortField === 'available' ? (
                      sortDirection === 'asc' ? <ArrowUp size={11} className="text-amber-400" /> : <ArrowDown size={11} className="text-amber-400" />
                    ) : (
                      <ArrowUpDown size={10} className="text-slate-500 opacity-60" />
                    )}
                  </div>
                </th>

                {/* Column: Health / Condition */}
                <th className="py-2.5 px-3">Condition & Health</th>

                {/* Column: Actions */}
                <th className="py-2.5 px-3.5 text-right">Actions & Desk</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map((item) => {
                  const categoryObj = allCategoryObjects.find(c => c.id === item.category) || { icon: '🏆', name: item.category || 'General' };
                  
                  // Active loans for this specific equipment item
                  const itemLoans = activeIssuedLogs.filter(l => l.equipmentId === item.id);
                  const issuedForThis = itemLoans.reduce((a, b) => a + (Number(b.qty) || 0), 0);
                  
                  const availForThis = Math.max(0, (Number(item.totalQty) || 0) - issuedForThis);
                  const isLow = availForThis > 0 && availForThis <= 2;
                  const isOut = availForThis === 0;
                  const availPercent = item.totalQty > 0 ? Math.round((availForThis / item.totalQty) * 100) : 0;

                  const isSelected = selectedItemIds.includes(item.id);
                  const isExpanded = expandedRowIds.includes(item.id);

                  return (
                    <React.Fragment key={item.id}>
                      <tr 
                        className={`transition-colors ${
                          isSelected 
                            ? 'bg-amber-50/70 border-l-2 border-l-amber-500' 
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        
                        {/* Checkbox */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => toggleSelectItem(item.id)}
                            className="p-1 text-slate-400 hover:text-amber-500 transition cursor-pointer flex items-center justify-center mx-auto"
                          >
                            {isSelected ? (
                              <CheckSquare size={14} className="text-amber-600" />
                            ) : (
                              <Square size={14} className="hover:text-slate-600" />
                            )}
                          </button>
                        </td>

                        {/* Equipment Item Name & Emoji */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => toggleRowExpand(item.id)}
                              className="text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                              title={isExpanded ? 'Collapse item details' : 'Expand item details'}
                            >
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            <span className="text-base shrink-0 p-1 bg-slate-100 rounded-lg border border-slate-200">
                              {categoryObj.icon}
                            </span>

                            <div className="min-w-0">
                              <span className="font-black text-slate-900 text-xs block truncate hover:text-amber-600 transition">
                                {item.name}
                              </span>
                              {item.notes && (
                                <span className="text-[0.62rem] text-slate-400 font-normal block truncate max-w-[200px]">
                                  {item.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Discipline Pill */}
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[0.65rem] border border-slate-200/90 whitespace-nowrap">
                            {item.category || 'General'}
                          </span>
                        </td>

                        {/* Storage Location */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1 text-[0.68rem] text-slate-600 font-medium">
                            <MapPin size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-[130px]">
                              {item.location || 'Main Sports Store'}
                            </span>
                          </div>
                        </td>

                        {/* Total Quantity (Inline Quick Stepper & Direct Click-to-Edit) */}
                        <td className="py-2.5 px-3 text-center">
                          {inlineEditingId === item.id ? (
                            <div className="inline-flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                autoFocus
                                value={inlineQtyValue}
                                onChange={(e) => setInlineQtyValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveInlineQty(item);
                                  if (e.key === 'Escape') setInlineEditingId(null);
                                }}
                                onBlur={() => handleSaveInlineQty(item)}
                                className="w-14 px-1.5 py-0.5 text-center text-xs font-black bg-white border-2 border-amber-500 rounded text-slate-900 focus:outline-none"
                              />
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 font-mono shadow-2xs">
                              <button
                                onClick={() => handleQuickQtyChange(item, -1)}
                                className="p-1 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded transition cursor-pointer"
                                title="Decrease total stock (-1)"
                              >
                                <Minus size={11} />
                              </button>

                              <span 
                                onClick={() => {
                                  setInlineEditingId(item.id);
                                  setInlineQtyValue(String(item.totalQty || 1));
                                }}
                                className="w-8 text-center text-xs font-black text-slate-900 hover:bg-amber-100 rounded cursor-text transition"
                                title="Click to edit quantity number directly"
                              >
                                {item.totalQty}
                              </span>

                              <button
                                onClick={() => handleQuickQtyChange(item, 1)}
                                className="p-1 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded transition cursor-pointer"
                                title="Increase total stock (+1)"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* On Loan Count */}
                        <td className="py-2.5 px-3 text-center">
                          {issuedForThis > 0 ? (
                            <button
                              onClick={() => toggleRowExpand(item.id)}
                              className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-mono font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer"
                              title="Click to view student borrowers"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              {issuedForThis} loaned
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs font-mono">-</span>
                          )}
                        </td>

                        {/* Available Stock & Visual Health Meter */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className={`px-2 py-0.5 rounded-md font-mono font-black text-xs ${
                              isOut
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isLow
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {availForThis} in store
                            </span>

                            {/* Mini Progress Ratio Bar */}
                            <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${availPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Condition & Status Badge */}
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[130px]">
                              {item.condition || 'Good Condition'}
                            </span>
                            <span className="text-[0.6rem] font-semibold text-slate-400">
                              {isOut ? '⛔ Depleted' : isLow ? '⚠️ Low Reserve' : '✓ Full Stock'}
                            </span>
                          </div>
                        </td>

                        {/* Actions & Instant Issue Button */}
                        <td className="py-2.5 px-3.5 text-right space-x-1 shrink-0 whitespace-nowrap">
                          {/* 1-Click Quick Issue Button */}
                          <button
                            onClick={() => openQuickIssue(item)}
                            disabled={availForThis <= 0}
                            className={`px-2 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition ${
                              availForThis > 0
                                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-2xs cursor-pointer active:scale-95'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            }`}
                            title={availForThis > 0 ? `Instant issue ${item.name} to student` : 'Out of stock'}
                          >
                            <Zap size={11} className={availForThis > 0 ? 'text-slate-950 fill-slate-950' : ''} />
                            <span>Issue</span>
                          </button>

                          {/* Edit Item */}
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Gear Details"
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Delete Item */}
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${item.name}" from inventory?`)) {
                                deleteEquipment(item.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Gear Item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>

                      {/* EXPANDABLE ROW DETAILS (Active loans list & Storage specs) */}
                      {isExpanded && (
                        <tr className="bg-slate-50/95 border-b border-slate-200 text-xs">
                          <td colSpan={9} className="py-3 px-4 sm:px-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                              
                              {/* Left Column: Storage Specs */}
                              <div className="space-y-1.5">
                                <span className="text-[0.62rem] font-black uppercase tracking-wider text-slate-400 block">
                                  Storage Location & Specs
                                </span>
                                <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs">
                                  <MapPin size={14} className="text-amber-500 shrink-0" />
                                  <span>{item.location || 'Main Sports Store, Section A'}</span>
                                </div>
                                <div className="text-[0.68rem] text-slate-500">
                                  Condition: <span className="font-bold text-slate-700">{item.condition || 'Good Condition'}</span>
                                </div>
                                {item.notes && (
                                  <div className="text-[0.68rem] text-slate-500">
                                    Notes: <span className="font-medium text-slate-700">{item.notes}</span>
                                  </div>
                                )}
                              </div>

                              {/* Middle & Right Column: Active Student Loans */}
                              <div className="md:col-span-2 space-y-1.5 border-t md:border-t-0 md:border-l border-slate-200 md:pl-4 pt-2 md:pt-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-[0.62rem] font-black uppercase tracking-wider text-slate-400 block">
                                    Active Student Loans ({itemLoans.length})
                                  </span>
                                  {availForThis > 0 && (
                                    <button
                                      onClick={() => openQuickIssue(item)}
                                      className="text-[0.65rem] font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      <Plus size={11} /> Issue another unit
                                    </button>
                                  )}
                                </div>

                                {itemLoans.length > 0 ? (
                                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                    {itemLoans.map(log => (
                                      <div key={log.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 border border-amber-200/80 text-xs">
                                        <div className="flex items-center gap-2">
                                          <User size={13} className="text-amber-600 shrink-0" />
                                          <div>
                                            <span className="font-bold text-slate-900">{log.borrowerName}</span>
                                            <span className="text-slate-500 text-[0.65rem] ml-1.5 font-mono">
                                              ({log.rollNo} • {log.branch})
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <span className="font-mono font-bold text-amber-700 text-xs">
                                            {log.qty} unit{log.qty > 1 ? 's' : ''}
                                          </span>
                                          <span className="text-[0.62rem] text-slate-400">
                                            {log.issueDate}
                                          </span>
                                          <button
                                            onClick={() => {
                                              if (confirm(`Accept return of ${log.qty}x "${item.name}" from ${log.borrowerName}?`)) {
                                                returnEquipment(log.id, 'Good Condition', 'Returned via stock desk', log.qty);
                                              }
                                            }}
                                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[0.65rem] font-bold cursor-pointer"
                                          >
                                            Return
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[0.68rem] text-slate-400 italic pt-1">
                                    No active loans for this item. All {item.totalQty} units are currently present in store.
                                  </p>
                                )}
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Package size={30} className="mx-auto text-slate-300" />
                      <p className="text-xs font-bold text-slate-700">No equipment items found</p>
                      <p className="text-[0.68rem] text-slate-400">
                        {hasActiveFilters 
                          ? 'No gear matches your active search or filters.' 
                          : 'No equipment items recorded for this discipline yet.'}
                      </p>
                      {hasActiveFilters ? (
                        <button
                          onClick={resetAllFilters}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold mt-2 cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button
                          onClick={() => openAddModal(selectedSport)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold mt-2 cursor-pointer"
                        >
                          + Add First Item
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary Bar */}
        <div className="py-2.5 px-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[0.68rem] font-bold text-slate-500">
          <div>
            Showing <span className="text-slate-900 font-black">{filteredEquipment.length}</span> of {totalItemsCount} total gear items
            {selectedItemIds.length > 0 && (
              <span className="ml-2 text-amber-600 font-black">
                ({selectedItemIds.length} items selected)
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> In Store: {totalAvailableUnits}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> On Loan: {totalIssuedUnits}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span> Total: {totalPhysicalUnits}
            </span>
          </div>
        </div>

      </div>

      {/* 5. FLOATING MULTI-SELECT BATCH ACTION DOCK */}
      {selectedItemIds.length > 0 && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-950/95 text-white backdrop-blur-xl px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-3 max-w-[94vw] overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2 pr-2 border-r border-slate-800 shrink-0">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
              {selectedItemIds.length}
            </span>
            <span className="text-xs font-bold text-slate-200">Selected</span>
          </div>

          {/* Quick Adjust Steppers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleBulkQtyAdjust(1)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition cursor-pointer"
              title="Add +1 unit to all selected items"
            >
              +1 Qty
            </button>
            <button
              onClick={() => handleBulkQtyAdjust(5)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition cursor-pointer"
              title="Add +5 units to all selected items"
            >
              +5 Qty
            </button>
          </div>

          {/* Export Selected CSV */}
          <button
            onClick={() => {
              const selectedItems = equipmentList.filter(e => selectedItemIds.includes(e.id));
              handleExportCSV(selectedItems);
            }}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
          >
            <Download size={12} />
            <span>Export</span>
          </button>

          {/* Bulk Delete */}
          <button
            onClick={handleBulkDelete}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>

          {/* Clear Selection */}
          <button
            onClick={() => setSelectedItemIds([])}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
            title="Deselect all"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 6. MODAL: QUICK ISSUE TO STUDENT */}
      {quickIssueItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 sm:p-5 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-3.5 border border-slate-200">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950">
                  <Zap size={16} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Quick Issue Desk</h4>
                  <p className="text-[0.62rem] font-semibold text-slate-400 truncate max-w-[200px]">
                    {quickIssueItem.name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setQuickIssueItem(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {quickIssueSuccessMsg ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold text-center flex flex-col items-center gap-1">
                <CheckCircle2 size={24} className="text-emerald-500" />
                <span>{quickIssueSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleQuickIssueSubmit} className="space-y-3 text-xs font-semibold">
                
                {/* Available in Store Info Box */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-[0.68rem] text-slate-600 font-bold">Discipline & Location</span>
                  <span className="text-[0.68rem] font-bold text-slate-800">
                    {quickIssueItem.category} • {quickIssueItem.location || 'Store'}
                  </span>
                </div>

                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={quickIssueData.borrowerName}
                    onChange={(e) => setQuickIssueData({ ...quickIssueData, borrowerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2201105012"
                      value={quickIssueData.rollNo}
                      onChange={(e) => setQuickIssueData({ ...quickIssueData, rollNo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                      Branch / Dept
                    </label>
                    <select
                      value={quickIssueData.branch}
                      onChange={(e) => setQuickIssueData({ ...quickIssueData, branch: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="CSE">CSE</option>
                      <option value="EE">EE</option>
                      <option value="ME">ME</option>
                      <option value="CE">CE</option>
                      <option value="Faculty">Faculty / Staff</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                      Units to Issue *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={quickIssueItem.totalQty}
                      required
                      value={quickIssueData.qty}
                      onChange={(e) => setQuickIssueData({ ...quickIssueData, qty: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                      Expected Return
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5:30 PM Today"
                      value={quickIssueData.expectedReturn}
                      onChange={(e) => setQuickIssueData({ ...quickIssueData, expectedReturn: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                    Event / Purpose (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Inter-branch practice match"
                    value={quickIssueData.notes}
                    onChange={(e) => setQuickIssueData({ ...quickIssueData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setQuickIssueItem(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-black text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Zap size={13} className="fill-slate-950" />
                    <span>Confirm Issue</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* 7. MODAL: ADD / EDIT EQUIPMENT STOCK */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 sm:p-5 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-3.5 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Package className="text-amber-500" size={17} />
                <span>{editingItem ? 'Edit Gear Stock' : 'Add Equipment Gear'}</span>
              </h4>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Sport Discipline *
                </label>
                <select
                  value={newEquip.category}
                  onChange={(e) => setNewEquip({ ...newEquip, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-amber-500"
                >
                  {customCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Equipment Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cricket Match Bats (SS Ton)"
                  value={newEquip.name}
                  onChange={(e) => setNewEquip({ ...newEquip, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                    Total Units *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newEquip.totalQty}
                    onChange={(e) => setNewEquip({ ...newEquip, totalQty: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-amber-500"
                  />
                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1 mt-1">
                    {[5, 10, 25, 50].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setNewEquip({ ...newEquip, totalQty: val })}
                        className="px-1.5 py-0.5 rounded text-[0.6rem] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                    Condition
                  </label>
                  <select
                    value={newEquip.condition}
                    onChange={(e) => setNewEquip({ ...newEquip, condition: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Good Condition">Good Condition</option>
                    <option value="Brand New">Brand New</option>
                    <option value="Fair / Used">Fair / Used</option>
                    <option value="Needs Maintenance">Needs Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Storage Location / Shelf
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main Sports Store, Locker B-4"
                  value={newEquip.location || ''}
                  onChange={(e) => setNewEquip({ ...newEquip, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Notes / Specs (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. English Willow, Leather ball only"
                  value={newEquip.notes || ''}
                  onChange={(e) => setNewEquip({ ...newEquip, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-black text-xs shadow-xs cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: ADD SPORT CATEGORY */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 sm:p-5 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-3.5 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <FolderPlus className="text-amber-500" size={17} />
                <span>Add Sport Category</span>
              </h4>
              <button 
                onClick={() => setShowAddCategoryModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table Tennis, Kabaddi, Swimming"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-600 mb-1">
                  Sport Icon / Emoji
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl max-h-28 overflow-y-auto">
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewCatIcon(emoji)}
                      className={`w-7 h-7 text-sm rounded-lg flex items-center justify-center transition cursor-pointer ${
                        newCatIcon === emoji ? 'bg-amber-500 text-slate-950 shadow-xs scale-105' : 'hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-black text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
