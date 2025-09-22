import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getStatusColor, getFreshnessColor } from '../../lib/utils';
import { Button } from '../../components/ui/button';

import { 
  MapPin, 
  Calendar, 
  Package, 
  Star, 
  Leaf, 
  Phone, 
  Mail, 
  User,
  ArrowLeft,
  Heart,
  Share2,
  Clock,
  ShoppingCart,
  Plus,
  Minus
} from 'lucide-react';

const ProductDetails = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id') || "507f1f77bcf86cd799439011";
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // API integration function
  const apiCall = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      throw new Error(err.message || 'API request failed');
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data.data);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock data');
      }
      
      // Mock product data if API fails
      const mockProduct = {
        _id: productId,
        title: "Fresh Organic Tomatoes",
        description: "Premium quality organic tomatoes grown without pesticides. Perfect for salads, cooking, and fresh consumption. Harvested at peak ripeness.",
        price: 450,
        unit: "kg",
        images: [
          { url: "https://images.unsplash.com/photo-1546470427-227e8e7dfde8?auto=format&fit=crop&w=500&q=80", alt: "Fresh Organic Tomatoes - Main", isPrimary: true },
          { url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=80", alt: "Tomatoes Close-up", isPrimary: false },
          { url: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=500&q=80", alt: "Tomato Farm", isPrimary: false }
        ],
        district: "Kandy",
        city: "Peradeniya",
        category: { _id: "cat1", name: "Vegetables" },
        qualityScore: 5,
        isOrganic: true,
        harvestDate: "2024-01-15T00:00:00.000Z",
        initialQuantity: 100,
        availableQuantity: 65,
        status: "active",
        farmer: {
          _id: "farmer1",
          firstName: "Sunil",
          lastName: "Perera",
          email: "sunil@example.com",
          phone: "+94 77 123 4567"
        },
        freshnessDays: 5,
        soldPercentage: 35,
        createdAt: "2024-01-15T00:00:00.000Z"
      };
      
      setProduct(mockProduct);
    } catch (err) {
      setError(err.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please log in to add items to cart');
      return;
    }
    
    if (user.role !== 'buyer') {
      alert('Only buyers can add items to cart');
      return;
    }
    
    try {
      setAddingToCart(true);
      
      // TODO: Implement cart API
      // await apiCall('/api/cart/add', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({
      //     productId: product._id,
      //     quantity: quantity
      //   })
      // });
      
      // Mock success
      alert('Added to cart successfully!');
      setQuantity(1);
    } catch (err) {
      alert(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Please log in to add favorites');
      return;
    }
    
    if (user.role !== 'buyer') {
      alert('Only buyers can add favorites');
      return;
    }
    
    try {
      // TODO: Implement favorites API
      // const method = isFavorite ? 'DELETE' : 'POST';
      // await apiCall(`/api/favorites/${product._id}`, {
      //   method,
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      
      setIsFavorite(!isFavorite);
      alert(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (err) {
      alert(err.message || 'Failed to update favorites');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      sold: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
      draft: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getFreshnessColor = (days) => {
    if (days <= 3) return 'text-green-600';
    if (days <= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={product.images[selectedImage]?.url}
                  alt={product.images[selectedImage]?.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400?text=Product+Image';
                  }}
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-green-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100x100?text=Image';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleToggleFavorite}
                      className={`p-2 rounded-full transition-colors ${
                        isFavorite ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <Button variant="ghost" size="sm" className="p-2 rounded-full">
                      <Share2 className="h-5 w-5 text-gray-600" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-3xl font-bold text-green-600">
                    Rs. {product.price.toLocaleString()}/{product.unit}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(product.status)}`}>
                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {product.isOrganic && (
                    <div className="flex items-center">
                      <Leaf className="h-4 w-4 text-green-600 mr-1" />
                      <span>Organic</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>Quality: {product.qualityScore}/5</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className={`h-4 w-4 mr-1 ${getFreshnessColor(product.freshnessDays)}`} />
                    <span className={getFreshnessColor(product.freshnessDays)}>
                      {product.freshnessDays} days since harvest
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Availability */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
                    <p className="text-sm text-gray-600">
                      {product.availableQuantity} {product.unit} available
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {product.soldPercentage}% sold
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${product.soldPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Purchase Section */}
                {product.status === 'active' && product.availableQuantity > 0 && user && user.role === 'buyer' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity ({product.unit})
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="p-2 hover:bg-gray-100 transition-colors"
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={product.availableQuantity}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Math.min(product.availableQuantity, Number(e.target.value))))}
                            className="w-16 border-0 text-center focus:outline-none focus:ring-0"
                          />
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.min(product.availableQuantity, quantity + 1))}
                            className="p-2 hover:bg-gray-100 transition-colors"
                            disabled={quantity >= product.availableQuantity}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">Total Price</div>
                        <div className="text-2xl font-bold text-green-600">
                          Rs. {(product.price * quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        {addingToCart ? 'Adding...' : 'Add to Cart'}
                      </button>
                      <button
                        onClick={() => {
                          handleAddToCart();
                          // Redirect to cart page after adding
                          setTimeout(() => {
                            window.location.href = '/cart';
                          }, 1000);
                        }}
                        disabled={addingToCart}
                        className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Show message for non-buyers */}
                {user && user.role !== 'buyer' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">Only registered buyers can purchase products.</p>
                  </div>
                )}
                
                {/* Show login message for non-authenticated users */}
                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      Please <a href="/login" className="underline font-medium">log in</a> as a buyer to purchase this product.
                    </p>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">Harvested:</span>
                    <span className="ml-2 font-medium">{formatDate(product.harvestDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <Package className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium">{product.category.name}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2 font-medium">{product.city}, {product.district}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Farmer Information */}
          <div className="border-t bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Farmer Information</h3>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">{product.farmer.firstName} {product.farmer.lastName}</h4>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <a href={`tel:${product.farmer.phone}`} className="hover:text-green-600 transition-colors">
                      {product.farmer.phone}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <a href={`mailto:${product.farmer.email}`} className="hover:text-green-600 transition-colors">
                      {product.farmer.email}
                    </a>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Button className="w-full">
                  Contact Farmer
                </Button>
                <Button variant="outline" className="w-full">
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
