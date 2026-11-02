import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Search, AlertCircle, CheckCircle2, Clock, MapPin, Plus, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PublicPortal() {
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [trackCode, setTrackCode] = useState('CMP-849201');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackCode.trim()) return;
    try {
      setTrackingLoading(true);
      const res = await api.trackComplaint(trackCode.trim());
      setTrackedComplaint(res);
    } catch (err) {
      showToast('No complaint record found with that tracking code.', 'danger');
      setTrackedComplaint(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-forest-800 to-forest-900 rounded-2xl p-6 sm:p-8 text-white shadow-md space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-700/60 text-forest-200">
          Citizen Waste Management Portal
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight">Keep Our Smart City Clean & Green</h2>
        <p className="text-sm text-forest-200 max-w-xl leading-relaxed">
          Report overflowing garbage bins, damaged containers, or uncollected streets. Your reports are automatically routed through our AI-assisted municipal dispatch queue.
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/complaints')}
            className="px-5 py-2.5 rounded-xl bg-white text-forest-900 font-bold text-xs shadow hover:bg-forest-50 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-forest-700" />
            Submit New Waste Complaint
          </button>
          <button
            onClick={() => navigate('/map')}
            className="px-5 py-2.5 rounded-xl bg-forest-700/60 text-white font-bold text-xs hover:bg-forest-700 transition flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Find Nearest Smart Dustbin
          </button>
        </div>
      </div>

      {/* Track Complaint Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900">Track Grievance Status</h3>
          <p className="text-xs text-slate-500 mt-0.5">Enter your complaint tracking number (e.g. CMP-849201)</p>
        </div>

        <form onSubmit={handleTrackSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              placeholder="Enter Complaint Tracking Code..."
              value={trackCode}
              onChange={e => setTrackCode(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-forest-500"
            />
          </div>
          <button
            type="submit"
            disabled={trackingLoading}
            className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs rounded-lg shadow-sm transition"
          >
            {trackingLoading ? 'Checking...' : 'Track Status'}
          </button>
        </form>

        {trackedComplaint && (
          <div className="mt-4 p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-mono font-bold text-sm text-slate-900">{trackedComplaint.complaintCode}</span>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                trackedComplaint.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                trackedComplaint.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {trackedComplaint.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <p>Category: <strong className="text-slate-900">{trackedComplaint.category}</strong></p>
              <p>Reported By: <strong>{trackedComplaint.userName}</strong></p>
              <p>Location: <strong>{trackedComplaint.location}</strong></p>
              <p>Date Filed: <strong>{new Date(trackedComplaint.createdAt).toLocaleDateString()}</strong></p>
            </div>

            <p className="text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
              "{trackedComplaint.description}"
            </p>

            {trackedComplaint.assignedStaff && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 font-medium">
                Sanitation Worker Assigned: <strong>{trackedComplaint.assignedStaff.name}</strong> ({trackedComplaint.assignedStaff.contactNumber})
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

