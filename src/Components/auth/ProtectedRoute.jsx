import React from 'react';
import { useAuth } from '../../Context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import Layout from '../layout/Layout'; // Your sidebar layout

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them back after they log in.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, render the children within the main app layout
    return <Layout>{children}</Layout>;
};

export default ProtectedRoute;