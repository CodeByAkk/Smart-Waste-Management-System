import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  AlertCircle, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Edit3,
  ExternalLink
} from 'lucide-react';

export default function ComplaintManagement() {
  const { role, refreshTrigger, refreshAll, showToast } = useApp();
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Submit Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    userName: '',
    contactDetails: '',
    category: 'OVERFLOWING',
    location: '',
    latitude: 18.5204,
    longitude: 73.8567,
    description: '',
    photographUrl: ''
  });

  // Status Update Modal (Admin)
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [statusForm, setStatusForm] = useState({
    status: 'ASSIGNED',
    assignedStaffId: '',
    adminNotes: ''
  });

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cList, sList] = await Promise.all([
        api.getComplaints(),
        api.getStaff()
      ]);
      setComplaints(cList);
      setStaffList(sList);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await api.submitComplaint(newComplaint);
      showToast(`Complaint registered successfully! Tracking Code: ${created.complaintCode}`, 'success');
      setCreateModalOpen(false);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!editingComplaint) return;
    try {
      await api.updateComplaintStatus(editingComplaint.id, {
        status: statusForm.status,
        assignedStaffId: statusForm.assignedStaffId ? parseInt(statusForm.assignedStaffId) : null,
        adminNotes: statusForm.adminNotes
      });
      showToast(`Complaint ${editingComplaint.complaintCode} updated to ${statusForm.status}.`, 'success');
      setEditingComplaint(null);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const filtered = complaints.filter(c => {
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchCode = c.complaintCode?.toLowerCase().includes(q);
      const matchUser = c.userName?.toLowerCase().includes(q);
      const matchLoc = c.location?.toLowerCase().includes(q);
      return matchCode || matchUser || matchLoc;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Public Grievances & Complaint Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Citizens report overflowing bins, damaged lids, and uncollected waste.</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-forest-700 text-white hover:bg-forest-800 shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          File Citizen Complaint
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, citizen, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Status:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Complaints Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(cmp => (
          <div key={cmp.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
            {cmp.photographUrl && (
              <div className="h-40 w-full overflow-hidden bg-slate-100 relative">
                <img src={cmp.photographUrl} alt="Complaint" className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold">
                  Evidence Photo
                </span>
              </div>
            )}

            <div className="p-5 space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 font-mono">{cmp.complaintCode}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  cmp.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                  cmp.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' :
                  cmp.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {cmp.status}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">{cmp.category}</span>
                <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">{cmp.description}</p>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {cmp.location}</p>
                <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> {cmp.userName} ({cmp.contactDetails})</p>
                {cmp.assignedStaff && (
                  <p className="text-forest-700 font-semibold">Assigned Staff: {cmp.assignedStaff.name}</p>
                )}
                {cmp.adminNotes && (
                  <p className="text-slate-600 bg-slate-50 p-1.5 rounded italic">Note: "{cmp.adminNotes}"</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400">
                {cmp.createdAt ? new Date(cmp.createdAt).toLocaleDateString() : 'Recent'}
              </span>
              <button
                onClick={() => {
                  setEditingComplaint(cmp);
                  setStatusForm({
                    status: cmp.status,
                    assignedStaffId: cmp.assignedStaff ? cmp.assignedStaff.id : '',
                    adminNotes: cmp.adminNotes || ''
                  });
                }}
                className="px-3 py-1 rounded bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Manage Status
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* File Complaint Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">File Public Waste Grievance</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pooja Deshmukh"
                  value={newComplaint.userName}
                  onChange={e => setNewComplaint({ ...newComplaint, userName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Phone / Email</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98220 XXXXX"
                  value={newComplaint.contactDetails}
                  onChange={e => setNewComplaint({ ...newComplaint, contactDetails: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Issue Category</label>
                <select
                  value={newComplaint.category}
                  onChange={e => setNewComplaint({ ...newComplaint, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                >
                  <option value="OVERFLOWING">Dustbin Overflowing</option>
                  <option value="GARBAGE_NOT_COLLECTED">Garbage Not Collected for Days</option>
                  <option value="DAMAGED_DUSTBIN">Damaged Dustbin / Broken Lid</option>
                  <option value="ILLEGAL_DUMPING">Illegal Roadside Dumping</option>
                  <option value="UNCLEAN_PUBLIC_AREA">Unclean Public Area</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Location Details</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near Cafe Goodluck, FC Road"
                  value={newComplaint.location}
                  onChange={e => setNewComplaint({ ...newComplaint, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Please describe the condition and severity..."
                  value={newComplaint.description}
                  onChange={e => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Photograph URL (Optional Evidence)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newComplaint.photographUrl}
                  onChange={e => setNewComplaint({ ...newComplaint, photographUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-bold"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Status Transition Modal */}
      {editingComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Manage Complaint: {editingComplaint.complaintCode}
            </h3>
            <form onSubmit={handleStatusSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Update Status</label>
                <select
                  value={statusForm.status}
                  onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assign Sanitation Staff Member</label>
                <select
                  value={statusForm.assignedStaffId}
                  onChange={e => setStatusForm({ ...statusForm, assignedStaffId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                >
                  <option value="">-- Select Staff --</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.employeeId} - {s.name} ({s.workingStatus})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Administrative Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Dispatched mini tipper truck to clear sidewalk..."
                  value={statusForm.adminNotes}
                  onChange={e => setStatusForm({ ...statusForm, adminNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingComplaint(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-bold"
                >
                  Update Grievance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

