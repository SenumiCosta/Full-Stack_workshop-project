import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BoardProvider } from './context/BoardContext';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BoardProvider>
      <BrowserRouter>
        <Routes>
          {/* Direct everything to Dashboard for now since others haven't cloned yet */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </BoardProvider>
  );
}

export default App;