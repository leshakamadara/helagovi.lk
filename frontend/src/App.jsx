import React from "react";
import { Route, Routes } from "react-router-dom";

import ProductCreationForm from "./pages/products/createProduct";
import ProductDetails from "./pages/products/productDetails";
import ProductListing from "./pages/products/productListing";
import MyProducts from "./pages/products/myProducts";
import FarmerDashboard from "./pages/products/farmerDashboard";
import EditProduct from "./pages/products/editProduct";

import MainLayout from "./layouts/MainLayout";

const App = () => {
  return (
    <div className="relative h-screen w-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 h-full w-full [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#00FF9D40_100%)]" />

      <Routes>
        {/* Marketplace and Product Pages inside Main Layout */}
        <Route
          path="/marketplace"
          element={
            <MainLayout>
              <ProductListing />
            </MainLayout>
          }
        />

        <Route
          path="/create-product"
          element={
            <MainLayout>
              <ProductCreationForm />
            </MainLayout>
          }
        />

        <Route
          path="/product-details"
          element={
            <MainLayout>
              <ProductDetails />
            </MainLayout>
          }
        />

        <Route
          path="/my-products"
          element={
            <MainLayout>
              <MyProducts />
            </MainLayout>
          }
        />

        <Route
          path="/farmer-dashboard"
          element={
            <MainLayout>
              <FarmerDashboard />
            </MainLayout>
          }
        />

        <Route
          path="/edit-product"
          element={
            <MainLayout>
              <EditProduct />
            </MainLayout>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
