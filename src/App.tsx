import Navbar from "./components/navbar/navbar";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Items from "./pages/items";
import Orders from "./pages/orders";
import Tables from "./pages/tables";
import PlaceOrder from "./pages/placeOrder";
import StaffDetails from "./pages/staffDetails";
import Login from "./pages/login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";
import { useAuth } from "./context/AuthContext";


function App() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const shouldShowNavbar = isAuthenticated && location.pathname !== "/login";

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<AdminProtectedRoute><Dashboard /></AdminProtectedRoute>} />
          <Route path="/items" element={<Items />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/tables/" element={<Tables />} />
          <Route path="/tables/:tableName" element={<PlaceOrder />} />
          <Route path="/staff/:staffId" element={<StaffDetails />} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>

    </>
  )
}

export default App
