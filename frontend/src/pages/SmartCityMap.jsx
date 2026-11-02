import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import L from 'leaflet';
import { 
  Search, 
  Filter, 
  Layers, 
  Trash2, 
  Truck, 
  RefreshCw, 
  Info, 
  MapPin, 
  AlertTriangle, 
  Navigation,
  CheckCircle2
} from 'lucide-react';

export default function SmartCityMap() {
  const { refreshTrigger, refreshAll, showToast } = useApp();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routePolylineRef = useRef(null);

  const [dustbins, setDustbins] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // ALL, EMPTY, MODERATE, ALMOST_FULL, CRITICAL
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBin, setSelectedBin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Pune Municipal Grid: 18.5204, 73.8567
    const map = L.map(mapContainerRef.current, {
      center: [18.5250, 73.8550],
      zoom: 13,
      zoomControl: true
    });

    // OpenStreetMap standard tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Smart Waste Management',
      maxZoom: 19
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Fetch data on load or when refreshTrigger triggers
  useEffect(() => {
    loadMapData();
  }, [refreshTrigger]);

  const loadMapData = async () => {
    try {
      setLoading(true);
      const [binsData, vehiclesData] = await Promise.all([
        api.getDustbins(),
        api.getVehicles()
      ]);
      setDustbins(binsData);
      setVehicles(vehiclesData);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Render markers whenever dustbins, vehicles, filter, or search changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Filter dustbins
    const filteredBins = dustbins.filter(bin => {
      // Status filter
      if (selectedFilter === 'EMPTY' && bin.fillPercentage > 30) return false;
      if (selectedFilter === 'MODERATE' && (bin.fillPercentage <= 30 || bin.fillPercentage >= 75)) return false;
      if (selectedFilter === 'ALMOST_FULL' && (bin.fillPercentage < 75 || bin.fillPercentage >= 90)) return false;
      if (selectedFilter === 'CRITICAL' && bin.fillPercentage < 90) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchCode = bin.dustbinCode?.toLowerCase().includes(query);
        const matchLoc = bin.locationName?.toLowerCase().includes(query);
        return matchCode || matchLoc;
      }
      return true;
    });

    // Add Dustbin Markers
    filteredBins.forEach(bin => {
      const fill = bin.fillPercentage;
      let colorClass = 'bg-emerald-600 border-white';
      let pinColor = '#10b981';
      let isCritical = false;

      if (fill >= 90) {
        colorClass = 'bg-red-600 border-white ring-4 ring-red-400/50 animate-pulse';
        pinColor = '#ef4444';
        isCritical = true;
      } else if (fill >= 75) {
        colorClass = 'bg-amber-500 border-white ring-2 ring-amber-300';
        pinColor = '#f97316';
      } else if (fill > 30) {
        colorClass = 'bg-yellow-500 border-white';
        pinColor = '#eab308';
      }

      const iconHtml = `
        <div style="position: relative; text-align: center; cursor: pointer;">
          <div style="
            background-color: ${pinColor};
            color: white;
            font-weight: bold;
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 9999px;
            border: 2px solid white;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            gap: 2px;
          ">
            <span>${bin.dustbinCode}</span>
            <span style="font-size: 9px; opacity: 0.9;">${fill}%</span>
          </div>
          <div style="
            width: 0; 
            height: 0; 
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 6px solid ${pinColor};
            margin: 0 auto;
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-bin-marker',
        iconSize: [60, 30],
        iconAnchor: [30, 30]
      });

      const marker = L.marker([bin.latitude, bin.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 200px; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <strong style="font-size: 14px; color: #0f172a;">${bin.dustbinCode}</strong>
            <span style="
              background-color: ${pinColor}20; 
              color: ${pinColor}; 
              font-weight: bold; 
              padding: 2px 8px; 
              border-radius: 4px;
              font-size: 11px;
            ">
              ${bin.priorityLevel} PRIORITY (${fill}%)
            </span>
          </div>
          <div style="color: #475569; margin-bottom: 4px;"><strong>Location:</strong> ${bin.locationName}</div>
          <div style="color: #475569; margin-bottom: 4px;"><strong>Coordinates:</strong> ${bin.latitude.toFixed(4)}, ${bin.longitude.toFixed(4)}</div>
          <div style="color: #475569; margin-bottom: 4px;"><strong>Capacity:</strong> ${bin.capacityLiters} L (${bin.currentWasteLiters.toFixed(1)} L full)</div>
          <div style="color: #475569; margin-bottom: 4px;"><strong>Category:</strong> ${bin.category}</div>
          <div style="color: #475569; margin-bottom: 4px;"><strong>Assigned Staff:</strong> ${bin.assignedStaffName || 'Unassigned'}</div>
          <div style="color: #94a3b8; font-size: 10px; margin-top: 6px;">Status: ${bin.status} • Simulated Coordinates</div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => setSelectedBin(bin));
      markersLayerRef.current.addLayer(marker);
    });

    // Add Vehicle Markers (Simulated Depot & Field Locations)
    vehicles.forEach(vehicle => {
      const vIconHtml = `
        <div style="
          background-color: #1e293b;
          color: white;
          padding: 3px 6px;
          border-radius: 6px;
          border: 2px solid #38bdf8;
          font-size: 10px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        ">
          <span>🚛 ${vehicle.vehicleNumber.split('-').slice(-2).join('-')}</span>
        </div>
      `;

      const vIcon = L.divIcon({
        html: vIconHtml,
        className: 'custom-vehicle-marker',
        iconSize: [70, 25],
        iconAnchor: [35, 25]
      });

      const vMarker = L.marker([vehicle.latitude || 18.5204, vehicle.longitude || 73.8567], { icon: vIcon });
      vMarker.bindPopup(`
        <div style="font-size: 12px; padding: 2px;">
          <strong style="color: #0f172a;">Vehicle: ${vehicle.vehicleNumber}</strong><br/>
          <span style="color: #64748b;">Type: ${vehicle.vehicleType}</span><br/>
          <span style="color: #64748b;">Driver: ${vehicle.driverName || 'Standby'}</span><br/>
          <span style="color: #64748b;">Status: <strong>${vehicle.status}</strong></span><br/>
          <span style="color: #64748b;">Capacity: ${vehicle.capacityKg} kg</span>
        </div>
      `);
      markersLayerRef.current.addLayer(vMarker);
    });

  }, [dustbins, vehicles, selectedFilter, searchQuery]);

  // Center map on searched bin if only 1 match
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;
    const match = dustbins.find(b => 
      b.dustbinCode.toLowerCase() === searchQuery.trim().toLowerCase() ||
      b.locationName.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    if (match) {
      mapInstanceRef.current.flyTo([match.latitude, match.longitude], 16, { duration: 1.5 });
      setSelectedBin(match);
    } else {
      showToast('No matching dustbin found for query', 'warning');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Top Map Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Dustbin ID (e.g. B101) or location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>
          {[
            { key: 'ALL', label: 'All', color: 'bg-slate-100 text-slate-800' },
            { key: 'CRITICAL', label: 'Critical (90-100%)', color: 'bg-red-50 text-red-700 border-red-200' },
            { key: 'ALMOST_FULL', label: 'Almost Full (75-89%)', color: 'bg-amber-50 text-amber-700 border-amber-200' },
            { key: 'MODERATE', label: 'Moderate (31-74%)', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
            { key: 'EMPTY', label: 'Empty (0-30%)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setSelectedFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg font-medium border transition ${
                selectedFilter === f.key 
                  ? 'bg-forest-800 text-white border-forest-900 shadow-sm font-semibold' 
                  : `${f.color} hover:bg-slate-200`
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Detail Side Panel Container */}
      <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm min-h-[500px]">
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Legend Overlay Card */}
        <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-md text-xs">
          <span className="font-bold text-slate-800 block mb-2">Dustbin Fill Legend</span>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-slate-700 font-medium">90% - 100% Critical Fill</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span className="text-slate-700 font-medium">75% - 89% High / Almost Full</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-slate-700 font-medium">31% - 74% Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span className="text-slate-700 font-medium">0% - 30% Empty / Low</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
              <span className="text-[10px] font-bold text-sky-700 bg-slate-900 px-1.5 py-0.5 rounded text-white">🚛 TRUCK</span>
              <span className="text-slate-700 font-medium">Collection Vehicles</span>
            </div>
          </div>
        </div>

        {/* Selected Bin Details Drawer */}
        {selectedBin && (
          <div className="absolute bottom-4 right-4 z-20 w-80 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-forest-700" />
                <span className="font-bold text-sm text-slate-900">{selectedBin.dustbinCode}</span>
              </div>
              <button 
                onClick={() => setSelectedBin(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="font-medium text-slate-800">{selectedBin.locationName}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Coordinates: {selectedBin.latitude.toFixed(4)}, {selectedBin.longitude.toFixed(4)}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Filling Level</span>
                <span className={`text-base font-extrabold ${
                  selectedBin.fillPercentage >= 90 ? 'text-red-600' :
                  selectedBin.fillPercentage >= 75 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {selectedBin.fillPercentage}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Priority Score</span>
                <span className="text-sm font-bold text-slate-800">{selectedBin.priorityLevel}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Capacity</span>
                <span className="text-slate-700 font-medium">{selectedBin.capacityLiters} L</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Waste Mass</span>
                <span className="text-slate-700 font-medium">{Math.round(selectedBin.currentWasteLiters * 0.45)} kg</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Category: <strong className="text-slate-700">{selectedBin.category}</strong></span>
              <span>Staff: <strong className="text-slate-700">{selectedBin.assignedStaffName || 'Team A'}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

