import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './layouts/MainLayout';

// Module Pages
import AdminDashboard from './pages/AdminDashboard';
import SmartCityMap from './pages/SmartCityMap';
import DustbinManagement from './pages/DustbinManagement';
import PriorityManagement from './pages/PriorityManagement';
import RouteOptimization from './pages/RouteOptimization';
import VehicleManagement from './pages/VehicleManagement';
import StaffManagement from './pages/StaffManagement';
import ComplaintManagement from './pages/ComplaintManagement';
import CollectionHistoryPage from './pages/CollectionHistoryPage';
import AnalyticsReports from './pages/AnalyticsReports';
import DsaVisualizerSandbox from './pages/DsaVisualizerSandbox';
import StaffPortal from './pages/StaffPortal';
import PublicPortal from './pages/PublicPortal';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="map" element={<SmartCityMap />} />
            <Route path="dustbins" element={<DustbinManagement />} />
            <Route path="priority" element={<PriorityManagement />} />
            <Route path="routes" element={<RouteOptimization />} />
            <Route path="vehicles" element={<VehicleManagement />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="complaints" element={<ComplaintManagement />} />
            <Route path="report-complaint" element={<ComplaintManagement />} />
            <Route path="track-complaint" element={<PublicPortal />} />
            <Route path="history" element={<CollectionHistoryPage />} />
            <Route path="analytics" element={<AnalyticsReports />} />
            <Route path="dsa-demo" element={<DsaVisualizerSandbox />} />
            <Route path="staff-portal" element={<StaffPortal />} />
            <Route path="public-portal" element={<PublicPortal />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
