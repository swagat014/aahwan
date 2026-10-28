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
  Square,
  RefreshCw,
  Database
} from 'lucide-react';

export default function EquipmentStockTab({ setActiveTab }) {
  const { 
    equipmentList, 
    addEquipment, 
    updateEquipment, 
    deleteEquipment, 
    equipmentLogs,
    issueEquipment,
    returnEquipment,
    refreshCloudData,
    cloudSyncStatus,
    lastSyncedTime
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  // Auto-fetch fresh equipment data directly from database on mount and poll every 15s
  useEffect(() => {
    let isMounted = true;
    const fetchFresh = async () => {
      if (refreshCloudData) {
        setIsRefreshing(true);
        try {
          await refreshCloudData();
        } catch (err) {
          console.warn('Failed to load fresh equipment data from database:', err);
        } finally {
          if (isMounted) setIsRefreshing(false);
        }
      }
    };

    fetchFresh();

    const interval = setInterval(() => {
      if (refreshCloudData && !isRefreshing) {
        refreshCloudData();
      }
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const showToast = (text, type = 'success') => {
    setToastNotification({ text, type });
    setTimeout(() => {
      setToastNotification(prev => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // 'all' | 'available' | 'low' | 'out' | 'loaned'
  const [conditionFilter, setConditionFilter] = useState('all');
  
  // Table Sorting State
  const [sortField, setSortField] = useState('category'); // 'name' | 'category' | 'location' | 'totalQty' | 'loaned' | 'available'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [viewLayout, setViewLayout] = useState('list'); // 'list' | 'grouped'

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
  const handleQuickQtyChange = async (item, delta) => {
    const current = Number(item.totalQty ?? item.total_qty) || 0;
    const newQty = Math.max(1, current + delta);
    try {
      await updateEquipment(item.id, { ...item, totalQty: newQty, total_qty: newQty });
      showToast(`Updated ${item.name} stock to ${newQty}. Synced to database.`);
    } catch (err) {
      showToast('Failed to update stock quantity', 'error');
    }
  };

  // Save Inline Direct Edit
  const handleSaveInlineQty = async (item) => {
    const parsed = parseInt(inlineQtyValue, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      try {
        await updateEquipment(item.id, { ...item, totalQty: parsed, total_qty: parsed });
        showToast(`Saved ${item.name} stock: ${parsed}. Synced to database.`);
      } catch (err) {
        showToast('Failed to save quantity', 'error');
      }
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
        const catCmp = sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        if (catCmp !== 0) return catCmp;
        return (a.name || '').localeCompare(b.name || '');
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

  // Grouped equipment by sport discipline (for sport-wise inventory view)
  const groupedEquipmentBySport = useMemo(() => {
    const groups = {};
    filteredEquipment.forEach(item => {
      const cat = item.category || 'General';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    });
    return groups;
  }, [filteredEquipment]);

  // Sorted Sport Groups for sport-wise grouped layout
  const sortedSportGroups = useMemo(() => {
    const entries = Object.entries(groupedEquipmentBySport);
    return entries.sort(([catA], [catB]) => {
      if (sortField === 'category') {
        return sortDirection === 'asc' ? catA.localeCompare(catB) : catB.localeCompare(catA);
      }
      return catA.localeCompare(catB);
    });
  }, [groupedEquipmentBySport, sortField, sortDirection]);

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
  const handleBulkDelete = async () => {
    if (selectedItemIds.length === 0) return;
    if (confirm(`Permanently remove ${selectedItemIds.length} selected equipment items from inventory?`)) {
      try {
        await Promise.all(selectedItemIds.map(id => deleteEquipment(id)));
        showToast(`Removed ${selectedItemIds.length} items from inventory.`);
        setSelectedItemIds([]);
      } catch (err) {
        showToast('Failed to delete selected items', 'error');
      }
    }
  };

  const handleBulkQtyAdjust = async (delta) => {
    try {
      await Promise.all(selectedItemIds.map(async id => {
        const item = equipmentList.find(e => e.id === id);
        if (item) {
          const newQty = Math.max(1, (Number(item.totalQty ?? item.total_qty) || 0) + delta);
          await updateEquipment(id, { ...item, totalQty: newQty, total_qty: newQty });
        }
      }));
      showToast(`Adjusted quantity for ${selectedItemIds.length} items.`);
    } catch (err) {
      showToast('Failed to adjust bulk quantities', 'error');
    }
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
  const handleQuickIssueSubmit = async (e) => {
    e.preventDefault();
    if (!quickIssueItem || !quickIssueData.borrowerName.trim() || !quickIssueData.rollNo.trim()) return;

    const issued = activeIssuedLogs
      .filter(l => (l.equipmentId || l.equipment_id) === quickIssueItem.id)
      .reduce((a, b) => a + (Number(b.qty) || 0), 0);
    const avail = Math.max(0, (Number(quickIssueItem.totalQty ?? quickIssueItem.total_qty) || 0) - issued);

    if (Number(quickIssueData.qty) > avail) {
      alert(`Cannot issue ${quickIssueData.qty} units. Only ${avail} available!`);
      return;
    }

    try {
      await issueEquipment({
        equipmentId: quickIssueItem.id,
        equipmentName: quickIssueItem.name,
        category: quickIssueItem.category || 'General',
        borrowerName: quickIssueData.borrowerName.trim(),
        rollNo: quickIssueData.rollNo.trim().toUpperCase(),
        branch: quickIssueData.branch,
        qty: Number(quickIssueData.qty),
        expectedReturn: quickIssueData.expectedReturn,
        notes: quickIssueData.notes
      });

      setQuickIssueSuccessMsg(`Successfully issued ${quickIssueData.qty}x ${quickIssueItem.name} to ${quickIssueData.borrowerName}!`);
      showToast(`Issued ${quickIssueData.qty}x ${quickIssueItem.name} to ${quickIssueData.borrowerName}. Synced to database.`);
      setTimeout(() => {
        setQuickIssueItem(null);
        setQuickIssueSuccessMsg('');
      }, 1200);
    } catch (err) {
      showToast(err.message || 'Failed to issue equipment', 'error');
    }
  };

  // Handle Equipment Add/Edit Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newEquip.name.trim()) return;

    try {
      if (editingItem) {
        await updateEquipment(editingItem.id, newEquip);
        showToast(`Updated ${newEquip.name}. Synced to database.`);
        setEditingItem(null);
      } else {
        await addEquipment(newEquip);
        showToast(`Added ${newEquip.name} to inventory. Synced to database.`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to save equipment', 'error');
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

  const hasActiveFilters = 
    searchTerm || 
    selectedSport !== 'all' || 
    stockStatusFilter !== 'all' || 
    conditionFilter !== 'all' || 
    sortField !== 'category' || 
    sortDirection !== 'asc' || 
    viewLayout !== 'list';

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedSport('all');
    setStockStatusFilter('all');
    setConditionFilter('all');
    setSortField('category');
    setSortDirection('asc');
    setViewLayout('list');
  };

  // Render function for Desktop Row (shared between flat list and grouped layouts)
  const renderDesktopRow = (item) => {
    const categoryObj = allCategoryObjects.find(c => c.id === item.category) || { icon: '🏆', name: item.category || 'General' };
    
    // Active loans for this specific equipment item
    const itemLoans = activeIssuedLogs.filter(l => l.equipmentId === item.id);
    const issuedForThis = itemLoans.reduce((a, b) => a + (Number(b.qty) || 0), 0);
    
    const availForThis = Math.max(0, (Number(item.totalQty) || 0) - issuedForThis);
    const isLow = availForThis > 0 && availForThis <= 2;
    const isOut = availForThis === 0;

    const isSelected = selectedItemIds.includes(item.id);
    const isExpanded = expandedRowIds.includes(item.id);

    return (
      <React.Fragment key={item.id}>
        <tr 
          className={`transition-colors border-b border-slate-100 ${
            isSelected 
              ? 'bg-amber-50/70 border-l-2 border-l-amber-500' 
              : 'hover:bg-slate-50/80'
          }`}
        >
          {/* Checkbox */}
          <td className="py-2 px-2.5 text-center w-8">
            <button
              onClick={() => toggleSelectItem(item.id)}
              className="p-0.5 text-slate-400 hover:text-amber-500 transition cursor-pointer flex items-center justify-center mx-auto"
            >
              {isSelected ? (
                <CheckSquare size={13} className="text-amber-600" />
              ) : (
                <Square size={13} className="hover:text-slate-600" />
              )}
            </button>
          </td>

          {/* Equipment Item Name + Discipline + Location */}
          <td className="py-2 px-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm shrink-0 p-1 bg-slate-100 rounded-md border border-slate-200/80">
                {categoryObj.icon}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-xs truncate">
                    {item.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold text-[0.62rem] border border-slate-200">
                    {item.category || 'General'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[0.62rem] text-slate-400 truncate">
                  {item.location && <span>{item.location}</span>}
                  {item.notes && <span>• {item.notes}</span>}
                </div>
              </div>
            </div>
          </td>

          {/* Total Quantity (Compact Stepper) */}
          <td className="py-2 px-2.5 text-center w-28">
            {inlineEditingId === item.id ? (
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
                className="w-12 px-1 py-0.2 text-center text-xs font-black bg-white border border-amber-500 rounded text-slate-900 focus:outline-none"
              />
            ) : (
              <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 font-mono text-xs shadow-2xs">
                <button
                  onClick={() => handleQuickQtyChange(item, -1)}
                  className="px-1 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                  title="-1"
                >
                  -
                </button>
                <span 
                  onClick={() => {
                    setInlineEditingId(item.id);
                    setInlineQtyValue(String(item.totalQty || 1));
                  }}
                  className="w-7 text-center font-bold text-slate-900 hover:bg-amber-100 rounded cursor-text"
                  title="Click to edit quantity"
                >
                  {item.totalQty}
                </span>
                <button
                  onClick={() => handleQuickQtyChange(item, 1)}
                  className="px-1 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                  title="+1"
                >
                  +
                </button>
              </div>
            )}
          </td>

          {/* In Store Available Count */}
          <td className="py-2 px-2.5 text-center w-28">
            <span className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold inline-block ${
              isOut
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : isLow
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {availForThis} in store
            </span>
          </td>

          {/* On Loan Count */}
          <td className="py-2 px-2.5 text-center w-24">
            {issuedForThis > 0 ? (
              <button
                onClick={() => toggleRowExpand(item.id)}
                className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-mono text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition"
                title="View student borrowers"
              >
                <span>{issuedForThis} loaned</span>
                {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              </button>
            ) : (
              <span className="text-slate-300 text-xs font-mono">-</span>
            )}
          </td>

          {/* Condition */}
          <td className="py-2 px-2.5 text-xs text-slate-600">
            <span className="truncate block max-w-[120px]">
              {item.condition || 'Good'}
            </span>
          </td>

          {/* Actions: Quick Issue, Edit, Delete */}
          <td className="py-2 px-2.5 text-right whitespace-nowrap w-28">
            <div className="inline-flex items-center gap-1 justify-end">
              <button
                onClick={() => openQuickIssue(item)}
                disabled={availForThis <= 0}
                className={`px-2 py-0.5 rounded text-xs font-bold inline-flex items-center gap-0.5 transition ${
                  availForThis > 0
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-2xs cursor-pointer active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
                title={availForThis > 0 ? `Issue ${item.name}` : 'Out of stock'}
              >
                <Zap size={10} className={availForThis > 0 ? 'fill-slate-950' : ''} />
                <span>Issue</span>
              </button>

              <button
                onClick={() => openEditModal(item)}
                className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer transition"
                title="Edit item"
              >
                <Edit2 size={12} />
              </button>

              <button
                onClick={() => {
                  if (confirm(`Remove "${item.name}" from inventory?`)) {
                    deleteEquipment(item.id);
                  }
                }}
                className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition"
                title="Delete item"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </td>
        </tr>

        {/* Collapsible Student Borrower Drawer */}
        {isExpanded && (
          <tr className="bg-slate-50/90 border-b border-slate-200 text-xs">
            <td colSpan={7} className="py-2.5 px-4 sm:px-6">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <User size={12} className="text-amber-600" />
                    <span>Active Borrowers for "{item.name}" ({itemLoans.length})</span>
                  </span>
                  {availForThis > 0 && (
                    <button
                      onClick={() => openQuickIssue(item)}
                      className="text-[0.68rem] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={11} /> Issue another unit
                    </button>
                  )}
                </div>

                {itemLoans.length > 0 ? (
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {itemLoans.map(log => (
                      <div key={log.id} className="flex items-center justify-between p-1.5 rounded bg-amber-50/50 border border-amber-200/70 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.borrowerName}</span>
                          <span className="text-slate-500 text-[0.65rem] font-mono">
                            ({log.rollNo} • {log.branch})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-800 text-xs">
                            {log.qty} unit{log.qty > 1 ? 's' : ''}
                          </span>
                          <span className="text-[0.62rem] text-slate-400">{log.issueDate}</span>
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
                  <p className="text-[0.68rem] text-slate-400 italic">
                    No active student loans for this item.
                  </p>
                )}
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  // Render function for Mobile Card (shared between flat list and grouped layouts)
  const renderMobileCard = (item) => {
    const categoryObj = allCategoryObjects.find(c => c.id === item.category) || { icon: '🏆', name: item.category || 'General' };
    const itemLoans = activeIssuedLogs.filter(l => l.equipmentId === item.id);
    const issuedForThis = itemLoans.reduce((a, b) => a + (Number(b.qty) || 0), 0);
    const availForThis = Math.max(0, (Number(item.totalQty) || 0) - issuedForThis);
    const isLow = availForThis > 0 && availForThis <= 2;
    const isOut = availForThis === 0;
    const isExpanded = expandedRowIds.includes(item.id);

    return (
      <div 
        key={`card-eq-${item.id}`}
        className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs space-y-2.5 transition-all"
      >
        {/* Main Row: Emoji, Name, Discipline, Status Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl shrink-0 w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200">
              {categoryObj.icon}
            </span>
            <div className="min-w-0">
              <h4 className="font-black text-slate-900 text-xs sm:text-sm truncate">
                {item.name}
              </h4>
              <div className="flex items-center gap-1.5 text-[0.62rem] text-slate-500 font-semibold mt-0.5 truncate">
                <span className="text-blue-700 font-bold">{item.category || 'General'}</span>
                {item.location && <span>• {item.location}</span>}
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {isOut ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-black text-[0.62rem] border border-rose-200">
                Out of Stock
              </span>
            ) : isLow ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-black text-[0.62rem] border border-amber-200">
                Low ({availForThis})
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[0.62rem] border border-emerald-200">
                🟢 {availForThis} in store
              </span>
            )}
          </div>
        </div>

        {/* Quantities breakdown strip */}
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-xs">
          <div className="flex items-center gap-3 text-[0.68rem] text-slate-600 font-bold">
            <span>In Store: <strong className="text-emerald-700 font-black">{availForThis}</strong></span>
            <span>•</span>
            <span>Total: <strong className="text-slate-900 font-mono">{item.totalQty}</strong></span>
          </div>

          {issuedForThis > 0 ? (
            <button
              onClick={() => toggleRowExpand(item.id)}
              className="text-[0.65rem] font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200/80 px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1 cursor-pointer transition active:scale-95"
            >
              <span>Loaned: {issuedForThis}</span>
              {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </button>
          ) : (
            <span className="text-[0.62rem] text-slate-400 font-semibold">0 on loan</span>
          )}
        </div>

        {/* Mobile Action Controls Bar */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          {/* Quick Issue Button (Thumb friendly) */}
          <button
            onClick={() => openQuickIssue(item)}
            disabled={availForThis <= 0}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 ${
              availForThis > 0
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-2xs cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <Zap size={13} className={availForThis > 0 ? 'fill-slate-950' : ''} />
            <span>Issue Gear</span>
          </button>

          {/* Stepper for stock counting */}
          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 font-mono text-xs shadow-2xs">
            <button
              onClick={() => handleQuickQtyChange(item, -1)}
              className="px-2 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg cursor-pointer transition"
              title="-1 unit"
            >
              <Minus size={12} />
            </button>
            <span 
              onClick={() => {
                setInlineEditingId(item.id);
                setInlineQtyValue(String(item.totalQty || 1));
              }}
              className="w-8 text-center font-bold text-slate-900 cursor-text"
              title="Click to edit quantity"
            >
              {item.totalQty}
            </span>
            <button
              onClick={() => handleQuickQtyChange(item, 1)}
              className="px-2 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg cursor-pointer transition"
              title="+1 unit"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Edit / Delete Icons */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => openEditModal(item)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition"
              title="Edit gear"
            >
              <Edit2 size={13} />
            </button>

            <button
              onClick={() => {
                if (confirm(`Remove "${item.name}" from inventory?`)) {
                  deleteEquipment(item.id);
                }
              }}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition"
              title="Delete item"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Collapsible Active Loans Drawer with Fast Return Button */}
        {isExpanded && issuedForThis > 0 && (
          <div className="mt-2 p-2.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[0.65rem] font-black text-amber-900 uppercase tracking-wider">
              <span>Active Student Borrowers ({itemLoans.length})</span>
              <span>Units Out: {issuedForThis}</span>
            </div>
            
            <div className="space-y-1.5">
              {itemLoans.map(log => (
                <div key={log.id} className="p-2 bg-white rounded-lg border border-amber-200/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{log.borrowerName}</span>
                      <span className="text-[0.62rem] text-slate-500 font-mono">
                        Roll: {log.rollNo} • {log.branch}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold text-xs">
                      {log.qty} unit{log.qty > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[0.62rem]">
                    <span className="text-slate-400">Issued: {log.issueDate}</span>
                    <button
                      onClick={async () => {
                        if (confirm(`Accept return of ${log.qty}x "${item.name}" from ${log.borrowerName}?`)) {
                          try {
                            await returnEquipment(log.id, 'Good Condition', 'Returned at stock desk', log.qty);
                            showToast(`✓ Accepted return of ${log.qty}x ${item.name} from ${log.borrowerName}`);
                          } catch (err) {
                            showToast(err.message || 'Failed to accept return', 'error');
                          }
                        }
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <RotateCcw size={10} />
                      <span>✓ Accept Return</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3.5 select-none text-slate-800 relative">
      
      {/* TOAST NOTIFICATION BANNER */}
      {toastNotification && (
        <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold transition-all shadow-md animate-in fade-in slide-in-from-top-2 ${
          toastNotification.type === 'error'
            ? 'bg-rose-50 border-rose-300 text-rose-800'
            : 'bg-emerald-50 border-emerald-300 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {toastNotification.type === 'error' ? (
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            )}
            <span>{toastNotification.text}</span>
          </div>
          <button 
            type="button"
            onClick={() => setToastNotification(null)}
            className="p-1 hover:bg-black/5 rounded-lg cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* MOBILE 2-WAY QUICK SWITCH BAR (< md) */}
      <div className="flex md:hidden items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs gap-1">
        <button
          type="button"
          className="flex-1 py-2 px-2.5 text-xs font-black rounded-lg bg-slate-900 text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-default"
        >
          <Package size={14} className="text-amber-400" />
          <span>Gear Inventory</span>
          <span className="px-1.5 py-0.2 rounded-full text-[0.6rem] font-black bg-amber-500 text-slate-950">
            {equipmentList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('equipment-issues')}
          className="flex-1 py-2 px-2.5 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/70 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <RotateCcw size={14} className="text-amber-500" />
          <span>Issue & Returns</span>
          <span className="px-1.5 py-0.2 rounded-full text-[0.6rem] font-bold bg-slate-200 text-slate-700">
            {equipmentLogs.length}
          </span>
        </button>
      </div>

      {/* 1. COMPACT TOP HEADER & QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Package size={16} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Stock Inventory
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              {totalItemsCount} items • {totalPhysicalUnits} units
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[0.62rem] font-bold">
              <Database size={10} className="text-emerald-600" />
              <span>Supabase Live</span>
            </span>
          </div>
        </div>

        {/* Compact Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={async () => {
              if (refreshCloudData) {
                setIsRefreshing(true);
                await refreshCloudData();
                setTimeout(() => setIsRefreshing(false), 600);
              }
            }}
            disabled={isRefreshing || cloudSyncStatus === 'syncing'}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg border border-blue-200 shadow-2xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Fetch fresh inventory stock from Supabase Database"
          >
            <RefreshCw size={12} className={isRefreshing || cloudSyncStatus === 'syncing' ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{isRefreshing || cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>

          <button
            onClick={() => handleExportCSV()}
            title="Export CSV"
            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download size={12} className="text-emerald-600" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={handlePrintSheet}
            title="Print Inventory Sheet"
            className="p-1.5 sm:px-2 sm:py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1 transition cursor-pointer"
          >
            <Printer size={12} className="text-slate-500" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <FolderPlus size={12} className="text-amber-600" />
            <span className="hidden sm:inline">Category</span>
          </button>

          <button
            onClick={() => openAddModal(selectedSport)}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg flex items-center gap-1 shadow-2xs transition transform active:scale-95 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT STATUS PILL FILTER BAR */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
        {/* All Items */}
        <button
          onClick={() => setStockStatusFilter('all')}
          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            stockStatusFilter === 'all'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>All Items</span>
          <span className={`px-1.5 py-0.2 rounded text-[0.62rem] font-black ${
            stockStatusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {totalItemsCount}
          </span>
        </button>

        {/* In Store */}
        <button
          onClick={() => setStockStatusFilter(prev => prev === 'available' ? 'all' : 'available')}
          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            stockStatusFilter === 'available'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>In Store</span>
          <span className={`px-1.5 py-0.2 rounded text-[0.62rem] font-black ${
            stockStatusFilter === 'available' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {totalAvailableUnits}
          </span>
        </button>

        {/* On Loan */}
        <button
          onClick={() => setStockStatusFilter(prev => prev === 'loaned' ? 'all' : 'loaned')}
          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            stockStatusFilter === 'loaned'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>On Loan</span>
          <span className={`px-1.5 py-0.2 rounded text-[0.62rem] font-black ${
            stockStatusFilter === 'loaned' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
          }`}>
            {totalIssuedUnits}
          </span>
        </button>

        {/* Low Stock */}
        <button
          onClick={() => setStockStatusFilter(prev => prev === 'low' ? 'all' : 'low')}
          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            stockStatusFilter === 'low'
              ? 'bg-amber-500 text-slate-950 shadow-2xs'
              : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <AlertTriangle size={11} className={stockStatusFilter === 'low' ? 'text-slate-950' : 'text-amber-500'} />
          <span>Low Stock</span>
          <span className={`px-1.5 py-0.2 rounded text-[0.62rem] font-black ${
            stockStatusFilter === 'low' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-100 text-amber-900'
          }`}>
            {stockMetrics.lowCount}
          </span>
        </button>

        {/* Out of Stock */}
        <button
          onClick={() => setStockStatusFilter(prev => prev === 'out' ? 'all' : 'out')}
          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            stockStatusFilter === 'out'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'bg-white text-rose-800 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <AlertCircle size={11} className={stockStatusFilter === 'out' ? 'text-white' : 'text-rose-500'} />
          <span>Out of Stock</span>
          <span className={`px-1.5 py-0.2 rounded text-[0.62rem] font-black ${
            stockStatusFilter === 'out' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-900'
          }`}>
            {stockMetrics.outCount}
          </span>
        </button>
      </div>

      {/* 3. SLEEK UNIFIED TOOLBAR */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-1.5 sm:p-2 flex flex-wrap items-center justify-between gap-1.5 shadow-2xs">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search equipment, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-7 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition placeholder:text-slate-400"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          
          {/* Sport Discipline Dropdown */}
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
            title="Filter by Sport Discipline"
          >
            <option value="all">🏆 All Disciplines ({equipmentList.length})</option>
            {allCategoryObjects.filter(c => c.id !== 'all').map(cat => {
              const count = equipmentList.filter(e => e.category === cat.id).length;
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name} ({count})
                </option>
              );
            })}
          </select>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <ArrowUpDown size={11} className="text-amber-500 shrink-0" />
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, dir] = e.target.value.split('-');
                setSortField(field);
                setSortDirection(dir);
              }}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              title="Sort inventory gear"
            >
              <option value="category-asc">Sport: A-Z</option>
              <option value="category-desc">Sport: Z-A</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
              <option value="totalQty-desc">Stock: High-Low</option>
              <option value="totalQty-asc">Stock: Low-High</option>
              <option value="available-desc">In Store: High</option>
              <option value="loaned-desc">On Loan: High</option>
              <option value="location-asc">Location: A-Z</option>
            </select>
          </div>

          {/* Condition Filter */}
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer hidden sm:block"
            title="Filter by condition"
          >
            <option value="all">All Conditions</option>
            <option value="Brand New">Brand New</option>
            <option value="Good Condition">Good Condition</option>
            <option value="Fair / Used">Fair / Used</option>
            <option value="Needs Maintenance">Needs Maintenance</option>
          </select>

          {/* View Mode Toggle: Flat vs Grouped */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewLayout('list')}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer text-[0.68rem] ${
                viewLayout === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Continuous flat list view"
            >
              Flat
            </button>
            <button
              type="button"
              onClick={() => {
                setViewLayout('grouped');
                if (sortField !== 'category') {
                  setSortField('category');
                  setSortDirection('asc');
                }
              }}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer text-[0.68rem] ${
                viewLayout === 'grouped'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Group items by sport discipline"
            >
              Grouped
            </button>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1 transition cursor-pointer"
              title="Reset all active filters"
            >
              <RotateCcw size={10} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. STREAMLINED TABULAR INVENTORY GRID */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs relative">
        
        {/* Desktop Table Container (md and up) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Table Header with 7 Clean Columns */}
            <thead className="bg-slate-900 text-white uppercase text-[0.62rem] font-black tracking-wider border-b border-slate-800 sticky top-0 z-10">
              <tr>
                {/* 1. Select All Checkbox */}
                <th className="py-2.5 px-2.5 w-8 text-center">
                  <button 
                    onClick={toggleSelectAll} 
                    className="p-1 hover:text-amber-400 text-slate-400 transition cursor-pointer flex items-center justify-center mx-auto"
                    title={isAllSelected ? 'Deselect all' : 'Select all'}
                  >
                    {isAllSelected ? (
                      <CheckSquare size={13} className="text-amber-400" />
                    ) : selectedItemIds.length > 0 ? (
                      <div className="w-3.5 h-3.5 bg-amber-500 rounded-xs flex items-center justify-center text-slate-950 text-[10px] font-black">
                        -
                      </div>
                    ) : (
                      <Square size={13} />
                    )}
                  </button>
                </th>

                {/* 2. Equipment Gear & Discipline */}
                <th 
                  onClick={() => handleSort('name')}
                  className="py-2.5 px-2.5 cursor-pointer hover:text-amber-400 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Equipment Gear</span>
                    {sortField === 'name' ? (
                      sortDirection === 'asc' ? <ArrowUp size={11} className="text-amber-400" /> : <ArrowDown size={11} className="text-amber-400" />
                    ) : (
                      <ArrowUpDown size={10} className="text-slate-500 opacity-60" />
                    )}
                  </div>
                </th>

                {/* 3. Total Stock */}
                <th 
                  onClick={() => handleSort('totalQty')}
                  className="py-2.5 px-2.5 w-28 text-center cursor-pointer hover:text-amber-400 transition select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Total Units</span>
                    {sortField === 'totalQty' ? (
                      sortDirection === 'asc' ? <ArrowUp size={11} className="text-amber-400" /> : <ArrowDown size={11} className="text-amber-400" />
                    ) : (
                      <ArrowUpDown size={10} className="text-slate-500 opacity-60" />
                    )}
                  </div>
                </th>

                {/* 4. In Store Ready */}
                <th 
                  onClick={() => handleSort('available')}
                  className="py-2.5 px-2.5 w-28 text-center cursor-pointer hover:text-amber-400 transition select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>In Store</span>
                    {sortField === 'available' ? (
                      sortDirection === 'asc' ? <ArrowUp size={11} className="text-amber-400" /> : <ArrowDown size={11} className="text-amber-400" />
                    ) : (
                      <ArrowUpDown size={10} className="text-slate-500 opacity-60" />
                    )}
                  </div>
                </th>

                {/* 5. On Loan */}
                <th 
                  onClick={() => handleSort('loaned')}
                  className="py-2.5 px-2.5 w-24 text-center cursor-pointer hover:text-amber-400 transition select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>On Loan</span>
                    {sortField === 'loaned' ? (
                      sortDirection === 'asc' ? <ArrowUp size={11} className="text-amber-400" /> : <ArrowDown size={11} className="text-amber-400" />
                    ) : (
                      <ArrowUpDown size={10} className="text-slate-500 opacity-60" />
                    )}
                  </div>
                </th>

                {/* 6. Condition */}
                <th className="py-2.5 px-2.5 w-28">Condition</th>

                {/* 7. Actions */}
                <th className="py-2.5 px-2.5 w-28 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredEquipment.length > 0 ? (
                viewLayout === 'grouped' ? (
                  sortedSportGroups.map(([sportName, items]) => {
                    const sportCategoryObj = allCategoryObjects.find(c => c.id === sportName) || { icon: '🏆', name: sportName };
                    const groupTotalUnits = items.reduce((sum, it) => sum + (Number(it.totalQty) || 0), 0);
                    const groupLoanedUnits = items.reduce((sum, it) => {
                      const loans = activeIssuedLogs.filter(l => l.equipmentId === it.id);
                      return sum + loans.reduce((s, l) => s + (Number(l.qty) || 0), 0);
                    }, 0);
                    const groupAvailableUnits = Math.max(0, groupTotalUnits - groupLoanedUnits);

                    return (
                      <React.Fragment key={`group-${sportName}`}>
                        {/* Refined Lightweight Sport Discipline Separator */}
                        <tr className="bg-slate-100/90 border-y border-slate-200 text-slate-900">
                          <td colSpan={7} className="py-1.5 px-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{sportCategoryObj.icon}</span>
                                <span className="font-black text-xs text-slate-900 tracking-tight">
                                  {sportCategoryObj.name}
                                </span>
                                <span className="px-1.5 py-0.2 rounded-full text-[0.6rem] font-bold bg-slate-200/80 text-slate-700">
                                  {items.length} {items.length === 1 ? 'item' : 'items'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-[0.62rem] font-bold">
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    🟢 {groupAvailableUnits} in store
                                  </span>
                                  {groupLoanedUnits > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                      ⚡ {groupLoanedUnits} loaned
                                    </span>
                                  )}
                                  <span className="px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-mono">
                                    {groupTotalUnits} total
                                  </span>
                                </div>

                                <button
                                  onClick={() => openAddModal(sportName)}
                                  className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[0.62rem] font-black transition flex items-center gap-0.5 cursor-pointer ml-1"
                                  title={`Add new gear to ${sportCategoryObj.name}`}
                                >
                                  <Plus size={10} />
                                  <span>Add</span>
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                        {items.map(item => renderDesktopRow(item))}
                      </React.Fragment>
                    );
                  })
                ) : (
                  filteredEquipment.map(item => renderDesktopRow(item))
                )
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Package size={28} className="mx-auto text-slate-300" />
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

        {/* MOBILE CARDS VIEW (< md screens) */}
        <div className="block md:hidden p-2 space-y-2 bg-slate-50/50">
          {filteredEquipment.length > 0 ? (
            viewLayout === 'grouped' ? (
              sortedSportGroups.map(([sportName, items]) => {
                const sportCategoryObj = allCategoryObjects.find(c => c.id === sportName) || { icon: '🏆', name: sportName };
                const groupTotalUnits = items.reduce((sum, it) => sum + (Number(it.totalQty) || 0), 0);
                const groupLoanedUnits = items.reduce((sum, it) => {
                  const loans = activeIssuedLogs.filter(l => l.equipmentId === it.id);
                  return sum + loans.reduce((s, l) => s + (Number(l.qty) || 0), 0);
                }, 0);
                const groupAvailableUnits = Math.max(0, groupTotalUnits - groupLoanedUnits);

                return (
                  <div key={`m-group-${sportName}`} className="space-y-1.5">
                    {/* Clean Lightweight Sticky Sport Header */}
                    <div className="bg-slate-100 border border-slate-200 p-2 rounded-xl flex items-center justify-between sticky top-2 z-10 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{sportCategoryObj.icon}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-xs text-slate-900">
                              {sportCategoryObj.name}
                            </h4>
                            <span className="px-1.5 py-0.2 rounded-full text-[0.58rem] font-bold bg-slate-200 text-slate-700">
                              {items.length}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[0.6rem] text-slate-500 font-medium">
                            <span className="text-emerald-700 font-bold">{groupAvailableUnits} in store</span>
                            {groupLoanedUnits > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-amber-700 font-bold">{groupLoanedUnits} loaned</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => openAddModal(sportName)}
                        className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus size={11} /> Add
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {items.map(item => renderMobileCard(item))}
                    </div>
                  </div>
                );
              })
            ) : (
              filteredEquipment.map(item => renderMobileCard(item))
            )
          ) : (
            <div className="py-10 text-center text-slate-400">
              <Package size={28} className="mx-auto text-slate-300 mb-1.5" />
              <p className="text-xs font-bold text-slate-700">No equipment items found</p>
              <p className="text-[0.68rem] text-slate-400">Try adjusting your active filter or search</p>
            </div>
          )}
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
                    {/* Quick branch chips */}
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {['CSE', 'EE', 'ME', 'CE'].map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setQuickIssueData(prev => ({ ...prev, branch: b }))}
                          className={`px-2 py-0.5 text-[0.6rem] font-bold rounded border transition cursor-pointer ${
                            quickIssueData.branch === b
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
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
                    {/* Quick duration buttons */}
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {['+2 Hours', '+4 Hours', '6 PM Today'].map(dur => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setQuickIssueData(prev => ({ ...prev, expectedReturn: dur }))}
                          className="px-1.5 py-0.2 bg-white hover:bg-amber-50 text-amber-900 font-bold text-[0.58rem] rounded border border-amber-200 cursor-pointer"
                        >
                          {dur}
                        </button>
                      ))}
                    </div>
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
