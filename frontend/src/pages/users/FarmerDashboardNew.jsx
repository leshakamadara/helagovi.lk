import * as React from "react"
import { Link } from "react-router-dom"
import {
  TrendingDownIcon,
  TrendingUpIcon,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Sprout,
  Users,
  ShoppingCart,
  Calendar
} from "lucide-react"
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/axios'
import { Badge } from "../../components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent
} from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb'
import { H1, H2, H3, P, Muted, Large } from "../../components/ui/typography"

const FarmerDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = React.useState({
    totalProducts: 0,
    activeProducts: 0,
    soldProducts: 0,
    totalRevenue: 0,
    averagePrice: 0,
    totalQuantityListed: 0,
    totalQuantitySold: 0,
    ordersThisMonth: 0,
    customersReached: 0
  })
  const [recentProducts, setRecentProducts] = React.useState([])
  const [recentOrders, setRecentOrders] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    if (user && user.role === 'farmer') {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch farmer's product statistics
      const [statsResponse, productsResponse, ordersResponse] = await Promise.all([
        api.get('/products/stats/overview'),
        api.get('/products/my/products?limit=5&sortBy=createdAt&sortOrder=desc'),
        api.get('/orders/my?limit=5&sortBy=createdAt&sortOrder=desc')
      ])

      // Set statistics from backend
      if (statsResponse.data.success) {
        const backendStats = statsResponse.data.data
        
        // Calculate additional metrics
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        
        setStats({
          totalProducts: backendStats.totalProducts || 0,
          activeProducts: backendStats.activeProducts || 0,
          soldProducts: backendStats.soldProducts || 0,
          totalRevenue: backendStats.totalRevenue || 0,
          averagePrice: backendStats.averagePrice || 0,
          totalQuantityListed: backendStats.totalQuantityListed || 0,
          totalQuantitySold: backendStats.totalQuantitySold || 0,
          ordersThisMonth: 0, // Will be calculated from orders
          customersReached: 0 // Will be calculated from orders
        })
      }

      // Set recent products
      if (productsResponse.data.success) {
        setRecentProducts(productsResponse.data.data || [])
      }

      // Set recent orders and calculate monthly stats
      if (ordersResponse.data.success) {
        const orders = ordersResponse.data.data.orders || []
        setRecentOrders(orders)
        
        // Calculate orders this month
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        
        const ordersThisMonth = orders.filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
        }).length

        // Calculate unique customers reached
        const uniqueCustomers = new Set(orders.map(order => order.buyer?._id || order.buyer)).size

        setStats(prevStats => ({
          ...prevStats,
          ordersThisMonth,
          customersReached: uniqueCustomers
        }))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      console.error('Error response:', error.response?.data)
      setError(`Failed to load dashboard data: ${error.response?.data?.message || error.message}`)
    } finally {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'confirmed':
        return 'text-blue-600 bg-blue-100'
      case 'preparing':
        return 'text-purple-600 bg-purple-100'
      case 'shipped':
        return 'text-indigo-600 bg-indigo-100'
      case 'delivered':
        return 'text-green-600 bg-green-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
          <p className="mt-4 text-red-600">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Check if user is a farmer
  if (user && user.role !== 'farmer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
          <p className="mt-4 text-red-600">Access denied. This dashboard is only available for farmers.</p>
          <Link to="/" className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Helagovi.lk</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Farmer Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <main className="space-y-4">
          {/* Welcome Section */}
          <div className="flex items-center justify-between space-y-2">
            <H1 className="text-green-700">
              Welcome back, {user?.firstName || 'Farmer'}! 🌾
            </H1>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={fetchDashboardData}
                disabled={loading}
                title="Refresh Dashboard"
              >
                <TrendingUp className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link to="/create-product">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="@container/card">
              <CardHeader className="relative pb-2">
                <CardDescription className="flex items-center">
                  <Package className="h-4 w-4 mr-2 text-blue-600" />
                  Total Products
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {stats.totalProducts}
                </CardTitle>
                <div className="absolute right-4 top-4">
                  <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                    <TrendingUpIcon className="size-3" />
                    {stats.activeProducts > 0 ? `${stats.activeProducts} active` : 'No active'}
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Growing inventory <TrendingUpIcon className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  {stats.activeProducts} active listings
                </div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader className="relative pb-2">
                <CardDescription className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                  Total Revenue
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {formatCurrency(stats.totalRevenue)}
                </CardTitle>
                <div className="absolute right-4 top-4">
                  <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                    <TrendingUpIcon className="size-3" />
                    {stats.totalRevenue > 0 ? 'Active' : 'No sales'}
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Strong sales performance <TrendingUpIcon className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  {stats.soldProducts} products sold this month
                </div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader className="relative pb-2">
                <CardDescription className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-purple-600" />
                  Customers Reached
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {stats.customersReached}
                </CardTitle>
                <div className="absolute right-4 top-4">
                  <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                    <TrendingUpIcon className="size-3" />
                    {stats.customersReached > 0 ? 'Growing' : 'Start selling'}
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Expanding market reach <TrendingUpIcon className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Growing customer base
                </div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader className="relative pb-2">
                <CardDescription className="flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-2 text-orange-600" />
                  Orders This Month
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {stats.ordersThisMonth}
                </CardTitle>
                <div className="absolute right-4 top-4">
                  <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                    <TrendingUpIcon className="size-3" />
                    {stats.ordersThisMonth > 0 ? 'Active' : 'No orders'}
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Steady order flow <TrendingUpIcon className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Consistent demand
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Products */}
            <Card className="col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Products</CardTitle>
                    <CardDescription>
                      Your latest product listings and their performance
                    </CardDescription>
                  </div>
                  <Link to="/my-products">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <Sprout className="h-12 w-12 mx-auto text-gray-400" />
                      <H3 className="text-gray-900 mt-4">No products yet</H3>
                      <P className="text-gray-500 mt-2">Get started by adding your first product.</P>
                      <Link to="/create-product">
                        <Button className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    recentProducts.map((product) => (
                      <div key={product._id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <H3 className="font-medium">{product.title}</H3>
                            {product.isOrganic && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <Sprout className="h-3 w-3 mr-1" />
                                Organic
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>{formatCurrency(product.price)} per {product.unit}</span>
                            <span className="flex items-center">
                              {getStatusIcon(product.status)}
                              <span className="ml-1 capitalize">{product.status}</span>
                            </span>
                            <span>{product.availableQuantity || 0}/{product.initialQuantity || 0} {product.unit}</span>
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {product.district || 'Not set'}
                            </span>
                            <span className="text-xs">{formatDate(product.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link to={`/product-details?id=${product._id}`}>
                            <Button variant="outline" size="sm" title="View Product">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/edit-product?id=${product._id}`}>
                            <Button variant="outline" size="sm" title="Edit Product">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Link to="/create-product" className="group">
                    <Card className="cursor-pointer transition-all hover:shadow-md group-hover:border-green-500">
                      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Plus className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-medium">Add New Product</CardTitle>
                            <CardDescription className="text-xs">
                              List a new product for sale
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>

                  <Link to="/my-products" className="group">
                    <Card className="cursor-pointer transition-all hover:shadow-md group-hover:border-blue-500">
                      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-medium">Manage Products</CardTitle>
                            <CardDescription className="text-xs">
                              View and edit your listings
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>

                  <Link to="/farmer-orders" className="group">
                    <Card className="cursor-pointer transition-all hover:shadow-md group-hover:border-purple-500">
                      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Truck className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-medium">View Orders</CardTitle>
                            <CardDescription className="text-xs">
                              Manage your sales orders
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>

                  <Link to="/profile" className="group">
                    <Card className="cursor-pointer transition-all hover:shadow-md group-hover:border-orange-500">
                      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Users className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-medium">Update Profile</CardTitle>
                            <CardDescription className="text-xs">
                              Manage your farmer profile
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    Your latest customer orders and their status
                  </CardDescription>
                </div>
                <Link to="/farmer-orders">
                  <Button variant="outline" size="sm">
                    View All Orders
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto text-gray-400" />
                    <H3 className="text-gray-900 mt-4">No orders yet</H3>
                    <P className="text-gray-500 mt-2">Orders will appear here when customers purchase your products.</P>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium text-sm">Order #{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">
                              {order.buyer?.firstName} {order.buyer?.lastName} • {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                          <span>{order.items?.length || 0} item(s)</span>
                          <span>{formatCurrency(order.total)}</span>
                          <Badge 
                            className={`px-2 py-1 text-xs rounded-full ${getOrderStatusColor(order.status)}`}
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/order-details/${order._id}`}>
                          <Button variant="outline" size="sm" title="View Order">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>
                Overview of your agricultural business metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Products Listed</div>
                    <div className="text-sm text-muted-foreground">
                      {stats.totalQuantityListed} {stats.totalQuantityListed !== 1 ? 'kg' : 'kg'}
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-600 rounded-full" 
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Products Sold</div>
                    <div className="text-sm text-muted-foreground">{stats.totalQuantitySold} kg</div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 rounded-full" 
                      style={{ 
                        width: stats.totalQuantityListed > 0 
                          ? `${Math.min((stats.totalQuantitySold / stats.totalQuantityListed) * 100, 100)}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Average Price</div>
                    <div className="text-sm text-muted-foreground">
                      {stats.averagePrice > 0 ? formatCurrency(stats.averagePrice) : 'No sales'}/kg
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-purple-600 rounded-full" 
                      style={{ width: stats.averagePrice > 0 ? '75%' : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Sales efficiency metrics */}
              <div className="mt-6 pt-6 border-t grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sales Rate</span>
                  <span className="font-medium">
                    {stats.totalQuantityListed > 0 
                      ? `${((stats.totalQuantitySold / stats.totalQuantityListed) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Revenue per Product</span>
                  <span className="font-medium">
                    {stats.totalProducts > 0 
                      ? formatCurrency(stats.totalRevenue / stats.totalProducts)
                      : formatCurrency(0)
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

export default FarmerDashboard