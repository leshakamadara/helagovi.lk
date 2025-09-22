import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchMyProducts();
  }, [filters]);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams(filters).toString();
      
      const response = await fetch(`/api/products/my/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      // Mock data for demo
      setProducts([
        {
          _id: '1',
          title: 'Fresh Organic Tomatoes',
          price: 450,
          unit: 'kg',
          availableQuantity: 65,
          initialQuantity: 100,
          status: 'active',
          category: { name: 'Vegetables' },
          images: [{ url: 'https://images.unsplash.com/photo-1546470427-227e8e7dfde8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' }],
          isOrganic: true,
          soldPercentage: 35,
          createdAt: '2024-01-20T00:00:00.000Z'
        }
      ]);
      setPagination({ currentPage: 1, totalPages: 1, totalProducts: 1 });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete product');
      
      setProducts(prev => prev.filter(p => p._id !== id));
      alert('Product deleted successfully');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center">
            <Plus className="h-5 w-5 mr-2" />Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={product.images[0]?.url}
                alt={product.title}
                className="w-full h-48 object-cover"
                onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Product'}
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{product.title}</h3>
                  {product.isOrganic && <Leaf className="h-4 w-4 text-green-600" />}
                </div>
                <p className="text-gray-600 text-sm mb-3">{product.category.name}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-green-600">Rs. {product.price.toLocaleString()}/{product.unit}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {product.status}
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Stock: {product.availableQuantity}/{product.initialQuantity} {product.unit}</span>
                    <span>{product.soldPercentage}% sold</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${product.soldPercentage}%` }}></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 flex items-center justify-center">
                    <Edit className="h-4 w-4 mr-1" />Edit
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 flex items-center justify-center">
                    <Trash2 className="h-4 w-4 mr-1" />Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyProducts;