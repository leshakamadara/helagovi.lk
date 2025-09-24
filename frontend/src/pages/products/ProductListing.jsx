import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Leaf, Star, ChevronLeft, ChevronRight, Grid, List, Heart, ShoppingCart, Truck } from 'lucide-react';
import api from '../../lib/axios';

// shadcn/ui imports
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Slider } from '../../components/ui/slider';
import { Checkbox } from '../../components/ui/checkbox';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb';

const districts = ['All Districts', 'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'];

const ProductListing = () => {
  const navigate = useNavigate();
  
  // State management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 12;

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      const categoriesData = response.data.categories || [];
      
      // Flatten categories for dropdown
      const flatCategories = [];
      const flattenCategories = (cats, level = 0) => {
        cats.forEach(cat => {
          flatCategories.push({
            _id: cat._id,
            name: cat.name.en,
            level
          });
          if (cat.children && cat.children.length > 0) {
            flattenCategories(cat.children, level + 1);
          }
        });
      };
      
      flattenCategories(categoriesData);
      setCategories([{ _id: 'all', name: 'All Categories', level: 0 }, ...flatCategories]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortBy === 'newest' ? 'createdAt' : sortBy.replace('-', ''),
        sortOrder: sortBy.includes('asc') ? 'asc' : 'desc'
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedDistrict !== 'All Districts') params.append('district', selectedDistrict);
      if (selectedCategory !== 'All Categories') {
        const categoryId = categories.find(cat => cat.name === selectedCategory)?._id;
        if (categoryId && categoryId !== 'all') params.append('category', categoryId);
      }
      if (priceRange.min > 0) params.append('minPrice', priceRange.min);
      if (priceRange.max < 1000) params.append('maxPrice', priceRange.max);
      if (organicOnly) params.append('isOrganic', 'true');
      
      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.data || []);
      setTotalProducts(response.data.pagination?.totalProducts || 0);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Use mock data as fallback when API fails
      const mockProducts = [
        {
          _id: 'mock-1',
          title: 'Fresh Organic Tomatoes',
          price: 450,
          unit: 'kg',
          availableQuantity: 65,
          initialQuantity: 100,
          status: 'active',
          category: { name: 'Vegetables' },
          district: 'Kandy',
          city: 'Peradeniya',
          farmer: { firstName: 'Sunil', lastName: 'Perera' },
          qualityScore: 5,
          isOrganic: true,
          images: [{ url: 'https://images.unsplash.com/photo-1546470427-227e8e7dfde8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', isPrimary: true }]
        },
        {
          _id: 'mock-2',
          title: 'Fresh Carrots',
          price: 200,
          unit: 'kg',
          availableQuantity: 30,
          initialQuantity: 50,
          status: 'active',
          category: { name: 'Vegetables' },
          district: 'Colombo',
          city: 'Maharagama',
          farmer: { firstName: 'Kamala', lastName: 'Silva' },
          qualityScore: 4,
          isOrganic: false,
          images: [{ url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', isPrimary: true }]
        },
        {
          _id: 'mock-3',
          title: 'Organic Potatoes',
          price: 180,
          unit: 'kg',
          availableQuantity: 85,
          initialQuantity: 120,
          status: 'active',
          category: { name: 'Vegetables' },
          district: 'Badulla',
          city: 'Bandarawela',
          farmer: { firstName: 'Nimal', lastName: 'Fernando' },
          qualityScore: 4.5,
          isOrganic: true,
          images: [{ url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', isPrimary: true }]
        },
        {
          _id: 'mock-4',
          title: 'Fresh Cabbage',
          price: 120,
          unit: 'kg',
          availableQuantity: 40,
          initialQuantity: 60,
          status: 'active',
          category: { name: 'Vegetables' },
          district: 'Nuwara Eliya',
          city: 'Nuwara Eliya',
          farmer: { firstName: 'Priya', lastName: 'Jayasuriya' },
          qualityScore: 4,
          isOrganic: false,
          images: [{ url: 'https://images.unsplash.com/photo-1594282486369-38a8b552c83b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', isPrimary: true }]
        },
        {
          _id: 'mock-5',
          title: 'Organic Cucumber',
          price: 250,
          unit: 'kg',
          availableQuantity: 25,
          initialQuantity: 40,
          status: 'active',
          category: { name: 'Vegetables' },
          district: 'Galle',
          city: 'Hikkaduwa',
          farmer: { firstName: 'Ajith', lastName: 'Perera' },
          qualityScore: 5,
          isOrganic: true,
          images: [{ url: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', isPrimary: true }]
        },
        {
          _id: 'mock-6',
          title: 'Fresh Bell Peppers',
          price: 350,
          unit: 'kg',
          availableQuantity: 15,
          initialQuantity: 30,
          status: 'active',
          category: { name: 'Vegetables' },
          district: 'Matale',
          city: 'Dambulla',
          farmer: { firstName: 'Saman', lastName: 'Wickramasinghe' },
          qualityScore: 4.5,
          isOrganic: false,
          images: [{ url: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', isPrimary: true }]
        }
      ];
      
      setProducts(mockProducts);
      setTotalProducts(mockProducts.length);
      
      console.log('Using mock products data due to API failure');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedDistrict, selectedCategory, priceRange, organicOnly, sortBy, categories]);

  // Load categories and initial products
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchProducts();
    }
  }, [fetchProducts, categories]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDistrict, selectedCategory, priceRange, organicOnly, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const handleProductClick = (productId) => {
    navigate(`/product-details?id=${productId}`);
  };

  const ProductCard = ({ product, isListView = false }) => {
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    const imageUrl = primaryImage?.url || 'https://images.unsplash.com/photo-1546470427-227e8e7dfde8?w=400&h=300&fit=crop';
    
    return (
      <Card 
        className={`group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${
          isListView ? 'flex gap-6' : ''
        }`}
        onClick={() => handleProductClick(product._id)}
      >
        {/* Image Container */}
        <div className={`${isListView ? 'w-32 h-24 flex-shrink-0' : 'h-48'} relative overflow-hidden`}>
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant={product.status === 'active' && product.availableQuantity > 0 ? "default" : "destructive"} className="text-xs">
              {product.status === 'active' && product.availableQuantity > 0 ? 'Available' : 'Sold Out'}
            </Badge>
          </div>

          {/* Organic Badge */}
          {product.isOrganic && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                <Leaf className="w-3 h-3 mr-1" />
                Organic
              </Badge>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className={`${isListView ? 'flex-1 p-4' : 'p-4'} flex flex-col justify-between`}>
          {/* Product Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{product.title}</h3>
            
            {/* Price */}
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-primary">Rs. {product.price?.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">/{product.unit}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{product.city}, {product.district}</span>
            </div>

            {/* Quantity Available */}
            {product.availableQuantity > 0 && (
              <div className="text-xs text-muted-foreground">
                {product.availableQuantity} {product.unit} available
              </div>
            )}
          </div>
          
          {/* Seller Info & Rating */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-muted text-xs">
                  {(product.farmer?.name || product.farmer?.firstName || 'F')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground font-medium">
                {product.farmer?.name || `${product.farmer?.firstName} ${product.farmer?.lastName}` || 'Farmer'}
              </span>
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-muted-foreground">
                {product.qualityScore || 4}.0
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const Pagination = () => (
    <Card className="mt-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalProducts)}</span> of{' '}
            <span className="font-semibold">{totalProducts}</span> results
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            
            <div className="flex items-center gap-1 mx-4">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="w-10 h-10"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Fresh from Farm to Table
            </h1>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Discover premium quality agricultural products directly from local farmers across Sri Lanka
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" size={20} />
                <Input
                  type="text"
                  placeholder="Search for fresh vegetables, fruits, grains..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 text-lg shadow-lg border-0 focus-visible:ring-2 focus-visible:ring-primary/50 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats & Navigation */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-4">
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                {totalProducts} Fresh Products
              </span>
              <span className="flex items-center gap-2">
                <Truck size={16} />
                Island-wide Delivery
              </span>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">View:</span>
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="p-2 h-8 w-8"
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="p-2 h-8 w-8"
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Products</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Filters Sidebar */}
          <div className="lg:w-80">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Filter size={20} className="text-emerald-600" />
                    Filters
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Filter size={20} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* District Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-600" />
                    Location
                  </label>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map(district => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Leaf size={16} className="text-emerald-600" />
                    Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category._id} value={category.name}>
                          {'  '.repeat(category.level)}{category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Price Range */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold">Price Range</label>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Rs. {priceRange.min}</span>
                      <span>Rs. {priceRange.max}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Minimum</label>
                        <Slider
                          value={[priceRange.min]}
                          onValueChange={([value]) => setPriceRange(prev => ({ ...prev, min: value }))}
                          max={1000}
                          min={0}
                          step={50}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Maximum</label>
                        <Slider
                          value={[priceRange.max]}
                          onValueChange={([value]) => setPriceRange(prev => ({ ...prev, max: value }))}
                          max={1000}
                          min={0}
                          step={50}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Organic Toggle */}
                <div className="flex items-center space-x-3 bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <Checkbox
                    id="organic"
                    checked={organicOnly}
                    onCheckedChange={setOrganicOnly}
                  />
                  <label htmlFor="organic" className="flex items-center gap-2 cursor-pointer text-sm font-medium text-primary">
                    <Leaf className="w-4 h-4" />
                    Organic Products Only
                  </label>
                </div>

                <Separator />

                {/* Sort Options */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sorting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDistrict('All Districts');
                    setSelectedCategory('All Categories');
                    setPriceRange({ min: 0, max: 1000 });
                    setOrganicOnly(false);
                    setSortBy('newest');
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Summary */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{totalProducts}</span> fresh products found
                  {searchQuery && (
                    <span className="ml-2 text-sm">
                      for "<span className="font-medium text-primary">{searchQuery}</span>"
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
              <Card className="p-20">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading fresh products...</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <Card className="p-20">
                <div className="text-center">
                  <div className="text-muted-foreground mb-6">
                    <Search size={64} className="mx-auto text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDistrict('All Districts');
                      setSelectedCategory('All Categories');
                      setPriceRange({ min: 0, max: 1000 });
                      setOrganicOnly(false);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </Card>
            )}

            {/* Products Display */}
            {!loading && products.length > 0 && (
              <>
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'space-y-4'
                }>
                  {products.map(product => (
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