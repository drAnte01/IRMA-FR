import Navbar from "./components/navbar/navbar";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Items from "./pages/items";
import Orders from "./pages/orders";
import Tables from "./pages/tables";
import PlaceOrder from "./pages/placeOrder";


function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/items" element={<Items />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/tables/" element={<Tables />} />
        <Route path="/tables/:tableName" element={<PlaceOrder />} />
      </Routes>

    </>
  )
}

export default App
