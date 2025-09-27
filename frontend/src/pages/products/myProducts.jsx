import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { Button } from '../../components/ui/button';
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


  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      console.log('Response data type:', typeof response.data);
      console.log('Response data structure:', Object.keys(response.data || {}));
      
      if (response.data?.success && Array.isArray(response.data?.data)) {
        setProducts(response.data.data);
        console.log(`Successfully loaded ${response.data.data.length} products from API`);
      } else {
        console.error('Invalid response format. Expected: { success: true, data: [] }');
        console.error('Actual response:', response.data);
        throw new Error(`Invalid response format from API. Got: ${JSON.stringify(response.data)}`);
      }
      
    } catch (err) {
      console.error('Error fetching products:', err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch products';
      setError(errorMessage);
      setProducts([]);
      
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
          <Button asChild>
            <Link to="/create-product">
              Add Product
            </Link>
          </Button>
        </div>

        {/* Banner Image */}
        <div className="mb-6 relative overflow-hidden rounded-lg shadow-lg">
          <img 
            src="https://res.cloudinary.com/dckoipgrs/image/upload/v1758904379/Gemini_Generated_Image_e1mjze1mjze1mjze_fmldic.jpg"
            alt="Fresh farm products banner"
            className="w-full h-48 md:h-56 lg:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <H2 className="text-white mb-0 pb-0 border-b-0">Manage Your Products</H2>
              <P className="text-white/90 mt-1">Track sales, update listings, and grow your farm business</P>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-start">
              <div>
                <strong>API Error:</strong> {error}
              </div>
              <Button 
                onClick={fetchMyProducts}
                variant="destructive"
                size="sm"
                className="ml-4"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Status Message */}
        {!error && products.length > 0 && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <strong> Success!</strong> Loaded {products.length} products from the database.
          </div>
        )}

        {/* No Products Message */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🌾</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-6">Start building your agricultural marketplace by adding your first product.</p>
              <Button asChild size="lg">
                <Link to="/create-product">
                  Create Your First Product
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const soldPercentage = product.initialQuantity > 0 
                ? Math.round(((product.initialQuantity - product.availableQuantity) / product.initialQuantity) * 100)
                : 0;
              
              return (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={product.title}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
                    }}
                  />
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {getDisplayText(product.title, 'Product')}
                      </h3>
                      {product.isOrganic && (
                        <span className="text-green-600 text-xs">🌱</span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-xs mb-2">
                      {getDisplayText(product.category?.name, 'No Category')}
                    </p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-green-600">
                        Rs. {(product.price || 0).toLocaleString()}/{product.unit || 'unit'}
                      </span>
                      <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : product.status === 'sold'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status || 'unknown'}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Stock: {product.availableQuantity || 0}/{product.initialQuantity || 0}</span>
                        <span>{soldPercentage}% sold</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all ${
                            soldPercentage >= 80 ? 'bg-red-500' : 
                            soldPercentage >= 50 ? 'bg-yellow-500' : 
                            'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(soldPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                      >
                        <Link to={`/edit-product?id=${product._id}`}>
                          Edit
                        </Link>
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product._id, product.title)}
                        className="flex-1 text-xs"
                      >
                        Delete
                      </Button>
                    </div>
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
            <Button asChild>
              <Link to="/create-product">
                Add Another Product
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;