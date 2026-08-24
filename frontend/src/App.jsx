import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ClassesPage from './pages/ClassesPage';
import MyBookingsPage from './pages/MyBookingsPage';

// Lazy load AdminPanel as required by examination specification
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          {/* Root Route: ALWAYS opens LoginPage */}
          <Route path="/" element={<LoginPage />} />

          {/* Protected Route: Classes Page */}
          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <ClassesPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Route: My Bookings Page */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Legacy / Alias Route for My Bookings */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Lazy-loaded Admin Route */}
          <Route
            path="/admin"
            element={
              <Suspense
                fallback={
                  <div className="container empty-state">
                    Loading Admin Panel...
                  </div>
                }
              >
                <AdminPanel />
              </Suspense>
            }
          />

          {/* Fallback redirect to / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
