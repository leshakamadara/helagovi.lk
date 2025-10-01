import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { Sprout } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/PageTransition'
import ErrorBoundary from './components/ErrorBoundary'
import RoleBasedHome from './components/RoleBasedHome'
import Navbar from './components/Navbar'
import Home from './pages/users/Home'
import Register from './pages/users/Register'
import LoginPage from './pages/users/Login'
import Profile from './pages/users/Profile'
import ForgotPassword from './pages/users/ForgotPassword'
import ResetPassword from './pages/users/ResetPassword'
import VerifyEmail from './pages/users/VerifyEmail'
import FarmerDashboard from './pages/users/FarmerDashboardNew'
import BuyerDashboard from './pages/users/BuyerDashboard'
import AdminDashboard from './pages/users/AdminDashboard'

import ProductCreationForm from "./pages/products/createProduct";
import ProductDetails from "./pages/products/productDetails";
import ProductListing from "./pages/products/ProductListing";
import MyProducts from "./pages/products/myProducts";
import EditProduct from "./pages/products/editProduct";
import BuyerOrders from "./pages/orders/BuyerOrders";
import FarmerOrders from "./pages/orders/FarmerOrders";
import Favorites from "./pages/buyers/Favorites";
import Cart from "./pages/buyers/Cart";
import FarmerWallet from "./pages/farmers/Wallet";
import Debug from "./pages/Debug";
import AnimationDemo from './pages/AnimationDemo';

// Payment routes
import BillingHistory from './pages/payments/addCard.jsx'
import ProcessingPage from './pages/payments/ProcessingPage'
import SuccessPage from './pages/payments/SuccessPage'
import ChargePage from './pages/payments/ChargePage'
import CardManagementPage from './pages/payments/CardManagementPage'
import PaymentPage from './pages/payments/billingHistory'
import PaymentHistoryPage from './pages/payments/PaymentHistoryPage'
import CardPreapprovalSuccess from './pages/payments/CardPreapprovalSuccess'
import CardPreapprovalCancel from './pages/payments/CardPreapprovalCancel'

// Checkout routes
import DeliveryInformation from './pages/checkout/DeliveryInformation'

import MainLayout from "./layouts/MainLayout";
import { Toaster } from 'sonner';

function App() {
  const location = useLocation()

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Main Page - Role-based Home */}
            <Route path="/" element={<RoleBasedHome />} />

            {/* User / Auth Routes - with smooth transitions */}
            <Route path="/register" element={
              <PageTransition>
                <Register />
              </PageTransition>
            } />
            <Route path="/login" element={
              <PageTransition>
                <LoginPage />
              </PageTransition>
            } />
            <Route path="/forgot-password" element={
              <PageTransition>
                <>
                  <Navbar />
                  <ForgotPassword />
                </>
              </PageTransition>
            } />
            <Route path="/reset-password" element={
              <PageTransition>
                <>
                  <Navbar />
                  <ResetPassword />
                </>
              </PageTransition>
            } />
            <Route path="/verify-email" element={
              <PageTransition>
                <>
                  <Navbar />
                  <VerifyEmail />
                </>
              </PageTransition>
            } />

          {/* Debug Route */}
          <Route path="/debug" element={<Debug />} />

          {/* Animation Demo Route */}
          <Route path="/animation-demo" element={<AnimationDemo />} />
          <Route path="/animation-demo" element={<AnimationDemo />} />

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
            path="/products"
            element={
              <MainLayout>
                <ProductListing />
              </MainLayout>
            }
          />
          <Route
            path="/organic-products"
            element={
              <MainLayout>
                <ProductListing />
              </MainLayout>
            }
          />
          <Route
            path="/exclusives"
            element={
              <MainLayout>
                <ProductListing />
              </MainLayout>
            }
          />
          <Route
            path="/promotions"
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
                <MainLayout showFooter={false}>
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
                  <MainLayout showFooter={false}>
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

          {/* Checkout Routes */}
          <Route path="/checkout/delivery" element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <MainLayout>
                <DeliveryInformation />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Payment Routes */}
          <Route path="/saveCard" element={
            <ProtectedRoute>
              <MainLayout>
                <BillingHistory />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/processing" element={<ProcessingPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/card-preapproval-success" element={<CardPreapprovalSuccess />} />
          <Route path="/card-preapproval-cancel" element={<CardPreapprovalCancel />} />
          <Route path="/ChargePage" element={
            <ProtectedRoute>
              <MainLayout>
                <ChargePage />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/CardManagementPage" element={
            <ProtectedRoute>
              <MainLayout showFooter={false}>
                <CardManagementPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/payment-history" element={
            <ProtectedRoute>
              <MainLayout showFooter={false}>
                <PaymentHistoryPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/PaymentPage" element={
            <ProtectedRoute>
              <MainLayout>
                <PaymentPage />
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
        </AnimatePresence>
        <Toaster
          position="top-right"
          expand={false}
          richColors
          closeButton
        />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
export default App
