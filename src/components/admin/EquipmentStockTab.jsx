import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RotateCcw, 
  Download, 
  RefreshCw, 
  User, 
  Clock, 
  Check, 
  AlertCircle,
  ArrowUpDown,
  MapPin,
  Sparkles,
  Loader2,
  Trophy,
  Box,
  Layers
} from 'lucide-react';

const DEFAULT_DISCIPLINES = [
  { id: 'Cricket', name: 'Cricket', icon: '🏏', color: 'emerald' },
  { id: 'Football', name: 'Football', icon: '⚽', color: 'blue' },
  { id: 'Volleyball', name: 'Volleyball', icon: '🏐', color: 'indigo' },
  { id: 'Badminton', name: 'Badminton', icon: '🏸', color: 'purple' },
  { id: 'Athletics', name: 'Athletics', icon: '🏃', color: 'amber' },
  { id: 'Indoor Games', name: 'Indoor Games', icon: '♟️', color: 'slate' },
  { id: 'Table Tennis', name: 'Table Tennis', icon: '🏓', color: 'rose' },
  { id: 'Kabaddi', name: 'Kabaddi', icon: '🤼', color: 'orange' },
  { id: 'General', name: 'General Store', icon: '📦', color: 'slate' }
];

const EMOJI_OPTIONS = [
  '🏏', '⚽', '🏐', '🏸', '🏃', '♟️', '🏓', '🏀', '🤼', '🥊', '🎯', '🏊', '🏋️', '🥋', '🏆', '🥇', '👟', '⛳', '🎾', '🏹'
];

const CONDITION_OPTIONS = [
  'Good Condition',
  'Brand New',
  'Fair / Used',
  'Needs Maintenance'
];

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
    cloudSyncStatus
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  // Sports Disciplines State
  const [disciplines, setDisciplines] = useState(() => {
    try {
      const saved = localStorage.getItem('aahwan_sport_disciplines') || localStorage.getItem('aahwan_custom_sport_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse sport disciplines:', e);
    }
    return DEFAULT_DISCIPLINES;
  });

  // Persist disciplines
  useEffect(() => {
    localStorage.setItem('aahwan_sport_disciplines', JSON.stringify(disciplines));
    localStorage.setItem('aahwan_custom_sport_categories', JSON.stringify(disciplines));
  }, [disciplines]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'new_stock' | 'old_stock' | 'available' | 'loaned' | 'low'
  const [sortBy, setSortBy] = useState('name-asc'); // 'name-asc' | 'name-desc' | 'qty-desc' | 'qty-asc'

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddDisciplineModal, setShowAddDisciplineModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);

  // New Discipline Form state
  const [newDisciplineName, setNewDisciplineName] = useState('');
  const [newDisciplineIcon, setNewDisciplineIcon] = useState('🏀');

  // Quick Issue state
  const [quickIssueItem, setQuickIssueItem] = useState(null);
  const [isSubmittingQuickIssue, setIsSubmittingQuickIssue] = useState(false);
  const [quickIssueData, setQuickIssueData] = useState({
    borrowerName: '',
    rollNo: '',
    branch: 'Computer Science & Engg (CSE)',
    borrowerPhone: '',
    qty: 1,
    stockType: 'new',
    expectedReturn: '',
    notes: ''
  });

  // View Loans Modal state
  const [viewingLoansItem, setViewingLoansItem] = useState(null);
  const [returningLogId, setReturningLogId] = useState(null);

  // Equipment Form State (Includes New Stock & Old Stock options)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cricket',
    stockType: 'new', // 'new' | 'old' | 'mixed'
    totalQty: 10,
    newQty: 10,
    oldQty: 0,
    condition: 'Brand New',
    location: 'Main Sports Store',
    notes: ''
  });

  const showToast = (text, type = 'success') => {
    setToastNotification({ text, type });
    setTimeout(() => {
      setToastNotification(prev => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Pre-calculate item loan and stock-type metrics
  const { 
    itemLoansMap, 
    totalUnitsCount, 
    totalAvailableCount, 
    totalLoanedCount, 
    lowStockCount,
    totalNewStockUnits,
    totalOldStockUnits,
    newItemsCount,
    oldItemsCount
  } = useMemo(() => {
    const map = {};
    let totalUnits = 0;
    let totalLoaned = 0;
    let lowCount = 0;
    let totalNew = 0;
    let totalOld = 0;
    let newItems = 0;
    let oldItems = 0;

    const activeLogs = (equipmentLogs || []).filter(l => l.status === 'issued');

    (equipmentList || []).forEach(item => {
      const loans = activeLogs.filter(l => String(l.equipmentId || l.equipment_id) === String(item.id));
      const loaned = loans.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);
      const total = Number(item.totalQty ?? item.total_qty) || 0;
      const available = Math.max(0, total - loaned);

      const stType = item.stockType || item.stock_type || ((item.condition && item.condition.toLowerCase().includes('new')) ? 'new' : 'old');
      const nQty = item.newQty !== undefined ? Number(item.newQty) : (item.new_qty !== undefined ? Number(item.new_qty) : (stType === 'new' ? total : 0));
      const oQty = item.oldQty !== undefined ? Number(item.oldQty) : (item.old_qty !== undefined ? Number(item.old_qty) : (stType === 'old' ? total : Math.max(0, total - nQty)));

      map[item.id] = {
        loans,
        loanedUnits: loaned,
        availableUnits: available,
        totalUnits: total,
        newQty: nQty,
        oldQty: oQty,
        stockType: stType
      };

      totalUnits += total;
      totalLoaned += loaned;
      totalNew += nQty;
      totalOld += oQty;

      if (stType === 'new' || nQty > 0) newItems++;
      if (stType === 'old' || oQty > 0) oldItems++;
      if (available <= 2) lowCount++;
    });

    return {
      itemLoansMap: map,
      totalUnitsCount: totalUnits,
      totalAvailableCount: Math.max(0, totalUnits - totalLoaned),
      totalLoanedCount: totalLoaned,
      lowStockCount: lowCount,
      totalNewStockUnits: totalNew,
      totalOldStockUnits: totalOld,
      newItemsCount: newItems,
      oldItemsCount: oldItems
    };
  }, [equipmentList, equipmentLogs]);

  // Group equipment according to Sports Discipline
  const groupedEquipment = useMemo(() => {
    const map = new Map();

    // 1. Add all configured disciplines in order
    disciplines.forEach(d => {
      map.set(d.name.toLowerCase().trim(), {
        discipline: d,
        items: []
      });
    });

    // 2. Ensure any custom category present in equipmentList is mapped
    (equipmentList || []).forEach(item => {
      const catName = (item.category || 'General').trim();
      const key = catName.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          discipline: { id: catName, name: catName, icon: '🏆', color: 'slate' },
          items: []
        });
      }
    });

    // 3. Filter items and place them into their discipline group
    const q = searchTerm.toLowerCase().trim();

    (equipmentList || []).forEach(item => {
      // Search match
      if (q) {
        const matches = 
          (item.name || '').toLowerCase().includes(q) ||
          (item.location || '').toLowerCase().includes(q) ||
          (item.notes || '').toLowerCase().includes(q) ||
          (item.category || '').toLowerCase().includes(q);
        if (!matches) return;
      }

      // Status match (including New Stock / Old Stock)
      const m = itemLoansMap[item.id] || { availableUnits: 0, loanedUnits: 0, newQty: 0, oldQty: 0, stockType: 'old' };
      if (statusFilter === 'available' && m.availableUnits <= 0) return;
      if (statusFilter === 'loaned' && m.loanedUnits <= 0) return;
      if (statusFilter === 'low' && m.availableUnits > 2) return;
      if (statusFilter === 'new_stock' && (m.stockType !== 'new' && m.newQty <= 0)) return;
      if (statusFilter === 'old_stock' && (m.stockType !== 'old' && m.oldQty <= 0)) return;

      const catKey = (item.category || 'General').toLowerCase().trim();
      if (map.has(catKey)) {
        map.get(catKey).items.push(item);
      }
    });

    // 4. Construct final array of groups
    const result = [];
    map.forEach(({ discipline, items }) => {
      // If user selected a specific discipline tab, only include that one
      if (selectedCategory !== 'all' && selectedCategory.toLowerCase().trim() !== discipline.name.toLowerCase().trim()) {
        return;
      }

      // If search/status filter active and no items match, hide empty discipline
      if ((searchTerm || statusFilter !== 'all') && items.length === 0) {
        return;
      }

      // Sort items within this discipline
      items.sort((a, b) => {
        const mA = itemLoansMap[a.id] || { totalUnits: 0 };
        const mB = itemLoansMap[b.id] || { totalUnits: 0 };
        if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
        if (sortBy === 'qty-desc') return mB.totalUnits - mA.totalUnits;
        if (sortBy === 'qty-asc') return mA.totalUnits - mB.totalUnits;
        return 0;
      });

      const totalUnits = items.reduce((acc, it) => acc + (Number(it.totalQty ?? it.total_qty) || 0), 0);
      const loanedUnits = items.reduce((acc, it) => acc + (itemLoansMap[it.id]?.loanedUnits || 0), 0);
      const availableUnits = Math.max(0, totalUnits - loanedUnits);
      const newUnits = items.reduce((acc, it) => acc + (itemLoansMap[it.id]?.newQty || 0), 0);
      const oldUnits = items.reduce((acc, it) => acc + (itemLoansMap[it.id]?.oldQty || 0), 0);

      result.push({
        discipline,
        items,
        totalUnits,
        loanedUnits,
        availableUnits,
        newUnits,
        oldUnits,
        count: items.length
      });
    });

    return result;
  }, [disciplines, equipmentList, selectedCategory, searchTerm, statusFilter, sortBy, itemLoansMap]);

  // Open Add Equipment Modal
  const openAddModal = (defaultCat = 'Cricket') => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: defaultCat !== 'all' ? defaultCat : 'Cricket',
      stockType: 'new',
      totalQty: 10,
      newQty: 10,
      oldQty: 0,
      condition: 'Brand New',
      location: 'Main Sports Store',
      notes: ''
    });
    setShowAddModal(true);
  };

  // Open Edit Equipment Modal
  const openEditModal = (item) => {
    setEditingItem(item);
    const m = itemLoansMap[item.id] || { totalUnits: 0, newQty: 0, oldQty: 0, stockType: 'old' };
    const stType = m.stockType || (m.newQty > 0 && m.oldQty > 0 ? 'mixed' : (m.newQty > 0 ? 'new' : 'old'));

    setFormData({
      name: item.name || '',
      category: item.category || 'Cricket',
      stockType: stType,
      totalQty: m.totalUnits,
      newQty: m.newQty,
      oldQty: m.oldQty,
      condition: item.condition || 'Good Condition',
      location: item.location || 'Main Sports Store',
      notes: item.notes || ''
    });
    setShowAddModal(true);
  };

  // Handle stock type change in modal
  const handleStockTypeChange = (type) => {
    setFormData(prev => {
      const total = Number(prev.totalQty) || 10;
      if (type === 'new') {
        return {
          ...prev,
          stockType: 'new',
          newQty: total,
          oldQty: 0,
          condition: prev.condition === 'Needs Maintenance' ? 'Good Condition' : 'Brand New'
        };
      } else if (type === 'old') {
        return {
          ...prev,
          stockType: 'old',
          newQty: 0,
          oldQty: total,
          condition: 'Good Condition'
        };
      } else {
        const halfNew = Math.ceil(total / 2);
        const halfOld = total - halfNew;
        return {
          ...prev,
          stockType: 'mixed',
          newQty: halfNew,
          oldQty: halfOld
        };
      }
    });
  };

  // Handle detailed stock quantity adjustment
  const handleQtyBreakdownChange = (field, val) => {
    const num = Math.max(0, Number(val) || 0);
    setFormData(prev => {
      const nextNew = field === 'newQty' ? num : (Number(prev.newQty) || 0);
      const nextOld = field === 'oldQty' ? num : (Number(prev.oldQty) || 0);
      const nextTotal = nextNew + nextOld;
      const nextType = (nextNew > 0 && nextOld > 0) ? 'mixed' : (nextNew > 0 ? 'new' : 'old');
      return {
        ...prev,
        [field]: num,
        totalQty: nextTotal,
        stockType: nextType
      };
    });
  };

  // Add new Sports Discipline
  const handleAddDiscipline = (e) => {
    e.preventDefault();
    const trimmed = newDisciplineName.trim();
    if (!trimmed) return;

    if (disciplines.some(d => d.name.toLowerCase() === trimmed.toLowerCase())) {
      alert(`Discipline "${trimmed}" already exists.`);
      return;
    }

    const newDisc = {
      id: trimmed,
      name: trimmed,
      icon: newDisciplineIcon || '🏆',
      color: 'indigo'
    };

    setDisciplines(prev => [...prev, newDisc]);
    setSelectedCategory(trimmed);
    setNewDisciplineName('');
    setShowAddDisciplineModal(false);
    showToast(`✓ Added "${trimmed}" sports discipline!`);
  };

  // Save Add/Edit Equipment
  const handleSaveEquipment = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const total = Math.max(0, (Number(formData.newQty) || 0) + (Number(formData.oldQty) || 0) || Number(formData.totalQty) || 0);
      const payload = {
        name: formData.name.trim(),
        category: formData.category || 'General',
        totalQty: total,
        total_qty: total,
        newQty: Number(formData.newQty) || 0,
        new_qty: Number(formData.newQty) || 0,
        oldQty: Number(formData.oldQty) || 0,
        old_qty: Number(formData.oldQty) || 0,
        stockType: formData.stockType || ((Number(formData.newQty) || 0) > 0 ? 'new' : 'old'),
        stock_type: formData.stockType || ((Number(formData.newQty) || 0) > 0 ? 'new' : 'old'),
        condition: formData.condition || 'Good Condition',
        location: formData.location.trim() || 'Main Sports Store',
        notes: formData.notes.trim()
      };

      if (editingItem) {
        await updateEquipment(editingItem.id, payload);
        showToast(`✓ Updated "${payload.name}" in inventory.`);
      } else {
        await addEquipment(payload);
        showToast(`✓ Added "${payload.name}" (${payload.totalQty} units: ${payload.newQty} new, ${payload.oldQty} old).`);
      }
      setShowAddModal(false);
      setEditingItem(null);
    } catch (err) {
      showToast(err.message || 'Failed to save equipment', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Equipment
  const handleDeleteItem = async (item) => {
    if (!item?.id) return;
    if (window.confirm(`Permanently remove "${item.name}" from inventory?`)) {
      setDeletingItemId(item.id);
      try {
        await deleteEquipment(item.id);
        showToast(`✓ Removed "${item.name}" from inventory.`);
      } catch (err) {
        showToast(err.message || 'Failed to remove equipment', 'error');
      } finally {
        setDeletingItemId(null);
      }
    }
  };

  // Open Quick Issue Modal
  const openQuickIssue = (item) => {
    setQuickIssueItem(item);
    const m = itemLoansMap[item.id] || { newQty: 0, oldQty: 0, stockType: 'old' };
    const defaultStockType = (m.stockType === 'new' || (m.newQty > 0 && m.oldQty === 0)) ? 'new' : 'old';

    const now = new Date();
    now.setHours(now.getHours() + 4);
    const defaultReturn = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ', ' + now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    setQuickIssueData({
      borrowerName: '',
      rollNo: '',
      branch: 'Computer Science & Engg (CSE)',
      borrowerPhone: '',
      qty: 1,
      stockType: defaultStockType,
      expectedReturn: defaultReturn,
      notes: ''
    });
  };

  // Submit Quick Issue
  const handleQuickIssueSubmit = async (e) => {
    e.preventDefault();
    if (!quickIssueItem) return;

    const metrics = itemLoansMap[quickIssueItem.id] || { availableUnits: 0 };
    const avail = metrics.availableUnits;
    const reqQty = Number(quickIssueData.qty) || 1;

    if (reqQty > avail) {
      alert(`Cannot issue ${reqQty} units. Only ${avail} units are available in store!`);
      return;
    }

    setIsSubmittingQuickIssue(true);
    try {
      await issueEquipment({
        equipmentId: quickIssueItem.id,
        equipmentName: quickIssueItem.name,
        category: quickIssueItem.category || 'General',
        borrowerName: quickIssueData.borrowerName.trim(),
        rollNo: quickIssueData.rollNo.trim().toUpperCase(),
        branch: quickIssueData.branch,
        borrowerPhone: quickIssueData.borrowerPhone.trim(),
        qty: reqQty,
        stockType: quickIssueData.stockType || 'old',
        expectedReturn: quickIssueData.expectedReturn,
        notes: quickIssueData.notes
      });
      showToast(`✓ Issued ${reqQty}x "${quickIssueItem.name}" (${quickIssueData.stockType === 'new' ? '✨ New Stock' : '📦 Old Stock'}) to ${quickIssueData.borrowerName}.`);
      setQuickIssueItem(null);
    } catch (err) {
      showToast(err.message || 'Failed to issue equipment', 'error');
    } finally {
      setIsSubmittingQuickIssue(false);
    }
  };

  // Handle Return from Loans Modal
  const handleReturnFromModal = async (log, itemName) => {
    if (!log?.id) return;
    if (window.confirm(`Accept return of ${log.qty} unit(s) of "${itemName}" from ${log.borrowerName}?`)) {
      setReturningLogId(log.id);
      try {
        await returnEquipment(log.id, 'Good Condition', 'Checked-in via stock inventory');
        showToast(`✓ Return recorded for ${itemName} (${log.borrowerName}).`);
      } catch (err) {
        showToast(err.message || 'Failed to record return', 'error');
      } finally {
        setReturningLogId(null);
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!equipmentList.length) {
      alert('No equipment items to export.');
      return;
    }
    const headers = ['Discipline', 'Item Name', 'Total Units', 'New Stock Units', 'Old Stock Units', 'Stock Type', 'Available in Store', 'On Loan', 'Condition', 'Location', 'Notes'];
    const rows = (equipmentList || []).map(item => {
      const m = itemLoansMap[item.id] || { totalUnits: 0, availableUnits: 0, loanedUnits: 0, newQty: 0, oldQty: 0, stockType: 'old' };
      return [
        `"${(item.category || '').replace(/"/g, '""')}"`,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        m.totalUnits,
        m.newQty,
        m.oldQty,
        `"${m.stockType === 'new' ? 'New Stock' : (m.stockType === 'mixed' ? 'Mixed' : 'Old Stock')}"`,
        m.availableUnits,
        m.loanedUnits,
        `"${(item.condition || '').replace(/"/g, '""')}"`,
        `"${(item.location || '').replace(/"/g, '""')}"`,
        `"${(item.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aahwan_Sports_Inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-3 text-slate-800 text-xs">
      
      {/* Toast Notification */}
      {toastNotification && (
        <div className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 text-xs font-bold transition shadow-xs animate-in fade-in ${
          toastNotification.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-1.5">
            {toastNotification.type === 'error' ? (
              <AlertTriangle size={14} className="text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            )}
            <span>{toastNotification.text}</span>
          </div>
          <button 
            type="button"
            onClick={() => setToastNotification(null)}
            className="p-1 hover:bg-black/5 rounded cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* 1. COMPACT PREMIUM HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Package size={15} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              Sports Stock Inventory
              <span className="text-[0.65rem] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {disciplines.length} Disciplines • {equipmentList.length} Items
              </span>
            </h2>
            <p className="text-[0.65rem] text-slate-500 font-medium">
              Categorized gear roster with New Stock vs Old Stock tracking
            </p>
          </div>
        </div>

        {/* Compact Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Add Sports Discipline Button */}
          <button
            onClick={() => setShowAddDisciplineModal(true)}
            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 flex items-center gap-1 transition cursor-pointer active:scale-95 shadow-2xs"
            title="Create a new sports discipline"
          >
            <Trophy size={12} className="text-indigo-600" />
            <span>+ Discipline</span>
          </button>

          {/* Cloud Sync Button */}
          <button
            onClick={async () => {
              if (refreshCloudData) {
                setIsRefreshing(true);
                await refreshCloudData();
                setTimeout(() => setIsRefreshing(false), 500);
              }
            }}
            disabled={isRefreshing || cloudSyncStatus === 'syncing'}
            className="p-1.5 sm:px-2 sm:py-1 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
            title="Sync latest inventory with Supabase cloud"
          >
            <RefreshCw size={12} className={isRefreshing || cloudSyncStatus === 'syncing' ? 'animate-spin text-blue-600' : 'text-slate-500'} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="p-1.5 sm:px-2 sm:py-1 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1 transition cursor-pointer"
            title="Download CSV"
          >
            <Download size={12} className="text-emerald-600" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* Add Equipment Item Button */}
          <button
            onClick={() => openAddModal(selectedCategory !== 'all' ? selectedCategory : 'Cricket')}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer ml-auto sm:ml-0"
          >
            <Plus size={13} />
            <span>Add Gear</span>
          </button>
        </div>
      </div>

      {/* 2. SLEEK COMPACT METRIC PILL STRIP (Includes New Stock & Old Stock) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[0.68rem] font-bold">
        {/* All Items Pill */}
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white shadow-2xs font-black'
              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          <span>All Gear</span>
          <span className={`px-1 py-0.2 rounded text-[0.62rem] font-mono ${
            statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {totalUnitsCount} units
          </span>
        </button>

        {/* New Stock Pill */}
        <button
          onClick={() => setStatusFilter(prev => prev === 'new_stock' ? 'all' : 'new_stock')}
          className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
            statusFilter === 'new_stock'
              ? 'bg-cyan-600 text-white shadow-2xs font-black'
              : 'bg-white hover:bg-cyan-50/60 text-cyan-800 border border-cyan-200'
          }`}
          title="Filter newly purchased / brand new equipment"
        >
          <Sparkles size={11} className={statusFilter === 'new_stock' ? 'text-white' : 'text-cyan-600'} />
          <span>New Stock</span>
          <span className={`px-1 py-0.2 rounded text-[0.62rem] font-mono font-bold ${
            statusFilter === 'new_stock' ? 'bg-white/20 text-white' : 'bg-cyan-100 text-cyan-900'
          }`}>
            {totalNewStockUnits}
          </span>
        </button>

        {/* Old Stock Pill */}
        <button
          onClick={() => setStatusFilter(prev => prev === 'old_stock' ? 'all' : 'old_stock')}
          className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
            statusFilter === 'old_stock'
              ? 'bg-slate-700 text-white shadow-2xs font-black'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
          title="Filter existing / practice stock from previous sessions"
        >
          <Box size={11} className={statusFilter === 'old_stock' ? 'text-white' : 'text-slate-500'} />
          <span>Old Stock</span>
          <span className={`px-1 py-0.2 rounded text-[0.62rem] font-mono font-bold ${
            statusFilter === 'old_stock' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {totalOldStockUnits}
          </span>
        </button>

        {/* Ready In Store Pill */}
        <button
          onClick={() => setStatusFilter(prev => prev === 'available' ? 'all' : 'available')}
          className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
            statusFilter === 'available'
              ? 'bg-emerald-600 text-white shadow-2xs font-black'
              : 'bg-white hover:bg-emerald-50/50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>In Store</span>
          <span className={`px-1 py-0.2 rounded text-[0.62rem] font-mono font-bold ${
            statusFilter === 'available' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {totalAvailableCount}
          </span>
        </button>

        {/* On Loan Pill */}
        <button
          onClick={() => setStatusFilter(prev => prev === 'loaned' ? 'all' : 'loaned')}
          className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
            statusFilter === 'loaned'
              ? 'bg-amber-600 text-white shadow-2xs font-black'
              : 'bg-white hover:bg-amber-50/50 text-amber-800 border border-amber-200'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>On Loan</span>
          <span className={`px-1 py-0.2 rounded text-[0.62rem] font-mono font-bold ${
            statusFilter === 'loaned' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            {totalLoanedCount}
          </span>
        </button>

        {/* Low Stock Alert Pill */}
        {lowStockCount > 0 && (
          <button
            onClick={() => setStatusFilter(prev => prev === 'low' ? 'all' : 'low')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              statusFilter === 'low'
                ? 'bg-rose-600 text-white shadow-2xs font-black'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <AlertTriangle size={11} className={statusFilter === 'low' ? 'text-white' : 'text-rose-600'} />
            <span>Low Stock</span>
            <span className={`px-1 py-0.2 rounded text-[0.62rem] font-mono font-bold ${
              statusFilter === 'low' ? 'bg-white/20 text-white' : 'bg-rose-200/80 text-rose-900'
            }`}>
              {lowStockCount}
            </span>
          </button>
        )}
      </div>

      {/* 3. SPORTS DISCIPLINE TABS & SEARCH BAR */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search gear by name, storage room, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-7 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition placeholder:text-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={11} />
              </button>
            )}
          </div>

          {/* Compact Sort Selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-[0.68rem] text-slate-700 shrink-0">
            <ArrowUpDown size={11} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="qty-desc">Stock (High-Low)</option>
              <option value="qty-asc">Stock (Low-High)</option>
            </select>
          </div>
        </div>

        {/* Scrollable Discipline Selector Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[0.68rem]">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer flex items-center gap-1 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white font-black shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>🏆 All Sports</span>
            <span className={`px-1 py-0.1 rounded text-[0.6rem] font-bold ${
              selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {equipmentList.length}
            </span>
          </button>

          {disciplines.map(d => {
            const count = (equipmentList || []).filter(e => (e.category || 'General').toLowerCase().trim() === d.name.toLowerCase().trim()).length;
            const isSelected = selectedCategory.toLowerCase().trim() === d.name.toLowerCase().trim();

            return (
              <button
                key={d.id || d.name}
                onClick={() => setSelectedCategory(d.name)}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{d.icon}</span>
                <span>{d.name}</span>
                <span className={`px-1 py-0.1 rounded text-[0.58rem] font-mono font-bold ${
                  isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          {/* Quick Add Discipline Button at the end of the tabs */}
          <button
            onClick={() => setShowAddDisciplineModal(true)}
            className="px-2 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer border border-dashed border-indigo-300 text-indigo-700 hover:bg-indigo-50 flex items-center gap-1"
            title="Add a new sport discipline"
          >
            <Plus size={11} />
            <span>Add Discipline</span>
          </button>
        </div>
      </div>

      {/* 4. DISCIPLINE-GROUPED STOCKS DISPLAY */}
      {groupedEquipment.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-2">
          <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
            <Package size={20} />
          </div>
          <h4 className="font-bold text-slate-900 text-xs">No matching sports equipment found</h4>
          <p className="text-[0.68rem] text-slate-500 max-w-xs mx-auto">
            {searchTerm || selectedCategory !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search query, status, or discipline filter.'
              : 'No equipment items recorded yet. Click "Add Gear" to stock inventory.'}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setStatusFilter('all');
            }}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedEquipment.map(group => {
            const { discipline, items, totalUnits, availableUnits, loanedUnits, newUnits, oldUnits } = group;

            return (
              <div 
                key={discipline.id || discipline.name}
                className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs transition hover:border-slate-300"
              >
                {/* Discipline Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-3 py-2 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{discipline.icon || '🏆'}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-xs text-white tracking-tight">
                          {discipline.name}
                        </h3>
                        <span className="px-1.5 py-0.2 rounded-full text-[0.58rem] font-bold bg-white/20 text-slate-200 font-mono">
                          {items.length} {items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Discipline Mini Stats & Quick Add */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[0.62rem] font-mono flex-wrap">
                      {newUnits > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          ✨ {newUnits} new
                        </span>
                      )}
                      {oldUnits > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300 border border-slate-600">
                          📦 {oldUnits} old
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {availableUnits} in store
                      </span>
                      {loanedUnits > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {loanedUnits} on loan
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => openAddModal(discipline.name)}
                      className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[0.65rem] rounded-md transition flex items-center gap-0.5 cursor-pointer active:scale-95 shadow-2xs"
                      title={`Add new equipment gear to ${discipline.name}`}
                    >
                      <Plus size={11} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Items in this Discipline */}
                {items.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-[0.7rem] bg-slate-50/50">
                    <span>No equipment items registered under {discipline.name} yet.</span>{' '}
                    <button
                      onClick={() => openAddModal(discipline.name)}
                      className="text-amber-600 font-bold hover:underline cursor-pointer ml-1"
                    >
                      + Add first item
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-[0.6rem] font-black tracking-wider border-b border-slate-100">
                          <tr>
                            <th className="py-2 px-3">Equipment Item</th>
                            <th className="py-2 px-2.5 w-32">Stock Classification</th>
                            <th className="py-2 px-2.5 w-24">Condition</th>
                            <th className="py-2 px-2.5 w-16 text-center">Total</th>
                            <th className="py-2 px-2.5 w-20 text-center">In Store</th>
                            <th className="py-2 px-2.5 w-20 text-center">On Loan</th>
                            <th className="py-2 px-3 w-36 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {items.map(item => {
                            const m = itemLoansMap[item.id] || { totalUnits: 0, availableUnits: 0, loanedUnits: 0, newQty: 0, oldQty: 0, stockType: 'old' };
                            const isLow = m.availableUnits <= 2;
                            const isOut = m.availableUnits === 0;

                            return (
                              <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                {/* Name & Location */}
                                <td className="py-2 px-3">
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-slate-900 text-xs block">{item.name}</span>
                                    <div className="flex items-center gap-1 text-[0.62rem] text-slate-400">
                                      <MapPin size={9} />
                                      <span>{item.location || 'Main Sports Store'}</span>
                                      {item.notes && (
                                        <>
                                          <span>•</span>
                                          <span className="truncate max-w-xs italic text-slate-500">{item.notes}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Stock Classification (New Stock vs Old Stock) */}
                                <td className="py-2 px-2.5">
                                  {m.newQty > 0 && m.oldQty > 0 ? (
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className="px-1.5 py-0.2 rounded text-[0.58rem] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                                        ✨ {m.newQty} New
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded text-[0.58rem] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                        📦 {m.oldQty} Old
                                      </span>
                                    </div>
                                  ) : m.stockType === 'new' || m.newQty > 0 ? (
                                    <span className="px-1.5 py-0.5 rounded text-[0.62rem] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 inline-flex items-center gap-1">
                                      <Sparkles size={10} className="text-cyan-600" />
                                      <span>New Stock</span>
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[0.62rem] font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
                                      <Box size={10} className="text-slate-500" />
                                      <span>Old Stock</span>
                                    </span>
                                  )}
                                </td>

                                {/* Condition */}
                                <td className="py-2 px-2.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[0.62rem] font-bold border inline-block ${
                                    item.condition === 'Brand New'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : item.condition === 'Fair / Used'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : item.condition === 'Needs Maintenance'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}>
                                    {item.condition || 'Good Condition'}
                                  </span>
                                </td>

                                {/* Total Units */}
                                <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-900 text-xs">
                                  {m.totalUnits}
                                </td>

                                {/* In Store Ready */}
                                <td className="py-2 px-2.5 text-center">
                                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs inline-block border ${
                                    isOut
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : isLow
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}>
                                    {m.availableUnits}
                                  </span>
                                </td>

                                {/* On Loan (Clickable) */}
                                <td className="py-2 px-2.5 text-center">
                                  {m.loanedUnits > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => setViewingLoansItem(item)}
                                      className="px-2 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-mono transition cursor-pointer"
                                      title="View active student borrowers"
                                    >
                                      <span>{m.loanedUnits}</span>
                                      <span className="text-[0.55rem] font-sans font-semibold uppercase">View</span>
                                    </button>
                                  ) : (
                                    <span className="text-slate-400 font-mono text-xs">0</span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="py-2 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    {/* Quick Issue */}
                                    <button
                                      disabled={m.availableUnits === 0}
                                      onClick={() => openQuickIssue(item)}
                                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-md text-[0.68rem] font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                                      title={m.availableUnits === 0 ? 'Out of stock' : 'Issue to student'}
                                    >
                                      <Plus size={11} />
                                      <span>Issue</span>
                                    </button>

                                    {/* Edit */}
                                    <button
                                      onClick={() => openEditModal(item)}
                                      className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                                      title="Edit gear"
                                    >
                                      <Edit2 size={12} />
                                    </button>

                                    {/* Delete */}
                                    <button
                                      disabled={deletingItemId === item.id}
                                      onClick={() => handleDeleteItem(item)}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer disabled:opacity-50"
                                      title="Delete gear permanently"
                                    >
                                      {deletingItemId === item.id ? (
                                        <Loader2 size={12} className="animate-spin text-rose-600" />
                                      ) : (
                                        <Trash2 size={12} />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Compact Cards View (< md) */}
                    <div className="block md:hidden divide-y divide-slate-100 p-2 space-y-2">
                      {items.map(item => {
                        const m = itemLoansMap[item.id] || { totalUnits: 0, availableUnits: 0, loanedUnits: 0, newQty: 0, oldQty: 0, stockType: 'old' };
                        const isLow = m.availableUnits <= 2;
                        const isOut = m.availableUnits === 0;

                        return (
                          <div key={item.id} className="pt-2 first:pt-0 space-y-1.5">
                            <div className="flex items-start justify-between gap-1.5">
                              <div>
                                <h4 className="font-bold text-slate-900 text-xs">{item.name}</h4>
                                <div className="flex items-center gap-1 text-[0.6rem] text-slate-400">
                                  <MapPin size={9} />
                                  <span>{item.location || 'Main Sports Store'}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {m.stockType === 'new' || m.newQty > 0 ? (
                                  <span className="px-1.5 py-0.2 rounded text-[0.58rem] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                                    ✨ New
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded text-[0.58rem] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                    📦 Old
                                  </span>
                                )}
                                <span className="px-1.5 py-0.2 rounded text-[0.58rem] font-bold border bg-slate-50 text-slate-700">
                                  {item.condition || 'Good'}
                                </span>
                              </div>
                            </div>

                            {/* 3-Column Stats Row */}
                            <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg text-center font-mono text-xs">
                              <div>
                                <span className="text-[0.58rem] font-bold uppercase text-slate-400 block">Total</span>
                                <span className="font-bold text-slate-900">{m.totalUnits}</span>
                              </div>
                              <div className="border-x border-slate-200 px-3">
                                <span className="text-[0.58rem] font-bold uppercase text-emerald-700 block">In Store</span>
                                <span className={`font-black ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-700'}`}>
                                  {m.availableUnits}
                                </span>
                              </div>
                              <div>
                                <span className="text-[0.58rem] font-bold uppercase text-amber-800 block">On Loan</span>
                                <span className="font-bold text-amber-800">{m.loanedUnits}</span>
                              </div>
                            </div>

                            {/* Mobile Actions */}
                            <div className="flex items-center justify-between pt-0.5">
                              <div className="flex items-center gap-1">
                                {m.loanedUnits > 0 && (
                                  <button
                                    onClick={() => setViewingLoansItem(item)}
                                    className="px-2 py-0.5 text-[0.62rem] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded cursor-pointer"
                                  >
                                    View Loans ({m.loanedUnits})
                                  </button>
                                )}
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="p-1 text-slate-500 hover:text-blue-600 bg-slate-100 rounded cursor-pointer"
                                >
                                  <Edit2 size={11} />
                                </button>
                                <button
                                  disabled={deletingItemId === item.id}
                                  onClick={() => handleDeleteItem(item)}
                                  className="p-1 text-slate-400 hover:text-rose-600 bg-slate-100 rounded cursor-pointer"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>

                              <button
                                disabled={m.availableUnits === 0}
                                onClick={() => openQuickIssue(item)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-[0.68rem] rounded-md transition flex items-center gap-1 active:scale-95 shadow-2xs cursor-pointer"
                              >
                                <Plus size={11} />
                                <span>Issue</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT EQUIPMENT (Includes New Stock vs Old Stock Options) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-3 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-3 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Package size={15} />
                </div>
                <h3 className="font-black text-slate-900 text-xs">
                  {editingItem ? 'Edit Equipment Gear' : 'Add Equipment Gear'}
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-2.5 text-xs font-semibold">
              {/* Item Name */}
              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-700 mb-0.5">
                  Equipment Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Match Footballs, SS Cricket Bats"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Sports Discipline Selection */}
              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-700 mb-0.5">
                  Sports Discipline *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowAddModal(false);
                      setShowAddDisciplineModal(true);
                    } else {
                      setFormData({ ...formData, category: e.target.value });
                    }
                  }}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {disciplines.map(d => (
                    <option key={d.id || d.name} value={d.name}>
                      {d.icon} {d.name}
                    </option>
                  ))}
                  <option value="__add_new__">+ Add New Discipline...</option>
                </select>
              </div>

              {/* NEW STOCK VS OLD STOCK OPTION SELECTOR */}
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-[0.65rem] uppercase font-black text-slate-700">
                  Stock Category / Origin *
                </label>
                
                {/* 3-Way Segmented Control */}
                <div className="grid grid-cols-3 gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[0.65rem] font-bold">
                  <button
                    type="button"
                    onClick={() => handleStockTypeChange('new')}
                    className={`py-1 rounded-md transition flex items-center justify-center gap-1 cursor-pointer ${
                      formData.stockType === 'new'
                        ? 'bg-cyan-600 text-white font-black shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles size={11} />
                    <span>New Stock</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStockTypeChange('old')}
                    className={`py-1 rounded-md transition flex items-center justify-center gap-1 cursor-pointer ${
                      formData.stockType === 'old'
                        ? 'bg-slate-800 text-white font-black shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Box size={11} />
                    <span>Old Stock</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStockTypeChange('mixed')}
                    className={`py-1 rounded-md transition flex items-center justify-center gap-1 cursor-pointer ${
                      formData.stockType === 'mixed'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers size={11} />
                    <span>Mixed</span>
                  </button>
                </div>

                {/* Stock Breakdown Inputs (New vs Old Units) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[0.6rem] uppercase font-bold text-cyan-800 mb-0.5">
                      ✨ New Stock Units
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.newQty}
                      onChange={(e) => handleQtyBreakdownChange('newQty', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-cyan-300 rounded-md text-slate-900 font-mono font-bold text-center focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.6rem] uppercase font-bold text-slate-600 mb-0.5">
                      📦 Old Stock Units
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.oldQty}
                      onChange={(e) => handleQtyBreakdownChange('oldQty', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md text-slate-900 font-mono font-bold text-center focus:outline-none focus:border-slate-500"
                    />
                  </div>
                </div>

                <div className="text-right text-[0.65rem] font-bold text-slate-600 pt-0.5">
                  Total Units:{' '}
                  <span className="font-mono font-black text-slate-900 text-xs">
                    {(Number(formData.newQty) || 0) + (Number(formData.oldQty) || 0)}
                  </span>
                </div>
              </div>

              {/* Condition & Location */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-700 mb-0.5">
                    Physical Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {CONDITION_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-700 mb-0.5">
                    Storage Room
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Store Box 1"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-700 mb-0.5">
                  Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SS English Willow, SG Red Leather, Purchase Batch 2026"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-black text-xs shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-slate-950" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={13} />
                      <span>{editingItem ? 'Save Changes' : 'Add to Inventory'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD SPORTS DISCIPLINE */}
      {showAddDisciplineModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-3 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full shadow-2xl space-y-3 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Trophy size={15} />
                </div>
                <h3 className="font-black text-slate-900 text-xs">
                  Add New Sports Discipline
                </h3>
              </div>
              <button 
                onClick={() => setShowAddDisciplineModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddDiscipline} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-700 mb-1">
                  Discipline Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basketball, Lawn Tennis, Hockey, Archery"
                  value={newDisciplineName}
                  onChange={(e) => setNewDisciplineName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-700 mb-1">
                  Choose Discipline Icon / Emoji
                </label>
                <div className="grid grid-cols-5 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
                  {EMOJI_OPTIONS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewDisciplineIcon(em)}
                      className={`h-8 text-base rounded-lg flex items-center justify-center transition cursor-pointer ${
                        newDisciplineIcon === em
                          ? 'bg-indigo-600 text-white shadow-xs scale-105'
                          : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-800'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDisciplineModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-black text-xs shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <Plus size={13} />
                  <span>Create Discipline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: QUICK ISSUE GEAR TO STUDENT */}
      {quickIssueItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-3 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-3 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <User size={13} className="text-emerald-600" />
                  <span>Issue Gear to Student</span>
                </h3>
                <p className="text-[0.65rem] text-slate-500 mt-0.5">
                  {quickIssueItem.name} • Available:{' '}
                  <strong className="text-emerald-700">
                    {(itemLoansMap[quickIssueItem.id]?.availableUnits ?? 0)} units
                  </strong>
                </p>
              </div>
              <button 
                onClick={() => setQuickIssueItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleQuickIssueSubmit} className="space-y-2.5 text-xs font-semibold">
              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-700 mb-0.5">
                  Borrower Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swagat Parida"
                  value={quickIssueData.borrowerName}
                  onChange={(e) => setQuickIssueData({ ...quickIssueData, borrowerName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-700 mb-0.5">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2201105012"
                    value={quickIssueData.rollNo}
                    onChange={(e) => setQuickIssueData({ ...quickIssueData, rollNo: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-700 mb-0.5">
                    Branch *
                  </label>
                  <select
                    value={quickIssueData.branch}
                    onChange={(e) => setQuickIssueData({ ...quickIssueData, branch: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Computer Science & Engg (CSE)">CSE</option>
                    <option value="Electrical Engineering (EE)">EE</option>
                    <option value="Mechanical Engineering (ME)">ME</option>
                    <option value="Civil Engineering (CE)">CE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-700 mb-0.5">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={quickIssueData.borrowerPhone}
                    onChange={(e) => setQuickIssueData({ ...quickIssueData, borrowerPhone: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[0.65rem] uppercase font-black text-slate-700 mb-0.5">
                    Units to Issue *
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQuickIssueData(prev => ({ ...prev, qty: Math.max(1, Number(prev.qty) - 1) }))}
                      className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-black cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={itemLoansMap[quickIssueItem.id]?.availableUnits ?? 1}
                      required
                      value={quickIssueData.qty}
                      onChange={(e) => setQuickIssueData({ ...quickIssueData, qty: Number(e.target.value) })}
                      className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-black text-center focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setQuickIssueData(prev => ({ 
                        ...prev, 
                        qty: Math.min(itemLoansMap[quickIssueItem.id]?.availableUnits ?? 1, Number(prev.qty) + 1) 
                      }))}
                      className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-black cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Stock Origin Selection (New Stock vs Old Stock) */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[0.65rem] uppercase font-black text-slate-700">
                    Stock Origin to Issue *
                  </label>
                  {quickIssueItem && (
                    <span className="text-[0.6rem] text-slate-500 font-mono">
                      ✨ {itemLoansMap[quickIssueItem.id]?.newQty || 0} new • 📦 {itemLoansMap[quickIssueItem.id]?.oldQty || 0} old
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200 text-[0.65rem] font-bold">
                  <button
                    type="button"
                    onClick={() => setQuickIssueData(prev => ({ ...prev, stockType: 'new' }))}
                    className={`py-1 rounded-md transition flex items-center justify-center gap-1 cursor-pointer ${
                      quickIssueData.stockType === 'new'
                        ? 'bg-cyan-600 text-white font-black shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles size={11} />
                    <span>✨ New Stock</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickIssueData(prev => ({ ...prev, stockType: 'old' }))}
                    className={`py-1 rounded-md transition flex items-center justify-center gap-1 cursor-pointer ${
                      quickIssueData.stockType === 'old'
                        ? 'bg-slate-800 text-white font-black shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Box size={11} />
                    <span>📦 Old Stock</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase font-black text-slate-700 mb-0.5">
                  Expected Return
                </label>
                <input
                  type="text"
                  placeholder="e.g. Today 5:00 PM"
                  value={quickIssueData.expectedReturn}
                  onChange={(e) => setQuickIssueData({ ...quickIssueData, expectedReturn: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickIssueItem(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuickIssue}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-xs shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingQuickIssue ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-white" />
                      <span>Issuing...</span>
                    </>
                  ) : (
                    <>
                      <Check size={13} />
                      <span>Confirm Issue ({quickIssueData.qty})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ACTIVE BORROWERS LIST */}
      {viewingLoansItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-3 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-3 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <Clock size={13} className="text-amber-600" />
                  <span>Active Loans: {viewingLoansItem.name}</span>
                </h3>
                <p className="text-[0.62rem] text-slate-500 mt-0.5">
                  Currently out:{' '}
                  <strong className="text-amber-800">
                    {(itemLoansMap[viewingLoansItem.id]?.loanedUnits ?? 0)} units
                  </strong>
                </p>
              </div>
              <button 
                onClick={() => setViewingLoansItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-1.5">
              {(itemLoansMap[viewingLoansItem.id]?.loans || []).length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No active student loans for this item.
                </div>
              ) : (
                (itemLoansMap[viewingLoansItem.id]?.loans || []).map(log => (
                  <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{log.borrowerName}</div>
                        <div className="text-[0.62rem] text-slate-500 font-mono">
                          Roll: {log.rollNo} • {log.branch}
                        </div>
                      </div>
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-black text-xs font-mono shrink-0">
                        {log.qty} unit{log.qty > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[0.62rem]">
                      <span className="text-slate-400">{log.issueDate}</span>
                      <button
                        type="button"
                        disabled={returningLogId === log.id}
                        onClick={() => handleReturnFromModal(log, viewingLoansItem.name)}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded transition cursor-pointer flex items-center gap-1 active:scale-95"
                      >
                        {returningLogId === log.id ? (
                          <Loader2 size={10} className="animate-spin text-white" />
                        ) : (
                          <Check size={10} />
                        )}
                        <span>Accept Return</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingLoansItem(null)}
                className="px-3 py-1 bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
