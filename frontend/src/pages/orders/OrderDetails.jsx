import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { orderService } from '../../services/orderService'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Phone,
  User,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  Star,
  MessageCircle
} from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb'

const OrderDetails = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [statusNote, setStatusNote] = useState('')

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await orderService.getOrderById(orderId)
      if (response.success) {
        setOrder(response.data.order)
      } else {
        setError(response.message || 'Failed to fetch order details')
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch order details')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus, note = '') => {
    try {
      setUpdating(true)
      const response = await orderService.updateOrderStatus(orderId, newStatus, note)
      if (response.success) {
        setOrder(response.data.order)
        setStatusNote('')
      } else {
        setError(response.message || 'Failed to update order status')
      }
    } catch (error) {
      setError(error.message || 'Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelOrder = async () => {
    try {
      setUpdating(true)
      const response = await orderService.cancelOrder(orderId, cancelReason)
      if (response.success) {
        setOrder(response.data.order)
        setShowCancelModal(false)
        setCancelReason('')
      } else {
        setError(response.message || 'Failed to cancel order')
      }
    } catch (error) {
      setError(error.message || 'Failed to cancel order')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <Clock className="h-5 w-5 text-yellow-600" />,
      'confirmed': <CheckCircle className="h-5 w-5 text-blue-600" />,
      'preparing': <Package className="h-5 w-5 text-indigo-600" />,
      'shipped': <Truck className="h-5 w-5 text-purple-600" />,
      'delivered': <CheckCircle className="h-5 w-5 text-green-600" />,
      'cancelled': <XCircle className="h-5 w-5 text-red-600" />,
      'refunded': <CreditCard className="h-5 w-5 text-gray-600" />
    }
    return icons[status] || <Clock className="h-5 w-5 text-gray-600" />
  }

  const getStatusBadge = (status) => {
    const styles = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'preparing': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'shipped': 'bg-purple-100 text-purple-800 border-purple-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'refunded': 'bg-gray-100 text-gray-800 border-gray-200'
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
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

  const canUpdateStatus = (currentStatus, newStatus) => {
    const transitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': [],
      'refunded': []
    }
    return transitions[currentStatus]?.includes(newStatus) || false
  }

  const canUserUpdateStatus = () => {
    if (!order) return false
    
    const isFarmer = user.role === 'farmer' && order.farmers.some(f => f._id === user.id)
    const isAdmin = user.role === 'admin'
    
    return isFarmer || isAdmin
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Order</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Order Not Found</h3>
          <p className="text-gray-600">The requested order could not be found.</p>
        </div>
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
              <BreadcrumbLink href="/buyer-orders">Orders</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Order Details</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="mt-2 text-gray-600">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            {getStatusBadge(order.status)}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
            </div>
            
            <div className="px-6 py-4">
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                    <img
                      src={item.productSnapshot.image.url || 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg'}
                      alt={item.productSnapshot.title}
                      className="h-20 w-20 rounded-lg object-cover"
                      onError={(e) => e.target.src = 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg'}
                    />
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productSnapshot.title}</h4>
                      <p className="text-sm text-gray-600">
                        Farmer: {item.productSnapshot.farmer.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} {item.productSnapshot.unit} × {formatCurrency(item.priceAtTime)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Order Timeline</h3>
              </div>
              
              <div className="px-6 py-4">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {order.statusHistory.map((event, index) => (
                      <li key={index}>
                        <div className="relative pb-8">
                          {index !== order.statusHistory.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                          )}
                          <div className="relative flex space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                              {getStatusIcon(event.status)}
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm text-gray-900 capitalize">
                                  {event.status.replace('_', ' ')}
                                </p>
                                {event.note && (
                                  <p className="mt-1 text-sm text-gray-500">{event.note}</p>
                                )}
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                <time>{formatDate(event.timestamp)}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Status Update Actions */}
          {canUserUpdateStatus() && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">Update Order Status</h3>
              </div>
              
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Note (Optional)
                    </label>
                    <textarea
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add a note about this status update..."
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus('confirmed', statusNote)}
                        disabled={updating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Confirm Order
                      </button>
                    )}
                    
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus('preparing', statusNote)}
                        disabled={updating}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Start Preparing
                      </button>
                    )}
                    
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus('shipped', statusNote)}
                        disabled={updating}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        Mark as Shipped
                      </button>
                    )}
                    
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => updateOrderStatus('delivered', statusNote)}
                        disabled={updating}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    
                    {order.canBeCancelled && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        disabled={updating}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
            </div>
            
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">{formatCurrency(order.deliveryFee)}</span>
              </div>
              
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatCurrency(order.tax)}</span>
                </div>
              )}
              
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              
              <hr />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Delivery Information</h3>
            </div>
            
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{order.deliveryAddress.recipientName}</p>
                  <p className="text-sm text-gray-600">{order.deliveryAddress.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-900">{order.deliveryAddress.street}</p>
                  <p className="text-gray-600">
                    {order.deliveryAddress.city}, {order.deliveryAddress.district} {order.deliveryAddress.postalCode}
                  </p>
                </div>
              </div>
              
              {order.expectedDeliveryDate && (
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Expected Delivery</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(order.expectedDeliveryDate)}
                    </p>
                  </div>
                </div>
              )}
              
              {order.trackingNumber && (
                <div className="flex items-start space-x-3">
                  <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-medium text-gray-900">{order.trackingNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
            </div>
            
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium capitalize">
                  {order.paymentInfo.method.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span className={`font-medium capitalize ${
                  order.paymentInfo.status === 'paid' ? 'text-green-600' : 
                  order.paymentInfo.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {order.paymentInfo.status}
                </span>
              </div>
              
              {order.paymentInfo.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-medium text-sm">{order.paymentInfo.transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {order.farmers && order.farmers.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">
                  {order.farmers.length === 1 ? 'Farmer Contact' : 'Farmer Contacts'}
                </h3>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                {order.farmers.map((farmer, index) => (
                  <div key={farmer._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {farmer.firstName} {farmer.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{farmer.phone}</p>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={`tel:${farmer.phone}`}
                        className="p-2 text-blue-600 hover:text-blue-800"
                        title="Call farmer"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => {/* Implement messaging */}}
                        className="p-2 text-green-600 hover:text-green-800"
                        title="Message farmer"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Cancel Order
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to cancel this order? This action cannot be undone.
                  </p>
                </div>
                <div className="mt-4">
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason for cancellation (optional)"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
            <div className="items-center px-4 py-3">
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelOrder}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {updating ? 'Cancelling...' : 'Cancel Order'}
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                >
                  Keep Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetails