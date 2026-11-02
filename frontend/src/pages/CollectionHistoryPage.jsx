import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { History, Search, Download, CheckCircle, Calendar, Truck, User, ArrowUpDown } from 'lucide-react';

export default function CollectionHistoryPage() {
  const { refreshTrigger, showToast } = useApp();
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getCollectionHistory();
      setHistory(data);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Collection Code,Dustbin Code,Staff Name,Vehicle Number,Previous Fill (%),Waste Collected (kg),Date,Status'];
    const rows = history.map(h => 
      `"${h.collectionCode}","${h.dustbinCode}","${h.staffName || ''}","${h.vehicleNumber || ''}",${h.previousFillPercentage},${h.collectedWasteQuantity},"${h.collectionDate}","${h.collectionStatus}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_waste_collection_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported collection logs to CSV!', 'success');
  };

  const filtered = history.filter(h => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      h.collectionCode?.toLowerCase().includes(q) ||
      h.dustbinCode?.toLowerCase().includes(q) ||
      h.staffName?.toLowerCase().includes(q) ||
      h.vehicleNumber?.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    const timeA = new Date(a.collectionDate).getTime();
    const timeB = new Date(b.collectionDate).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const totalCollectedKg = history.reduce((sum, h) => sum + (h.collectedWasteQuantity || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Municipal Collection History</h2>
          <p className="text-sm text-slate-500 mt-0.5">Auditable logs of emptied dustbins, collected tonnage, and personnel records.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-forest-700" />
          Export Report to CSV
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-semibold uppercase">Total Logged Pickups</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{history.length} Tasks</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-semibold uppercase">Cumulative Waste Cleared</span>
          <p className="text-2xl font-bold text-forest-700 mt-1">{Math.round(totalCollectedKg)} kg ({((totalCollectedKg)/1000).toFixed(2)} Tons)</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 text-xs font-semibold uppercase">Average Previous Fill</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {history.length ? Math.round(history.reduce((s, h) => s + h.previousFillPercentage, 0) / history.length) : 0}%
          </p>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, bin, driver, or truck..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
        </div>

        <button
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1 transition"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          Date Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Log Code</th>
                <th className="py-3 px-4">Dustbin</th>
                <th className="py-3 px-4">Collection Staff</th>
                <th className="py-3 px-4">Vehicle Number</th>
                <th className="py-3 px-4">Prev Fill %</th>
                <th className="py-3 px-4">Quantity Cleared</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.collectionCode}</td>
                  <td className="py-3 px-4 font-bold text-forest-800">{row.dustbinCode}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{row.staffName || 'Sanitation Crew'}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{row.vehicleNumber || 'MH-12-GW-9001'}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800">{row.previousFillPercentage}%</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-forest-700">{row.collectedWasteQuantity} kg</td>
                  <td className="py-3 px-4 text-slate-500">
                    {row.collectionDate ? new Date(row.collectionDate).toLocaleString() : 'Recent'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {row.collectionStatus || 'COMPLETED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
