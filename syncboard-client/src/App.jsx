import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BoardProvider } from './context/BoardContext';
import { CacheProvider } from './context/CacheContext';

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

// Route protector
const ProtectedRoute = ({ children }) => {
  const isAuthenticated =
    localStorage.getItem('syncboard_auth') === 'true';

  return isAuthenticated
    ? children
    : <Navigate to="/login" replace />;
};

function App() {
  return (
    <CacheProvider>
      <BoardProvider>
        <BrowserRouter>
          <Routes>

            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Default route */}
            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />

          </Routes>
        </BrowserRouter>
      </BoardProvider>
    </CacheProvider>
  );
}

export default App;