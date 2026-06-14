// src/components/shared/ProtectedRoute.jsx
// Wrap any route that requires login. Optionally restrict by role.
//
//   <ProtectedRoute><CustomerDashboard /></ProtectedRoute>
//   <ProtectedRoute role="provider"><ProviderDashboard /></ProtectedRoute>
//
// - While the session is being restored, show a tiny loader (avoids a
//   flash of the login page on refresh).
// - Not logged in        → redirect to /login
// - Logged in, wrong role → redirect to their own dashboard

import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8FAFC" }}>
        <span className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Logged in but trying to access the wrong dashboard → send home.
    const home = user.role === "provider" ? "/provider/dashboard" : "/customer/dashboard";
    return <Navigate to={home} replace />;
  }

  return children;
}
