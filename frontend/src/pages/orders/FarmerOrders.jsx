import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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
  Mail
} from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb'
import { H1, H2, H3, P, Muted, Large } from '../../components/ui/typography'

const FarmerOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/orders/farmer', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // })
      
      // Mock data for now
      const mockOrders = [
        {
          _id: '1',
          orderNumber: 'ORD-2024-001',
          status: 'pending',
          total: 2250,
          createdAt: '2024-01-20T00:00:00.000Z',
          buyer: {
            firstName: 'Sarah',
            lastName: 'Wilson',
            email: 'sarah@example.com',
            phone: '+94 77 111 2222'
          },
          items: [
            {
              product: {
                _id: 'prod1',
                title: 'Fresh Organic Tomatoes',
                primaryImage: { url: 'https://images.unsplash.com/photo-1546470427-227e8e7dfde8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
                unit: 'kg'
              },
              quantity: 5,
              price: 450
            }
          ],
          deliveryAddress: {
            street: '123 Main Street',
            city: 'Colombo',
            district: 'Colombo',
            postalCode: '00100'
          },
          paymentMethod: 'cash_on_delivery'
        },
        {
          _id: '2',
          orderNumber: 'ORD-2024-002',
          status: 'confirmed',
          total: 1800,
          createdAt: '2024-01-18T00:00:00.000Z',
          confirmedAt: '2024-01-18T12:00:00.000Z',
          buyer: {
            firstName: 'Mike',
            lastName: 'Brown',
            email: 'mike@example.com',
            phone: '+94 77 333 4444'
          },
          items: [
            {
              product: {
                _id: 'prod2',
                title: 'Fresh Carrots',
                primaryImage: { url: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
                unit: 'kg'
              },
              quantity: 4,
              price: 350
            }
          ],
          deliveryAddress: {
            street: '456 Garden Road',
            city: 'Kandy',
            district: 'Kandy',
            postalCode: '20000'
          },
          paymentMethod: 'bank_transfer'
        },
        {
          _id: '3',
          orderNumber: 'ORD-2024-003',
          status: 'delivered',
          total: 3200,
          createdAt: '2024-01-15T00:00:00.000Z',
          confirmedAt: '2024-01-15T14:00:00.000Z',
          shippedAt: '2024-01-16T10:00:00.000Z',
          deliveredAt: '2024-01-17T16:00:00.000Z',
          buyer: {
            firstName: 'Emma',
            lastName: 'Davis',
            email: 'emma@example.com',
            phone: '+94 77 555 6666'
          },
          items: [
            {
              product: {
                _id: 'prod3',
                title: 'Organic Lettuce',
                primaryImage: { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
                unit: 'bunch'
              },
              quantity: 8,
              price: 400
            }
          ],
          deliveryAddress: {
            street: '789 Hill Road',
            city: 'Galle',
            district: 'Galle',
            postalCode: '80000'
          },
          paymentMethod: 'cash_on_delivery'
        }
      ]
      
      let filteredOrders = mockOrders
      if (filter !== 'all') {
        filteredOrders = mockOrders.filter(order => order.status === filter)
      }
      
      setOrders(filteredOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/orders/${orderId}/status`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ status: newStatus })
      // })
      
      // Mock update
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              [`${newStatus}At`]: new Date().toISOString()
            }
          : order
      ))
      
      alert(`Order status updated to ${newStatus}`)
    } catch (error) {
      alert('Failed to update order status')
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
        <H1 className="text-gray-900">Order Management</H1>
        <P className="text-gray-600">Manage orders for your products</P>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'all', label: 'All Orders', count: 3 },
              { id: 'pending', label: 'Pending', count: 1 },
              { id: 'confirmed', label: 'Confirmed', count: 1 },
              { id: 'delivered', label: 'Delivered', count: 1 },
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