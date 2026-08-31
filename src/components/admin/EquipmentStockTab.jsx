import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  PackageCheck, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowUpRight,
  Minus,
  Trophy,
  Filter,
  Layers,
  Sparkles,
  FolderPlus
} from 'lucide-react';

export default function EquipmentStockTab() {
  const { 
    equipmentList, addEquipment, updateEquipment, deleteEquipment, equipmentLogs
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🏆');

  // New Equipment Form State (No location field)
  const [newEquip, setNewEquip] = useState({
    name: '',
    category: 'Cricket',
    totalQty: 10,
    condition: 'Good Condition',
    notes: ''
  });

  // Save custom categories to local storage
  useEffect(() => {
    localStorage.setItem('aahwan_custom_sport_categories', JSON.stringify(customCategories));
  }, [customCategories]);

  // Combine default categories with any existing equipment categories not in list
  const allCategoryObjects = [
    { id: 'all', name: 'All Sports', icon: '🏆', color: 'bg-blue-600' },
    ...customCategories
  ];

  // Include any extra categories present in equipmentList
  equipmentList.forEach(item => {
    if (item.category && !allCategoryObjects.some(c => c.id === item.category)) {
      allCategoryObjects.push({
        id: item.category,
        name: item.category,
        icon: '🥇',
        color: 'bg-slate-700'
      });
    }
  });

  const activeIssuedLogs = (equipmentLogs || []).filter(log => log.status === 'issued');
  
  const totalItems = equipmentList.length;
  const totalUnits = equipmentList.reduce((acc, curr) => acc + (Number(curr.totalQty) || 0), 0);
  const totalIssuedUnits = activeIssuedLogs.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);
  const availableUnits = Math.max(0, totalUnits - totalIssuedUnits);

  // Group equipment by category
  const groupedEquipment = allCategoryObjects.reduce((acc, cat) => {
    if (cat.id === 'all') return acc;
    const items = equipmentList.filter(item => item.category === cat.id);
    acc[cat.id] = items;
    return acc;
  }, {});

  // Handle Quick +/- Quantity Adjustment
  const handleQuickQtyChange = (item, delta) => {
    const newQty = Math.max(1, (Number(item.totalQty) || 0) + delta);
    updateEquipment(item.id, { ...item, totalQty: newQty });
  };

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
      category: newEquip.category || 'Cricket',
      totalQty: 10,
      condition: 'Good Condition',
      notes: ''
    });
    setShowAddModal(false);
  };

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const trimmedName = newCatName.trim();
    if (customCategories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert(`Sport category "${trimmedName}" already exists!`);
      return;
    }

    const colors = ['bg-emerald-600', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-pink-600', 'bg-amber-600', 'bg-rose-600', 'bg-cyan-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newCategory = {
      id: trimmedName,
      name: trimmedName,
      icon: newCatIcon || '🏆',
      color: randomColor
    };

    setCustomCategories(prev => [...prev, newCategory]);
    setSelectedSport(trimmedName);
    setNewCatName('');
    setNewCatIcon('🏆');
    setShowAddCategoryModal(false);
  };

  const deleteCategory = (catId, catName) => {
    if (confirm(`Delete the "${catName}" sports category? Items in this category will not be deleted.`)) {
      setCustomCategories(prev => prev.filter(c => c.id !== catId && c.name !== catName));
      if (selectedSport === catId || selectedSport === catName) {
        setSelectedSport('all');
      }
    }
  };

  const openAddModalForSport = (sportName) => {
    setEditingItem(null);
    setNewEquip({
      name: '',
      category: sportName || 'Cricket',
      totalQty: 10,
      condition: 'Good Condition',
      notes: ''
    });
    setShowAddModal(true);
  };

  const emojiOptions = ['🏏', '⚽', '🏐', '🏸', '🏃', '♟️', '🏓', '🏀', '🤼', '🏊', '🏋️', '🎯', '🥇', '🏆', '🎯', '🥊', '🥋'];

  return (
    <div className="space-y-6 select-none">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Package className="text-blue-600" size={24} /> Sports Equipment Inventory
          </h4>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Manage equipment stocks organized by sport disciplines. Easily add or delete custom sports categories & edit stock levels.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl flex items-center gap-2 shadow-md transition"
          >
            <FolderPlus size={16} /> Add Sport Category
          </button>

          <button
            onClick={() => openAddModalForSport(customCategories[0]?.name || 'Cricket')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/25 transition"
          >
            <Plus size={18} /> Add Equipment Stock
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[0.68rem] font-black uppercase tracking-wider mb-1">
            <span>Equipment Types</span>
            <Package size={18} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{totalItems}</h3>
          <p className="text-[0.62rem] font-bold text-slate-400 mt-0.5">Across {customCategories.length} Sport Categories</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[0.68rem] font-black uppercase tracking-wider mb-1">
            <span>Total Units In Store</span>
            <PackageCheck size={18} className="text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{totalUnits}</h3>
          <p className="text-[0.62rem] font-bold text-slate-400 mt-0.5">Physical Inventory Count</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[0.68rem] font-black uppercase tracking-wider mb-1">
            <span>Issued Out</span>
            <ArrowUpRight size={18} className="text-amber-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{totalIssuedUnits}</h3>
          <p className="text-[0.62rem] font-bold text-amber-600 mt-0.5">Units in Student Use</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[0.68rem] font-black uppercase tracking-wider mb-1">
            <span>Available Units</span>
            <CheckCircle2 size={18} className="text-teal-600" />
          </div>
          <h3 className="text-2xl font-black text-emerald-600">{availableUnits}</h3>
          <p className="text-[0.62rem] font-bold text-emerald-600 mt-0.5">Ready for Issue</p>
        </div>
      </div>

      {/* SPORTS CATEGORY FILTER BAR */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[0.68rem] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <Filter size={14} className="text-blue-600" /> Filter by Sports Category:
          </span>

          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search gear name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Sports Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {allCategoryObjects.map(cat => {
            const count = cat.id === 'all' 
              ? equipmentList.length 
              : (groupedEquipment[cat.id] || []).length;
            const isSelected = selectedSport === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedSport(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 shrink-0 transition-all ${
                  isSelected 
                    ? `${cat.color || 'bg-blue-600'} text-white shadow-md scale-102` 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[0.65rem] font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="px-3 py-2 bg-slate-900 hover:bg-blue-600 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-sm"
          >
            <Plus size={14} /> Add Category
          </button>
        </div>
      </div>

      {/* SPORTS-WISE GROUPED TABLES SECTION */}
      <div className="space-y-6 pt-2">
        {allCategoryObjects
          .filter(cat => cat.id !== 'all' && (selectedSport === 'all' || selectedSport === cat.id))
          .map(cat => {
            const sportItems = (groupedEquipment[cat.id] || []).filter(item => 
              (item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (selectedSport !== 'all' && sportItems.length === 0 && searchTerm) return null;

            const categoryTotalUnits = sportItems.reduce((a, b) => a + (Number(b.totalQty) || 0), 0);

            return (
              <div key={cat.id} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Category Card Header */}
                <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <h5 className="font-black text-sm text-white tracking-tight flex items-center gap-2">
                        <span>{cat.name} Equipment</span>
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full text-[0.65rem] font-bold border border-slate-700">
                          {sportItems.length} Item Types • {categoryTotalUnits} Units
                        </span>
                      </h5>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteCategory(cat.id, cat.name)}
                      className="px-2.5 py-1.5 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl font-bold text-xs flex items-center gap-1 transition"
                      title={`Delete ${cat.name} category`}
                    >
                      <Trash2 size={13} /> Delete Category
                    </button>

                    <button
                      onClick={() => openAddModalForSport(cat.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Plus size={14} /> Add {cat.name} Stock
                    </button>
                  </div>
                </div>

                {/* Category Items Table (Store Location Removed) */}
                {sportItems.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                    No {cat.name} equipment items added yet. Click "Add {cat.name} Stock" to create one.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-black uppercase text-[0.65rem] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-3.5">Equipment Item Name</th>
                          <th className="p-3.5 text-center">Total Units (Quick Adjust)</th>
                          <th className="p-3.5 text-center">Issued Out</th>
                          <th className="p-3.5 text-center">Available Stock</th>
                          <th className="p-3.5">Condition</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {sportItems.map((item) => {
                          const issuedForThis = activeIssuedLogs
                            .filter(l => l.equipmentId === item.id)
                            .reduce((a, b) => a + (Number(b.qty) || 0), 0);
                          const availForThis = Math.max(0, item.totalQty - issuedForThis);
                          const isLow = availForThis <= 2;

                          return (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-3.5 font-black text-slate-900 flex items-center gap-2">
                                <span className="text-base">{cat.icon}</span>
                                <span>{item.name}</span>
                              </td>

                              {/* Quick Qty Incrementor / Decrementor */}
                              <td className="p-3.5 text-center">
                                <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 font-mono font-bold">
                                  <button
                                    onClick={() => handleQuickQtyChange(item, -1)}
                                    className="p-1 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                                    title="Decrease Qty"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="w-8 text-center text-xs font-black text-slate-900">{item.totalQty}</span>
                                  <button
                                    onClick={() => handleQuickQtyChange(item, 1)}
                                    className="p-1 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                                    title="Increase Qty"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              </td>

                              <td className="p-3.5 text-center font-mono font-bold text-amber-600 text-xs">
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

                              <td className="p-3.5 text-slate-600">{item.condition || 'Good Condition'}</td>
                              
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
                                    if (confirm(`Delete ${item.name} from ${cat.name} inventory?`)) {
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
            );
          })}
      </div>

      {/* MODAL 1: ADD NEW CUSTOM SPORT CATEGORY */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <FolderPlus className="text-blue-600" size={20} />
                Add New Sport Category
              </h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Sport Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table Tennis, Basketball, Kabaddi, Swimming"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1.5">Select Sport Icon / Emoji</label>
                <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewCatIcon(emoji)}
                      className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition ${
                        newCatIcon === emoji ? 'bg-blue-600 text-white shadow-md scale-110' : 'hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-md flex items-center gap-1.5"
                >
                  <Plus size={16} /> Create Sport Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT EQUIPMENT STOCK (STORE LOCATION REMOVED) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Package className="text-blue-600" size={20} />
                {editingItem ? 'Edit Stock Item' : `Add New ${newEquip.category} Stock`}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="block text-[0.68rem] uppercase font-black text-slate-700 mb-1">Select Sport Category *</label>
                <select
                  value={newEquip.category}
                  onChange={(e) => setNewEquip({ ...newEquip, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                >
                  {customCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

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
                  {editingItem ? 'Save Stock' : 'Add Stock Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
