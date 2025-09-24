import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch recent products
      const productsResponse = await fetch('/api/products?limit=6&sortBy=createdAt&sortOrder=desc')
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setRecentProducts(productsData.data)
      }

      // Initialize empty arrays for now - these will be populated when the backend endpoints are implemented
      setFavoriteProducts([])
      setRecentOrders([])
      setStats({
        totalOrders: 0,
        completedOrders: 0,
        totalSpent: 0,
        favoriteCount: 0
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
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
        <H1 className="text-gray-900">Welcome back, {user?.firstName || 'Buyer'}!</H1>
        <P className="text-gray-600">Discover fresh agricultural products directly from local farmers.</P>
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
                <div key={product._id} className="px-4 py-4 hover:bg-gray-50 cursor-pointer">
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
                          <Muted>{product.district}</Muted>
                          {product.farmer && (
                            <Muted>• by {product.farmer.firstName} {product.farmer.lastName}</Muted>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <P className="font-medium text-green-600">
                        {formatCurrency(product.price)}/{product.unit}
                      </P>
                      <Button 
                        variant="link"
                        size="sm"
                        className="mt-1 h-auto p-0 text-xs"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
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
                <div key={order._id} className="px-4 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <P className="font-medium text-gray-900">Order #{order.orderNumber}</P>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <Clock className="h-3 w-3" />
                        <Muted>{new Date(order.createdAt).toLocaleDateString()}</Muted>
                        <Muted>• {order.items} items</Muted>
                        <Muted>• from {order.farmer.firstName} {order.farmer.lastName}</Muted>
                      </div>
                    </div>
                    <div className="text-right">
                      <P className="font-medium text-gray-900">{formatCurrency(order.total)}</P>
                      <div className="mt-1">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>
                </div>
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