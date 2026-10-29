import React, { useState, useMemo } from 'react';
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
  Sparkles,
  Calendar,
  CalendarCheck,
  CalendarClock,
  Download,
  Eye,
  Trash2,
  Phone,
  FileSpreadsheet,
  Info,
  CheckCircle,
  Clock4,
  History,
  Timer,
  RefreshCw,
  Database,
  Loader2
} from 'lucide-react';

// Date utility helpers
const parseLogDate = (dateStr) => {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const formatDisplayDateTime = (dateStr) => {
  if (!dateStr) return '—';
  // If already standard formatted like "17 Oct 2026, 09:30 AM", return directly
  if (typeof dateStr === 'string' && /^[0-9]{1,2}\s+[A-Za-z]{3}\s+[0-9]{4}/.test(dateStr)) {
    return dateStr;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ', ' + d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  return dateStr;
};

const getNowDateTimeLocal = (offsetHours = 0) => {
  const d = new Date();
  if (offsetHours) d.setHours(d.getHours() + offsetHours);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

const dateTimeLocalToDisplay = (val) => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ', ' + d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const calculateLoanDuration = (issueDateStr, returnDateStr) => {
  const start = parseLogDate(issueDateStr);
  const end = returnDateStr ? parseLogDate(returnDateStr) : new Date();
  
  if (!start || !end) return null;
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return 'Just issued';
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    const remHours = diffHours % 24;
    return `${diffDays}d ${remHours > 0 ? `${remHours}h` : ''}`.trim();
  }
  if (diffHours > 0) {
    const remMins = diffMins % 60;
    return `${diffHours}h ${remMins > 0 ? `${remMins}m` : ''}`.trim();
  }
  return `${Math.max(1, diffMins)}m`;
};

const checkIsOverdue = (log) => {
  if (log.status !== 'issued' || !log.expectedReturn) return false;
  const exp = parseLogDate(log.expectedReturnTimestamp || log.expectedReturn);
  if (!exp) return false;
  return new Date().getTime() > exp.getTime();
};

export default function EquipmentIssueReturnTab({ setActiveTab }) {
  const { 
    equipmentList, 
    equipmentLogs, 
    issueEquipment, 
    returnEquipment,
    deleteEquipmentLog,
    refreshCloudData,
    cloudSyncStatus,
    lastSyncedTime
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'issued', 'returned', 'overdue'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [modalSportCategory, setModalSportCategory] = useState('all');
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [isDeletingLogId, setIsDeletingLogId] = useState(null);
  
  // Issue Form State
  const [issueData, setIssueData] = useState({
    equipmentId: '',
    borrowerName: '',
    rollNo: '',
    branch: 'Computer Science & Engg (CSE)',
    borrowerPhone: '',
    qty: 1,
    stockType: 'old',
    issueDateLocal: getNowDateTimeLocal(0),
    expectedReturnLocal: getNowDateTimeLocal(4), // default 4 hours loan
    purpose: 'Practice Match & Training',
    issueCondition: 'Good Condition',
    notes: ''
  });

  // Return Modal State
  const [returnLog, setReturnLog] = useState(null);
  const [returnQty, setReturnQty] = useState(1);
  const [returnDateLocal, setReturnDateLocal] = useState(getNowDateTimeLocal(0));
  const [returnCondition, setReturnCondition] = useState('Good Condition');
  const [returnNotes, setReturnNotes] = useState('');

  // Dossier Modal State (inspect detailed record)
  const [dossierLog, setDossierLog] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastNotification({ text, type });
    setTimeout(() => {
      setToastNotification(prev => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Auto-fetch fresh equipment data directly from database on mount and poll every 60s
  React.useEffect(() => {
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
      if (refreshCloudData && !isRefreshing && !showIssueModal && !returnLog) {
        refreshCloudData();
      }
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [showIssueModal, returnLog]);

  // Available sport categories from equipmentList
  const sportCategories = useMemo(() => {
    return Array.from(new Set(equipmentList.map(e => e.category || 'General')));
  }, [equipmentList]);

  // Filtered equipment list inside Issue Modal
  const filteredModalEquipment = useMemo(() => {
    return equipmentList.filter(item => {
      return modalSportCategory === 'all' || item.category === modalSportCategory;
    });
  }, [equipmentList, modalSportCategory]);

  // Active and Returned logs
  const activeIssuedLogs = useMemo(() => {
    return equipmentLogs.filter(log => log.status === 'issued');
  }, [equipmentLogs]);

  const returnedLogs = useMemo(() => {
    return equipmentLogs.filter(log => log.status === 'returned');
  }, [equipmentLogs]);

  const overdueLogs = useMemo(() => {
    return activeIssuedLogs.filter(log => checkIsOverdue(log));
  }, [activeIssuedLogs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return equipmentLogs.filter(log => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || 
        (log.borrowerName || '').toLowerCase().includes(q) ||
        (log.rollNo || '').toLowerCase().includes(q) ||
        (log.equipmentName || '').toLowerCase().includes(q) ||
        (log.branch || '').toLowerCase().includes(q) ||
        (log.borrowerPhone || '').toLowerCase().includes(q) ||
        (log.id || '').toLowerCase().includes(q);

      const isOverdue = checkIsOverdue(log);

      let matchesStatus = true;
      if (statusFilter === 'issued') matchesStatus = log.status === 'issued';
      else if (statusFilter === 'returned') matchesStatus = log.status === 'returned';
      else if (statusFilter === 'overdue') matchesStatus = isOverdue;

      const matchesCat = categoryFilter === 'all' || log.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [equipmentLogs, searchTerm, statusFilter, categoryFilter]);

  // Handle Issue Submit
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueData.equipmentId || !issueData.borrowerName || !issueData.rollNo) return;

    const targetEquip = equipmentList.find(e => e.id === issueData.equipmentId);
    if (!targetEquip) return;

    const issuedUnitsForThis = activeIssuedLogs
      .filter(l => 
        (l.equipmentId || l.equipment_id) === targetEquip.id || 
        (l.equipmentName && targetEquip.name && l.equipmentName.toLowerCase().trim() === targetEquip.name.toLowerCase().trim())
      )
      .reduce((a, b) => a + (Number(b.qty) || 0), 0);
    const totalUnits = Number(targetEquip.totalQty !== undefined ? targetEquip.totalQty : targetEquip.total_qty) || 0;
    const availableForThis = Math.max(0, totalUnits - issuedUnitsForThis);

    if (Number(issueData.qty) > availableForThis) {
      alert(`Cannot issue ${issueData.qty} units. Only ${availableForThis} available in store stock!`);
      return;
    }

    const formattedIssueDate = dateTimeLocalToDisplay(issueData.issueDateLocal);
    const formattedExpectedReturn = dateTimeLocalToDisplay(issueData.expectedReturnLocal);

    setIsSubmittingIssue(true);
    try {
      await issueEquipment({
        equipmentId: targetEquip.id,
        equipmentName: targetEquip.name,
        category: targetEquip.category || 'General',
        borrowerName: issueData.borrowerName,
        rollNo: issueData.rollNo,
        branch: issueData.branch,
        borrowerPhone: issueData.borrowerPhone,
        qty: Number(issueData.qty),
        stockType: issueData.stockType || 'old',
        issueDate: formattedIssueDate,
        issueTimestamp: issueData.issueDateLocal ? new Date(issueData.issueDateLocal).toISOString() : new Date().toISOString(),
        expectedReturn: formattedExpectedReturn,
        expectedReturnTimestamp: issueData.expectedReturnLocal ? new Date(issueData.expectedReturnLocal).toISOString() : '',
        purpose: issueData.purpose,
        issueCondition: issueData.issueCondition,
        notes: issueData.notes
      });
      showToast(`✓ Successfully issued ${issueData.qty}x ${targetEquip.name} (${issueData.stockType === 'new' ? '✨ New Stock' : '📦 Old Stock'}) to ${issueData.borrowerName}. Synced to database.`);
      setIssueData({
        equipmentId: '',
        borrowerName: '',
        rollNo: '',
        branch: 'Computer Science & Engg (CSE)',
        borrowerPhone: '',
        qty: 1,
        stockType: 'old',
        issueDateLocal: getNowDateTimeLocal(0),
        expectedReturnLocal: getNowDateTimeLocal(4),
        purpose: 'Practice Match & Training',
        issueCondition: 'Good Condition',
        notes: ''
      });
      setShowIssueModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to issue equipment', 'error');
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  // Open Return Modal
  const openReturnModal = (log) => {
    setReturnLog(log);
    setReturnQty(Number(log.qty) || 1);
    setReturnDateLocal(getNowDateTimeLocal(0));
    setReturnCondition('Good Condition');
    setReturnNotes('');
  };

  // Confirm Return
  const handleReturnConfirm = async () => {
    if (!returnLog) return;
    const formattedReturnDate = dateTimeLocalToDisplay(returnDateLocal);
    setIsSubmittingReturn(true);
    try {
      await returnEquipment(
        returnLog.id, 
        returnCondition, 
        returnNotes, 
        Number(returnQty), 
        formattedReturnDate
      );
      showToast(`✓ Return marked for ${returnLog.equipmentName} (${returnLog.borrowerName}). Synced to database.`);
      setReturnLog(null);
    } catch (err) {
      showToast(err.message || 'Failed to register return', 'error');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // Delete Log
  const handleDeleteLog = async (logId) => {
    if (!logId) return;
    const confirmed = window.confirm(`Permanently delete loan record #${logId} from the register?`);
    if (!confirmed) return;

    setIsDeletingLogId(logId);
    try {
      if (deleteEquipmentLog) {
        await deleteEquipmentLog(logId);
        if (dossierLog && String(dossierLog.id) === String(logId)) {
          setDossierLog(null);
        }
        showToast(`✓ Record #${logId} permanently removed and synced to database.`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete record', 'error');
    } finally {
      setIsDeletingLogId(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Log ID',
      'Equipment Item',
      'Stock Origin',
      'Category',
      'Borrower Student',
      'Roll Number',
      'Branch',
      'Contact Phone',
      'Quantity Issued',
      'Quantity Returned',
      'Loan Status',
      'Issue Date & Time',
      'Expected Return Date & Time',
      'Actual Return Date & Time',
      'Loan Duration',
      'Condition at Issue',
      'Condition at Return',
      'Purpose / Fixture',
      'Remarks'
    ];

    const rows = equipmentLogs.map(log => {
      const dur = calculateLoanDuration(log.issueTimestamp || log.issueDate, log.returnTimestamp || log.returnDate) || '—';
      const isOver = checkIsOverdue(log);
      const statusLabel = log.status === 'issued' ? (isOver ? 'Overdue' : 'On Loan') : 'Returned & Cleared';

      return [
        log.id || '',
        `"${(log.equipmentName || '').replace(/"/g, '""')}"`,
        `"${log.stockType === 'new' ? 'New Stock' : 'Old Stock'}"`,
        `"${(log.category || '').replace(/"/g, '""')}"`,
        `"${(log.borrowerName || '').replace(/"/g, '""')}"`,
        `"${(log.rollNo || '').replace(/"/g, '""')}"`,
        `"${(log.branch || '').replace(/"/g, '""')}"`,
        `"${(log.borrowerPhone || '').replace(/"/g, '""')}"`,
        log.qty || 1,
        log.returnedCount || (log.status === 'returned' ? log.qty : 0),
        `"${statusLabel}"`,
        `"${(log.issueDate || '').replace(/"/g, '""')}"`,
        `"${(log.expectedReturn || '').replace(/"/g, '""')}"`,
        `"${(log.returnDate || '').replace(/"/g, '""')}"`,
        `"${dur}"`,
        `"${(log.issueCondition || 'Good Condition').replace(/"/g, '""')}"`,
        `"${(log.returnCondition || '').replace(/"/g, '""')}"`,
        `"${(log.purpose || '').replace(/"/g, '""')}"`,
        `"${(log.notes || log.returnNotes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AAHWAN_Equipment_Issue_Return_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none relative">
      
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
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
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
          onClick={() => setActiveTab && setActiveTab('equipment-stocks')}
          className="flex-1 py-2 px-2.5 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/70 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Package size={14} className="text-amber-500" />
          <span>Gear Inventory</span>
          <span className="px-1.5 py-0.2 rounded-full text-[0.6rem] font-bold bg-slate-200 text-slate-700">
            {equipmentList.length}
          </span>
        </button>

        <button
          type="button"
          className="flex-1 py-2 px-2.5 text-xs font-black rounded-lg bg-slate-900 text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-default"
        >
          <RotateCcw size={14} className="text-amber-400" />
          <span>Issue & Returns</span>
          <span className="px-1.5 py-0.2 rounded-full text-[0.6rem] font-black bg-amber-500 text-slate-950">
            {activeIssuedLogs.length > 0 ? activeIssuedLogs.length : equipmentLogs.length}
          </span>
        </button>
      </div>

      {/* HEADER & ACTION CONTROLS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
              <RotateCcw size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Issue & Return Register</span>
                  <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[0.6rem] font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                    Live Audit
                  </span>
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[0.62rem] font-bold">
                  <Database size={10} className="text-emerald-600" />
                  <span>Supabase Live</span>
                </span>
              </div>
              <p className="text-[0.7rem] font-semibold text-slate-500 mt-0.5">
                {lastSyncedTime ? `Synced at ${lastSyncedTime}` : 'Cloud Connected'} • Student accountability & return schedules.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={async () => {
              if (refreshCloudData) {
                setIsRefreshing(true);
                await refreshCloudData();
                setTimeout(() => setIsRefreshing(false), 600);
              }
            }}
            disabled={isRefreshing || cloudSyncStatus === 'syncing'}
            className="px-2.5 sm:px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Fetch fresh issue & return records from Supabase Database"
          >
            <RefreshCw size={13} className={isRefreshing || cloudSyncStatus === 'syncing' ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{isRefreshing || cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            title="Download CSV report of all issue and return records"
            className="px-2.5 sm:px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => {
              if (equipmentList.length > 0) {
                const first = equipmentList[0];
                const defSt = first.stockType === 'new' || (first.newQty > 0 && first.oldQty === 0) ? 'new' : 'old';
                setIssueData(prev => ({ 
                  ...prev, 
                  equipmentId: first.id,
                  stockType: defSt,
                  issueDateLocal: getNowDateTimeLocal(0),
                  expectedReturnLocal: getNowDateTimeLocal(4)
                }));
              }
              setShowIssueModal(true);
            }}
            className="flex-1 sm:flex-initial px-4 py-2 sm:py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <ArrowUpRight size={15} /> 
            <span>+ Issue Gear</span>
          </button>
        </div>
      </div>

      {/* MOBILE COMPACT STATS PILLS (< sm screens) */}
      <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <span>All</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[0.62rem] font-black ${
            statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
          }`}>
            {equipmentLogs.length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('issued')}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            statusFilter === 'issued'
              ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          <Clock size={12} className={statusFilter === 'issued' ? 'text-slate-950' : 'text-amber-600'} />
          <span>On Loan</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[0.62rem] font-black ${
            statusFilter === 'issued' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-200/60 text-amber-900'
          }`}>
            {activeIssuedLogs.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0)}u
          </span>
        </button>

        {overdueLogs.length > 0 && (
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
            }`}
          >
            <AlertTriangle size={12} className={statusFilter === 'overdue' ? 'text-white' : 'text-rose-600'} />
            <span>Overdue</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[0.62rem] font-black ${
              statusFilter === 'overdue' ? 'bg-white/20 text-white' : 'bg-rose-200/60 text-rose-900'
            }`}>
              {overdueLogs.length}
            </span>
          </button>
        )}

        <button
          onClick={() => setStatusFilter('returned')}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
            statusFilter === 'returned'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <CheckCircle2 size={12} className={statusFilter === 'returned' ? 'text-white' : 'text-emerald-600'} />
          <span>Cleared</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[0.62rem] font-black ${
            statusFilter === 'returned' ? 'bg-white/20 text-white' : 'bg-emerald-200/60 text-emerald-900'
          }`}>
            {returnedLogs.length}
          </span>
        </button>
      </div>

      {/* DESKTOP KPI METRIC CARDS (sm and up) */}
      <div className="hidden sm:grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[0.62rem] font-bold uppercase tracking-wider mb-0.5">
            <span>Total Loan Records</span>
            <History size={14} className="text-blue-500" />
          </div>
          <div className="text-xl font-black text-slate-900">{equipmentLogs.length}</div>
          <p className="text-[0.62rem] font-semibold text-slate-400 mt-0.5">Historical Student Transactions</p>
        </div>

        <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-[0.62rem] font-bold uppercase tracking-wider mb-0.5">
            <span>Currently On Loan</span>
            <Clock4 size={14} className="text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-600">
            {activeIssuedLogs.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0)}
            <span className="text-xs font-bold text-amber-700 ml-1 font-sans">
              units ({activeIssuedLogs.length} loans)
            </span>
          </div>
          <p className="text-[0.62rem] font-bold text-amber-600/80 mt-0.5">Active Student Holders</p>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-[0.62rem] font-bold uppercase tracking-wider mb-0.5">
            <span>Returned & Cleared</span>
            <CheckCircle2 size={14} className="text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600">{returnedLogs.length}</div>
          <p className="text-[0.62rem] font-bold text-emerald-600/80 mt-0.5">Checked Back to Sports Store</p>
        </div>

        <div className={`border rounded-xl p-3 shadow-2xs ${
          overdueLogs.length > 0 ? 'bg-rose-50/60 border-rose-300' : 'bg-slate-50 border-slate-200/80'
        }`}>
          <div className={`flex items-center justify-between text-[0.62rem] font-bold uppercase tracking-wider mb-0.5 ${
            overdueLogs.length > 0 ? 'text-rose-700' : 'text-slate-500'
          }`}>
            <span>Overdue Returns</span>
            <AlertTriangle size={14} className={overdueLogs.length > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'} />
          </div>
          <div className={`text-xl font-black ${overdueLogs.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {overdueLogs.length}
          </div>
          <p className={`text-[0.62rem] font-semibold mt-0.5 ${overdueLogs.length > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
            {overdueLogs.length > 0 ? 'Immediate Follow-up Required' : 'All Loans within Window'}
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH STRIP */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-50/90 border border-slate-200 rounded-xl p-2.5">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, roll number, equipment, phone, branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition placeholder:text-slate-400"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs & Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[0.68rem] font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({equipmentLogs.length})
            </button>
            <button
              onClick={() => setStatusFilter('issued')}
              className={`px-2.5 py-1 rounded-md text-[0.68rem] font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'issued' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              On Loan ({activeIssuedLogs.length})
            </button>
            <button
              onClick={() => setStatusFilter('returned')}
              className={`px-2.5 py-1 rounded-md text-[0.68rem] font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'returned' ? 'bg-emerald-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Returned ({returnedLogs.length})
            </button>
            {overdueLogs.length > 0 && (
              <button
                onClick={() => setStatusFilter('overdue')}
                className={`px-2.5 py-1 rounded-md text-[0.68rem] font-black transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  statusFilter === 'overdue' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-600 hover:bg-rose-50'
                }`}
              >
                <AlertTriangle size={11} /> Overdue ({overdueLogs.length})
              </button>
            )}
          </div>

          {/* Sport Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500 shadow-2xs"
          >
            <option value="all">All Sports</option>
            {sportCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* REGISTER TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {filteredLogs.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <RotateCcw size={22} />
            </div>
            <p className="text-xs font-bold text-slate-700">No equipment issue & return records found.</p>
            <p className="text-[0.68rem] font-semibold text-slate-400 mt-0.5">
              Try adjusting your search criteria or issue a new equipment item.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW (md and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white uppercase text-[0.62rem] font-black tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Log ID</th>
                    <th className="py-2.5 px-3">Equipment Item & Qty</th>
                    <th className="py-2.5 px-3">Borrower Student</th>
                    <th className="py-2.5 px-3 min-w-[170px]">
                      <div className="flex items-center gap-1 text-blue-300">
                        <Calendar size={12} />
                        <span>Issue Date & Time</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-3 min-w-[180px]">
                      <div className="flex items-center gap-1 text-emerald-300">
                        <CalendarCheck size={12} />
                        <span>Return Date & Status</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-3 text-center">Duration</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredLogs.map((log) => {
                    const isOverdue = checkIsOverdue(log);
                    const duration = calculateLoanDuration(
                      log.issueTimestamp || log.issueDate, 
                      log.returnTimestamp || log.returnDate
                    );
                    const hasPartialReturn = Number(log.returnedCount || 0) > 0 && log.status === 'issued';

                    return (
                      <tr 
                        key={log.id} 
                        className={`hover:bg-amber-50/30 transition-colors ${
                          isOverdue ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        {/* 1. Log ID & Category */}
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[0.72rem]">
                          <span className="font-bold text-slate-900 block">{log.id}</span>
                          {log.category && (
                            <span className="text-[0.6rem] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-sans font-bold inline-block mt-0.5">
                              {log.category}
                            </span>
                          )}
                        </td>

                        {/* 2. Equipment Item & Qty */}
                        <td className="py-2.5 px-3">
                          <span className="font-black text-slate-900 block text-xs">
                            {log.equipmentName}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            <span className={`px-1.5 py-0.2 rounded text-[0.62rem] font-bold ${
                              log.status === 'issued' 
                                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {log.qty} {log.status === 'issued' ? 'unit(s) out' : 'unit(s)'}
                            </span>
                            {log.stockType === 'new' ? (
                              <span className="text-[0.58rem] font-bold text-cyan-800 bg-cyan-50 px-1 py-0.2 rounded border border-cyan-200">
                                ✨ New Stock
                              </span>
                            ) : (
                              <span className="text-[0.58rem] font-bold text-slate-600 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                                📦 Old Stock
                              </span>
                            )}
                            {hasPartialReturn && (
                              <span className="text-[0.6rem] font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                                {log.returnedCount} returned
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3. Borrower Student */}
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                            <User size={12} className="text-slate-400 shrink-0" />
                            <span>{log.borrowerName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[0.62rem] text-slate-500">
                            <span className="font-mono font-bold text-slate-600">Roll: {log.rollNo}</span>
                            <span>•</span>
                            <span className="font-bold text-blue-700">{log.branch}</span>
                          </div>
                          {log.borrowerPhone && (
                            <div className="text-[0.6rem] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone size={10} className="text-slate-400" />
                              <span>{log.borrowerPhone}</span>
                            </div>
                          )}
                        </td>

                        {/* 4. Issue Date & Time (PROMINENT) */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-start gap-1.5">
                            <div className="p-1 rounded bg-blue-50 text-blue-600 border border-blue-200 shrink-0 mt-0.5">
                              <Calendar size={12} />
                            </div>
                            <div>
                              <span className="font-black text-slate-900 text-xs block leading-tight">
                                {formatDisplayDateTime(log.issueDate)}
                              </span>
                              <div className="flex items-center gap-1 mt-0.5 text-[0.62rem] text-slate-400 font-semibold">
                                <span>Cond:</span>
                                <span className="text-slate-600 font-bold">{log.issueCondition || 'Good'}</span>
                              </div>
                              {log.purpose && (
                                <p className="text-[0.6rem] text-slate-500 italic truncate max-w-[160px] mt-0.5">
                                  "{log.purpose}"
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 5. Return Date & Time (PROMINENT) */}
                        <td className="py-2.5 px-3">
                          {log.status === 'returned' ? (
                            <div className="flex items-start gap-1.5">
                              <div className="p-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0 mt-0.5">
                                <CheckCircle2 size={12} />
                              </div>
                              <div>
                                <span className="font-black text-emerald-700 text-xs block leading-tight">
                                {formatDisplayDateTime(log.returnDate)}
                              </span>
                              <div className="flex items-center gap-1 mt-0.5 text-[0.62rem]">
                                <span className="text-slate-400 font-semibold">Verified:</span>
                                <span className="font-bold text-emerald-700">{log.returnCondition || 'Good Condition'}</span>
                              </div>
                              {log.returnNotes && (
                                <p className="text-[0.6rem] text-slate-500 italic truncate max-w-[160px] mt-0.5">
                                  "{log.returnNotes}"
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-1.5">
                            <div className={`p-1 rounded shrink-0 mt-0.5 ${
                              isOverdue 
                                ? 'bg-rose-100 text-rose-700 border border-rose-300' 
                                : 'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}>
                              <CalendarClock size={12} />
                            </div>
                            <div>
                              {log.expectedReturn ? (
                                <>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[0.62rem] font-bold text-slate-500 uppercase">Due:</span>
                                    <span className={`text-xs font-bold leading-tight ${
                                      isOverdue ? 'text-rose-700 font-black' : 'text-slate-800'
                                    }`}>
                                      {formatDisplayDateTime(log.expectedReturn)}
                                    </span>
                                  </div>
                                  {isOverdue && (
                                    <span className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-rose-600 text-white text-[0.58rem] font-black uppercase tracking-wider animate-pulse">
                                      <AlertTriangle size={10} /> Overdue Loan
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-[0.68rem] text-slate-400 font-medium italic">
                                  Open Return Window
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 6. Duration */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[0.68rem] font-bold border border-slate-200 inline-flex items-center gap-1">
                          <Timer size={10} className="text-slate-400" />
                          {duration || '—'}
                        </span>
                      </td>

                      {/* 7. Status Pill */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {log.status === 'issued' ? (
                          isOverdue ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-black border border-rose-300 text-[0.65rem] inline-flex items-center gap-1">
                              <AlertTriangle size={11} className="text-rose-600" /> Overdue
                            </span>
                          ) : hasPartialReturn ? (
                            <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 font-bold border border-cyan-200 text-[0.65rem] inline-flex items-center gap-1">
                              <Clock size={11} /> Partial Return
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200 text-[0.65rem] inline-flex items-center gap-1">
                              <Clock size={11} /> On Loan
                            </span>
                          )
                        ) : log.returnCondition && log.returnCondition.toLowerCase().includes('missing') ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[0.65rem] inline-flex items-center gap-1">
                            <AlertTriangle size={11} /> Missing / Lost
                          </span>
                        ) : log.returnCondition && log.returnCondition.toLowerCase().includes('damage') ? (
                          <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-bold border border-orange-200 text-[0.65rem] inline-flex items-center gap-1">
                            <AlertTriangle size={11} /> Damaged
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[0.65rem] inline-flex items-center gap-1">
                            <CheckCircle2 size={11} /> Cleared
                          </span>
                        )}
                      </td>

                      {/* 8. Action Buttons */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {log.status === 'issued' && (
                            <button
                              onClick={() => openReturnModal(log)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[0.68rem] rounded-lg shadow-2xs transition inline-flex items-center gap-1 cursor-pointer"
                              title="Mark equipment returned to store"
                            >
                              <RotateCcw size={11} /> Return
                            </button>
                          )}

                          <button
                            onClick={() => setDossierLog(log)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Inspect full loan dossier & audit timeline"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            disabled={isDeletingLogId === log.id}
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                            title="Delete log record permanently"
                          >
                            {isDeletingLogId === log.id ? (
                              <Loader2 size={14} className="animate-spin text-rose-600" />
                            ) : (
                              <Trash2 size={14} />
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

          {/* MOBILE CARDS VIEW (< md screens) */}
          <div className="block md:hidden p-2 sm:p-3 space-y-3 bg-slate-50/50">
            {filteredLogs.map((log) => {
              const isOverdue = checkIsOverdue(log);
              const duration = calculateLoanDuration(
                log.issueTimestamp || log.issueDate, 
                log.returnTimestamp || log.returnDate
              );
              const hasPartialReturn = Number(log.returnedCount || 0) > 0 && log.status === 'issued';
              const borrowerInitial = (log.borrowerName || 'S').trim().charAt(0).toUpperCase();

              return (
                <div 
                  key={`card-${log.id}`}
                  className={`bg-white rounded-2xl border p-3.5 shadow-2xs transition-all space-y-3 relative overflow-hidden ${
                    isOverdue 
                      ? 'border-rose-300 bg-rose-50/20 ring-1 ring-rose-200' 
                      : log.status === 'issued'
                        ? 'border-amber-200'
                        : 'border-slate-200'
                  }`}
                >
                  {/* Top Color Accent Strip */}
                  <div className={`absolute top-0 inset-x-0 h-1 ${
                    isOverdue 
                      ? 'bg-rose-500' 
                      : log.status === 'issued'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`} />

                  {/* 1. Header: Gear Title, Count & Status Pill */}
                  <div className="flex items-start justify-between gap-2 pt-0.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-[0.68rem] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          #{log.id}
                        </span>
                        {log.category && (
                          <span className="text-[0.62rem] px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                            {log.category}
                          </span>
                        )}
                        {log.stockType === 'new' ? (
                          <span className="text-[0.6rem] px-1.5 py-0.2 rounded font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            ✨ New
                          </span>
                        ) : (
                          <span className="text-[0.6rem] px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            📦 Old
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-slate-900 text-sm leading-snug mt-1">
                        {log.equipmentName}
                      </h4>
                      {log.purpose && (
                        <p className="text-[0.65rem] text-slate-500 italic mt-0.5 line-clamp-1">
                          "{log.purpose}"
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {log.status === 'issued' ? (
                        isOverdue ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[0.62rem] uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs animate-pulse">
                            <AlertTriangle size={10} /> Overdue
                          </span>
                        ) : hasPartialReturn ? (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold border border-cyan-300 text-[0.62rem] inline-flex items-center gap-1">
                            <Clock size={10} /> Partial ({log.returnedCount})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black border border-amber-300 text-[0.62rem] inline-flex items-center gap-1">
                            <Clock size={10} /> On Loan
                          </span>
                        )
                      ) : log.returnCondition && log.returnCondition.toLowerCase().includes('missing') ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300 text-[0.62rem] inline-flex items-center gap-1">
                          <AlertTriangle size={10} /> Missing
                        </span>
                      ) : log.returnCondition && log.returnCondition.toLowerCase().includes('damage') ? (
                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold border border-orange-300 text-[0.62rem] inline-flex items-center gap-1">
                          <AlertTriangle size={10} /> Damaged
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black border border-emerald-300 text-[0.62rem] inline-flex items-center gap-1">
                          <CheckCircle2 size={10} /> Cleared
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded-md text-xs font-black font-mono ${
                        log.status === 'issued'
                          ? 'bg-amber-500 text-slate-950 shadow-2xs'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {log.qty} {log.status === 'issued' ? 'unit out' : 'units'}
                      </span>
                    </div>
                  </div>

                  {/* 2. Student Borrower Profile Card */}
                  <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 border border-blue-200">
                        {borrowerInitial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {log.borrowerName}
                        </div>
                        <div className="flex items-center gap-1.5 text-[0.65rem] text-slate-500 font-semibold truncate">
                          <span className="font-mono font-bold text-slate-600">Roll: {log.rollNo}</span>
                          <span>•</span>
                          <span className="font-bold text-blue-700">{log.branch}</span>
                        </div>
                      </div>
                    </div>

                    {log.borrowerPhone && (
                      <a 
                        href={`tel:${log.borrowerPhone}`} 
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-black flex items-center gap-1 shrink-0 transition active:scale-95 shadow-2xs"
                        title="Call student"
                      >
                        <Phone size={12} className="text-emerald-600" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>

                  {/* 3. Schedule Timeline Strip */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-[0.6rem] uppercase font-black text-slate-500 flex items-center gap-1">
                        <Calendar size={10} className="text-blue-500" /> Issued At
                      </span>
                      <span className="font-black text-slate-900 text-[0.7rem] block leading-tight mt-0.5">
                        {formatDisplayDateTime(log.issueDate)}
                      </span>
                    </div>

                    <div className={`p-2 rounded-xl border ${
                      log.status === 'returned'
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : isOverdue
                          ? 'bg-rose-50 border-rose-300'
                          : 'bg-amber-50/70 border-amber-200'
                    }`}>
                      <span className={`text-[0.6rem] uppercase font-black flex items-center gap-1 ${
                        log.status === 'returned' 
                          ? 'text-emerald-700' 
                          : isOverdue
                            ? 'text-rose-700'
                            : 'text-amber-700'
                      }`}>
                        {log.status === 'returned' ? <CheckCircle2 size={10} /> : <CalendarClock size={10} />}
                        {log.status === 'returned' ? 'Returned At' : 'Due At'}
                      </span>
                      <span className={`font-black text-[0.7rem] block leading-tight mt-0.5 ${
                        log.status === 'returned'
                          ? 'text-emerald-800'
                          : isOverdue
                            ? 'text-rose-700'
                            : 'text-slate-900'
                      }`}>
                        {log.status === 'returned' 
                          ? formatDisplayDateTime(log.returnDate)
                          : (log.expectedReturn ? formatDisplayDateTime(log.expectedReturn) : 'Open Window')}
                      </span>
                    </div>
                  </div>

                  {/* 4. PRIMARY MOBILE RETURN BUTTON (Full width, big thumb target) */}
                  {log.status === 'issued' && (
                    <button
                      onClick={() => openReturnModal(log)}
                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                    >
                      <RotateCcw size={15} />
                      <span>✓ Mark as Returned to Store</span>
                    </button>
                  )}

                  {/* 5. Card Bottom Status & Secondary Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[0.65rem] text-slate-500 font-semibold min-w-0">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200 inline-flex items-center gap-1 shrink-0">
                        <Timer size={10} className="text-slate-400" />
                        {duration || '—'}
                      </span>
                      {log.status === 'returned' && (
                        <span className="text-emerald-700 font-bold truncate">
                          ✓ {log.returnCondition || 'Good Condition'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setDossierLog(log)}
                        className="px-2.5 py-1 text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>Dossier</span>
                      </button>

                      <button
                        disabled={isDeletingLogId === log.id}
                        onClick={() => handleDeleteLog(log.id)}
                        className="min-h-[32px] min-w-[32px] flex items-center justify-center p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-100 bg-rose-50 border border-rose-200 rounded-lg transition cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Delete log record permanently"
                      >
                        {isDeletingLogId === log.id ? (
                          <Loader2 size={13} className="animate-spin text-rose-600" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>

      {/* MODAL 1: ISSUE EQUIPMENT TO STUDENT */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <ArrowUpRight size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    Issue Equipment to Student
                  </h3>
                  <p className="text-[0.68rem] font-semibold text-slate-500">
                    Log new loan record with accurate issue & return deadlines.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowIssueModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-3.5 text-xs font-semibold">
              
              {/* Category & Item Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-xs"
                  >
                    <option value="all">All Sports Categories</option>
                    {sportCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">
                    Quantity to Issue *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={issueData.qty}
                    onChange={(e) => setIssueData({ ...issueData, qty: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-xs"
                  />
                </div>
              </div>

              {/* Equipment Selection */}
                <div>
                  <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">
                    Select Equipment Item *
                  </label>
                  <select
                    required
                    value={issueData.equipmentId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      const it = equipmentList.find(x => x.id === newId);
                      const defSt = it?.stockType === 'new' || (it?.newQty > 0 && it?.oldQty === 0) ? 'new' : 'old';
                      setIssueData({ ...issueData, equipmentId: newId, stockType: defSt });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-xs"
                  >
                    {filteredModalEquipment.map(item => {
                      const issuedForThis = activeIssuedLogs
                        .filter(l => 
                          (l.equipmentId || l.equipment_id) === item.id || 
                          (l.equipmentName && item.name && l.equipmentName.toLowerCase().trim() === item.name.toLowerCase().trim())
                        )
                        .reduce((a, b) => a + (Number(b.qty) || 0), 0);
                      const totalUnits = Number(item.totalQty !== undefined ? item.totalQty : item.total_qty) || 0;
                      const avail = Math.max(0, totalUnits - issuedForThis);
                      const stType = item.stockType || item.stock_type || 'old';
                      return (
                        <option key={item.id} value={item.id} disabled={avail === 0}>
                          [{item.category}] {item.name} ({stType === 'new' ? '✨ New' : '📦 Old'}) — ({avail} available)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Stock Origin Selection (New Stock vs Old Stock) */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[0.65rem] uppercase font-black text-slate-700">
                      Stock Origin to Issue *
                    </label>
                    {(() => {
                      const sel = equipmentList.find(e => e.id === issueData.equipmentId);
                      if (!sel) return null;
                      const n = Number(sel.newQty ?? sel.new_qty ?? 0);
                      const o = Number(sel.oldQty ?? sel.old_qty ?? 0);
                      return (
                        <span className="text-[0.6rem] font-mono text-slate-500">
                          {n > 0 && o > 0 ? `✨ ${n} new • 📦 ${o} old` : (sel.stockType === 'new' ? '✨ New Stock batch' : '📦 Old Stock batch')}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIssueData(prev => ({ ...prev, stockType: 'new', issueCondition: 'Brand New / Mint' }))}
                      className={`py-1.5 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        issueData.stockType === 'new'
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-2xs font-black'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Sparkles size={12} className={issueData.stockType === 'new' ? 'text-white' : 'text-cyan-600'} />
                      <span>✨ New Stock</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIssueData(prev => ({ ...prev, stockType: 'old', issueCondition: 'Good Condition' }))}
                      className={`py-1.5 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        issueData.stockType === 'old'
                          ? 'bg-slate-800 text-white border-slate-800 shadow-2xs font-black'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Box size={12} className={issueData.stockType === 'old' ? 'text-white' : 'text-slate-500'} />
                      <span>📦 Old Stock</span>
                    </button>
                  </div>
                </div>

              {/* Student Borrower Details */}
              <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2.5">
                <span className="block text-[0.62rem] uppercase font-black tracking-wider text-slate-500">
                  Borrower Student Profile
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[0.65rem] font-bold text-slate-700 mb-0.5">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Swagat Parida"
                      value={issueData.borrowerName}
                      onChange={(e) => setIssueData({ ...issueData, borrowerName: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.65rem] font-bold text-slate-700 mb-0.5">Roll Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2201105012"
                      value={issueData.rollNo}
                      onChange={(e) => setIssueData({ ...issueData, rollNo: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[0.65rem] font-bold text-slate-700 mb-0.5">Branch / Department *</label>
                    <select
                      value={issueData.branch}
                      onChange={(e) => setIssueData({ ...issueData, branch: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold text-xs"
                    >
                      <option value="Computer Science & Engg (CSE)">Computer Science & Engg (CSE)</option>
                      <option value="Electrical Engineering (EE)">Electrical Engineering (EE)</option>
                      <option value="Mechanical Engineering (ME)">Mechanical Engineering (ME)</option>
                      <option value="Civil Engineering (CE)">Civil Engineering (CE)</option>
                    </select>
                    {/* Mobile Quick Branch Chips */}
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      {[
                        { label: 'CSE', val: 'Computer Science & Engg (CSE)' },
                        { label: 'EE', val: 'Electrical Engineering (EE)' },
                        { label: 'ME', val: 'Mechanical Engineering (ME)' },
                        { label: 'CE', val: 'Civil Engineering (CE)' }
                      ].map(b => (
                        <button
                          key={b.label}
                          type="button"
                          onClick={() => setIssueData(prev => ({ ...prev, branch: b.val }))}
                          className={`px-2 py-0.5 text-[0.62rem] font-bold rounded border transition cursor-pointer ${
                            issueData.branch === b.val
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.65rem] font-bold text-slate-700 mb-0.5">WhatsApp / Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 94392 10834"
                      value={issueData.borrowerPhone}
                      onChange={(e) => setIssueData({ ...issueData, borrowerPhone: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* DATE & TIME CONFIGURATION (PROMINENT) */}
              <div className="p-3 bg-blue-50/50 border border-blue-200/80 rounded-xl space-y-2.5">
                <span className="block text-[0.62rem] uppercase font-black tracking-wider text-blue-800 flex items-center gap-1">
                  <Calendar size={12} className="text-blue-600" />
                  Issue Date & Expected Return Schedule
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[0.65rem] font-bold text-slate-700 mb-0.5">
                      Issue Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={issueData.issueDateLocal}
                      onChange={(e) => setIssueData({ ...issueData, issueDateLocal: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-slate-900 font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.65rem] font-bold text-slate-700 mb-0.5">
                      Expected Return Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={issueData.expectedReturnLocal}
                      onChange={(e) => setIssueData({ ...issueData, expectedReturnLocal: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-slate-900 font-bold text-xs"
                    />
                  </div>
                </div>

                {/* Quick Presets for Expected Return */}
                <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                  <span className="text-[0.62rem] font-bold text-slate-500">Quick Due:</span>
                  <button
                    type="button"
                    onClick={() => setIssueData(prev => ({ ...prev, expectedReturnLocal: getNowDateTimeLocal(1) }))}
                    className="px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-700 font-bold text-[0.62rem] rounded border border-blue-200 cursor-pointer"
                  >
                    +1 Hour
                  </button>
                  <button
                    type="button"
                    onClick={() => setIssueData(prev => ({ ...prev, expectedReturnLocal: getNowDateTimeLocal(2) }))}
                    className="px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-700 font-bold text-[0.62rem] rounded border border-blue-200 cursor-pointer"
                  >
                    +2 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => setIssueData(prev => ({ ...prev, expectedReturnLocal: getNowDateTimeLocal(4) }))}
                    className="px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-700 font-bold text-[0.62rem] rounded border border-blue-200 cursor-pointer"
                  >
                    +4 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setHours(18, 0, 0, 0);
                      const tz = d.getTimezoneOffset() * 60000;
                      setIssueData(prev => ({ ...prev, expectedReturnLocal: new Date(d.getTime() - tz).toISOString().slice(0, 16) }));
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-700 font-bold text-[0.62rem] rounded border border-blue-200 cursor-pointer"
                  >
                    Today 6 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => setIssueData(prev => ({ ...prev, expectedReturnLocal: getNowDateTimeLocal(24) }))}
                    className="px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-700 font-bold text-[0.62rem] rounded border border-blue-200 cursor-pointer"
                  >
                    Tomorrow
                  </button>
                </div>
              </div>

              {/* Purpose & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">
                    Purpose / Event Fixture
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Inter-branch practice, Girls match"
                    value={issueData.purpose}
                    onChange={(e) => setIssueData({ ...issueData, purpose: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">
                    Item Condition at Issue
                  </label>
                  <select
                    value={issueData.issueCondition}
                    onChange={(e) => setIssueData({ ...issueData, issueCondition: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-xs"
                  >
                    <option value="Good Condition">Good Condition</option>
                    <option value="Brand New / Mint">Brand New / Mint</option>
                    <option value="Minor Pre-existing Scuffs">Minor Pre-existing Scuffs</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIssue}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {isSubmittingIssue ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-white" />
                      <span>Issuing to Cloud...</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={15} />
                      <span>Confirm & Issue Gear</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RETURN EQUIPMENT TO STORE */}
      {returnLog && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-4 border border-slate-200 text-xs font-semibold">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    Return Equipment to Store
                  </h3>
                  <p className="text-[0.68rem] font-semibold text-slate-500">
                    Verify condition, log exact return timestamp, and clear student record.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setReturnLog(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Loan Context Summary Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm">{returnLog.equipmentName}</span>
                <span className="text-[0.65rem] font-mono font-bold text-slate-500">#{returnLog.id}</span>
              </div>
              <div className="flex items-center gap-2 text-[0.7rem] text-slate-600">
                <User size={12} className="text-slate-400" />
                <span>{returnLog.borrowerName} ({returnLog.rollNo})</span>
                <span>•</span>
                <span className="font-bold text-blue-700">{returnLog.branch}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[0.65rem]">
                <span className="text-slate-500">
                  Issued: <strong>{formatDisplayDateTime(returnLog.issueDate)}</strong>
                </span>
                <span className="text-amber-700 font-bold">
                  Units Out: <strong>{returnLog.qty}</strong>
                </span>
              </div>
            </div>

            {/* ⚡ 1-TAP FAST TRACK RETURN BUTTON (95% STANDARD CASE) */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 sm:p-3 space-y-2">
              <div className="flex items-center justify-between text-[0.68rem] text-emerald-800 font-bold">
                <span className="flex items-center gap-1">
                  <CheckCircle size={13} className="text-emerald-600" />
                  <span>Standard Full Clearance</span>
                </span>
                <span className="text-[0.6rem] bg-emerald-200/70 text-emerald-900 px-1.5 py-0.2 rounded font-black uppercase tracking-wider">
                  1-Tap Fast
                </span>
              </div>
              <button
                type="button"
                disabled={isSubmittingReturn}
                onClick={async () => {
                  setIsSubmittingReturn(true);
                  const formattedNow = dateTimeLocalToDisplay(getNowDateTimeLocal(0));
                  try {
                    await returnEquipment(
                      returnLog.id,
                      'Good Condition',
                      '1-Tap Fast Mobile Return (All units in Good Condition)',
                      Number(returnLog.qty),
                      formattedNow
                    );
                    showToast(`✓ Cleared ${returnLog.qty}x ${returnLog.equipmentName} returned by ${returnLog.borrowerName}.`);
                    setReturnLog(null);
                  } catch (err) {
                    showToast(err.message || 'Failed to register return', 'error');
                  } finally {
                    setIsSubmittingReturn(false);
                  }
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white rounded-xl font-black text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition"
              >
                {isSubmittingReturn ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-white" />
                    <span>Syncing Return to Cloud...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>⚡ 1-Tap Return: All {returnLog.qty} Unit(s) in Good Condition</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative flex py-0.5 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-2 text-[0.62rem] text-slate-400 font-bold uppercase tracking-wider">
                Or customize return details
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Quantity Returning Input (Supports Partial Returns with Mobile Stepper) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[0.68rem] uppercase font-black text-slate-700">
                  Quantity Being Returned Today *
                </label>
                <span className="text-[0.62rem] text-slate-400 font-bold">Total on loan: {returnLog.qty}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setReturnQty(prev => Math.max(1, prev - 1))}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-black text-base flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={returnLog.qty}
                  required
                  value={returnQty}
                  onChange={(e) => setReturnQty(Math.min(returnLog.qty, Math.max(1, Number(e.target.value))))}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-black text-center text-xs"
                />
                <button
                  type="button"
                  onClick={() => setReturnQty(prev => Math.min(returnLog.qty, prev + 1))}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-black text-base flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
                >
                  +
                </button>
                {returnLog.qty > 1 && (
                  <button
                    type="button"
                    onClick={() => setReturnQty(returnLog.qty)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
                      returnQty === returnLog.qty
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    All ({returnLog.qty})
                  </button>
                )}
              </div>
              {Number(returnQty) < Number(returnLog.qty) && (
                <p className="text-[0.65rem] text-amber-600 font-bold mt-1">
                  ⚠️ Partial return! {returnLog.qty - returnQty} unit(s) will remain on loan to student.
                </p>
              )}
            </div>

            {/* RETURN DATE & TIME INPUT (PROMINENT) */}
            <div>
              <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1 flex items-center gap-1">
                <CalendarCheck size={12} className="text-emerald-600" />
                Actual Return Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={returnDateLocal}
                onChange={(e) => setReturnDateLocal(e.target.value)}
                className="w-full px-3 py-2 bg-emerald-50/40 border border-emerald-200 rounded-xl text-slate-900 font-bold text-xs"
              />
              <span className="text-[0.62rem] text-slate-400 font-semibold mt-0.5 block">
                Recorded for official physical equipment audit ledger.
              </span>
            </div>

            {/* Condition on Return */}
            <div>
              <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">
                Equipment Condition Upon Return *
              </label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-xs"
              >
                <option value="Good Condition">Good Condition (No Damage)</option>
                <option value="Minor Wear / Acceptable">Minor Wear / Acceptable</option>
                <option value="Damaged / Repair Needed">Damaged / Repair Needed</option>
                <option value="Missing / Lost Equipment">Missing / Lost Equipment</option>
              </select>
            </div>

            {/* Return Notes / Inspector Remarks */}
            <div>
              <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">
                Inspector Notes / Clearance Remarks
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Returned clean, balls sanitized, bats placed in rack 1"
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs resize-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReturnLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingReturn}
                onClick={handleReturnConfirm}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {isSubmittingReturn ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-white" />
                    <span>Recording Return...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} /> 
                    <span>Confirm Return of {returnQty} Unit(s)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: FULL LOAN DOSSIER & AUDIT RECEIPT */}
      {dossierLog && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                  <Eye size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Equipment Loan Dossier
                  </h3>
                  <p className="text-[0.68rem] font-semibold text-slate-500">
                    Official College Sports Equipment Issue & Return Certificate
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setDossierLog(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dossier Header Info */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[0.62rem] uppercase font-black tracking-widest text-slate-400">
                  Transaction Record
                </span>
                <span className="font-mono text-xs font-bold text-amber-400">#{dossierLog.id}</span>
              </div>
              <h4 className="text-base font-black tracking-tight">{dossierLog.equipmentName}</h4>
              <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
                <span>Issued Units: <strong className="text-white">{dossierLog.qty}</strong></span>
                <span>•</span>
                <span>Category: <strong className="text-white">{dossierLog.category || 'General Sports'}</strong></span>
                <span>•</span>
                <span>
                  Origin:{' '}
                  <strong className={dossierLog.stockType === 'new' ? 'text-cyan-300' : 'text-slate-300'}>
                    {dossierLog.stockType === 'new' ? '✨ New Stock' : '📦 Old Stock'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Borrower Profile */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[0.62rem] font-black uppercase tracking-wider text-slate-500 block">
                Borrower Custodian Details
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[0.65rem]">Student Name:</span>
                  <span className="font-bold text-slate-900">{dossierLog.borrowerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[0.65rem]">Roll Number:</span>
                  <span className="font-mono font-bold text-slate-900">{dossierLog.rollNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[0.65rem]">Department / Branch:</span>
                  <span className="font-bold text-blue-700">{dossierLog.branch}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[0.65rem]">Contact Phone:</span>
                  <span className="font-bold text-slate-900">{dossierLog.borrowerPhone || 'Not recorded'}</span>
                </div>
              </div>
            </div>

            {/* Audit Timeline */}
            <div className="space-y-3 p-3 bg-slate-50/70 border border-slate-200 rounded-xl">
              <span className="text-[0.62rem] font-black uppercase tracking-wider text-slate-500 block">
                Issue & Return Chronology
              </span>

              {/* Event 1: Issue */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Equipment Issued Out</span>
                    <span className="text-[0.65rem] font-bold text-blue-700">
                      {formatDisplayDateTime(dossierLog.issueDate)}
                    </span>
                  </div>
                  <p className="text-[0.68rem] text-slate-500 mt-0.5">
                    Condition: <strong>{dossierLog.issueCondition || 'Good Condition'}</strong> • Purpose: "{dossierLog.purpose || 'Sports Practice'}"
                  </p>
                </div>
              </div>

              {/* Event 2: Scheduled Due */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Scheduled Return Due</span>
                    <span className="text-[0.65rem] font-bold text-amber-700">
                      {dossierLog.expectedReturn ? formatDisplayDateTime(dossierLog.expectedReturn) : 'Open Window'}
                    </span>
                  </div>
                  {checkIsOverdue(dossierLog) && (
                    <span className="text-[0.62rem] font-black text-rose-600 block mt-0.5">
                      ⚠️ Current status: Past due date!
                    </span>
                  )}
                </div>
              </div>

              {/* Event 3: Return Status */}
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs ${
                  dossierLog.status === 'returned' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      {dossierLog.status === 'returned' ? 'Return Cleared to Store' : 'Active On Loan'}
                    </span>
                    {dossierLog.returnDate && (
                      <span className="text-[0.65rem] font-bold text-emerald-700">
                        {formatDisplayDateTime(dossierLog.returnDate)}
                      </span>
                    )}
                  </div>
                  {dossierLog.status === 'returned' ? (
                    <div className="text-[0.68rem] text-slate-500 mt-0.5 space-y-0.5">
                      <p>Return Condition: <strong className="text-emerald-700">{dossierLog.returnCondition || 'Good Condition'}</strong></p>
                      {dossierLog.returnNotes && <p>Remarks: "{dossierLog.returnNotes}"</p>}
                      <p>Total Loan Duration: <strong>{calculateLoanDuration(dossierLog.issueTimestamp || dossierLog.issueDate, dossierLog.returnTimestamp || dossierLog.returnDate)}</strong></p>
                    </div>
                  ) : (
                    <p className="text-[0.68rem] text-amber-700 font-bold mt-0.5">
                      Currently held by student. Awaiting return check-in.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                disabled={isDeletingLogId === dossierLog.id}
                onClick={() => handleDeleteLog(dossierLog.id)}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                title="Delete this record permanently"
              >
                {isDeletingLogId === dossierLog.id ? (
                  <Loader2 size={13} className="animate-spin text-rose-600" />
                ) : (
                  <Trash2 size={13} />
                )}
                <span>Delete Record</span>
              </button>
              <button
                type="button"
                onClick={() => setDossierLog(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-800"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
