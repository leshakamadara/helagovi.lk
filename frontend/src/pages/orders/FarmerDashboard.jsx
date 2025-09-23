import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Loader2
} from 'lucide-react';

const FarmerDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch('/api/farmer/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Fetch recent orders
      const ordersResponse = await fetch('/api/orders/farmer/orders?limit=5', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Mock data for demo
      setStats({
        totalOrders: 24,
        pendingOrders: 5,
        completedOrders: 18,
        totalRevenue: 85500,
        averageOrderValue: 425
      });
      
      setRecentOrders([
        {
          _id: '1',
          orderNumber: 'ORD-2024-0001',
          customer: { name: 'John Doe' },
          totalAmount: 2500,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]);
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
        // Refresh data
        fetchDashboardData();
        alert(`Order ${status} successfully`);
        
        // Send notification to buyer
        await sendBuyerNotification(orderId, status);
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
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount?.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your farming overview.</p>
          </div>
          <Link
            to="/farmer/products"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Manage Products
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link
                to="/farmer/orders"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No recent orders</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900">Order #{order.orderNumber}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.customer?.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-600">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="ml-4 flex space-x-2">
                      <Link
                        to={`/farmer/orders/${order._id}`}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order._id, 'confirmed')}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                            title="Accept Order"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => updateOrderStatus(order._id, 'cancelled')}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            title="Reject Order"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Order Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Management</h2>
              <div className="grid grid-cols-1 gap-3">
                <Link
                  to="/farmer/orders"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Package className="h-5 w-5 text-blue-600 mr-3" />
                  <span>View All Orders</span>
                </Link>
                
                <Link
                  to="/farmer/orders/pending"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5 text-yellow-600 mr-3" />
                  <span>Pending Orders ({stats.pendingOrders})</span>
                </Link>
                
                <Link
                  to="/farmer/orders/completed"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Completed Orders</span>
                </Link>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Order Value</span>
                  <span className="font-medium">{formatCurrency(stats.averageOrderValue)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">
                    {stats.totalOrders ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Actions</span>
                  <span className="font-medium">{stats.pendingOrders} orders</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;