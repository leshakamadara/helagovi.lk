import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  DollarSign,
  Loader2
} from 'lucide-react';

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchPendingOrders();
  }, [filters]);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        status: 'pending',
        page: filters.page.toString(),
        limit: filters.limit.toString()
      }).toString();
      
      const response = await fetch(`/api/orders/farmer/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data);
        setPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch pending orders');
      }
    } catch (err) {
      console.error('Error fetching pending orders:', err);
      // Mock data for demo
      setOrders([
        {
          _id: '1',
          orderNumber: 'ORD-2024-0001',
          customer: { 
            name: 'John Doe', 
            email: 'john@example.com',
            phone: '+94 77 123 4567'
          },
          totalAmount: 2500,
          status: 'pending',
          items: [
            {
              product: { 
                title: 'Organic Tomatoes',
                unit: 'kg'
              },
              quantity: 2,
              unitPrice: 250
            }
          ],
          deliveryAddress: { 
            city: 'Colombo', 
            district: 'Colombo' 
          },
          createdAt: new Date().toISOString(),
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '2',
          orderNumber: 'ORD-2024-0002',
          customer: { 
            name: 'Jane Smith', 
            email: 'jane@example.com',
            phone: '+94 77 765 4321'
          },
          totalAmount: 1800,
          status: 'pending',
          items: [
            {
              product: { 
                title: 'Fresh Carrots',
                unit: 'kg'
              },
              quantity: 3,
              unitPrice: 200
            }
          ],
          deliveryAddress: { 
            city: 'Kandy', 
            district: 'Kandy' 
          },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
      setPagination({ currentPage: 1, totalPages: 1, total: 2 });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        // Remove the order from the list
        setOrders(prev => prev.filter(order => order._id !== orderId));
        alert(`Order ${status === 'confirmed' ? 'accepted' : 'rejected'} successfully`);
        
        // Send notification to buyer
        await sendBuyerNotification(orderId, status);
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  const sendBuyerNotification = async (orderId, status) => {
    try {
      await fetch(`/api/orders/${orderId}/notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status,
          message: status === 'confirmed' 
            ? 'Your order has been accepted by the farmer' 
            : 'Your order has been rejected by the farmer'
        })
      });
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount?.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pending Orders</h1>
            <p className="text-gray-600">Review and manage incoming orders</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Link
              to="/farmer/orders"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All Orders
            </Link>
            <Link
              to="/farmer/orders/completed"
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Completed Orders
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>

            <div className="flex items-center text-sm text-gray-600">
              <Filter className="h-4 w-4 mr-1" />
              <span>{orders.length} pending orders</span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending orders</h3>
              <p className="text-gray-600">All orders have been processed.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order._id} className="p-6 hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          Pending
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>{formatCurrency(order.totalAmount)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          <span>{order.items?.length} item(s)</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {order.deliveryAddress?.city}, {order.deliveryAddress?.district}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-sm text-gray-600">
                          Customer: {order.customer?.name} ({order.customer?.email})
                        </p>
                        <p className="text-sm text-gray-600">
                          Phone: {order.customer?.phone}
                        </p>
                      </div>

                      {order.estimatedDelivery && (
                        <div className="text-sm text-blue-600">
                          Estimated delivery: {formatDate(order.estimatedDelivery)}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 mt-4 md:mt-0">
                      <Link
                        to={`/farmer/orders/${order._id}`}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      
                      <button
                        onClick={() => updateOrderStatus(order._id, 'confirmed')}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Accept Order"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to reject this order?')) {
                            updateOrderStatus(order._id, 'cancelled');
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Reject Order"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                    <div className="flex flex-wrap gap-2">
                      {order.items?.map((item, index) => (
                        <span key={index} className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {item.quantity} × {item.product?.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              
              <button
                onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingOrders;