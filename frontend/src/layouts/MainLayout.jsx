import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  MapPin, 
  Trash2, 
  Flame, 
  Route, 
  Truck, 
  Users, 
  AlertCircle, 
  History, 
  BarChart3, 
  Cpu, 
  Bell, 
  Menu, 
  X, 
  Radio, 
  ShieldCheck, 
  CheckCircle2, 
  UserSquare2
} from 'lucide-react';
import { api } from '../services/api';

export default function MainLayout() {
  const { role, setRole, alerts, unreadAlertsCount, markAllRead, refreshAll, showToast } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertsDropdown, setAlertsDropdown] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const location = useLocation();

  const handleSimulateRandom = async () => {
    try {
      setSimulating(true);
      const updated = await api.simulateRandomSensors();
      showToast(`Simulated IoT sensor updates for ${updated.length} dustbins!`, 'success');
      refreshAll();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setSimulating(false);
    }
  };

  // Nav items based on roles
  const adminNav = [
    { to: '/', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/map', label: 'Smart City Map', icon: MapPin },
    { to: '/dustbins', label: 'Dustbin Management', icon: Trash2 },
    { to: '/priority', label: 'Priority Management (Heap)', icon: Flame },
    { to: '/routes', label: 'Route Optimization (Graph)', icon: Route },
    { to: '/vehicles', label: 'Vehicle Management', icon: Truck },
    { to: '/staff', label: 'Staff Management', icon: Users },
    { to: '/complaints', label: 'Public Complaints', icon: AlertCircle },
    { to: '/history', label: 'Collection History', icon: History },
    { to: '/analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/dsa-demo', label: 'DSA Visualizer Sandbox', icon: Cpu },
  ];

  const staffNav = [
    { to: '/staff-portal', label: 'My Collection Tasks', icon: CheckCircle2 },
    { to: '/map', label: 'City Map & Stops', icon: MapPin },
    { to: '/priority', label: 'High Priority Bins', icon: Flame },
    { to: '/routes', label: 'Vehicle Route Details', icon: Route },
    { to: '/history', label: 'My Completed Logs', icon: History },
  ];

  const publicNav = [
    { to: '/public-portal', label: 'Citizen Waste Portal', icon: UserSquare2 },
    { to: '/report-complaint', label: 'Report Overflow / Issue', icon: AlertCircle },
    { to: '/track-complaint', label: 'Track My Complaint', icon: History },
    { to: '/map', label: 'Public Dustbin Locator', icon: MapPin },
  ];

  let currentNav = adminNav;
  if (role === 'STAFF') currentNav = staffNav;
  if (role === 'PUBLIC') currentNav = publicNav;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-forest-900 text-white flex flex-col transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-forest-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-forest-600 flex items-center justify-center text-white shadow-md">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight tracking-tight">SmartWaste</h1>
              <p className="text-[10px] text-forest-300 uppercase tracking-wider font-semibold">City Clean Platform</p>
            </div>
          </div>
          <button 
            className="lg:hidden text-forest-300 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-forest-300/80 uppercase tracking-wider">
            {role === 'ADMIN' ? 'Administration' : role === 'STAFF' ? 'Collection Staff' : 'Public Citizen'}
          </div>
          {currentNav.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${active 
                    ? 'bg-forest-700 text-white shadow-sm font-semibold' 
                    : 'text-forest-100 hover:bg-forest-800/60 hover:text-white'}
                `}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-forest-300' : 'text-forest-400'}`} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* DSA Badge & Academic Footer */}
        <div className="p-3.5 m-3 rounded-xl bg-forest-950/60 border border-forest-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-forest-200 mb-1">
            <Cpu className="w-3.5 h-3.5 text-forest-400" />
            <span>Active DSA Algorithms</span>
          </div>
          <p className="text-[11px] text-forest-300/80 leading-relaxed">
            Max Heap Priority Queue, Dijkstra Shortest Path, Greedy VRP, & Merge Sort in Java.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-forest-50 text-forest-700 border border-forest-200">
                <span className="w-2 h-2 rounded-full bg-forest-500 animate-pulse"></span>
                Simulation Active
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">Demonstration City: Pune Central (Model Grid)</span>
            </div>
          </div>

          {/* Right Top Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Simulate IoT Update Button */}
            <button
              onClick={handleSimulateRandom}
              disabled={simulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-forest-700 text-white hover:bg-forest-800 disabled:opacity-50 transition shadow-sm"
              title="Simulates IoT ultrasonic sensor readings fluctuation across city dustbins"
            >
              <Radio className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Simulate Sensor Update</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setAlertsDropdown(prev => !prev)}
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              >
                <Bell className="w-5 h-5" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
                  </span>
                )}
              </button>

              {/* Alerts Dropdown */}
              {alertsDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <span className="font-semibold text-sm text-slate-800">System Notifications</span>
                    {unreadAlertsCount > 0 && (
                      <button 
                        onClick={markAllRead} 
                        className="text-xs font-medium text-forest-600 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {alerts.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-400">No recent notifications</div>
                    ) : (
                      alerts.slice(0, 10).map(alert => (
                        <div key={alert.id} className={`p-3 text-xs ${alert.read ? 'opacity-70' : 'bg-slate-50 font-medium'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              alert.severity === 'danger' ? 'bg-red-100 text-red-700' :
                              alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                              alert.severity === 'success' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {alert.type}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-800">{alert.title}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5">{alert.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                onClick={() => setRole('ADMIN')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                  role === 'ADMIN' ? 'bg-white text-forest-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setRole('STAFF')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                  role === 'STAFF' ? 'bg-white text-forest-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Staff
              </button>
              <button
                onClick={() => setRole('PUBLIC')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                  role === 'PUBLIC' ? 'bg-white text-forest-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Public
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

