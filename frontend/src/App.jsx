import React from "react";
import { Route, Routes } from "react-router-dom";

import ProductCreationForm from "./pages/products/createProduct";
import ProductDetails from "./pages/products/productDetails";
import ProductListing from "../src/pages/products/productListing";
import MyProducts from "./pages/products/myProducts";
import FarmerDashboard from "./pages/products/farmerDashboard";
import EditProduct from "./pages/products/editProduct";


const App = () => {
  return (
    <div className="relative h-screen w-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 h-full w-full [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#00FF9D40_100%)]" />

      <Routes>
        //HomePage

        //Create Product
        <Route path="/create-product" element={<ProductCreationForm />} />

        //Product List 
        <Route path="/marketplace" element={<ProductListing />} />

        <Route path="/product-details" element={<ProductDetails />} />

        <Route path="/my-products" element={<MyProducts />} />

        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
        <Route path="/edit-product" element={<EditProduct />} />
    

      </Routes>
    </div>
  );
};

export default App;
