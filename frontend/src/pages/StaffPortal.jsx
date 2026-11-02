import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { CheckCircle2, Truck, Trash2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function StaffPortal() {
  const { refreshTrigger, refreshAll, showToast } = useApp();
  const [priorityBins, setPriorityBins] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('1'); // Default Sunil Pawar
  const [selectedVehicleId, setSelectedVehicleId] = useState('1');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffData();
  }, [refreshTrigger, selectedStaffId]);

  const loadStaffData = async () => {
    try {
      setLoading(true);
      const [pq, vList, sList, hist] = await Promise.all([
        api.getPriorityQueue(),
        api.getVehicles(),
        api.getStaff(),
        api.getCollectionHistory()
      ]);
      setPriorityBins(pq.filter(b => b.fillPercentage >= 50));
      setVehicles(vList);
      setStaffList(sList);
      setHistory(hist);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCollected = async (binCode, prevFill) => {
    try {
      await api.completeCollection({
        dustbinCode: binCode,
        staffId: parseInt(selectedStaffId),
        vehicleId: parseInt(selectedVehicleId)
      });
      showToast(`Dustbin ${binCode} marked collected! Fill reset to 0%.`, 'success');
      refreshAll();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const currentStaff = staffList.find(s => s.id.toString() === selectedStaffId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Collection Staff Portal</h2>
          <p className="text-sm text-slate-500 mt-0.5">View urgent assigned bins, log waste collections, and record completed tasks.</p>
        </div>

        {/* Staff Switcher for Demo */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Logged in as:</span>
          <select
            value={selectedStaffId}
            onChange={e => setSelectedStaffId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
          >
            {staffList.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.employeeId})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Status Hero */}
      {currentStaff && (
        <div className="bg-forest-900 text-white p-6 rounded-2xl shadow-sm border border-forest-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-forest-300">Duty Card</span>
            <h3 className="text-xl font-bold">{currentStaff.name} ({currentStaff.employeeId})</h3>
            <p className="text-xs text-forest-200">
              Assigned Vehicle: <strong>{currentStaff.assignedVehicle ? currentStaff.assignedVehicle.vehicleNumber : 'MH-12-GW-9001 (Compactor)'}</strong>
            </p>
          </div>
          <div className="bg-forest-800/80 px-4 py-3 rounded-xl border border-forest-700 text-right">
            <span className="text-[10px] uppercase font-bold text-forest-300 block">Total Completed Collections</span>
            <span className="text-2xl font-extrabold text-white">{currentStaff.completedCollections} Tasks</span>
          </div>
        </div>
      )}

      {/* Urgent Bins To Collect Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Priority Dustbins Requiring Immediate Pickup</h3>
            <p className="text-slate-500 mt-0.5 text-xs">Sorted by Custom Max-Heap Priority</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
            {priorityBins.length} Urgent Targets
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {priorityBins.map(bin => (
            <div key={bin.dustbinCode} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{bin.dustbinCode}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    bin.priorityLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {bin.priorityLevel} ({bin.fillPercentage}%)
                  </span>
                </div>
                <p className="text-slate-700 font-medium">{bin.locationName}</p>
                <p className="text-[11px] text-slate-400">Coordinates: {bin.latitude.toFixed(4)}, {bin.longitude.toFixed(4)}</p>
              </div>

              <button
                onClick={() => handleMarkCollected(bin.dustbinCode, bin.fillPercentage)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Collected (0%)
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

