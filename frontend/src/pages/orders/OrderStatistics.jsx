import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Package, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const OrderStatistics = () => {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('30days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/stats/overview?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount?.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Order Statistics</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
          <option value="year">Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-blue-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-green-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.overview.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-purple-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.overview.averageOrderValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-orange-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.overview.totalOrders ? 
                  Math.round((stats.overview.deliveredOrders / stats.overview.totalOrders) * 100) : 0
                }%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-800">{stats.overview.pendingOrders}</p>
          <p className="text-sm text-yellow-600">Pending</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-800">{stats.overview.confirmedOrders}</p>
          <p className="text-sm text-blue-600">Confirmed</p>
        </div>
        <div className="text-center p-3 bg-indigo-50 rounded-lg">
          <p className="text-2xl font-bold text-indigo-800">{stats.overview.processingOrders}</p>
          <p className="text-sm text-indigo-600">Processing</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-800">{stats.overview.shippedOrders}</p>
          <p className="text-sm text-purple-600">Shipped</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-800">{stats.overview.deliveredOrders}</p>
          <p className="text-sm text-green-600">Delivered</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-800">{stats.overview.cancelledOrders}</p>
          <p className="text-sm text-red-600">Cancelled</p>
        </div>
      </div>
    </div>
  );
};

export default OrderStatistics;