import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import L from 'leaflet';
import { 
  Route, 
  MapPin, 
  Truck, 
  Navigation, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  Play, 
  RotateCw, 
  ArrowRight, 
  Milestone,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export default function RouteOptimization() {
  const { refreshTrigger, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('TOUR'); // 'TOUR' | 'POINT_TO_POINT'
  const [vehicles, setVehicles] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Multi-Stop Tour Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [startDepotCode, setStartDepotCode] = useState('DEPOT-01');
  const [minThreshold, setMinThreshold] = useState(75);
  const [tourResult, setTourResult] = useState(null);

  // Point to point Dijkstra state
  const [p2pStart, setP2pStart] = useState('DEPOT-01');
  const [p2pEnd, setP2pEnd] = useState('INT-06');
  const [p2pResult, setP2pResult] = useState(null);

  // Leaflet map refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, [refreshTrigger]);

  const loadInitialData = async () => {
    try {
      const [vList, gData] = await Promise.all([
        api.getVehicles(),
        api.getCityGraph()
      ]);
      setVehicles(vList);
      if (vList.length > 0) {
        setSelectedVehicleId(vList[0].id.toString());
      }
      setGraphData(gData);
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [18.5250, 73.8550],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap | Smart Waste Routing'
    }).addTo(map);

    routeLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Map Graphics whenever tourResult or p2pResult changes
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;
    routeLayerRef.current.clearLayers();

    if (activeTab === 'TOUR' && tourResult?.stops?.length) {
      const latlngs = [];
      // If full polyline exists from backend Dijkstra concatenation
      if (tourResult.fullPolylineVertices?.length) {
        tourResult.fullPolylineVertices.forEach(v => {
          latlngs.push([v.latitude, v.longitude]);
        });
      } else {
        tourResult.stops.forEach(s => {
          latlngs.push([s.latitude, s.longitude]);
        });
      }

      // Draw polyline
      const polyline = L.polyline(latlngs, {
        color: '#16a34a',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 6',
        lineJoin: 'round'
      }).addTo(routeLayerRef.current);

      mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });

      // Add Stop Markers with Order Numbers
      tourResult.stops.forEach(stop => {
        const isDepot = stop.stopType.includes('DEPOT');
        const markerHtml = `
          <div style="
            background-color: ${isDepot ? '#0f172a' : '#15803d'};
            color: white;
            font-size: 11px;
            font-weight: 800;
            width: 28px;
            height: 28px;
            border-radius: 9999px;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          ">
            ${isDepot ? '🏛️' : stop.stopOrder}
          </div>
        `;
        const icon = L.divIcon({
          html: markerHtml,
          className: 'tour-stop-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const m = L.marker([stop.latitude, stop.longitude], { icon }).addTo(routeLayerRef.current);
        m.bindPopup(`
          <div style="font-size: 12px; padding: 2px;">
            <strong>Stop #${stop.stopOrder}: ${stop.locationName}</strong><br/>
            ${stop.dustbinCode ? `<span>Dustbin: <strong>${stop.dustbinCode}</strong> (${stop.fillPercentage}%)</span><br/>` : ''}
            <span>Segment Distance: ${stop.segmentDistanceKm} km</span><br/>
            <span>Cumulative: ${stop.cumulativeDistanceKm} km</span>
          </div>
        `);
      });
    } else if (activeTab === 'POINT_TO_POINT' && p2pResult?.pathVertices?.length) {
      const latlngs = p2pResult.pathVertices.map(v => [v.latitude, v.longitude]);
      const polyline = L.polyline(latlngs, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.9
      }).addTo(routeLayerRef.current);

      mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });

      // Markers for start, waypoints, and end
      p2pResult.pathVertices.forEach((v, idx) => {
        const isStart = idx === 0;
        const isEnd = idx === p2pResult.pathVertices.length - 1;
        const icon = L.divIcon({
          html: `
            <div style="
              background-color: ${isStart ? '#16a34a' : isEnd ? '#dc2626' : '#3b82f6'};
              color: white;
              font-size: 10px;
              font-weight: bold;
              padding: 3px 6px;
              border-radius: 6px;
              border: 2px solid white;
              box-shadow: 0 4px 6px rgba(0,0,0,0.3);
              white-space: nowrap;
            ">
              ${isStart ? '🚩 START' : isEnd ? '🏁 END' : v.code}
            </div>
          `,
          iconSize: [60, 24],
          iconAnchor: [30, 24]
        });
        L.marker([v.latitude, v.longitude], { icon }).addTo(routeLayerRef.current);
      });
    }
  }, [tourResult, p2pResult, activeTab]);

  const handleGenerateTour = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.optimizeRoute({
        vehicleId: selectedVehicleId,
        startDepotCode,
        minimumFillThreshold: parseInt(minThreshold)
      });
      setTourResult(res);
      showToast(`Optimized route generated with ${res.totalStopsCount} collection stops (${res.totalDistanceKm} km)!`, 'success');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleComputeP2p = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.computeShortestPath(p2pStart, p2pEnd);
      if (res.found) {
        setP2pResult(res);
        showToast(`Shortest path calculated via Dijkstra: ${res.totalDistanceKm} km`, 'success');
      } else {
        showToast('No road path found between selected locations', 'warning');
      }
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const verticesList = graphData?.vertices || [];

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Graph & Route Optimization</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Dijkstra + Priority Greedy VRP
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Adjacency list weighted city graph with priority-aware greedy stop selection and Dijkstra point-to-point road calculations.
          </p>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="flex items-center bg-slate-200 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('TOUR')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'TOUR' ? 'bg-white text-forest-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Multi-Stop Collection Tour
          </button>
          <button
            onClick={() => setActiveTab('POINT_TO_POINT')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'POINT_TO_POINT' ? 'bg-white text-forest-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dijkstra Shortest Path
          </button>
        </div>
      </div>

      {/* Main Content Layout: Controls on Left, Map & Visuals on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {activeTab === 'TOUR' ? (
            /* Multi-Stop Greedy Optimizer Form */
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-forest-700" />
                  Route Dispatch Parameters
                </h3>
                <span className="text-[10px] font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
                  Greedy TSP Heuristic
                </span>
              </div>

              <form onSubmit={handleGenerateTour} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Collection Vehicle</label>
                  <select
                    value={selectedVehicleId}
                    onChange={e => setSelectedVehicleId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500 bg-slate-50"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.vehicleNumber} ({v.vehicleType}) • Cap: {v.capacityKg} kg • Status: {v.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Starting Municipal Depot</label>
                  <select
                    value={startDepotCode}
                    onChange={e => setStartDepotCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-forest-500 bg-slate-50"
                  >
                    <option value="DEPOT-01">DEPOT-01: Central Municipal Waste Depot (Shivaji Nagar)</option>
                    <option value="DEPOT-02">DEPOT-02: North Ward Transfer Station (Aundh)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700">Minimum Fill Threshold</span>
                    <span className="font-bold text-forest-700">{minThreshold}% & above</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    step="5"
                    value={minThreshold}
                    onChange={e => setMinThreshold(e.target.value)}
                    className="w-full accent-forest-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>50% (Medium+)</span>
                    <span>75% (High+)</span>
                    <span>90% (Critical Only)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Executing Route Algorithms...' : 'Calculate Optimized Route'}
                </button>
              </form>
            </div>
          ) : (
            /* Point to Point Dijkstra Form */
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  Dijkstra Point-to-Point Route
                </h3>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  O((V+E) log V)
                </span>
              </div>

              <form onSubmit={handleComputeP2p} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Origin Node (Start Location)</label>
                  <select
                    value={p2pStart}
                    onChange={e => setP2pStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  >
                    {verticesList.map(v => (
                      <option key={v.code} value={v.code}>
                        {v.code} - {v.name} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Destination Node (Target Location)</label>
                  <select
                    value={p2pEnd}
                    onChange={e => setP2pEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  >
                    {verticesList.map(v => (
                      <option key={v.code} value={v.code}>
                        {v.code} - {v.name} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {loading ? 'Finding Shortest Path...' : 'Compute Shortest Path'}
                </button>
              </form>
            </div>
          )}

          {/* Tour Metrics Card */}
          {activeTab === 'TOUR' && tourResult && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Tour Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Distance</span>
                  <span className="text-base font-extrabold text-forest-700">{tourResult.totalDistanceKm} km</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Collection Stops</span>
                  <span className="text-base font-extrabold text-slate-900">{tourResult.totalStopsCount} Bins</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Estimated Time</span>
                  <span className="text-base font-extrabold text-slate-900">{tourResult.estimatedDurationMinutes} mins</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Waste Collected</span>
                  <span className="text-base font-extrabold text-forest-700">{tourResult.totalWasteToCollectKg} kg</span>
                </div>
              </div>

              {/* Algorithm Explanation Note */}
              <div className="p-3 bg-forest-50/70 border border-forest-200 rounded-lg text-slate-700 text-[11px] leading-relaxed">
                <p className="font-semibold text-forest-900 mb-0.5">Algorithm Execution Report:</p>
                {tourResult.algorithmExplanation}
              </div>
            </div>
          )}

          {/* P2P Dijkstra Result Card */}
          {activeTab === 'POINT_TO_POINT' && p2pResult && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Dijkstra Shortest Path Result</h4>
              <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-200">
                <span className="text-blue-900 font-semibold">Total Shortest Distance:</span>
                <span className="text-lg font-black text-blue-700">{p2pResult.totalDistanceKm} km</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Path Vertex Sequence:</span>
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                  {p2pResult.pathCodes.map((code, idx) => (
                    <React.Fragment key={idx}>
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-slate-800">
                        {code}
                      </span>
                      {idx < p2pResult.pathCodes.length - 1 && <span className="text-slate-400">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="h-[460px] rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
            <div ref={mapContainerRef} className="w-full h-full" />
            <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 shadow text-xs font-semibold text-slate-700">
              Interactive OpenStreetMap Route Overlay
            </div>
          </div>

          {/* Stops Itinerary Table */}
          {activeTab === 'TOUR' && tourResult?.stops?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                Ordered Itinerary Stops
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                {tourResult.stops.map(stop => (
                  <div key={stop.stopOrder} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">
                        {stop.stopOrder}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {stop.locationName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {stop.dustbinCode ? `Bin: ${stop.dustbinCode} • Fill: ${stop.fillPercentage}% • Load: ${stop.wasteQuantityKg} kg` : stop.stopType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-700">+{stop.segmentDistanceKm} km</span>
                      <p className="text-[10px] text-slate-400">Total: {stop.cumulativeDistanceKm} km</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
