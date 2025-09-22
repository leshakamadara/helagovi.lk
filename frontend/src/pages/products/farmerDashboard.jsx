
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Package, TrendingUp, DollarSign, CheckCircle, AlertCircle, Eye, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/axios";
import { Button } from '../../components/ui/button';

const FarmerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch stats and recent products in parallel
      const [statsResponse, productsResponse] = await Promise.all([
        api.get('/products/stats/overview'),
        api.get('/products/my/products?limit=5&sortBy=createdAt&sortOrder=desc')
      ]);
      
      setStats(statsResponse.data.data);
      setRecentProducts(productsResponse.data.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    navigate('/create-product');
  };

  const handleViewAllProducts = () => {
    navigate('/my-products');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={fetchDashboardData}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
              <p className="text-green-100 mt-2">
                Welcome back, {user?.name || 'Farmer'}! Manage your products and track your sales
              </p>
            </div>
            <button
              onClick={handleAddProduct}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
              </div>
              <Package className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.activeProducts || 0}</p>
              </div>
              <ShoppingBag className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sold Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.soldProducts || 0}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">Rs. {(stats?.totalRevenue || 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-12 w-12 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Products</h2>
              <button
                onClick={handleViewAllProducts}
                className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
              >
                View All <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-500 mb-6">Start by adding your first product to the marketplace</p>
                <button
                  onClick={handleAddProduct}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Product
                </button>
              </div>
            ) : (
              recentProducts.map((product) => (
                <div key={product._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        <img
                          src={product.images?.[0]?.url || 'https://via.placeholder.com/64?text=No+Image'}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{product.title}</h3>
                        <p className="text-sm text-gray-500">
                          Rs. {product.price.toLocaleString()}/{product.unit} • {product.availableQuantity} {product.unit} available
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                            {product.status?.charAt(0).toUpperCase() + product.status?.slice(1) || 'N/A'}
                          </span>
                          {product.category && (
                            <span className="text-xs text-gray-500">
                              {product.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Created: {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default FarmerDashboard;
