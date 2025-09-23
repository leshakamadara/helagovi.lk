import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Filter, 
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Truck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  formatDate, 
  formatCurrency, 
  getOrderStatusColor, 
  getPaymentStatusColor,
  formatOrderStatus,
  formatPaymentMethod
} from '../../lib/orderUtils';

const OrderList = ({ userRole = 'customer' }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchOrders();
  }, [filters, userRole]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        ...filters,
        page: filters.page.toString(),
        limit: filters.limit.toString()
      }).toString();
      
      // Determine the appropriate endpoint based on user role
      const endpoint = userRole === 'farmer' 
        ? `/orders/farmer/orders?${params}`
        : `/orders/my/orders?${params}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      // Mock data for demo
      setOrders([
        {
          _id: '1',
          orderNumber: 'ORD-2024-000001',
          items: [
            {
              product: { 
                _id: '1', 
                title: 'Fresh Organic Tomatoes', 
                images: [{ url: 'https://images.unsplash.com/photo-1546470427-227e8e7dfde8?w=100&h=100&fit=crop' }],
                unit: 'kg'
              },
              quantity: 2,
              unitPrice: 250,
              totalPrice: 500
            }
          ],
          subtotal: 500,
          deliveryFee: 200,
          totalAmount: 700,
          deliveryAddress: {
            addressLine1: '123 Main Street',
            city: 'Colombo',
            district: 'Colombo'
          },
          paymentMethod: 'cash_on_delivery',
          paymentStatus: 'pending',
          orderStatus: 'pending',
          createdAt: '2024-01-20T10:30:00.000Z',
          estimatedDelivery: '2024-01-22T10:30:00.000Z',
          farmer: { name: 'Sunil Perera', phone: '+94 77 123 4567' },
          customer: { name: 'John Customer', phone: '+94 77 987 6543' }
        }
      ]);
      setPagination({ currentPage: 1, totalPages: 1, totalOrders: 1 });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update order status');
      
      // Refresh orders
      fetchOrders();
      alert('Order status updated successfully');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {userRole === 'farmer' ? 'My Orders' : 'Order History'}
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="ready_for_delivery">Ready for Delivery</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Date</option>
              <option value="totalAmount">Amount</option>
              <option value="estimatedDelivery">Delivery Date</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Order Header */}
              <div className="border-b p-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.orderStatus)}`}>
                      {formatOrderStatus(order.orderStatus)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Items */}
                  <div className="lg:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
                          <img
                            src={item.product.images[0]?.url}
                            alt={item.product.title}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/48x48?text=Product'}
                          />
                          <div className="flex-1">
                            <h5 className="font-medium">{item.product.title}</h5>
                            <p className="text-sm text-gray-600">
                              {item.quantity} {item.product.unit} × {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                          <div className="font-medium">
                            {formatCurrency(item.totalPrice)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                      <div className="text-sm text-gray-600">
                        <p>{order.deliveryAddress.addressLine1}</p>
                        {order.deliveryAddress.addressLine2 && (
                          <p>{order.deliveryAddress.addressLine2}</p>
                        )}
                        <p>{order.deliveryAddress.city}, {order.deliveryAddress.district}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
                      <p className="text-sm text-gray-600">
                        {formatPaymentMethod(order.paymentMethod)}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Total</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee:</span>
                          <span>{formatCurrency(order.deliveryFee)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-1">
                          <span>Total:</span>
                          <span className="text-blue-600">{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    {userRole === 'farmer' && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
                        <p className="text-sm text-gray-600">
                          {order.customer.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.customer.phone}
                        </p>
                      </div>
                    )}

                    {userRole === 'customer' && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-2">Farmer</h4>
                        <p className="text-sm text-gray-600">
                          {order.farmer.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.farmer.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="border-t p-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    {order.estimatedDelivery && (
                      <p>Estimated delivery: {formatDate(order.estimatedDelivery)}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    
                    {userRole === 'farmer' && order.orderStatus === 'ready_for_delivery' && (
                      <button 
                        onClick={() => handleStatusUpdate(order._id, 'out_for_delivery')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <Truck className="h-4 w-4" />
                        Mark as Out for Delivery
                      </button>
                    )}
                    
                    {userRole === 'farmer' && order.orderStatus === 'out_for_delivery' && (
                      <button 
                        onClick={() => handleStatusUpdate(order._id, 'delivered')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Mark as Delivered
                      </button>
                    )}
                    
                    {order.orderStatus === 'pending' && (
                      <button 
                        onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * pagination.ordersPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.ordersPerPage, pagination.totalOrders)} of{' '}
              {pagination.totalOrders} results
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handleFilterChange('page', i + 1)}
                  className={`px-3 py-2 rounded border ${
                    pagination.currentPage === i + 1
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;