import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Home from './pages/users/Home'
import Register from './pages/users/Register'
import Login from './pages/users/Login'
import Profile from './pages/users/Profile'
import ForgotPassword from './pages/users/ForgotPassword'
import ResetPassword from './pages/users/ResetPassword'
import VerifyEmail from './pages/users/VerifyEmail'
import FarmerDashboard from './pages/users/FarmerDashboard'
import BuyerDashboard from './pages/users/BuyerDashboard'
import AdminDashboard from './pages/users/AdminDashboard'

import ProductCreationForm from "./pages/products/createProduct";
import ProductDetails from "./pages/products/productDetails";
import ProductListing from "./pages/products/productListing";
import MyProducts from "./pages/products/myProducts";
import EditProduct from "./pages/products/editProduct";

import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* User / Auth Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/farmer-dashboard" element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/buyer-dashboard" element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Product / Marketplace Routes */}
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
            path="/edit-product"
            element={
              <MainLayout>
                <EditProduct />
              </MainLayout>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
