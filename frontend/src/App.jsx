import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { Sprout } from 'lucide-react'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import RoleBasedHome from './components/RoleBasedHome'
import Navbar from './components/Navbar'
import Home from './pages/users/Home'
import Register from './pages/users/Register'
import Login from './pages/users/Login'
import Profile from './pages/users/Profile'
import ForgotPassword from './pages/users/ForgotPassword'
import ResetPassword from './pages/users/ResetPassword'
import VerifyEmail from './pages/users/VerifyEmail'
import FarmerDashboard from './pages/users/FarmerDashboardNew'
import BuyerDashboard from './pages/users/BuyerDashboard'
import AdminDashboard from './pages/users/AdminDashboard'

import ProductCreationForm from "./pages/products/createProduct";
import ProductDetails from "./pages/products/productDetails";
import ProductListing from "./pages/products/productListing";
import MyProducts from "./pages/products/myProducts";
import EditProduct from "./pages/products/editProduct";
import BuyerOrders from "./pages/orders/BuyerOrders";
import FarmerOrders from "./pages/orders/FarmerOrders";
import Favorites from "./pages/buyers/Favorites";
import Cart from "./pages/buyers/Cart";
import FarmerWallet from "./pages/farmers/Wallet";
import Debug from "./pages/Debug";

import MainLayout from "./layouts/MainLayout";
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Main Page - Role-based Home */}
          <Route path="/" element={<RoleBasedHome />} />
          
          {/* User / Auth Routes - with individual navbar */}
          <Route path="/register" element={
            <>
              <div className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-16">
                    <div className="flex items-center">
                      <Link to="/" className="flex-shrink-0 flex items-center">
                        <img 
                          src="https://framerusercontent.com/images/tQEEeKRa0oOBXHoksVNKvgBJZc.png" 
                          alt="Helagovi.lk Logo" 
                          className="h-8 w-8 object-contain"
                        />
                        <span className="ml-2 text-xl font-bold text-gray-800">Helagovi.lk</span>
                      </Link>
                    </div>
                    <div className="flex items-center">
                      <Link 
                        to="/login"
                        className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700"
                      >
                        Login
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <Register />
            </>
          } />
          <Route path="/login" element={
            <>
              <div className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-16">
                    <div className="flex items-center">
                      <Link to="/" className="flex-shrink-0 flex items-center">
                        <img 
                          src="https://framerusercontent.com/images/tQEEeKRa0oOBXHoksVNKvgBJZc.png" 
                          alt="Helagovi.lk Logo" 
                          className="h-8 w-8 object-contain"
                        />
                        <span className="ml-2 text-xl font-bold text-gray-800">Helagovi.lk</span>
                      </Link>
                    </div>
                    <div className="flex items-center">
                      <Link 
                        to="/register"
                        className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <Login />
            </>
          } />
          <Route path="/forgot-password" element={
            <>
              <Navbar />
              <ForgotPassword />
            </>
          } />
          <Route path="/reset-password" element={
            <>
              <Navbar />
              <ResetPassword />
            </>
          } />
          <Route path="/verify-email" element={
            <>
              <Navbar />
              <VerifyEmail />
            </>
          } />

          {/* Debug Route */}
          <Route path="/debug" element={<Debug />} />

          {/* Protected Routes - with individual navbar */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Profile />
              </>
            </ProtectedRoute>
          } />
          <Route path="/farmer-dashboard" element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <>
                <Navbar />
                <FarmerDashboard />
              </>
            </ProtectedRoute>
          } />
          <Route path="/buyer-dashboard" element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <>
                <Navbar />
                <BuyerDashboard />
              </>
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <>
                <Navbar />
                <AdminDashboard />
              </>
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
              <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                <MainLayout>
                  <ProductCreationForm />
                </MainLayout>
              </ProtectedRoute>
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
              <ErrorBoundary>
                <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                  <MainLayout>
                    <MyProducts />
                  </MainLayout>
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/edit-product"
            element={
              <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                <MainLayout>
                  <EditProduct />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Farmer-specific routes */}
          <Route
            path="/farmer-orders"
            element={
              <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                <>
                  <Navbar />
                  <FarmerOrders />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer-analytics"
            element={
              <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                <>
                  <Navbar />
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900">Farmer Analytics</h2>
                      <p className="mt-2 text-gray-600">Coming soon - View detailed sales analytics and reports</p>
                    </div>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/wallet"
            element={
              <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                <>
                  <Navbar />
                  <FarmerWallet />
                </>
              </ProtectedRoute>
            }
          />

          {/* Buyer-specific routes */}
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                <>
                  <Navbar />
                  <BuyerOrders />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                <>
                  <Navbar />
                  <Favorites />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                <>
                  <Navbar />
                  <Cart />
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster 
          position="top-right"
          expand={false}
          richColors
          closeButton
        />
      </div>
    </AuthProvider>
  )
}

export default App
