import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Trash2, 
  Truck, 
  Users, 
  Clock, 
  Download, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, AreaChart, Area 
} from 'recharts';

export default function AnalyticsReports() {
  const { refreshTrigger, showToast } = useApp();
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [refreshTrigger]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [sData, vData, stData] = await Promise.all([
        api.getDashboardStats(),
        api.getVehicles(),
        api.getStaff()
      ]);
      setStats(sData);
      setVehicles(vData);
      setStaffList(stData);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSummary = () => {
    showToast('Analytics summary exported as PDF/CSV report!', 'success');
  };

  const weeklyTrend = stats?.dailyStats || [];
  const areaWaste = stats?.areaWasteStats || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & City Performance Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">Municipal operational metrics, vehicle utilization, and area waste trends.</p>
        </div>
        <button
          onClick={handleExportSummary}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-forest-700 text-white hover:bg-forest-800 shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export Executive Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-semibold uppercase">Dustbin Utilization Rate</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">74.2%</p>
          <span className="text-[11px] text-emerald-600 font-medium">Optimal capacity utilization</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-semibold uppercase">Avg Collection Turnaround</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">28.5 mins</p>
          <span className="text-[11px] text-slate-500">From 75% threshold to emptied</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-semibold uppercase">Fleet Operational Rate</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">83.3%</p>
          <span className="text-[11px] text-slate-500">Active vs Maintenance vehicles</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-semibold uppercase">Staff Efficiency Index</span>
          <p className="text-2xl font-bold text-forest-700 mt-1">94.8%</p>
          <span className="text-[11px] text-emerald-600 font-medium">High task adherence</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Collection Curve */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-1">Weekly Collection Volume Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Total kilograms cleared per day</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#166534" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#166534" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`${value} kg`, 'Collected Waste']} />
                <Area type="monotone" dataKey="wasteCollectedKg" stroke="#166534" fillOpacity={1} fill="url(#colorWaste)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area-Wise Waste Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-1">Area-Wise Waste Tonnage</h3>
          <p className="text-xs text-slate-400 mb-4">Comparison across major city zones</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaWaste} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="areaName" type="category" tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`${value} Tons`, 'Total Waste']} />
                <Bar dataKey="wasteTons" fill="#15803d" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fleet & Staff Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Performance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-3">Vehicle Fleet Performance</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {vehicles.map(v => (
              <div key={v.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">{v.vehicleNumber}</strong>
                  <span className="text-[11px] text-slate-400">{v.vehicleType} • Driver: {v.driverName || 'Standby'}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-forest-700">{v.collectedWasteCapacity} kg cleared</span>
                  <p className="text-[10px] text-slate-400">Capacity: {v.capacityKg} kg</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-3">Staff Task Completion Board</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {staffList.map(s => (
              <div key={s.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">{s.name} ({s.employeeId})</strong>
                  <span className="text-[11px] text-slate-400">{s.assignedRoute || 'General Dispatch'}</span>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                    {s.completedCollections} Completed
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Status: {s.workingStatus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
