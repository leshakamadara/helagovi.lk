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
  RefreshCw
} from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb'
import { H1, H2, H3, P, Muted, Large } from '../../components/ui/typography'

const FarmerOrders = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

  useEffect(() => {
    fetchOrders()
    fetchOrderStats()
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [filter, pagination.currentPage])

  const fetchOrderStats = async () => {
    try {
      // Fetch all orders with a large limit to get accurate status counts
      const response = await orderService.getMyOrders({ limit: 1000 }) // Large limit to get all orders
      if (response.success && response.data.orders) {
        const counts = {
          all: response.data.pagination.totalOrders || 0,
          pending: 0,
          confirmed: 0,
          preparing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0
        }
        
        // Count orders by status from all fetched orders
        response.data.orders.forEach(order => {
          if (counts[order.status] !== undefined) {
            counts[order.status]++
          }
        })
        
        setOrderStats(counts)
      }
    } catch (error) {
      // If API call fails, fall back to current page calculation
      console.warn('Failed to fetch order statistics, using current page counts')
      const currentPageCounts = {
        all: pagination.totalOrders,
        pending: 0,
        confirmed: 0,
        preparing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      }
      
      orders.forEach(order => {
        if (currentPageCounts[order.status] !== undefined) {
          currentPageCounts[order.status]++
        }
      })
      
      setOrderStats(currentPageCounts)
    }
  }

  const fetchOrders = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true)
        // Refresh stats when manually refreshing
        await fetchOrderStats()
      } else {
        setLoading(true)
      }
      setError('')

      const params = {
        page: pagination.currentPage,
        limit: 10
      }
      
      if (filter !== 'all') {
        params.status = filter
      }

      const response = await orderService.getMyOrders(params)
      
      if (response.success) {
        setOrders(response.data.orders)
        setPagination(response.data.pagination)
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

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus)
      
      if (response.success) {
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus, [`${newStatus}At`]: new Date().toISOString() }
              : order
          )
        )
        
        // Refresh order statistics
        await fetchOrderStats()
        
        // Show success message
        toast.success(`Order status updated to ${newStatus}`)
      } else {
        toast.error(response.message || 'Failed to update order status')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update order status')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />
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
      confirmed: 'shipped',
      shipped: 'delivered'
    }
    return statusFlow[currentStatus]
  }

  const getStatusActionLabel = (currentStatus) => {
    const labels = {
      pending: 'Confirm Order',
      confirmed: 'Mark as Shipped',
      shipped: 'Mark as Delivered'
    }
    return labels[currentStatus]
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
        <div className="flex items-center justify-between">
          <div>
            <H1 className="text-gray-900">Order Management</H1>
            <P className="text-gray-600">Manage orders for your products</P>
          </div>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
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

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'all', label: 'All Orders', count: orderStats.all },
              { id: 'pending', label: 'Pending', count: orderStats.pending },
              { id: 'confirmed', label: 'Confirmed', count: orderStats.confirmed },
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Items */}
                  <div className="lg:col-span-1">
                    <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <img
                            src={item.product.primaryImage?.url || 'https://via.placeholder.com/50x50?text=Product'}
                            alt={item.product.title}
                            className="h-12 w-12 rounded-lg object-cover"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/50x50?text=Product'}
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 text-sm truncate">{item.product.title}</h5>
                            <p className="text-xs text-gray-500">
                              {item.quantity} {item.product.unit} × {formatCurrency(item.price)}
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
                        <span>{order.buyer.firstName} {order.buyer.lastName}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <a href={`tel:${order.buyer.phone}`} className="hover:text-green-600">
                          {order.buyer.phone}
                        </a>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <a href={`mailto:${order.buyer.email}`} className="hover:text-green-600 truncate">
                          {order.buyer.email}
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
                          <div>{order.deliveryAddress.street}</div>
                          <div>{order.deliveryAddress.city}, {order.deliveryAddress.district}</div>
                          <div>{order.deliveryAddress.postalCode}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Package className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
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
                      onClick={() => window.open(`tel:${order.buyer.phone}`, '_blank')}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      <Phone className="h-4 w-4 inline mr-1" />
                      Call Buyer
                    </button>
                    {getNextStatus(order.status) && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status))}
                        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
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