import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../../lib/axios';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb';
import { H1, H2, H3, P, Muted, Large } from '../../components/ui/typography';

// Utility function to handle multilingual text
const getDisplayText = (text, fallback = 'N/A') => {
  if (!text) return fallback;
  if (typeof text === 'string') return text;
  if (typeof text === 'object') {
    return text.en || text.si || fallback;
  }
  return fallback;
};

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMockData, setShowMockData] = useState(false);

  // Mock data as fallback
  const mockProducts = [
    {
      _id: 'mock-1',
      title: 'Fresh Organic Tomatoes (Demo)',
      price: 450,
      unit: 'kg',
      availableQuantity: 65,
      initialQuantity: 100,
      status: 'active',
      category: { name: 'Vegetables' },
      images: [{ url: 'https://images.unsplash.com/photo-1546470427-227e8e7dfde8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }],
      isOrganic: true
    },
    {
      _id: 'mock-2',
      title: 'Fresh Carrots (Demo)',
      price: 200,
      unit: 'kg',
      availableQuantity: 30,
      initialQuantity: 50,
      status: 'active',
      category: { name: 'Vegetables' },
      images: [{ url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }],
      isOrganic: false
    }
  ];

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setShowMockData(false);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login first.');
      }
      
      console.log('Fetching products from API...');
      const response = await api.get('/products/my/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data?.success && Array.isArray(response.data?.data)) {
        setProducts(response.data.data);
        console.log(`Successfully loaded ${response.data.data.length} products from API`);
      } else {
        throw new Error('Invalid response format from API');
      }
      
    } catch (err) {
      console.error('Error fetching products:', err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch products';
      setError(errorMessage);
      
      // Show mock data as fallback
      setProducts(mockProducts);
      setShowMockData(true);
      console.log('Using mock data due to API error');
      
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, productTitle) => {
    // Handle multilingual titles
    const displayTitle = getDisplayText(productTitle, 'this product');
      
    if (!window.confirm(`Are you sure you want to delete "${displayTitle}"?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login first');
        return;
      }
      
      console.log(`Deleting product ${productId}...`);
      await api.delete(`/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove from local state
      setProducts(prev => prev.filter(p => p._id !== productId));
      console.log(`Product ${displayTitle} deleted successfully`);
      
    } catch (err) {
      console.error('Error deleting product:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete product';
      alert(`Error: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your products...</p>
          <p className="mt-2 text-sm text-gray-500">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <BreadcrumbPage>My Products</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <H1 className="text-gray-900">My Products</H1>
          <Link 
            to="/create-product" 
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-start">
              <div>
                <strong>API Error:</strong> {error}
                {showMockData && <div className="mt-1 text-sm">Showing demo data below.</div>}
              </div>
              <button 
                onClick={fetchMyProducts}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 ml-4"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Status Message */}
        {!error && products.length > 0 && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <strong>✅ Success!</strong> Loaded {products.length} products from the database.
          </div>
        )}

        {showMockData && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
            <strong>ℹ️ Demo Mode:</strong> Showing sample data. Start the backend server to see your real products.
          </div>
        )}

        {/* No Products Message */}
        {!loading && products.length === 0 && !showMockData && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🌾</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-6">Start building your agricultural marketplace by adding your first product.</p>
              <Link 
                to="/create-product" 
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 inline-flex items-center text-lg"
              >
                <Plus className="h-6 w-6 mr-2" />
                Create Your First Product
              </Link>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const soldPercentage = product.initialQuantity > 0 
                ? Math.round(((product.initialQuantity - product.availableQuantity) / product.initialQuantity) * 100)
                : 0;
              
              return (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
                    }}
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {getDisplayText(product.title, 'Product')}
                      </h3>
                      {product.isOrganic && (
                        <span className="text-green-600 text-sm">🌱 Organic</span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      {getDisplayText(product.category?.name, 'No Category')}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-green-600">
                        Rs. {(product.price || 0).toLocaleString()}/{product.unit || 'unit'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : product.status === 'sold'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status || 'unknown'}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Stock: {product.availableQuantity || 0}/{product.initialQuantity || 0} {product.unit}</span>
                        <span>{soldPercentage}% sold</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            soldPercentage >= 80 ? 'bg-red-500' : 
                            soldPercentage >= 50 ? 'bg-yellow-500' : 
                            'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(soldPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link 
                        to={`/edit-product?id=${product._id}`}
                        className="flex-1 text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors text-sm"
                      >
                        ✏️ Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(product._id, product.title)} 
                        className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors text-sm"
                        disabled={showMockData}
                        title={showMockData ? "Demo data - Start backend to enable" : "Delete product"}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                    
                    {showMockData && (
                      <div className="mt-2 text-xs text-blue-600 text-center">
                        Demo data - Start backend to enable editing
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add More Products Section */}
        {products.length > 0 && (
          <div className="text-center mt-12 p-8 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to expand your offerings?</h3>
            <p className="text-gray-600 mb-4">Add more products to reach more customers</p>
            <Link 
              to="/create-product" 
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Another Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;