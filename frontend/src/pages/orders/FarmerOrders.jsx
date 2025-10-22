import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { orderService } from '../../services/orderService'
import {
  ShoppingBag,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  AlertCircle,
  RefreshCw,
  Download,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Star,
  FileText,
  CreditCard,
  ArrowUpDown
} from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb'
import { H1, H2, H3, P, Muted, Large } from '../../components/ui/typography'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

const FarmerOrders = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [filter, setFilter] = useState('all')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0
  })
  const [refreshing, setRefreshing] = useState(false)
  const [orderStats, setOrderStats] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    preparing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    averageOrderValue: 0
  })
  const [activeTab, setActiveTab] = useState('orders')

  useEffect(() => {
    fetchOrders()
    fetchOrderStats()
    fetchAnalytics()
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [filter, pagination.currentPage, searchTerm, sortBy, sortOrder])

  const fetchOrderStats = async () => {
    try {
      // Use the same data as fetchAnalytics for consistency
      const response = await orderService.getMyOrders({ limit: 1000 })
      if (response.success && response.data.orders) {
        // Filter out test orders same as in fetchOrders
        const validOrders = response.data.orders.filter(order => {
          const orderDate = new Date(order.createdAt)
          const now = new Date()
          
          // Exclude orders from the future (test data)
          if (orderDate > now) {
            return false
          }
          
          // Exclude orders with test buyer names
          const buyerName = `${order.buyer?.firstName || ''} ${order.buyer?.lastName || ''}`.toLowerCase()
          if (buyerName.includes('test') || buyerName.includes('dummy') || buyerName.includes('sample')) {
            return false
          }
          
          // Exclude orders with suspicious order numbers (future timestamps)
          if (order.orderNumber && order.orderNumber.includes('1758640665029')) {
            return false
          }
          
          return true
        })

        // Count orders by status for filter tabs
        const statusCounts = {
          all: validOrders.length,
          pending: validOrders.filter(order => order.status === 'pending').length,
          confirmed: validOrders.filter(order => order.status === 'confirmed').length,
          preparing: validOrders.filter(order => order.status === 'preparing').length,
          shipped: validOrders.filter(order => order.status === 'shipped').length,
          delivered: validOrders.filter(order => order.status === 'delivered').length,
          cancelled: validOrders.filter(order => order.status === 'cancelled').length
        }

        setOrderStats(statusCounts)
      } else {
        console.warn('Failed to fetch orders for stats: Invalid response', response)
      }
    } catch (error) {
      console.warn('Failed to fetch order statistics:', error)
      // Don't show error to user, just log it since this is supplementary data
    }
  }

  const fetchAnalytics = async () => {
    // Farmers don't have access to analytics endpoint, so we'll calculate basic stats from their orders
    try {
      const response = await orderService.getMyOrders({ limit: 1000 })
      if (response.success && response.data.orders) {
        // Filter out test orders same as in fetchOrders
        const validOrders = response.data.orders.filter(order => {
          const orderDate = new Date(order.createdAt)
          const now = new Date()
          
          // Exclude orders from the future (test data)
          if (orderDate > now) {
            return false
          }
          
          // Exclude orders with test buyer names
          const buyerName = `${order.buyer?.firstName || ''} ${order.buyer?.lastName || ''}`.toLowerCase()
          if (buyerName.includes('test') || buyerName.includes('dummy') || buyerName.includes('sample')) {
            return false
          }
          
          // Exclude orders with suspicious order numbers (future timestamps)
          if (order.orderNumber && order.orderNumber.includes('1758640665029')) {
            return false
          }
          
          return true
        })
        
        // Calculate farmer's earnings from delivered orders (what they actually earn)
        const deliveredOrders = validOrders.filter(order => order.status === 'delivered')
        const totalFarmerEarnings = deliveredOrders.reduce((sum, order) => {
          // Sum up the farmer's share from each delivered order
          const farmerItems = order.items.filter(item => 
            item.productSnapshot.farmer.id === user._id
          )
          const farmerEarnings = farmerItems.reduce((itemSum, item) => 
            itemSum + item.subtotal, 0
          )
          return sum + farmerEarnings
        }, 0)
        
        // Calculate total orders (all valid orders, not just delivered)
        const totalOrders = validOrders.length
        
        // Calculate pending orders
        const pendingOrders = validOrders.filter(order => order.status === 'pending').length
        
        // Calculate average earnings per delivered order
        const averageOrderValue = deliveredOrders.length > 0 ? totalFarmerEarnings / deliveredOrders.length : 0

        setAnalytics({
          totalRevenue: totalFarmerEarnings,
          totalOrders,
          pendingOrders,
          averageOrderValue
        })
      }
    } catch (error) {
      console.warn('Failed to calculate analytics from orders:', error)
    }
  }

  const fetchOrders = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true)
        // Refresh analytics when manually refreshing
        await fetchAnalytics()
        await fetchOrderStats()
      } else {
        setLoading(true)
      }
      setError('')

      const params = {
        page: pagination.currentPage,
        limit: 10,
        sortBy,
        sortOrder
      }
      
      if (filter !== 'all') {
        params.status = filter
      }

      if (searchTerm) {
        params.search = searchTerm
      }

      const response = await orderService.getMyOrders(params)
      
      if (response.success) {
        // Filter out test orders (future dates, test buyer names, or specific patterns)
        const filteredOrders = response.data.orders.filter(order => {
          const orderDate = new Date(order.createdAt)
          const now = new Date()
          
          // Exclude orders from the future (test data)
          if (orderDate > now) {
            return false
          }
          
          // Exclude orders with test buyer names
          const buyerName = `${order.buyer?.firstName || ''} ${order.buyer?.lastName || ''}`.toLowerCase()
          if (buyerName.includes('test') || buyerName.includes('dummy') || buyerName.includes('sample')) {
            return false
          }
          
          // Exclude orders with suspicious order numbers (future timestamps)
          if (order.orderNumber && order.orderNumber.includes('1758640665029')) {
            return false
          }
          
          return true
        })
        
        setOrders(filteredOrders)
        setPagination(response.data.pagination)
        // No longer calling fetchOrderStats here since it's called separately
      } else {
        setError(response.message || 'Failed to fetch orders')
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleSort = (field, order) => {
    setSortBy(field)
    setSortOrder(order)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleExportOrders = async () => {
    try {
      await orderService.exportOrders({
        status: filter !== 'all' ? filter : undefined,
        search: searchTerm || undefined,
        sortBy,
        sortOrder
      })
      toast.success('Orders exported successfully')
    } catch (error) {
      toast.error('Failed to export orders')
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus)

      if (response.success) {
        // Update the order in the local state
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus, [`${newStatus}At`]: new Date() }
            : order
        ))
        
        // Update analytics
        fetchAnalytics()
        
        // Show success message
        setError(null)
        setSuccess(`Order status updated to ${newStatus} successfully!`)
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000)
      } else {
        // Handle specific error cases
        const errorMessage = response.message || 'Failed to update order status'
        if (errorMessage.includes('delivered status')) {
          setError(`Cannot mark as delivered: Order must be shipped first. Please follow the proper order flow: Confirm → Prepare → Ship → Deliver`)
        } else if (errorMessage.includes('Cannot transition from')) {
          const currentStatus = errorMessage.match(/from (\w+) to/)[1]
          const nextRequired = getNextStatus(currentStatus)
          setError(`Invalid status transition. Current status: ${currentStatus}. Next step should be: ${getStatusActionLabel(currentStatus)}`)
        } else {
          setError(errorMessage)
        }
        setSuccess(null) // Clear any previous success message
      }
    } catch (error) {
      console.error('Status update error:', error)
      setError('Network error. Please check your connection and try again.')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'preparing':
        return <Package className="h-5 w-5 text-orange-600" />
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-600" />
      case 'delivered':
        return <Package className="h-5 w-5 text-green-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    )
  }

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'shipped',
      shipped: 'delivered'
    }
    return statusFlow[currentStatus]
  }

  const getStatusActionLabel = (currentStatus) => {
    const labels = {
      pending: 'Confirm Order',
      confirmed: 'Start Preparing',
      preparing: 'Mark as Shipped',
      shipped: 'Mark as Delivered'
    }
    return labels[currentStatus]
  }

  const getStatusProgression = (currentStatus) => {
    const allStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered']
    
    // Handle cancelled status separately
    if (currentStatus === 'cancelled') {
      return {
        completed: [],
        current: 'cancelled',
        remaining: [],
        isCancelled: true
      }
    }
    
    const currentIndex = allStatuses.indexOf(currentStatus)
    return {
      completed: allStatuses.slice(0, currentIndex),
      current: currentStatus,
      remaining: allStatuses.slice(currentIndex + 1),
      isCancelled: false
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto pt-16 pb-6 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/farmer-dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Order Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <H1 className="text-gray-900">Order Management</H1>
            <P className="text-gray-600">Manage orders for your products</P>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleExportOrders}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => {
                fetchOrders(true)
              }}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">{success}</div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.pendingOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Order Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.averageOrderValue || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'all', label: 'All Orders', count: orderStats.all },
              { id: 'pending', label: 'Pending', count: orderStats.pending },
              { id: 'confirmed', label: 'Confirmed', count: orderStats.confirmed },
              { id: 'preparing', label: 'Preparing', count: orderStats.preparing },
              { id: 'shipped', label: 'Shipped', count: orderStats.shipped },
              { id: 'delivered', label: 'Delivered', count: orderStats.delivered },
              { id: 'cancelled', label: 'Cancelled', count: orderStats.cancelled },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  filter === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by order number, buyer name, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="createdAt">Date</option>
              <option value="total">Amount</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order._id} className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">#{order.orderNumber}</h3>
                      <p className="text-sm text-gray-500">
                        Ordered on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                    <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                {/* Status Progression */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Order Progress</h4>
                  <div className="flex items-center space-x-2">
                    {order.status === 'cancelled' ? (
                      // Show cancelled status
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium bg-red-100 text-red-800 ring-2 ring-red-500">
                          <XCircle className="h-4 w-4" />
                        </div>
                        <span className="ml-2 text-xs font-medium capitalize text-red-800">
                          Cancelled
                        </span>
                      </div>
                    ) : (
                      // Show normal progression
                      ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'].map((status, index) => {
                        const progression = getStatusProgression(order.status)
                        const isCompleted = progression.completed.includes(status)
                        const isCurrent = progression.current === status
                        const isRemaining = progression.remaining.includes(status)
                        
                        return (
                          <div key={status} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                              isCompleted 
                                ? 'bg-green-100 text-green-800' 
                                : isCurrent 
                                  ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500' 
                                  : 'bg-gray-100 text-gray-400'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : isCurrent ? (
                                getStatusIcon(status)
                              ) : (
                                <div className="w-2 h-2 bg-current rounded-full"></div>
                              )}
                            </div>
                            <span className={`ml-2 text-xs font-medium capitalize ${
                              isCompleted 
                                ? 'text-green-800' 
                                : isCurrent 
                                  ? 'text-blue-800' 
                                  : 'text-gray-400'
                            }`}>
                              {status}
                            </span>
                            {index < 4 && (
                              <div className={`w-8 h-0.5 mx-2 ${
                                isCompleted ? 'bg-green-300' : 'bg-gray-200'
                              }`}></div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {order.status === 'pending' && "Next: Confirm the order to start processing"}
                    {order.status === 'confirmed' && "Next: Start preparing the order"}
                    {order.status === 'preparing' && "Next: Mark as shipped when ready for delivery"}
                    {order.status === 'shipped' && "Next: Mark as delivered when customer receives the order"}
                    {order.status === 'delivered' && "Order completed successfully"}
                    {order.status === 'cancelled' && "Order has been cancelled"}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Items */}
                  <div className="lg:col-span-1">
                    <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <img
                            src={'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg'}
                            alt={item.product?.title || 'Product'}
                            className="h-12 w-12 rounded-lg object-cover"
                            onLoad={(e) => {
                              // Only try to load actual image if we have a valid URL
                              const actualImageUrl = item.product?.primaryImage?.url;
                              if (actualImageUrl && actualImageUrl.startsWith('http') && !actualImageUrl.includes('undefined')) {
                                const img = new Image();
                                img.onload = () => e.target.src = actualImageUrl;
                                img.src = actualImageUrl;
                              }
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 text-sm truncate">{item.product?.title || 'Unknown Product'}</h5>
                            <p className="text-xs text-gray-500">
                              {item.quantity} {item.product?.unit || 'unit'} × {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buyer Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Buyer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{order.buyer?.firstName || ''} {order.buyer?.lastName || ''}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <a href={`tel:${order.buyer?.phone || ''}`} className="hover:text-green-600">
                          {order.buyer?.phone || 'N/A'}
                        </a>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <a href={`mailto:${order.buyer?.email || ''}`} className="hover:text-green-600 truncate">
                          {order.buyer?.email || 'N/A'}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Delivery Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <div>{order.deliveryAddress?.street || 'N/A'}</div>
                          <div>{order.deliveryAddress?.city || 'N/A'}, {order.deliveryAddress?.district || 'N/A'}</div>
                          <div>{order.deliveryAddress?.postalCode || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Package className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="capitalize">{order.paymentMethod ? order.paymentMethod.replace('_', ' ') : 'Cash on Delivery'}</span>
                      </div>
                      {order.confirmedAt && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>Confirmed: {formatDate(order.confirmedAt)}</span>
                        </div>
                      )}
                      {order.shippedAt && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>Shipped: {formatDate(order.shippedAt)}</span>
                        </div>
                      )}
                      {order.deliveredAt && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>Delivered: {formatDate(order.deliveredAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    <Eye className="h-4 w-4 inline mr-1" />
                    View Details
                  </button>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => window.open(`tel:${order.buyer?.phone || ''}`, '_blank')}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      <Phone className="h-4 w-4 inline mr-1" />
                      Call Buyer
                    </button>
                    {getNextStatus(order.status) && (
                      <button
                        onClick={() => {
                          const expectedNextStatus = getNextStatus(order.status)
                          if (expectedNextStatus) {
                            handleStatusUpdate(order._id, expectedNextStatus)
                          }
                        }}
                        disabled={!getNextStatus(order.status)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {getStatusActionLabel(order.status)}
                      </button>
                    )}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? "You haven't received any orders yet."
                : `No ${filter} orders found.`}
            </p>
            <div className="mt-6">
              <Link
                to="/my-products"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Package className="h-4 w-4 mr-2" />
                Manage Products
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FarmerOrders