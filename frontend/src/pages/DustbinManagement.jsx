import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash, 
  ArrowUpDown, 
  CheckCircle, 
  AlertTriangle, 
  Flame, 
  X,
  Sliders,
  History
} from 'lucide-react';

export default function DustbinManagement() {
  const { refreshTrigger, refreshAll, showToast } = useApp();
  const [dustbins, setDustbins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, filter, sorting & pagination
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('fillPercentage');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBin, setEditingBin] = useState(null);
  const [formData, setFormData] = useState({
    dustbinCode: '',
    locationName: '',
    latitude: 18.5204,
    longitude: 73.8567,
    capacityLiters: 500,
    fillPercentage: 0,
    category: 'GENERAL',
    assignedStaffName: 'Sunil Pawar'
  });

  // Sensor update modal
  const [sensorModalBin, setSensorModalBin] = useState(null);
  const [sensorFill, setSensorFill] = useState(50);

  useEffect(() => {
    loadDustbins();
  }, [refreshTrigger]);

  const loadDustbins = async () => {
    try {
      setLoading(true);
      const data = await api.getDustbins();
      setDustbins(data);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingBin(null);
    setFormData({
      dustbinCode: `B${Math.floor(100 + Math.random() * 900)}`,
      locationName: '',
      latitude: 18.5204 + (Math.random() - 0.5) * 0.05,
      longitude: 73.8567 + (Math.random() - 0.5) * 0.05,
      capacityLiters: 500,
      fillPercentage: 0,
      category: 'GENERAL',
      assignedStaffName: 'Sunil Pawar'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (bin) => {
    setEditingBin(bin);
    setFormData({
      dustbinCode: bin.dustbinCode,
      locationName: bin.locationName,
      latitude: bin.latitude,
      longitude: bin.longitude,
      capacityLiters: bin.capacityLiters,
      fillPercentage: bin.fillPercentage,
      category: bin.category,
      assignedStaffName: bin.assignedStaffName || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete dustbin ${code}?`)) return;
    try {
      await api.deleteDustbin(id);
      showToast(`Dustbin ${code} deleted successfully.`, 'success');
      refreshAll();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBin) {
        await api.updateDustbin(editingBin.id, formData);
        showToast(`Dustbin ${editingBin.dustbinCode} updated successfully.`, 'success');
      } else {
        await api.createDustbin(formData);
        showToast(`New dustbin ${formData.dustbinCode} added to city network.`, 'success');
      }
      setModalOpen(false);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleApplySensor = async (e) => {
    e.preventDefault();
    if (!sensorModalBin) return;
    try {
      await api.simulateSensor(sensorModalBin.dustbinCode, parseInt(sensorFill));
      showToast(`Sensor update for ${sensorModalBin.dustbinCode}: ${sensorFill}%`, 'success');
      setSensorModalBin(null);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  // Filter & Sorting Logic
  const filteredBins = dustbins.filter(bin => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchCode = bin.dustbinCode?.toLowerCase().includes(q);
      const matchLoc = bin.locationName?.toLowerCase().includes(q);
      if (!matchCode && !matchLoc) return false;
    }
    if (filterCategory !== 'ALL' && bin.category !== filterCategory) return false;
    if (filterStatus !== 'ALL' && bin.status !== filterStatus) return false;
    return true;
  });

  const sortedBins = [...filteredBins].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (typeof valA === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const totalPages = Math.ceil(sortedBins.length / pageSize) || 1;
  const paginatedBins = sortedBins.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dustbin Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Comprehensive registry of smart bins, IoT status, capacities, and maintenance schedules.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-forest-700 text-white hover:bg-forest-800 shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Dustbin
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search code or location..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="EMPTY">Empty</option>
            <option value="MODERATE">Moderate</option>
            <option value="ALMOST_FULL">Almost Full</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select
            value={filterCategory}
            onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            <option value="ALL">All Categories</option>
            <option value="GENERAL">General</option>
            <option value="ORGANIC">Organic</option>
            <option value="RECYCLABLE">Recyclable</option>
            <option value="HAZARDOUS">Hazardous</option>
            <option value="ELECTRONIC">Electronic</option>
          </select>

          <button
            onClick={() => {
              setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
            }}
            className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1 transition"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Fill: {sortOrder.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Dustbins Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Location Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Fill Level</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Capacity / Waste</th>
                <th className="py-3 px-4">Last Collection</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBins.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No dustbins found matching the criteria.
                  </td>
                </tr>
              ) : (
                paginatedBins.map(bin => {
                  const fill = bin.fillPercentage;
                  return (
                    <tr key={bin.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">{bin.dustbinCode}</td>
                      <td className="py-3 px-4 font-medium text-slate-800 max-w-xs truncate" title={bin.locationName}>
                        {bin.locationName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {bin.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                            <div 
                              className={`h-full ${
                                fill >= 90 ? 'bg-red-500' :
                                fill >= 75 ? 'bg-orange-500' :
                                fill >= 50 ? 'bg-yellow-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${fill}%` }}
                            />
                          </div>
                          <span className={`font-bold ${
                            fill >= 90 ? 'text-red-600' :
                            fill >= 75 ? 'text-orange-600' : 'text-slate-700'
                          }`}>
                            {fill}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          bin.priorityLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                          bin.priorityLevel === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                          bin.priorityLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {bin.priorityLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {bin.capacityLiters} L <span className="text-[10px] text-slate-400">({bin.currentWasteLiters.toFixed(0)} L)</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {bin.lastCollectionDate ? new Date(bin.lastCollectionDate).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setSensorModalBin(bin);
                            setSensorFill(bin.fillPercentage);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-forest-700 hover:bg-forest-50 transition"
                          title="Simulate IoT sensor value"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(bin)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition"
                          title="Edit dustbin"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bin.id, bin.dustbinCode)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition"
                          title="Delete dustbin"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {paginatedBins.length} of {sortedBins.length} dustbins</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 font-medium">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">
                {editingBin ? `Edit Dustbin ${editingBin.dustbinCode}` : 'Add New Dustbin'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Dustbin Code</label>
                <input
                  type="text"
                  required
                  value={formData.dustbinCode}
                  onChange={e => setFormData({ ...formData, dustbinCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Location Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FC Road Corner, Shivaji Nagar"
                  value={formData.locationName}
                  onChange={e => setFormData({ ...formData, locationName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude}
                    onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude}
                    onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Capacity (Litres)</label>
                  <input
                    type="number"
                    required
                    value={formData.capacityLiters}
                    onChange={e => setFormData({ ...formData, capacityLiters: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Waste Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                  >
                    <option value="GENERAL">General</option>
                    <option value="ORGANIC">Organic</option>
                    <option value="RECYCLABLE">Recyclable</option>
                    <option value="HAZARDOUS">Hazardous</option>
                    <option value="ELECTRONIC">Electronic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Initial Fill Percentage ({formData.fillPercentage}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.fillPercentage}
                  onChange={e => setFormData({ ...formData, fillPercentage: parseInt(e.target.value) })}
                  className="w-full accent-forest-700 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-bold"
                >
                  Save Dustbin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sensor Simulation Slider Modal */}
      {sensorModalBin && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">
                Simulate Sensor: {sensorModalBin.dustbinCode}
              </h3>
              <button onClick={() => setSensorModalBin(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Adjust ultrasonic sensor fill level for <strong>{sensorModalBin.locationName}</strong>.
            </p>

            <form onSubmit={handleApplySensor} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700">Fill Level</span>
                  <span className="text-base font-extrabold text-forest-700">{sensorFill}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sensorFill}
                  onChange={e => setSensorFill(e.target.value)}
                  className="w-full accent-forest-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0% Empty</span>
                  <span>75% Alert</span>
                  <span>90% Critical</span>
                  <span>100% Full</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSensorModalBin(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-forest-700 text-white font-bold"
                >
                  Apply IoT Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
