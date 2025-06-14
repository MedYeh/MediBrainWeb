// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import ProtectedRoute from './Components/auth/ProtectedRoute';

// Page Components
import LoginPage from './Pages/LoginPage';
import DashboardPage from './Pages/DashboardPage'; // <-- Import the new page
import PageList from './Pages/PageList';
import CreatePage from './Pages/CreatePage';
import EditPage from './Pages/EditPage';
import PageViewer from './Pages/PageViewer';
import SettingsPage from './Pages/SettingsPage';
import SearchResultsPage from './Pages/SearchResultsPage';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* PUBLIC ROUTE */}
          <Route path="/login" element={<LoginPage />} />

          {/* PROTECTED ROUTES */}
          {/* Make the dashboard the default page after login */}
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          
          <Route path="/pages" element={<ProtectedRoute><PageList /></ProtectedRoute>} />
          <Route path="/create-page" element={<ProtectedRoute><CreatePage /></ProtectedRoute>} />
          <Route path="/edit-page/:id" element={<ProtectedRoute><EditPage /></ProtectedRoute>} />
           <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchResultsPage /></ProtectedRoute>} />
          {/* Public viewer route */}
          <Route path="/pages/:id" element={<ProtectedRoute><PageViewer /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;