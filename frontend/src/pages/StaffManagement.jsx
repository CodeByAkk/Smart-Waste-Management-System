import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Users, Plus, Edit3, Trash, Phone, Truck, CheckCircle } from 'lucide-react';

export default function StaffManagement() {
  const { refreshTrigger, refreshAll, showToast } = useApp();
  const [staffList, setStaffList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    contactNumber: '',
    assignedRoute: 'Zone 1 (Shivaji Nagar - Deccan)',
    workingStatus: 'ACTIVE'
  });

  useEffect(() => {
    loadStaff();
  }, [refreshTrigger]);

  const loadStaff = async () => {
    try {
      const data = await api.getStaff();
      setStaffList(data);
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      employeeId: `STF-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      contactNumber: '+91 98220 ',
      assignedRoute: 'Zone 1 (Shivaji Nagar - Deccan)',
      workingStatus: 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingStaff(s);
    setFormData({
      employeeId: s.employeeId,
      name: s.name,
      contactNumber: s.contactNumber,
      assignedRoute: s.assignedRoute || 'Zone 1',
      workingStatus: s.workingStatus
    });
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove staff member ${name}?`)) return;
    try {
      await api.deleteStaff(id);
      showToast(`Staff ${name} removed.`, 'success');
      refreshAll();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await api.updateStaff(editingStaff.id, formData);
        showToast(`Staff ${editingStaff.name} updated.`, 'success');
      } else {
        await api.createStaff(formData);
        showToast(`Staff ${formData.name} registered.`, 'success');
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Collection Staff Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage municipal sanitation personnel, assigned trucks, and shifts.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-forest-700 text-white hover:bg-forest-800 shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {staffList.map(staff => (
          <div key={staff.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{staff.employeeId}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                staff.workingStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                staff.workingStatus === 'BUSY' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {staff.workingStatus}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900">{staff.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> {staff.contactNumber}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Truck className="w-3 h-3 text-slate-400" />
                {staff.assignedVehicle ? staff.assignedVehicle.vehicleNumber : 'Vehicle: Standby'}
              </p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs flex justify-between">
              <span className="text-slate-500 font-medium">Completed Pickups:</span>
              <strong className="text-forest-700">{staff.completedCollections} Tasks</strong>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => handleOpenEdit(staff)}
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => handleDelete(staff.id, staff.name)}
                className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
              >
                <Trash className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              {editingStaff ? 'Edit Staff Member' : 'Register Staff Member'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Employee ID</label>
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={formData.contactNumber}
                  onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Working Status</label>
                <select
                  value={formData.workingStatus}
                  onChange={e => setFormData({ ...formData, workingStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ON_LEAVE">ON_LEAVE</option>
                  <option value="BUSY">BUSY</option>
                </select>
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
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

