import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Plus,
  MapPin,
  Star
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb'

const FarmerDashboard = () => {
  console.log('FarmerDashboard component rendered') // Debug log
  const { user } = useAuth()
  console.log('User from context:', user) // Debug log
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    soldProducts: 0,
    totalRevenue: 0,
    averagePrice: 0,
    totalQuantityListed: 0,
    totalQuantitySold: 0
  })
  const [recentProducts, setRecentProducts] = useState([])
  const [loading, setLoading] = useState(false) // Changed from true to false for testing

  useEffect(() => {
    console.log('useEffect triggered') // Debug log
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('Fetching dashboard data...') // Debug log
      
      // Fetch stats
      const statsResponse = await fetch('/api/products/stats/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      console.log('Stats response status:', statsResponse.status) // Debug log
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        console.log('Stats data:', statsData) // Debug log
        setStats(statsData.data)
      } else {
        console.log('Stats response failed, using mock data') // Debug log
        // Set mock stats for development
        setStats({
          totalProducts: 12,
          activeProducts: 8,
          soldProducts: 4,
          totalRevenue: 45000,
          averagePrice: 425,
          totalQuantityListed: 500,
          totalQuantitySold: 180
        })
      }

      // Fetch recent products
      const productsResponse = await fetch('/api/products/my/products?limit=5&sortBy=createdAt&sortOrder=desc', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      console.log('Products response status:', productsResponse.status) // Debug log
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        console.log('Products data:', productsData) // Debug log
        setRecentProducts(productsData.data)
      } else {
        console.log('Products response failed, using mock data') // Debug log
        // Mock data for development
        setRecentProducts([
          {
            _id: '1',
            title: 'Fresh Organic Tomatoes',
            price: 450,
            unit: 'kg',
            status: 'active',
            availableQuantity: 65,
            initialQuantity: 100,
            createdAt: '2024-01-20T00:00:00.000Z',
            primaryImage: { url: 'https://images.unsplash.com/photo-1546470427-227e8e7dfde8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' }
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set mock stats for development
      setStats({
        totalProducts: 12,
        activeProducts: 8,
        soldProducts: 4,
        totalRevenue: 45000,
        averagePrice: 425,
        totalQuantityListed: 500,
        totalQuantitySold: 180
      })
      // Mock data for development
      setRecentProducts([
        {
          _id: '1',
          title: 'Fresh Organic Tomatoes',
          price: 450,
          unit: 'kg',
          status: 'active',
          availableQuantity: 65,
          initialQuantity: 100,
          createdAt: '2024-01-20T00:00:00.000Z',
          primaryImage: { url: 'https://images.unsplash.com/photo-1546470427-227e8e7dfde8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' }
        }
      ])
    } finally {
      console.log('Setting loading to false') // Debug log
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'sold':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    console.log('Dashboard is in loading state') // Debug log
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  console.log('Dashboard rendering main content') // Debug log

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Farmer Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName || 'Farmer'}!</h1>
        <p className="mt-2 text-gray-600">Manage your products, track sales, and grow your agricultural business.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalProducts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Products</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeProducts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalRevenue)}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Price</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.averagePrice)}</dd>
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
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/create-product" className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <div className="flex-shrink-0">
                    <Plus className="h-10 w-10 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Add New Product</p>
                    <p className="text-sm text-gray-500">List a new product for sale</p>
                  </div>
                </Link>

                <Link to="/my-products" className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <div className="flex-shrink-0">
                    <Package className="h-10 w-10 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Manage Products</p>
                    <p className="text-sm text-gray-500">View and edit your products</p>
                  </div>
                </Link>

                <Link to="/farmer-orders" className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                  <div className="flex-shrink-0">
                    <ShoppingBag className="h-10 w-10 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">View Orders</p>
                    <p className="text-sm text-gray-500">Track your product orders</p>
                  </div>
                </Link>

                <Link to="/farmer-analytics" className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-10 w-10 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Analytics</p>
                    <p className="text-sm text-gray-500">View detailed reports</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Sales Summary</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Products Sold</span>
                  <span className="font-medium">{stats.soldProducts}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quantity Sold</span>
                  <span className="font-medium">{stats.totalQuantitySold} units</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Remaining Stock</span>
                  <span className="font-medium">{stats.totalQuantityListed - stats.totalQuantitySold} units</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">Total Earnings</span>
                  <span className="text-lg font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Products</h3>
            <Link to="/my-products" className="text-sm font-medium text-green-600 hover:text-green-500">
              View all
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentProducts.length > 0 ? (
            recentProducts.map((product) => (
              <div key={product._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.primaryImage?.url || 'https://via.placeholder.com/50x50?text=Product'}
                      alt={product.title}
                      className="h-12 w-12 rounded-lg object-cover"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/50x50?text=Product'}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.title}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(product.price)}/{product.unit} • 
                        Stock: {product.availableQuantity}/{product.initialQuantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(product.status)}
                      <span className="text-sm text-gray-500 capitalize">{product.status}</span>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" className="p-1 h-auto text-gray-400 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1 h-auto text-gray-400 hover:text-green-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first product.</p>
              <div className="mt-6">
                <Link
                  to="/create-product"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FarmerDashboard