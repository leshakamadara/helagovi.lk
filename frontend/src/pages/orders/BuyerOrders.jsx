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
  User
} from 'lucide-react'

const BuyerOrders = () => {
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
      // const response = await fetch('/api/orders/buyer', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // })
      
      // Mock data for now
      const mockOrders = [
        {
          _id: '1',
          orderNumber: 'ORD-2024-001',
          status: 'delivered',
          total: 2250,
          createdAt: '2024-01-20T00:00:00.000Z',
          deliveredAt: '2024-01-22T00:00:00.000Z',
          farmer: {
            firstName: 'John',
            lastName: 'Doe',
            phone: '+94 77 123 4567'
          },
          items: [
            {
              product: {
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
            district: 'Colombo'
          }
        },
        {
          _id: '2',
          orderNumber: 'ORD-2024-002',
          status: 'shipped',
          total: 1800,
          createdAt: '2024-01-18T00:00:00.000Z',
          shippedAt: '2024-01-19T00:00:00.000Z',
          farmer: {
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '+94 77 987 6543'
          },
          items: [
            {
              product: {
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
            district: 'Kandy'
          }
        },
        {
          _id: '3',
          orderNumber: 'ORD-2024-003',
          status: 'pending',
          total: 3200,
          createdAt: '2024-01-21T00:00:00.000Z',
          farmer: {
            firstName: 'Mike',
            lastName: 'Johnson',
            phone: '+94 77 555 1234'
          },
          items: [
            {
              product: {
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
            district: 'Galle'
          }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-gray-600">Track and manage your orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'all', label: 'All Orders', count: 3 },
              { id: 'pending', label: 'Pending', count: 1 },
              { id: 'shipped', label: 'Shipped', count: 1 },
              { id: 'delivered', label: 'Delivered', count: 1 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
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
                  <div className="lg:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <img
                            src={item.product.primaryImage?.url || 'https://via.placeholder.com/60x60?text=Product'}
                            alt={item.product.title}
                            className="h-16 w-16 rounded-lg object-cover"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/60x60?text=Product'}
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{item.product.title}</h5>
                            <p className="text-sm text-gray-500">
                              {item.quantity} {item.product.unit} × {formatCurrency(item.price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatCurrency(item.quantity * item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>Farmer: {order.farmer.firstName} {order.farmer.lastName}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                          {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.district}
                        </span>
                      </div>
                      {order.shippedAt && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Shipped: {formatDate(order.shippedAt)}</span>
                        </div>
                      )}
                      {order.deliveredAt && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
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
                    {order.status === 'pending' && (
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Cancel Order
                      </button>
                    )}
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Contact Farmer
                    </button>
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
  )
}

export default BuyerOrders