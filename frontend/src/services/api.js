const API_BASE = '/api';

/**
 * Helper to handle fetch responses safely
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = `Server error (${response.status})`;
    try {
      const errData = await response.json();
      if (errData && errData.message) {
        errorMsg = errData.message;
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Analytics & Dashboard
  getDashboardStats: () => fetch(`${API_BASE}/analytics/dashboard`).then(handleResponse),
  getAlerts: () => fetch(`${API_BASE}/analytics/alerts`).then(handleResponse),
  markAlertsAsRead: () => fetch(`${API_BASE}/analytics/alerts/read-all`, { method: 'POST' }).then(handleResponse),

  // Dustbins CRUD & Simulation
  getDustbins: () => fetch(`${API_BASE}/dustbins`).then(handleResponse),
  getDustbinById: (id) => fetch(`${API_BASE}/dustbins/${id}`).then(handleResponse),
  createDustbin: (data) => fetch(`${API_BASE}/dustbins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateDustbin: (id, data) => fetch(`${API_BASE}/dustbins/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteDustbin: (id) => fetch(`${API_BASE}/dustbins/${id}`, { method: 'DELETE' }).then(handleResponse),
  simulateSensor: (dustbinCode, fillPercentage) => fetch(`${API_BASE}/dustbins/simulate-sensor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dustbinCode, fillPercentage, isSimulated: true })
  }).then(handleResponse),
  simulateRandomSensors: () => fetch(`${API_BASE}/dustbins/simulate-random`, { method: 'POST' }).then(handleResponse),

  // DSA Priority Queue (Max Heap)
  getPriorityQueue: () => fetch(`${API_BASE}/priority`).then(handleResponse),
  getNextDustbin: () => fetch(`${API_BASE}/priority/next`).then(handleResponse),
  getHeapTree: () => fetch(`${API_BASE}/priority/tree`).then(handleResponse),
  rebuildPriorityQueue: () => fetch(`${API_BASE}/priority/rebuild`, { method: 'POST' }).then(handleResponse),
  extractMaxPriority: () => fetch(`${API_BASE}/priority/extract-max`, { method: 'POST' }).then(handleResponse),

  // DSA Dijkstra & Greedy Route Optimization
  getCityGraph: () => fetch(`${API_BASE}/routes/graph`).then(handleResponse),
  computeShortestPath: (startLocationCode, endLocationCode) => fetch(`${API_BASE}/routes/shortest-path`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startLocationCode, endLocationCode })
  }).then(handleResponse),
  optimizeRoute: (params) => fetch(`${API_BASE}/routes/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  }).then(handleResponse),

  // Vehicles
  getVehicles: () => fetch(`${API_BASE}/vehicles`).then(handleResponse),
  createVehicle: (data) => fetch(`${API_BASE}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateVehicle: (id, data) => fetch(`${API_BASE}/vehicles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteVehicle: (id) => fetch(`${API_BASE}/vehicles/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Staff
  getStaff: () => fetch(`${API_BASE}/staff`).then(handleResponse),
  createStaff: (data) => fetch(`${API_BASE}/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateStaff: (id, data) => fetch(`${API_BASE}/staff/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteStaff: (id) => fetch(`${API_BASE}/staff/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Complaints
  getComplaints: () => fetch(`${API_BASE}/complaints`).then(handleResponse),
  trackComplaint: (code) => fetch(`${API_BASE}/complaints/track/${code}`).then(handleResponse),
  submitComplaint: (data) => fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateComplaintStatus: (id, data) => fetch(`${API_BASE}/complaints/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  // Collection History & Actions
  getCollectionHistory: () => fetch(`${API_BASE}/collections/history`).then(handleResponse),
  completeCollection: (data) => fetch(`${API_BASE}/collections/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  // DSA Demonstration Sandbox
  runMergeSortDemo: (numbers, ascending = true) => fetch(`${API_BASE}/dsa/mergesort`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numbers, ascending })
  }).then(handleResponse),
  getAlgorithmsInfo: () => fetch(`${API_BASE}/dsa/algorithms-info`).then(handleResponse)
};
