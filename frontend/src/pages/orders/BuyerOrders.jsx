import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { orderService } from '../../services/orderService'
import api from '../../lib/axios'
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
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb'
import { H1, H2, H3, P, Muted, Large } from '../../components/ui/typography'
import ReviewModal from '../../components/ReviewModal'

const BuyerOrders = () => {
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
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null)
  const [existingReviews, setExistingReviews] = useState({})

  useEffect(() => {
    fetchOrders()
    fetchOrderStats()
  }, []) // Remove filter and pagination.currentPage dependencies for stats

  useEffect(() => {
    fetchOrders()
  }, [filter, pagination.currentPage]) // Keep this for order fetching

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
        
        // Check for existing reviews for delivered orders
        await checkExistingReviews(response.data.orders)
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

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return
    }

    try {
      const response = await orderService.cancelOrder(orderId, 'Cancelled by buyer')
      if (response.success) {
        // Refresh orders to show updated status
        fetchOrders(true)
      } else {
        alert(response.message || 'Failed to cancel order')
      }
    } catch (error) {
      alert(error.message || 'Failed to cancel order')
    }
  }

  const handleWriteReview = (order) => {
    setSelectedOrderForReview(order)
    setReviewModalOpen(true)
  }

  const checkExistingReviews = async (orders) => {
    try {
      const reviewsMap = {}
      
      // Get all delivered orders
      const deliveredOrders = orders.filter(order => order.status === 'delivered')
      
      // Check reviews for each product in delivered orders
      for (const order of deliveredOrders) {
        for (const item of order.items) {
          const productId = typeof item.product === 'object' ? item.product._id : item.product
          
          try {
            // Check if user has already reviewed this product
            const response = await api.get(`/reviews/eligibility/${productId}`)
            if (!response.data.data.canReview) {
              // User has already reviewed this product
              reviewsMap[`${order._id}-${productId}`] = true
            }
          } catch (error) {
            // If there's an error checking eligibility, assume no review exists
            console.warn(`Could not check review eligibility for product ${productId}:`, error)
          }
        }
      }
      
      setExistingReviews(reviewsMap)
    } catch (error) {
      console.error('Error checking existing reviews:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'preparing':
        return <Package className="h-5 w-5 text-indigo-600" />
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-600" />
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    )
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

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <BreadcrumbLink href="/buyer-dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <H1 className="text-gray-900">My Orders</H1>
            <P className="text-gray-600">Track and manage your orders</P>
          </div>
          
          <button
            onClick={() => {
              fetchOrders(true)
              fetchOrderStats()
            }}
            disabled={refreshing}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={() => fetchOrders()}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="px-4 sm:px-6 overflow-x-auto" aria-label="Tabs">
            <div className="flex space-x-4 sm:space-x-8 min-w-max">
              {[
                { id: 'all', label: 'All Orders', count: orderStats.all },
                { id: 'pending', label: 'Pending', count: orderStats.pending },
                { id: 'confirmed', label: 'Confirmed', count: orderStats.confirmed },
                { id: 'shipped', label: 'Shipped', count: orderStats.shipped },
                { id: 'delivered', label: 'Delivered', count: orderStats.delivered },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleFilterChange(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    filter === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order._id} className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">#{order.orderNumber}</h3>
                      <p className="text-sm text-gray-500">
                        Ordered on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                    <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-6 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Items */}
                  <div className="lg:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.productSnapshot?.image?.url || 'https://via.placeholder.com/60x60?text=Product'}
                            alt={item.productSnapshot?.title || 'Product'}
                            className="h-16 w-16 rounded-lg object-cover flex-shrink-0 mx-auto sm:mx-0"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/60x60?text=Product'}
                          />
                          <div className="flex-1 text-center sm:text-left">
                            <h5 className="font-medium text-gray-900">
                              {item.productSnapshot?.title || 'Unknown Product'}
                            </h5>
                            <p className="text-sm text-gray-500">
                              {item.quantity} {item.productSnapshot?.unit || 'units'} × {formatCurrency(item.priceAtTime)}
                            </p>
                            {item.productSnapshot?.farmer?.name && (
                              <p className="text-xs text-gray-400">
                                Farmer: {item.productSnapshot.farmer.name}
                              </p>
                            )}
                          </div>
                          <div className="text-center sm:text-right">
                            <p className="font-medium text-gray-900">
                              {formatCurrency(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Details</h4>
                    <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-lg">
                      {order.deliveryAddress && (
                        <div className="flex items-start gap-2 text-gray-600">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>
                            {order.deliveryAddress.city}, {order.deliveryAddress.district}
                          </span>
                        </div>
                      )}
                      
                      {order.expectedDeliveryDate && (
                        <div className="flex items-start gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Expected: {formatDate(order.expectedDeliveryDate)}</span>
                        </div>
                      )}
                      
                      {order.actualDeliveryDate && (
                        <div className="flex items-start gap-2 text-gray-600">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Delivered: {formatDate(order.actualDeliveryDate)}</span>
                        </div>
                      )}
                      
                      {order.trackingNumber && (
                        <div className="flex items-start gap-2 text-gray-600">
                          <Truck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Tracking: {order.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <button 
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center sm:justify-start"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button 
                        onClick={() => handleCancelOrder(order._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                      >
                        Cancel Order
                      </button>
                    )}
                    
                    {order.status === 'delivered' && order.canBeReviewed && (
                      <button
                        onClick={() => handleWriteReview(order)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1 border border-green-200 rounded hover:bg-green-50"
                      >
                        {order.items.some(item => {
                          const productId = typeof item.product === 'object' ? item.product._id : item.product
                          return existingReviews[`${order._id}-${productId}`]
                        }) ? 'Edit Review' : 'Write Review'}
                      </button>
                    )}
                    
                    {order.trackingNumber && (
                      <button className="text-purple-600 hover:text-purple-800 text-sm font-medium px-3 py-1 border border-purple-200 rounded hover:bg-purple-50">
                        Track Order
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
                ? "You haven't placed any orders yet."
                : `No ${filter} orders found.`}
            </p>
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Start Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-4 py-3 sm:px-6">
            {/* Mobile Pagination */}
            <div className="flex flex-col gap-3 sm:hidden">
              <div className="text-center text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalOrders} total orders)
              </div>
              <div className="flex justify-between gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
            
            {/* Desktop Pagination */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalOrders} total orders)
                </p>
              </div>
              
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          page === pagination.currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false)
          setSelectedOrderForReview(null)
        }}
        order={selectedOrderForReview}
      />
    </div>
  )
}

export default BuyerOrders