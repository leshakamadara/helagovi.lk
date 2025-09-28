import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getStatusColor, getFreshnessColor } from '../../lib/utils';
import api from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { H1, H2, H3, P, Muted, Large } from '../../components/ui/typography';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import LoginModal from '../../components/LoginModal';
import ReviewsSection from '../../components/ReviewsSection';

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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb';

const ProductDetails = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const { user } = useAuth();
  
  console.log('ProductDetails component loaded with productId:', productId);
  console.log('Search params:', Object.fromEntries(searchParams));
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Helper function to safely render multilingual text
  const renderText = (text, defaultValue = '') => {
    if (!text) return defaultValue;
    if (typeof text === 'string') return text;
    if (typeof text === 'object' && text.en) return text.en;
    return defaultValue;
  };

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
      setError(null);
      
      console.log('Fetching product with ID:', productId);
      
      // Validate product ID
      if (!productId || productId === "507f1f77bcf86cd799439011") {
        setError('Invalid product ID');
        setProduct(null);
        return;
      }
      
      // Try to fetch from API
      const response = await api.get(`/products/${productId}`);
      
      console.log('API Response:', response.data);
      
      if (response.data?.success && response.data?.data) {
        console.log('Successfully fetched product from API:', response.data.data);
        setProduct(response.data.data);
      } else {
        console.error('Invalid API response structure:', response.data);
        setError('Invalid product data received');
        setProduct(null);
      }
      
    } catch (err) {
      console.error('Error fetching product:', err);
      
      // More specific error handling
      if (err.response?.status === 404) {
        setError('Product not found');
      } else if (err.response?.status === 400) {
        setError('Invalid product ID');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch product');
      }
      
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (buyNow = false) => {
    if (!user) {
      // Set pending action and show login modal
      setPendingAction(buyNow ? 'buyNow' : 'addToCart');
      setShowLoginModal(true);
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
      if (buyNow) {
        alert('Item added to cart! Redirecting to checkout...');
        // Redirect to cart page after adding
        setTimeout(() => {
          window.location.href = '/cart';
        }, 1000);
      } else {
        alert('Added to cart successfully!');
      }
      setQuantity(1);
    } catch (err) {
      alert(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleLoginSuccess = () => {
    // After successful login, execute the pending action
    if (pendingAction === 'addToCart') {
      handleAddToCart(false);
    } else if (pendingAction === 'buyNow') {
      handleAddToCart(true);
    } else if (pendingAction === 'favorite') {
      handleToggleFavorite();
    }
    // Clear pending action
    setPendingAction(null);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      // Set pending action and show login modal
      setPendingAction('favorite');
      setShowLoginModal(true);
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
      //     'Authorization': `Bearer ${localStorage.getToken()}`
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
          <H2 className="text-gray-900 mb-2">Product Not Found</H2>
          <P className="text-gray-600 mb-4">{error || 'Product data not available'}</P>
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
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Product Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

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
                  src={product.images[selectedImage]?.url || 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg'}
                  alt={product.images[selectedImage]?.alt || 'Product image'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg';
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
                        src={image.url || 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg'}
                        alt={image.alt || 'Product thumbnail'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg';
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
                  <H1>{product.title}</H1>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleToggleFavorite}
                      variant="ghost"
                      size="icon"
                      className={`rounded-full transition-all duration-200 ${
                        isFavorite 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110' 
                          : 'hover:bg-muted hover:scale-110'
                      }`}
                    >
                      <Heart className={`h-5 w-5 transition-all duration-200 ${isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted hover:scale-110 transition-all duration-200">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-2 sm:space-y-0">
                  <div className="space-y-1">
                    <span className="text-4xl font-bold text-primary">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    <span className="text-lg text-muted-foreground">
                      per {product.unit}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={product.status === 'active' ? 'default' : 'secondary'}
                      className={`${product.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''} text-white`}
                    >
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </Badge>
                    {product.isOrganic && (
                      <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                        <Leaf className="h-3 w-3 mr-1" />
                        Organic
                      </Badge>
                    )}
                  </div>
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
                <H3 className="mb-2">Description</H3>
                <P className="text-gray-700 leading-relaxed">{product.description}</P>
              </div>

              {/* Availability */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <H3>Availability</H3>
                    <Muted>
                      {product.availableQuantity} {product.unit} available
                    </Muted>
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

                {/* Purchase Section - Show for all users when product is active and available */}
                {product.status === 'active' && product.availableQuantity > 0 && (
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        variant="outline"
                        size="lg"
                        className="h-12 text-base font-medium border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        {addingToCart ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            Adding...
                          </>
                        ) : (
                          'Add to Cart'
                        )}
                      </Button>
                      <Button
                        onClick={() => handleAddToCart(true)}
                        disabled={addingToCart}
                        size="lg"
                        className="h-12 text-base font-medium bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        {addingToCart ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <ArrowLeft className="h-5 w-5 mr-2 rotate-180" />
                            Buy Now
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Show role-specific messages below buttons */}
                    {user && user.role !== 'buyer' && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <User className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                          Only registered buyers can purchase products.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {!user && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <User className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <span className="font-medium">Ready to purchase?</span> Click "Add to Cart" or "Buy Now" to sign in.
                        </AlertDescription>
                      </Alert>
                    )}
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
                    <span className="ml-2 font-medium">
                      {renderText(product.category.name, 'Category')}
                    </span>
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
          <div className="border-t bg-gray-50 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Farmer Information</h3>
            
            {/* Mobile-first responsive layout */}
            <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Farmer Avatar and Info */}
              <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                    {product.farmer.firstName && product.farmer.lastName 
                      ? `${product.farmer.firstName} ${product.farmer.lastName}`
                      : 'Farmer Profile'
                    }
                  </h4>
                  <div className="mt-2 space-y-2">
                    {product.farmer.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <a 
                          href={`tel:${product.farmer.phone}`} 
                          className="hover:text-green-600 transition-colors truncate"
                        >
                          {product.farmer.phone}
                        </a>
                      </div>
                    )}
                    {product.farmer.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <a 
                          href={`mailto:${product.farmer.email}`} 
                          className="hover:text-green-600 transition-colors truncate"
                        >
                          {product.farmer.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-row sm:flex-col space-x-3 sm:space-x-0 sm:space-y-2 sm:w-auto w-full">
                <Button 
                  className="flex-1 sm:flex-none sm:w-32 text-sm sm:text-base h-9 sm:h-10"
                  size="sm"
                >
                  Contact Farmer
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-none sm:w-32 text-sm sm:text-base h-9 sm:h-10"
                  size="sm"
                >
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ReviewsSection productId={productId} />
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccessCallback={handleLoginSuccess}
        title="Login Required"
        description="Please sign in to add items to your cart or favorites."
      />
    </div>
  );
};

export default ProductDetails;
