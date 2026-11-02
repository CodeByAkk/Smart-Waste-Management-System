import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Cpu, 
  Play, 
  RotateCcw, 
  GitCommit, 
  CheckCircle, 
  Clock, 
  Layers, 
  Activity, 
  ArrowRight, 
  Hash, 
  Sparkles, 
  Code,
  Flame,
  Route,
  Navigation
} from 'lucide-react';

export default function DsaVisualizerSandbox() {
  const [selectedAlgo, setSelectedAlgo] = useState('mergesort'); // 'mergesort' | 'dijkstra' | 'heap' | 'greedy' | 'graph'
  const [algorithmsInfo, setAlgorithmsInfo] = useState([]);

  // Merge Sort Sandbox State
  const [mergeInput, setMergeInput] = useState('95, 45, 82, 100, 30, 76, 25, 92, 88, 94, 58, 91');
  const [mergeAsc, setMergeAsc] = useState(true);
  const [mergeResult, setMergeResult] = useState(null);
  const [sortingLoading, setSortingLoading] = useState(false);

  // Dijkstra Sandbox State
  const [dijkstraStart, setDijkstraStart] = useState('DEPOT-01');
  const [dijkstraEnd, setDijkstraEnd] = useState('INT-06');
  const [dijkstraResult, setDijkstraResult] = useState(null);
  const [dijkstraLoading, setDijkstraLoading] = useState(false);

  // Max Heap State
  const [heapData, setHeapData] = useState(null);

  // Graph State
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    try {
      const [info, heap, graph] = await Promise.all([
        api.getAlgorithmsInfo(),
        api.getHeapTree(),
        api.getCityGraph()
      ]);
      setAlgorithmsInfo(info);
      setHeapData(heap);
      setGraphData(graph);
    } catch (_) {}
  };

  const handleRunMergeSort = async (e) => {
    e.preventDefault();
    try {
      setSortingLoading(true);
      const nums = mergeInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const res = await api.runMergeSortDemo(nums, mergeAsc);
      setMergeResult(res);
    } catch (_) {} finally {
      setSortingLoading(false);
    }
  };

  const handleRunDijkstra = async (e) => {
    e.preventDefault();
    try {
      setDijkstraLoading(true);
      const res = await api.computeShortestPath(dijkstraStart, dijkstraEnd);
      setDijkstraResult(res);
    } catch (_) {} finally {
      setDijkstraLoading(false);
    }
  };

  const currentInfo = algorithmsInfo.find(a => a.id === selectedAlgo) || {};

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">DSA Demonstration & Evaluation Sandbox</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Academic Viva Ready
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Interactive verification of core algorithms implemented in pure Java: Max Heap, Dijkstra, Merge Sort, and Graph networks.
          </p>
        </div>
      </div>

      {/* Algorithm Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'mergesort', label: '1. Custom Merge Sort' },
          { id: 'dijkstra', label: '2. Dijkstra\'s Algorithm' },
          { id: 'max-heap', label: '3. Custom Max Heap (Priority Queue)' },
          { id: 'greedy-optimizer', label: '4. Greedy Route Optimizer (VRP)' },
          { id: 'graph', label: '5. Weighted Graph (Adjacency List)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedAlgo(tab.id)}
            className={`px-4 py-2.5 rounded-t-lg transition whitespace-nowrap border-b-2 ${
              selectedAlgo === tab.id
                ? 'border-forest-700 text-forest-800 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Algorithm Theoretical Complexity Card */}
      {currentInfo && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">{currentInfo.type}</span>
              <h3 className="text-base font-bold text-slate-900">{currentInfo.name}</h3>
            </div>
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono font-bold">
              Space: {currentInfo.spaceComplexity}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
              <span className="font-bold text-slate-700 block">Time Complexity:</span>
              <p className="font-mono text-forest-800 font-semibold">{currentInfo.timeComplexity}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
              <span className="font-bold text-slate-700 block">Actual Project Application Role:</span>
              <p className="text-slate-600 leading-relaxed">{currentInfo.applicationRole}</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MERGE SORT DEMO TAB */}
      {/* ========================================================================= */}
      {selectedAlgo === 'mergesort' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Interactive Merge Sort Step Tracer</h3>
            <p className="text-xs text-slate-500">
              Provide comma-separated numbers (such as dustbin fill percentages). Watch divide-and-conquer recursion and merge steps execute in real time.
            </p>

            <form onSubmit={handleRunMergeSort} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Input Numbers Array</label>
                <input
                  type="text"
                  value={mergeInput}
                  onChange={e => setMergeInput(e.target.value)}
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500 bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 font-medium text-slate-700">
                  <input
                    type="radio"
                    name="mergeOrder"
                    checked={mergeAsc}
                    onChange={() => setMergeAsc(true)}
                  />
                  <span>Ascending Order (Min to Max)</span>
                </label>
                <label className="flex items-center gap-1.5 font-medium text-slate-700">
                  <input
                    type="radio"
                    name="mergeOrder"
                    checked={!mergeAsc}
                    onChange={() => setMergeAsc(false)}
                  />
                  <span>Descending Order (Highest Priority First)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={sortingLoading}
                className="px-4 py-2 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-bold shadow transition flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {sortingLoading ? 'Executing Merge Sort...' : 'Run Merge Sort in Java'}
              </button>
            </form>
          </div>

          {mergeResult && (
            <div className="space-y-4">
              {/* Telemetry Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-slate-400 text-xs font-semibold uppercase">Total Comparisons</span>
                  <p className="text-2xl font-bold text-forest-700 mt-1">{mergeResult.comparisonsCount} Ops</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-slate-400 text-xs font-semibold uppercase">Merge Operations</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{mergeResult.mergesCount} Sub-merges</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-slate-400 text-xs font-semibold uppercase">CPU Elapsed Time</span>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{mergeResult.executionTimeNanos} ns</p>
                </div>
              </div>

              {/* Sorted Array Output */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 block mb-1">Final Sorted Array Result:</span>
                <div className="flex flex-wrap gap-2">
                  {mergeResult.sortedList.map((val, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-white font-mono font-bold text-emerald-800 border border-emerald-300 shadow-sm text-xs">
                      {val}
                    </span>
                  ))}
                </div>
              </div>

              {/* Step Traces Log */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                  Detailed Step-by-Step Execution Trace ({mergeResult.stepTraces.length} Steps)
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {mergeResult.stepTraces.map(step => (
                    <div key={step.stepNumber} className="p-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-slate-500">Step #{step.stepNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            step.action === 'DIVIDE' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {step.action}
                          </span>
                        </div>
                        <p className="text-slate-700">{step.explanation}</p>
                      </div>
                      <div className="font-mono text-[11px] bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-800 font-bold whitespace-nowrap">
                        [{step.currentSubarray.join(', ')}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DIJKSTRA DEMO TAB */}
      {/* ========================================================================= */}
      {selectedAlgo === 'dijkstra' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Dijkstra Shortest Path Step Tracer</h3>
            <p className="text-xs text-slate-500">
              Select origin and destination nodes to trace Min-Heap vertex relaxation and shortest road routing.
            </p>

            <form onSubmit={handleRunDijkstra} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Start Location</label>
                <select
                  value={dijkstraStart}
                  onChange={e => setDijkstraStart(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                >
                  {graphData?.vertices?.map(v => (
                    <option key={v.code} value={v.code}>{v.code} - {v.name} ({v.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Destination Location</label>
                <select
                  value={dijkstraEnd}
                  onChange={e => setDijkstraEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                >
                  {graphData?.vertices?.map(v => (
                    <option key={v.code} value={v.code}>{v.code} - {v.name} ({v.type})</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={dijkstraLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow transition flex items-center gap-2"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {dijkstraLoading ? 'Tracing Dijkstra...' : 'Compute Shortest Road Distance'}
                </button>
              </div>
            </form>
          </div>

          {dijkstraResult && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900 block">Shortest Path Found:</span>
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs mt-1">
                    {dijkstraResult.pathCodes.map((code, idx) => (
                      <React.Fragment key={idx}>
                        <span className="px-2 py-0.5 rounded bg-white font-bold text-blue-900 border border-blue-200">
                          {code}
                        </span>
                        {idx < dijkstraResult.pathCodes.length - 1 && <span>→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-blue-600 uppercase font-bold block">Total Distance</span>
                  <span className="text-2xl font-black text-blue-900">{dijkstraResult.totalDistanceKm} km</span>
                </div>
              </div>

              {/* Execution Trace Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                  Dijkstra Relaxation Trace Steps ({dijkstraResult.executionTrace.length} Steps)
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {dijkstraResult.executionTrace.map(step => (
                    <div key={step.stepNumber} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-500">#{step.stepNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          step.status === 'SETTLED' ? 'bg-emerald-100 text-emerald-800' :
                          step.status === 'UPDATED' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {step.status}
                        </span>
                        <span className="text-slate-800 font-medium">
                          Vertex: <strong className="font-mono">{step.currentVertex}</strong> 
                          {step.evaluatedNeighbor !== '-' && ` → Neighbor: ${step.evaluatedNeighbor}`}
                        </span>
                      </div>
                      <div className="text-right font-mono font-bold text-slate-700">
                        Dist: {step.updatedDistance.toFixed(2)} km
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAX HEAP TAB */}
      {/* ========================================================================= */}
      {selectedAlgo === 'max-heap' && heapData && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Custom Max-Heap Structural Hierarchy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every parent node at index <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-bold">i</code> satisfies the Heap Property: 
              <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-bold">Priority(i) &gt;= Priority(2i+1)</code> and 
              <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-bold">Priority(i) &gt;= Priority(2i+2)</code>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
              {heapData.treeNodes?.slice(0, 15).map(item => (
                <div key={item.index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-400">Node [{item.index}]</span>
                    <span className="font-bold text-slate-900">{item.node?.dustbinCode}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Fill Level:</span>
                    <strong className="text-red-600">{item.node?.fillPercentage}%</strong>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 space-y-0.5">
                    <div>Parent: {item.parentIndex !== null ? `[${item.parentIndex}]` : 'ROOT (None)'}</div>
                    <div>Left Child: {item.leftChild !== null ? `[${item.leftChild}]` : 'None'}</div>
                    <div>Right Child: {item.rightChild !== null ? `[${item.rightChild}]` : 'None'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. GREEDY OPTIMIZER TAB */}
      {/* ========================================================================= */}
      {selectedAlgo === 'greedy-optimizer' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900">Why Dijkstra Alone Does Not Solve Waste Collection Routing</h3>
          
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-2 leading-relaxed">
            <p className="font-bold">Algorithmic Distinction & Academic Clarification:</p>
            <p>
              Dijkstra's Algorithm is formulated strictly for <strong>single-pair or single-source shortest path</strong> calculations across a graph. It finds the shortest path between 2 vertices in polynomial time \(O((V + E) \log V)\).
            </p>
            <p>
              However, the full Multi-Stop Garbage Collection Routing problem visits multiple collection targets across the city before returning to the depot, which is an instance of the <strong>Travelling Salesperson Problem (TSP) / Capacitated Vehicle Routing Problem (CVRP)</strong>, which is <strong>NP-Hard</strong>.
            </p>
          </div>

          <div className="space-y-2 text-slate-700 leading-relaxed">
            <h4 className="font-bold text-slate-900 text-xs">Our Priority-Aware Greedy Heuristic Solution:</h4>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li><strong>Candidate Identification:</strong> Identify dustbins exceeding collection thresholds (e.g. &gt;= 75% or 90%) whose waste mass fits within available vehicle capacity.</li>
              <li><strong>Dijkstra Distance Computation:</strong> For each candidate, calculate the exact network road distance from current truck position using Dijkstra's shortest path algorithm.</li>
              <li><strong>Heuristic Evaluation Function:</strong> Score candidates by balancing waste urgency against road distance:
                <pre className="p-2 bg-slate-100 rounded text-slate-800 font-mono text-[11px] my-1">
                  Score = (PriorityWeight * 100) / (DijkstraDistanceKm + 0.5)
                </pre>
              </li>
              <li><strong>Greedy Step Selection:</strong> The truck advances to the maximum score stop, loads waste, and iterates until capacity is reached or all urgent bins are cleared.</li>
              <li><strong>Depot Closure:</strong> The final path back to Central Municipal Depot is accurately calculated using Dijkstra's shortest path.</li>
            </ol>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. GRAPH ADJACENCY TAB */}
      {/* ========================================================================= */}
      {selectedAlgo === 'graph' && graphData && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">City Road Network Adjacency List Structure</h3>
            <span className="font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
              |V| = {graphData.vertexCount} Vertices • |E| = {graphData.edgeCount} Roads
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {graphData.vertices?.slice(0, 15).map(v => (
              <div key={v.code} className="py-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-mono">{v.code}: {v.name}</strong>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                    {v.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {graphData.adjacencyList && graphData.adjacencyList[v.code]?.map((edge, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700 font-mono">
                      → {edge.targetCode} ({edge.distanceKm} km, {edge.roadName})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

