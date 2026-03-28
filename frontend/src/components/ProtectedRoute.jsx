import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getUser } from '../utils/auth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = getToken();
  const user = getUser();
  const [loading, setLoading] = React.useState(false); 

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-muted font-black tracking-[0.4em] text-xs uppercase">Authenticating Identity Node...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard based on actual role
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'job_poster') return <Navigate to="/poster" replace />;
    return <Navigate to="/finder" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
