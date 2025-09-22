import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Leaf, Star, ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';

// Mock data for demonstration - replace with your API calls
const mockProducts = [
  {
    _id: '1',
    title: 'Fresh Organic Tomatoes',
    price: 250,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=200&fit=crop',
    location: 'Colombo',
    district: 'Western',
    category: 'Vegetables',
    isOrganic: true,
    status: 'available',
    farmer: 'John Silva',
    createdAt: '2024-08-25T10:00:00Z'
  },
  {
    _id: '2',
    title: 'Premium Rice - Samba',
    price: 180,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
    location: 'Anuradhapura',
    district: 'North Central',
    category: 'Grains',
    isOrganic: false,
    status: 'available',
    farmer: 'Nimal Perera',
    createdAt: '2024-08-24T14:30:00Z'
  },
  {
    _id: '3',
    title: 'Sweet Mangoes',
    price: 320,
    image: 'https://images.unsplash.com/photo-1553279768-865429ffa1e1?w=300&h=200&fit=crop',
    location: 'Jaffna',
    district: 'Northern',
    category: 'Fruits',
    isOrganic: true,
    status: 'available',
    farmer: 'Kamala Fernando',
    createdAt: '2024-08-26T09:15:00Z'
  },
  {
    _id: '4',
    title: 'Fresh Coconuts',
    price: 80,
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&h=200&fit=crop',
    location: 'Kurunegala',
    district: 'North Western',
    category: 'Fruits',
    isOrganic: false,
    status: 'sold',
    farmer: 'Sunil Kumar',
    createdAt: '2024-08-23T16:45:00Z'
  },
  {
    _id: '5',
    title: 'Organic Carrots',
    price: 200,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop',
    location: 'Nuwara Eliya',
    district: 'Central',
    category: 'Vegetables',
    isOrganic: true,
    status: 'available',
    farmer: 'Priya Jayasinghe',
    createdAt: '2024-08-27T11:20:00Z'
  },
   {
    _id: '6',
    title: 'Organic Carrots',
    price: 200,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop',
    location: 'Nuwara Eliya',
    district: 'Central',
    category: 'Vegetables',
    isOrganic: true,
    status: 'available',
    farmer: 'Priya Jayasinghe',
    createdAt: '2024-08-27T11:20:00Z'
  },
   {
    _id: '7',
    title: 'Organic Carrots',
    price: 200,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop',
    location: 'Nuwara Eliya',
    district: 'Central',
    category: 'Vegetables',
    isOrganic: true,
    status: 'available',
    farmer: 'Priya Jayasinghe',
    createdAt: '2024-08-27T11:20:00Z'
  },
   {
    _id: '8',
    title: 'Organic Carrots',
    price: 200,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop',
    location: 'Nuwara Eliya',
    district: 'Central',
    category: 'Vegetables',
    isOrganic: true,
    status: 'available',
    farmer: 'Priya Jayasinghe',
    createdAt: '2024-08-27T11:20:00Z'
  },
   {
    _id: '9',
    title: 'Organic Carrots',
    price: 200,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop',
    location: 'Nuwara Eliya',
    district: 'Central',
    category: 'Vegetables',
    isOrganic: true,
    status: 'available',
    farmer: 'Priya Jayasinghe',
    createdAt: '2024-08-27T11:20:00Z'
  },
   {
    _id: '5',
    title: 'Organic Carrots',
    price: 200,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop',
    location: 'Nuwara Eliya',
    district: 'Central',
    category: 'Vegetables',
    isOrganic: true,
    status: 'available',
    farmer: 'Priya Jayasinghe',
    createdAt: '2024-08-27T11:20:00Z'
  },
   {
    _id: '10',
    title: 'Organic Carrots',
    price: 200,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop',
    location: 'Nuwara Eliya',
    district: 'Central',
    category: 'Vegetables',
    isOrganic: true,
    status: 'available',
    farmer: 'Priya Jayasinghe',
    createdAt: '2024-08-27T11:20:00Z'
  }
];

const districts = ['All Districts', 'Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa'];
const categories = ['All Categories', 'Fruits', 'Vegetables', 'Grains', 'Spices', 'Dairy', 'Other'];

const ProductListing = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  // Mock API call - replace with your actual API endpoint
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Replace this with your actual API call:
      // const response = await axios.get('/api/products');
      // setProducts(response.data);
      
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDistrict = selectedDistrict === 'All Districts' || product.district === selectedDistrict;
      const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      const matchesOrganic = !organicOnly || product.isOrganic;

      return matchesSearch && matchesDistrict && matchesCategory && matchesPrice && matchesOrganic;
    });

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchQuery, selectedDistrict, selectedCategory, priceRange, organicOnly, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const ProductCard = ({ product, isListView = false }) => (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ${
      isListView ? 'flex gap-4 p-4' : 'overflow-hidden'
    }`}>
      <div className={`${isListView ? 'w-32 h-24 flex-shrink-0' : 'h-48'} relative`}>
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        {product.isOrganic && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Leaf size={12} />
            Organic
          </div>
        )}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
          product.status === 'available' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {product.status}
        </div>
      </div>
      
      <div className={`${isListView ? 'flex-1' : 'p-4'}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.title}</h3>
        <p className="text-2xl font-bold text-green-600 mb-2">Rs. {product.price}</p>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPin size={16} />
          <span>{product.location}, {product.district}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">by {product.farmer}</span>
          <span className="text-xs text-gray-400">
            {new Date(product.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        {isListView && (
          <div className="mt-3 flex gap-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              View Details
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
              Contact Farmer
            </button>
          </div>
        )}
      </div>
      
      {!isListView && (
        <div className="px-4 pb-4 flex gap-2">
          <button className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors">
            View Details
          </button>
          <button className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors">
            Contact
          </button>
        </div>
      )}
    </div>
  );

  const Pagination = () => (
    <div className="flex items-center justify-between mt-8">
      <div className="text-sm text-gray-700">
        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronLeft size={16} />
        </button>
        
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-2 rounded border ${
              currentPage === i + 1
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {i + 1}
          </button>
        ))}
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Fresh Products</h1>
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products, farmers, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Filter size={20} />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* District Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (Rs. {priceRange.min} - Rs. {priceRange.max})
                  </label>
                  <div className="space-y-3">
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500">Min: Rs. {priceRange.min}</div>
                    </div>
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500">Max: Rs. {priceRange.max}</div>
                    </div>
                  </div>
                </div>

                {/* Organic Toggle */}
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={organicOnly}
                      onChange={(e) => setOrganicOnly(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div className="flex items-center gap-1">
                      <Leaf size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Organic Only</span>
                    </div>
                  </label>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-600">
                {filteredProducts.length} products found
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDistrict('All Districts');
                    setSelectedCategory('All Categories');
                    setPriceRange({ min: 0, max: 1000 });
                    setOrganicOnly(false);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Products Display */}
            {!loading && filteredProducts.length > 0 && (
              <>
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }>
                  {currentProducts.map(product => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      isListView={viewMode === 'list'}
                    />
                  ))}
                </div>
                
                {totalPages > 1 && <Pagination />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;