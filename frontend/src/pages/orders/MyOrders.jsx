import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Calendar,
  MapPin,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Build query parameters
      const params = new URLSearchParams(filters).toString();
      
      // Replace with your API endpoint
      const response = await fetch(`/api/orders/farmer/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching orders:', err);
      // Mock data for demo
      setOrders([
        {
          _id: '1',
          orderNumber: 'ORD-2024-0001',
          customer: { name: 'John Doe', email: 'john@example.com' },
          totalAmount: 2500,
          status: 'pending',
          items: [{ product: { title: 'Organic Tomatoes' }, quantity: 2 }],
          deliveryAddress: { city: 'Colombo', district: 'Colombo' },
          createdAt: new Date().toISOString()
        }
      ]);
      setPagination({ currentPage: 1, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600">Manage and track your customer orders</p>
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
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">You don't have any orders yet.</p>
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
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>Rs. {order.totalAmount?.toLocaleString()}</span>
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
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {order.deliveryAddress?.city}, {order.deliveryAddress?.district}
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Customer: {order.customer?.name} ({order.customer?.email})
                        </p>
                      </div>
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
                      
                      <Link
                        to={`/farmer/orders/${order._id}/edit`}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Edit Order"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {order.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => updateOrderStatus(order._id, 'confirmed')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Accept Order
                        </button>
                        
                        <button
                          onClick={() => updateOrderStatus(order._id, 'cancelled')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                        >
                          <XCircle className="h-4 w-4 inline mr-1" />
                          Reject Order
                        </button>
                      </div>
                    </div>
                  )}
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

export default MyOrders;