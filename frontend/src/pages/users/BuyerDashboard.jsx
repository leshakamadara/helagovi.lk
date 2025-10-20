import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import {
  ShoppingBag,
  Search,
  Heart,
  ShoppingCart,
  Star,
  MapPin,
  Clock,
  Package,
  TrendingUp,
  Filter,
  Eye,
  Plus
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb'
import { H1, H2, H3, P, Muted, Large } from '../../components/ui/typography'

const BuyerDashboard = () => {
  const { user } = useAuth()
  const [recentProducts, setRecentProducts] = useState([])
  const [favoriteProducts, setFavoriteProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    favoriteCount: 0
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!user) {
        setLoading(false)
        return
      }

      // Parallel API calls for better performance
      const [
        productsResponse,
        ordersResponse,
        statsResponse
      ] = await Promise.allSettled([
        // Fetch recent products
        api.get('/products?limit=6&sortBy=createdAt&sortOrder=desc'),
        // Fetch user's recent orders
        api.get('/orders/my?limit=5&sortBy=createdAt&sortOrder=desc'),
        // Fetch order statistics for current user
        api.get('/orders/stats')
      ])

      // Handle products response
      if (productsResponse.status === 'fulfilled' && productsResponse.value.data?.success) {
        setRecentProducts(productsResponse.value.data.data || [])
      }

      // Handle orders response
      if (ordersResponse.status === 'fulfilled' && ordersResponse.value.data?.success) {
        setRecentOrders(ordersResponse.value.data.data || [])
      }

      // Handle stats response
      if (statsResponse.status === 'fulfilled' && statsResponse.value.data?.success) {
        const statsData = statsResponse.value.data.data
        setStats({
          totalOrders: statsData.statusCounts?.all || 0,
          completedOrders: statsData.revenue?.completedOrders || 0,
          totalSpent: statsData.revenue?.total || 0,
          favoriteCount: 0 // Placeholder, update when favorites endpoint is available
        })
      }

      // Handle favorites response (placeholder for future implementation)
      setFavoriteProducts([])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
      // Set default empty state on error
      setRecentProducts([])
      setRecentOrders([])
      setFavoriteProducts([])
      setStats({
        totalOrders: 0,
        completedOrders: 0,
        totalSpent: 0,
        favoriteCount: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchDashboardData()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Buyer Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <H1 className="text-gray-900">Welcome back, {user?.firstName || 'Buyer'}!</H1>
            <P className="text-gray-600">Discover fresh agricultural products directly from local farmers.</P>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </Button>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <P className="text-sm text-red-800">{error}</P>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <Muted>Total Orders</Muted>
                  <Large className="font-medium text-gray-900">{stats.totalOrders}</Large>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <Muted>Completed</Muted>
                  <Large className="font-medium text-gray-900">{stats.completedOrders}</Large>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <Muted>Total Spent</Muted>
                  <Large className="font-medium text-gray-900">{formatCurrency(stats.totalSpent)}</Large>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <Muted>Favorites</Muted>
                  <Large className="font-medium text-gray-900">{stats.favoriteCount}</Large>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <H3 className="mb-4">Quick Actions</H3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/" className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <div className="flex-shrink-0">
                    <Search className="h-10 w-10 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <P className="font-medium text-gray-900">Browse Products</P>
                    <Muted>Explore fresh agricultural products</Muted>
                  </div>
                </Link>

                <Link to="/my-orders" className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <div className="flex-shrink-0">
                    <ShoppingBag className="h-10 w-10 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <P className="font-medium text-gray-900">My Orders</P>
                    <Muted>Track your orders</Muted>
                  </div>
                </Link>

                <Link to="/favorites" className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  <div className="flex-shrink-0">
                    <Heart className="h-10 w-10 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <P className="font-medium text-gray-900">Favorites</P>
                    <Muted>View saved products</Muted>
                  </div>
                </Link>

                <Link to="/cart" className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                  <div className="flex-shrink-0">
                    <ShoppingCart className="h-10 w-10 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <P className="font-medium text-gray-900">Shopping Cart</P>
                    <Muted>Review your items</Muted>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <H3 className="mb-4">Order Summary</H3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <Muted>Pending Orders</Muted>
                  <P className="font-medium">{stats.totalOrders - stats.completedOrders}</P>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <Muted>Completed Orders</Muted>
                  <P className="font-medium">{stats.completedOrders}</P>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <Muted>Avg. Order Value</Muted>
                  <P className="font-medium">{formatCurrency(stats.totalSpent / (stats.totalOrders || 1))}</P>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <P className="font-medium text-gray-900">Total Spent</P>
                  <Large className="font-bold text-green-600">{formatCurrency(stats.totalSpent)}</Large>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products and Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <H3>Fresh Products</H3>
              <Link to="/" className="text-sm font-medium text-green-600 hover:text-green-500">
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentProducts.length > 0 ? (
              recentProducts.slice(0, 4).map((product) => (
                <Link 
                  key={product._id} 
                  to={`/product-details?id=${product._id}`}
                  className="block px-4 py-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.primaryImage?.url || product.images?.[0]?.url || 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg'}
                        alt={product.title}
                        className="h-12 w-12 rounded-lg object-cover"
                        onError={(e) => e.target.src = 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg'}
                      />
                      <div>
                        <P className="font-medium text-gray-900">{product.title}</P>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <Muted>{product.district || product.city}</Muted>
                          {product.farmer && (
                            <Muted>• by {product.farmer.firstName} {product.farmer.lastName}</Muted>
                          )}
                        </div>
                        {product.freshnessDays && (
                          <div className="flex items-center space-x-1 text-xs text-green-600 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{product.freshnessDays} days fresh</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <P className="font-medium text-green-600">
                        {formatCurrency(product.price)}/{product.unit}
                      </P>
                      {product.qualityScore && (
                        <div className="flex items-center text-xs text-yellow-600 mt-1">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          <span>{product.qualityScore}/5</span>
                        </div>
                      )}
                      <Button 
                        variant="link"
                        size="sm"
                        className="mt-1 h-auto p-0 text-xs text-blue-600 hover:text-blue-500"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <H3 className="mt-2">Discover Products</H3>
                <Muted className="mt-1">Browse fresh agricultural products from local farmers.</Muted>
                <div className="mt-6">
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Browse Now
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <H3>Recent Orders</H3>
              <Link to="/my-orders" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link
                  key={order._id}
                  to={`/my-orders?orderId=${order._id}`}
                  className="block px-4 py-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <P className="font-medium text-gray-900">
                        Order #{order.orderNumber || order._id?.slice(-8)}
                      </P>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <Clock className="h-3 w-3" />
                        <Muted>{new Date(order.createdAt).toLocaleDateString()}</Muted>
                        <Muted>• {order.items?.length || order.products?.length || 1} items</Muted>
                        {order.farmer && (
                          <Muted>• from {order.farmer.firstName} {order.farmer.lastName}</Muted>
                        )}
                      </div>
                      {order.deliveryAddress && (
                        <div className="flex items-center space-x-1 text-xs text-gray-400 mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{order.deliveryAddress.city}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <P className="font-medium text-gray-900">
                        {formatCurrency(order.totalAmount || order.total || 0)}
                      </P>
                      <div className="mt-1">
                        {getStatusBadge(order.status)}
                      </div>
                      {order.estimatedDelivery && (
                        <Muted className="text-xs mt-1">
                          Est: {new Date(order.estimatedDelivery).toLocaleDateString()}
                        </Muted>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <H3 className="mt-2">No orders yet</H3>
                <Muted className="mt-1">Start shopping to see your orders here.</Muted>
                <div className="mt-6">
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Start Shopping
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuyerDashboard