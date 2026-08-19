import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div style={{ color: "white", padding: "24px" }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.role !== "Admin") {
    return (
      <div style={{ color: "white", padding: "24px", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page. Only administrators can view the dashboard.</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default AdminProtectedRoute;
