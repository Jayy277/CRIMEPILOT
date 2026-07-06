import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';

// Officer Portal Pages
import OfficerDashboard from './pages/officer/Dashboard';
import RegisterCrime from './pages/officer/RegisterCrime';
import MyCases from './pages/officer/MyCases';
import OfficerCrimeDetails from './pages/officer/CrimeDetails';
import OfficerSearch from './pages/officer/Search';
import OfficerProfile from './pages/officer/Profile';

// Analyst Portal Pages
import AnalystDashboard from './pages/analyst/Dashboard';
import AnalystAnalytics from './pages/analyst/Analytics';
import CrimeTrends from './pages/analyst/CrimeTrends';
import Heatmap from './pages/analyst/Heatmap';
import AnalystReports from './pages/analyst/Reports';
import PredictionPlaceholder from './pages/analyst/Prediction';

// Admin Portal Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOfficers from './pages/admin/ManageOfficers';
import CrimeCategories from './pages/admin/CrimeCategories';
import Locations from './pages/admin/Locations';
import SystemLogs from './pages/admin/Logs';
import AdminReports from './pages/admin/Reports';

// Citizen Portal Pages
import CitizenLogin from './pages/citizen/Login';
import CitizenRegister from './pages/citizen/Register';
import CitizenDashboard from './pages/citizen/Dashboard';
import RegisterFIR from './pages/citizen/RegisterFIR';
import TrackFIR from './pages/citizen/TrackFIR';
import CitizenProfile from './pages/citizen/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/citizen/login" element={<CitizenLogin />} />
          <Route path="/citizen/register" element={<CitizenRegister />} />

          {/* Public Routing Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Officer Portal Protected Routes */}
          <Route
            path="/officer"
            element={
              <ProtectedRoute allowedRoles={['officer']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/officer/dashboard" replace />} />
            <Route path="dashboard" element={<OfficerDashboard />} />
            <Route path="register" element={<RegisterCrime />} />
            <Route path="my-cases" element={<MyCases />} />
            <Route path="cases/:id" element={<OfficerCrimeDetails />} />
            <Route path="search" element={<OfficerSearch />} />
            <Route path="profile" element={<OfficerProfile />} />
          </Route>

          {/* Analyst Portal Protected Routes */}
          <Route
            path="/analyst"
            element={
              <ProtectedRoute allowedRoles={['analyst']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/analyst/dashboard" replace />} />
            <Route path="dashboard" element={<AnalystDashboard />} />
            <Route path="analytics" element={<AnalystAnalytics />} />
            <Route path="trends" element={<CrimeTrends />} />
            <Route path="heatmap" element={<Heatmap />} />
            <Route path="reports" element={<AnalystReports />} />
            <Route path="prediction" element={<PredictionPlaceholder />} />
            <Route path="profile" element={<OfficerProfile />} />
            <Route path="cases/:id" element={<OfficerCrimeDetails />} /> {/* Reused CrimeDetails */}
          </Route>

          {/* Admin Portal Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="officers" element={<ManageOfficers />} />
            <Route path="categories" element={<CrimeCategories />} />
            <Route path="locations" element={<Locations />} />
            <Route path="logs" element={<SystemLogs />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="profile" element={<OfficerProfile />} />
            <Route path="cases/:id" element={<OfficerCrimeDetails />} /> {/* Reused CrimeDetails */}
          </Route>

          {/* Citizen Portal Protected Routes */}
          <Route
            path="/citizen"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/citizen/dashboard" replace />} />
            <Route path="dashboard" element={<CitizenDashboard />} />
            <Route path="register-fir" element={<RegisterFIR />} />
            <Route path="track-fir" element={<TrackFIR />} />
            <Route path="my-cases" element={<TrackFIR />} />
            <Route path="profile" element={<CitizenProfile />} />
          </Route>

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
