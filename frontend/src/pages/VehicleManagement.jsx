import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Truck, Plus, Edit3, Trash, CheckCircle2, AlertCircle, Wrench } from 'lucide-react';

export default function VehicleManagement() {
  const { refreshTrigger, refreshAll, showToast } = useApp();
  const [vehicles, setVehicles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'Heavy Hydraulic Compactor',
    capacityKg: 3500,
    currentLocation: 'Central Depot',
    driverName: '',
    status: 'AVAILABLE'
  });

  useEffect(() => {
    loadVehicles();
  }, [refreshTrigger]);

  const loadVehicles = async () => {
    try {
      const data = await api.getVehicles();
      setVehicles(data);
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({
      vehicleNumber: `MH-12-GW-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleType: 'Heavy Hydraulic Compactor',
      capacityKg: 4000,
      currentLocation: 'Central Municipal Solid Waste Depot',
      driverName: '',
      status: 'AVAILABLE'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVehicle(v);
    setFormData({
      vehicleNumber: v.vehicleNumber,
      vehicleType: v.vehicleType,
      capacityKg: v.capacityKg,
      currentLocation: v.currentLocation,
      driverName: v.driverName || '',
      status: v.status
    });
    setModalOpen(true);
  };

  const handleDelete = async (id, number) => {
    if (!window.confirm(`Delete vehicle ${number}?`)) return;
    try {
      await api.deleteVehicle(id);
      showToast(`Vehicle ${number} removed.`, 'success');
      refreshAll();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await api.updateVehicle(editingVehicle.id, formData);
        showToast(`Vehicle ${editingVehicle.vehicleNumber} updated.`, 'success');
      } else {
        await api.createVehicle(formData);
        showToast(`Vehicle ${formData.vehicleNumber} registered into municipal fleet.`, 'success');
      }
      setModalOpen(false);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Garbage Vehicle Fleet Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track compactor trucks, mini tippers, and maintenance status.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-forest-700 text-white hover:bg-forest-800 shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Register New Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base text-slate-900">{vehicle.vehicleNumber}</span>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                vehicle.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' :
                vehicle.status === 'ON_DUTY' ? 'bg-blue-100 text-blue-700' :
                vehicle.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {vehicle.status}
              </span>
            </div>

            <div className="text-xs space-y-1.5 text-slate-600">
              <p>Type: <strong className="text-slate-800">{vehicle.vehicleType}</strong></p>
              <p>Capacity: <strong className="text-slate-800">{vehicle.capacityKg} kg</strong></p>
              <p>Driver: <strong className="text-slate-800">{vehicle.driverName || 'Unassigned'}</strong></p>
              <p>Current Station: <strong className="text-slate-800">{vehicle.currentLocation}</strong></p>
              <p>Collected Waste: <strong className="text-forest-700 font-bold">{vehicle.collectedWasteCapacity} kg</strong></p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => handleOpenEdit(vehicle)}
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => handleDelete(vehicle.id, vehicle.vehicleNumber)}
                className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
              >
                <Trash className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              {editingVehicle ? 'Edit Vehicle Details' : 'Register Vehicle'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Registration Number</label>
                <input
                  type="text"
                  required
                  value={formData.vehicleNumber}
                  onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Vehicle Type</label>
                <select
                  value={formData.vehicleType}
                  onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                >
                  <option value="Heavy Hydraulic Compactor">Heavy Hydraulic Compactor (4500 kg)</option>
                  <option value="Medium Compactor Truck">Medium Compactor Truck (3500 kg)</option>
                  <option value="Mini Tipper Truck">Mini Tipper Truck (1800 kg)</option>
                  <option value="Electric Waste Carrier">Electric Waste Carrier (1200 kg)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Capacity (Kg)</label>
                  <input
                    type="number"
                    required
                    value={formData.capacityKg}
                    onChange={e => setFormData({ ...formData, capacityKg: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ON_DUTY">ON_DUTY</option>
                    <option value="BUSY">BUSY</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assigned Driver Name</label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-bold"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
