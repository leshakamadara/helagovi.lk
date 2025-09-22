
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Package} from 'lucide-react';

const FarmerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch('/api/products/stats/overview', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Fetch recent products
      const productsResponse = await fetch('/api/products/my/products?limit=5', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Mock data for demo
      setStats({
        overview: {
          totalProducts: 24,
          activeProducts: 18,
          soldProducts: 6,
          totalRevenue: 85500,
          averagePrice: 425
        }
      });
      
      setRecentProducts([
        {
          _id: '1',
          title: 'Fresh Organic Tomatoes',
          price: 450,
          unit: 'kg',
          availableQuantity: 65,
          status: 'active',
          images: [{ url: 'https://images.unsplash.com/photo-1546470427-227e8e7dfde8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' }],
          soldPercentage: 35
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center">
            <Plus className="h-5 w-5 mr-2" />Add Product
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.overview.totalProducts}</p>
              </div>
              <Package className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">Rs. {stats.overview.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">💰</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.overview.activeProducts}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">✅</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sold Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.overview.soldProducts}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">📦</div>
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Products</h2>
          <div className="space-y-4">
            {recentProducts.map((product) => (
              <div key={product._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <img src={product.images[0]?.url} alt={product.title} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{product.title}</h3>
                  <p className="text-sm text-gray-600">Rs. {product.price.toLocaleString()}/{product.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{product.availableQuantity} {product.unit} left</p>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${product.soldPercentage}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default FarmerDashboard;
