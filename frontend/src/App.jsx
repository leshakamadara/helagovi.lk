import React from "react";
import { Route, Routes } from "react-router-dom";
import CreateOrder from "./pages/orders/CreateOrder";
import OrderList from "./pages/orders/OrderList";
import OrderDetails from "./pages/orders/OrderDetails";
import FarmerDashboard from "./pages/orders/FarmerDashboard";
import MyOrders from "./pages/orders/MyOrders";
import PendingOrders from "./pages/orders/PendingOrders";
import CompletedOrders from "./pages/orders/CompletedOrders";
import ViewAllOrders from "./pages/orders/ViewAllOrders";

// Test page
const HomePage = () => (
  <div className="p-10 text-center text-white">
    🟢 Frontend is working!
    <div className="mt-4">
      <a href="/orders/create" className="text-blue-300 hover:text-blue-100 underline">
        Test Order Creation
      </a>
    </div>
  </div>
);

const App = () => {
  return (
    <div className="relative min-h-screen w-full">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 h-full w-full [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#00FF9D40_100%)]" />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/orders/create" element={<CreateOrder />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/orders" element={<MyOrders />} />
        <Route path="/farmer/orders" element={<ViewAllOrders />} />
        <Route path="/farmer/orders/pending" element={<PendingOrders />} />
        <Route path="/farmer/orders/completed" element={<CompletedOrders />} />
      </Routes>
    </div>
  );
};

export default App;