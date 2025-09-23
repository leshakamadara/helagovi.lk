import React, { useState } from 'react';
import { ShoppingCart, MapPin, CreditCard, Plus, Minus, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/orderUtils';
import api from '../../lib/axios';

const CreateOrder = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    postalCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Sri Lankan districts
  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  const paymentMethods = [
    { value: 'cash_on_delivery', label: 'Cash on Delivery' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'digital_wallet', label: 'Digital Wallet' }
  ];

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const calculateDeliveryFee = (district) => {
    if (!district) return 0;
    
    const metroDistricts = ['Colombo', 'Gampaha', 'Kalutara'];
    const urbanDistricts = ['Kandy', 'Galle', 'Matara'];
    
    if (metroDistricts.includes(district)) {
      return 200;
    } else if (urbanDistricts.includes(district)) {
      return 300;
    } else {
      return 500;
    }
  };
  
  const deliveryFee = calculateDeliveryFee(deliveryAddress.district);
  const totalAmount = subtotal + deliveryFee;

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({ ...prev, [name]: value }));
  };

  // Mock product data - replace with actual API call
  const mockProducts = [
    { 
      _id: '1', 
      title: 'Organic Tomatoes', 
      price: 250, 
      unit: 'kg', 
      availableQuantity: 10,
      images: [{ url: 'https://images.unsplash.com/photo-1546470427-227e8e7dfde8?w=100&h=100&fit=crop' }]
    },
    { 
      _id: '2', 
      title: 'Fresh Carrots', 
      price: 200, 
      unit: 'kg', 
      availableQuantity: 8,
      images: [{ url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=100&h=100&fit=crop' }]
    }
  ];

  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.availableQuantity) {
        alert(`Only ${product.availableQuantity} ${product.unit} available`);
        return;
      }
      
      setCart(cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        _id: product._id,
        title: product.title,
        price: product.price,
        unit: product.unit,
        quantity: 1,
        availableQuantity: product.availableQuantity,
        image: product.images[0]?.url
      }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const product = cart.find(item => item._id === productId);
    if (newQuantity > product.availableQuantity) {
      alert(`Only ${product.availableQuantity} ${product.unit} available`);
      return;
    }
    
    setCart(cart.map(item =>
      item._id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const validateForm = () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return false;
    }
    
    if (!deliveryAddress.addressLine1 || !deliveryAddress.city || !deliveryAddress.district) {
      alert('Please complete your delivery address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setSubmitStatus(null);

    try {
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity
        })),
        deliveryAddress,
        paymentMethod,
        deliveryInstructions
      };

      const response = await api.post('/orders', orderData);
      
      setSubmitStatus({ 
        type: 'success', 
        message: response.data.message || 'Order placed successfully!' 
      });
      
      // Clear cart and form after successful submission
      setTimeout(() => {
        setCart([]);
        setDeliveryAddress({
          addressLine1: '',
          addressLine2: '',
          city: '',
          district: '',
          postalCode: ''
        });
        setDeliveryInstructions('');
        setSubmitStatus(null);
      }, 3000);

    } catch (error) {
      console.error('Order creation error:', error);
      
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = 'Please fix the validation errors and try again.';
      }
      
      setSubmitStatus({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Checkout
            </h1>
            <p className="text-blue-100 mt-1">Review your order and complete purchase</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Messages */}
            {submitStatus && (
              <div className={`p-4 rounded-md flex items-center gap-3 ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {submitStatus.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                {submitStatus.message}
              </div>
            )}

            {/* Product Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Available Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockProducts.map(product => (
                  <div key={product._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.images[0]?.url} 
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium">{product.title}</h3>
                        <p className="text-sm text-gray-600">{formatCurrency(product.price)}/{product.unit}</p>
                        <p className="text-xs text-gray-500">{product.availableQuantity} available</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              
              {cart.length === 0 ? (
                <p className="text-gray-500">Your cart is empty</p>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-gray-600">{formatCurrency(item.price)}/{item.unit}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <span className="w-8 text-center">{item.quantity}</span>
                        
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={item.quantity >= item.availableQuantity}
                          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="p-1 rounded-full hover:bg-red-100 text-red-600 ml-2"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Address */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={deliveryAddress.addressLine1}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street address, P.O. box"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={deliveryAddress.addressLine2}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Apartment, suite, unit, building, floor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={deliveryAddress.city}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District *
                  </label>
                  <select
                    name="district"
                    value={deliveryAddress.district}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select district</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={deliveryAddress.postalCode}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Postal code"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map(method => (
                  <label key={method.value} className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-blue-500">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Delivery Instructions */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Delivery Instructions
              </h2>

              <textarea
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Special delivery instructions, gate codes, etc."
              />
            </div>

            {/* Order Total */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">{formatCurrency(deliveryFee)}</span>
              </div>
              
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total</span>
                <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <button
                onClick={handleSubmit}
                disabled={loading || cart.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Place Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;