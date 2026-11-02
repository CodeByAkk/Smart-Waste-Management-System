import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Truck, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  Activity, 
  Radio, 
  Flame, 
  MapPin, 
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';

export default function AdminDashboard() {
  const { refreshTrigger, refreshAll, showToast } = useApp();
  const [stats, setStats] = useState(null);
  const [recentBins, setRecentBins] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Sensor simulation widget state
  const [simBinCode, setSimBinCode] = useState('B101');
  const [simFillValue, setSimFillValue] = useState(95);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [refreshTrigger]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, binsData, historyData, complaintsData] = await Promise.all([
        api.getDashboardStats(),
        api.getDustbins(),
        api.getCollectionHistory(),
        api.getComplaints()
      ]);
      setStats(statsData);
      setRecentBins(binsData.slice(0, 6));
      setRecentHistory(historyData.slice(0, 5));
      setComplaints(complaintsData.slice(0, 4));
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSimulating(true);
      await api.simulateSensor(simBinCode, parseInt(simFillValue));
      showToast(`Sensor update applied for ${simBinCode}: ${simFillValue}%`, 'success');
      refreshAll();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSimulating(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-forest-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500">Loading Smart City Platform Metrics...</span>
        </div>
      </div>
    );
  }

  // Chart data formatting
  const pieData = stats?.statusDistribution ? [
    { name: 'Empty (0-30%)', value: stats.statusDistribution['Empty (0-30%)'] || 0, color: '#10b981' },
    { name: 'Moderate (31-74%)', value: stats.statusDistribution['Moderate (31-74%)'] || 0, color: '#eab308' },
    { name: 'Almost Full (75-89%)', value: stats.statusDistribution['Almost Full (75-89%)'] || 0, color: '#f97316' },
    { name: 'Critical (90-100%)', value: stats.statusDistribution['Critical (90-100%)'] || 0, color: '#ef4444' }
  ] : [];

  const dailyTrend = stats?.dailyStats || [];
  const areaWaste = stats?.areaWasteStats || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Smart City Waste Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">Real-time IoT sensors telemetry, priority queues, and optimized collection operations.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshAll()}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-forest-600" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* 8 Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Dustbins */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Dustbins</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.totalDustbins ?? 0}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>Installed across Pune Municipal Grid</span>
          </div>
        </div>

        {/* Card 2: Empty Dustbins */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Empty / Low (0-30%)</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats?.emptyDustbins ?? 0}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>Adequate capacity remaining</span>
          </div>
        </div>

        {/* Card 3: Almost Full (75-89%) */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Almost Full (75-89%)</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats?.almostFullDustbins ?? 0}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>High priority collection queue</span>
          </div>
        </div>

        {/* Card 4: Critical Dustbins (90-100%) */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-red-200 bg-red-50/20 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">Critical (90-100%)</span>
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats?.completelyFullDustbins ?? 0}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-red-600 font-medium">
            <span>Immediate dispatch required</span>
          </div>
        </div>

        {/* Card 5: Pending Requests */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Urgent Requests</span>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.pendingCollectionRequests ?? 0}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>Bins with fill &gt;= 75%</span>
          </div>
        </div>

        {/* Card 6: Available Vehicles */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Fleet</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats?.availableGarbageVehicles ?? 0} <span className="text-sm font-normal text-slate-400">/ {stats?.totalVehicles ?? 0}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>Ready for dispatch routes</span>
          </div>
        </div>

        {/* Card 7: Collections Today */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Collections Today</span>
            <div className="p-2 rounded-lg bg-forest-50 text-forest-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-forest-700">{stats?.totalCollectionsToday ?? 0}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>{stats?.totalWasteCollectedKg ? `${stats.totalWasteCollectedKg} kg emptied` : '0 kg'}</span>
          </div>
        </div>

        {/* Card 8: Completion Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600">{stats?.collectionCompletionRate ?? 0}%</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>Urgent bins service efficiency</span>
          </div>
        </div>
      </div>

      {/* Visualizations Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Dustbin Filling Distribution (Donut) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Dustbin Filling Distribution</h3>
            <span className="text-xs text-slate-400">Capacity breakdown</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Daily Garbage Collection Statistics */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Daily Garbage Collection Trends (Last 7 Days)</h3>
            <span className="text-xs text-slate-400">Waste collected in Kg</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`${value} kg`, 'Waste Collected']} />
                <Bar dataKey="wasteCollectedKg" fill="#166534" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Visualizations Row 2: Area-wise Waste & Sensor Simulation Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area-Wise Waste Generation Table/Bar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm">Area-wise Waste Generation & Average Fill</h3>
            <span className="text-xs text-slate-400">Pune municipal zones</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">City Area</th>
                  <th className="py-2.5 px-3">Dustbins</th>
                  <th className="py-2.5 px-3">Waste (Tons)</th>
                  <th className="py-2.5 px-3">Avg Fill %</th>
                  <th className="py-2.5 px-3">Status Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {areaWaste.map((area, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{area.areaName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{area.dustbinsCount}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{area.wasteTons} T</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              area.avgFillPercentage >= 80 ? 'bg-red-500' :
                              area.avgFillPercentage >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${area.avgFillPercentage}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-700">{area.avgFillPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        area.avgFillPercentage >= 75 ? 'bg-red-100 text-red-700' :
                        area.avgFillPercentage >= 50 ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {area.avgFillPercentage >= 75 ? 'HIGH ATTENTION' : area.avgFillPercentage >= 50 ? 'MODERATE' : 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Module 9: Simulated Smart Sensor Controller */}
        <div className="bg-gradient-to-br from-forest-900 to-forest-950 text-white p-5 rounded-xl shadow-md border border-forest-800">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-5 h-5 text-forest-400 animate-pulse" />
            <h3 className="font-bold text-sm tracking-tight">IoT Sensor Simulation Hub</h3>
          </div>
          <p className="text-xs text-forest-200 leading-relaxed mb-4">
            Simulate live ultrasonic level updates from smart bins. Testing changes triggers immediate database persistence, automatic Max Heap priority updates, and threshold alerts.
          </p>

          <form onSubmit={handleSimulateSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-forest-300 mb-1">Target Dustbin Code</label>
              <select
                value={simBinCode}
                onChange={e => setSimBinCode(e.target.value)}
                className="w-full bg-forest-800/80 border border-forest-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-forest-400 focus:outline-none"
              >
                {recentBins.map(b => (
                  <option key={b.dustbinCode} value={b.dustbinCode} className="bg-forest-900 text-white">
                    {b.dustbinCode} - {b.locationName} (Currently {b.fillPercentage}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium text-forest-300 mb-1">
                <span>New Simulated Fill Level</span>
                <span className="font-bold text-white text-sm">{simFillValue}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simFillValue}
                onChange={e => setSimFillValue(e.target.value)}
                className="w-full accent-forest-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-forest-400 font-mono mt-1">
                <span>0% Empty</span>
                <span>50%</span>
                <span>75% Alert</span>
                <span>100% Full</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={simulating}
              className="w-full mt-2 py-2 px-4 rounded-lg bg-forest-500 hover:bg-forest-400 text-forest-950 font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {simulating ? 'Broadcasting Update...' : 'Update Sensor Reading'}
            </button>
          </form>
        </div>
      </div>

      {/* Recent Activity Sections: Dustbins & Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Collections */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Recent Waste Collections</h3>
            <span className="text-xs text-slate-400">Completed pickups</span>
          </div>
          <div className="divide-y divide-slate-100">
            {recentHistory.map(item => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    {item.dustbinCode}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{item.staffName || 'Collection Staff'}</p>
                    <p className="text-[11px] text-slate-500">Vehicle: {item.vehicleNumber} • Cleared at {item.previousFillPercentage}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-emerald-700">{item.collectedWasteQuantity} kg</span>
                  <p className="text-[10px] text-slate-400">
                    {item.collectionDate ? new Date(item.collectionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Public Complaints */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Recent Citizen Complaints</h3>
            <span className="text-xs text-slate-400">Public reports</span>
          </div>
          <div className="divide-y divide-slate-100">
            {complaints.map(cmp => (
              <div key={cmp.id} className="py-2.5 flex items-start justify-between text-xs gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-slate-800">{cmp.complaintCode}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cmp.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                      cmp.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {cmp.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{cmp.description}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5"><MapPin className="w-2.5 h-2.5 inline mr-1" />{cmp.location}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {cmp.userName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
