import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  Flame, 
  Layers, 
  RotateCcw, 
  ArrowUpRight, 
  Sparkles, 
  Trash2, 
  CheckCircle, 
  Info, 
  GitCommit, 
  Hash, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

export default function PriorityManagement() {
  const { refreshTrigger, refreshAll, showToast } = useApp();
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [heapTreeData, setHeapTreeData] = useState(null);
  const [topBin, setTopBin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);

  useEffect(() => {
    loadPriorityData();
  }, [refreshTrigger]);

  const loadPriorityData = async () => {
    try {
      setLoading(true);
      const [pq, tree, top] = await Promise.all([
        api.getPriorityQueue(),
        api.getHeapTree(),
        api.getNextDustbin()
      ]);
      setPriorityQueue(pq);
      setHeapTreeData(tree);
      setTopBin(top);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractMax = async () => {
    try {
      setExtracting(true);
      const extracted = await api.extractMaxPriority();
      if (extracted) {
        showToast(`Extracted top priority dustbin: ${extracted.dustbinCode} (${extracted.fillPercentage}%)`, 'success');
        refreshAll();
      } else {
        showToast('Priority Queue is currently empty.', 'warning');
      }
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setExtracting(false);
    }
  };

  const handleRebuild = async () => {
    try {
      setRebuilding(true);
      await api.rebuildPriorityQueue();
      showToast('Custom Max Heap rebuilt from database records.', 'success');
      refreshAll();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setRebuilding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Priority Management</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 text-red-800 border border-red-200">
              Custom Max Heap (Java)
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Dynamic urban prioritization utilizing a custom binary Max-Heap with tie-breaking rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRebuild}
            disabled={rebuilding}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-forest-700 ${rebuilding ? 'animate-spin' : ''}`} />
            Rebuild Max Heap
          </button>
          <button
            onClick={handleExtractMax}
            disabled={extracting || !topBin}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Flame className="w-3.5 h-3.5 text-white" />
            Extract Max Priority
          </button>
        </div>
      </div>

      {/* Top Urgent Dustbin Spotlight Card */}
      {topBin ? (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-2xl p-6 text-white shadow-lg border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-white/20 tracking-wider">
                Root Node [Index 0] • Highest Urgent Task
              </span>
              <span className="text-xs text-white/90 font-medium">Tie-Breaker: Timestamp & Proximity</span>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span>{topBin.dustbinCode}</span>
              <span className="text-xl px-3 py-0.5 rounded-full bg-white text-red-700 font-black shadow-inner">
                {topBin.fillPercentage}% FULL
              </span>
            </h3>
            <p className="text-sm text-white/90 font-medium max-w-xl">
              {topBin.locationName}
            </p>
            <p className="text-xs text-white/80">
              Coordinates: {topBin.latitude.toFixed(4)}, {topBin.longitude.toFixed(4)} • Derived Priority Score: {topBin.priorityScore ? topBin.priorityScore.toFixed(3) : topBin.fillPercentage}
            </p>
          </div>

          <div className="bg-black/20 backdrop-blur-md p-4 rounded-xl border border-white/10 text-xs min-w-[220px] space-y-2">
            <span className="font-bold text-white uppercase text-[10px] tracking-wider block">Heap Operational Specs</span>
            <div className="flex justify-between text-white/80">
              <span>Time Complexity:</span>
              <span className="font-mono font-bold text-white">O(log N)</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Extract Mechanism:</span>
              <span className="font-semibold text-white">Sift-Down Root</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Current Status:</span>
              <span className="font-bold text-amber-300 uppercase">{topBin.priorityLevel}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
          No urgent dustbins currently in priority queue.
        </div>
      )}

      {/* Heap Array Memory Representation (Visual DSA Demonstration) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Hash className="w-4 h-4 text-forest-700" />
              Binary Max-Heap Array Memory Buffer [0 .. N-1]
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live sequential storage layout where for index <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">i</code>: 
              Parent = <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">(i-1)/2</code>, 
              Left = <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">2i+1</code>, 
              Right = <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">2i+2</code>.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-forest-50 text-forest-700 border border-forest-200">
            Heap Size: {heapTreeData?.size ?? 0}
          </span>
        </div>

        {/* Array Cells Scrollable Row */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {heapTreeData?.heapArray && heapTreeData.heapArray.map((node, index) => (
              <div
                key={index}
                className={`flex flex-col items-center p-2.5 rounded-lg border text-center transition min-w-[76px] ${
                  index === 0 
                    ? 'bg-red-50 border-red-300 ring-2 ring-red-400/40' 
                    : node.fillPercentage >= 90
                    ? 'bg-rose-50 border-rose-200'
                    : node.fillPercentage >= 75
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-slate-400 mb-1">[{index}]</span>
                <span className="font-extrabold text-xs text-slate-900">{node.dustbinCode}</span>
                <span className={`text-[11px] font-bold mt-0.5 ${
                  node.fillPercentage >= 90 ? 'text-red-600' :
                  node.fillPercentage >= 75 ? 'text-amber-600' : 'text-slate-600'
                }`}>
                  {node.fillPercentage}%
                </span>
                <span className="text-[9px] text-slate-400 mt-1 uppercase font-semibold">
                  {node.priorityLevel.slice(0, 4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* "Next Dustbins to Collect" Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Next Dustbins to Collect (Heap Extracted Priority Order)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ordered sequence generated by continuous heap extractions with tie-breakers.</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing top {Math.min(priorityQueue.length, 12)} high-priority targets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Priority Rank</th>
                <th className="py-3 px-4">Dustbin Code</th>
                <th className="py-3 px-4">Location Name</th>
                <th className="py-3 px-4">Fill Percentage</th>
                <th className="py-3 px-4">Priority Class</th>
                <th className="py-3 px-4">Coordinates</th>
                <th className="py-3 px-4 text-right">Dispatch Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priorityQueue.slice(0, 15).map((bin, idx) => {
                const fill = bin.fillPercentage;
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                        idx === 0 ? 'bg-red-600 text-white' :
                        idx < 3 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{bin.dustbinCode}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{bin.locationName}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className={`h-full ${
                              fill >= 90 ? 'bg-red-500' :
                              fill >= 75 ? 'bg-orange-500' : 'bg-yellow-500'
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
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {bin.latitude.toFixed(4)}, {bin.longitude.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[11px] font-semibold text-forest-700 bg-forest-50 px-2 py-1 rounded">
                        Queued for Route
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
