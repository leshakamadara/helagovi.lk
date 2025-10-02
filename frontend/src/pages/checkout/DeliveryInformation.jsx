import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { MapPin, Truck, Clock, CreditCard, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { H1, H2, H3, P, Muted } from '../../components/ui/typography';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb';

const districts = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
];

const DeliveryInformation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { items, subtotal, shipping, total, itemCount } = useCart();
  
  // Check if coming from direct buy now or cart checkout
  const { product: directProduct, quantity: directQuantity } = location.state || {};
  
  // Determine what we're checking out
  const checkoutItems = directProduct 
    ? [{ product: directProduct, quantity: directQuantity }]
    : items;
  
  const checkoutSubtotal = directProduct 
    ? directProduct.price * directQuantity
    : subtotal;
  
  const checkoutTotal = checkoutSubtotal + shipping;

  const [deliveryInfo, setDeliveryInfo] = useState({
    // Personal Info
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    
    // Delivery Address
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    postalCode: '',
    
    // Delivery Options
    deliveryMethod: 'standard', // standard, express, pickup
    deliveryInstructions: '',
    
    // Billing
    billingAddressSame: true,
    billingAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      district: '',
      postalCode: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect if no items to checkout
  useEffect(() => {
    if (!directProduct && (!items || items.length === 0)) {
      navigate('/cart');
    }
  }, [directProduct, items, navigate]);

  const deliveryMethods = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: '3-5 business days',
      price: 200,
      icon: Truck
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: '1-2 business days',
      price: 500,
      icon: Clock
    },
    {
      id: 'pickup',
      name: 'Pickup Point',
      description: 'Collect from nearest center',
      price: 0,
      icon: MapPin
    }
  ];

  const handleInputChange = (field, value) => {
    setDeliveryInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleBillingAddressChange = (field, value) => {
    setDeliveryInfo(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!deliveryInfo.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!deliveryInfo.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!deliveryInfo.email?.trim()) newErrors.email = 'Email is required';
    if (!deliveryInfo.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!deliveryInfo.addressLine1?.trim()) newErrors.addressLine1 = 'Address is required';
    if (!deliveryInfo.city?.trim()) newErrors.city = 'City is required';
    if (!deliveryInfo.district) newErrors.district = 'District is required';
    if (!deliveryInfo.postalCode?.trim()) newErrors.postalCode = 'Postal code is required';

    // Email validation
    if (deliveryInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (deliveryInfo.phone && !/^[0-9+\-\s()]{10,}$/.test(deliveryInfo.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Postal code validation
    if (deliveryInfo.postalCode && !/^[0-9]{5}$/.test(deliveryInfo.postalCode)) {
      newErrors.postalCode = 'Postal code must be 5 digits';
    }

    // Billing address validation if different
    if (!deliveryInfo.billingAddressSame) {
      if (!deliveryInfo.billingAddress.addressLine1?.trim()) {
        newErrors.billingAddressLine1 = 'Billing address is required';
      }
      if (!deliveryInfo.billingAddress.city?.trim()) {
        newErrors.billingCity = 'Billing city is required';
      }
      if (!deliveryInfo.billingAddress.district) {
        newErrors.billingDistrict = 'Billing district is required';
      }
      if (!deliveryInfo.billingAddress.postalCode?.trim()) {
        newErrors.billingPostalCode = 'Billing postal code is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Calculate final totals with selected delivery method
      const selectedDelivery = deliveryMethods.find(m => m.id === deliveryInfo.deliveryMethod);
      const finalShipping = selectedDelivery.price;
      const finalTotal = checkoutSubtotal + finalShipping;

      // Prepare order data
      const orderData = {
        items: checkoutItems.map(item => ({
          productId: item.product._id,
          productTitle: item.product.title,
          quantity: item.quantity,
          price: item.product.price,
          farmerId: item.product.farmer._id,
          farmerName: `${item.product.farmer.firstName || ''} ${item.product.farmer.lastName || ''}`.trim()
        })),
        deliveryInfo,
        totals: {
          subtotal: checkoutSubtotal,
          shipping: finalShipping,
          total: finalTotal
        },
        paymentMethod: 'pending', // Will be selected on payment page
      };

      // Navigate to payment page with order data
      navigate('/PaymentPage', {
        state: {
          orderData,
          fromDelivery: true
        }
      });
      
    } catch (error) {
      console.error('Error proceeding to payment:', error);
      alert('Failed to process delivery information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!checkoutItems || checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <H2>No items to checkout</H2>
          <P className="text-gray-600 mb-4">Your cart is empty</P>
          <Button onClick={() => navigate('/cart')}>
            Go to Cart
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/cart">Cart</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Delivery Information</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <H1>Delivery Information</H1>
          <P className="text-gray-600">Please provide your delivery details to complete your order</P>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={deliveryInfo.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={deliveryInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={deliveryInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={deliveryInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={errors.phone ? 'border-red-500' : ''}
                      placeholder="+94 77 123 4567"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-emerald-600" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={deliveryInfo.addressLine1}
                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    className={errors.addressLine1 ? 'border-red-500' : ''}
                    placeholder="House number and street name"
                  />
                  {errors.addressLine1 && (
                    <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={deliveryInfo.addressLine2}
                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={deliveryInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="district">District *</Label>
                    <Select value={deliveryInfo.district} onValueChange={(value) => handleInputChange('district', value)}>
                      <SelectTrigger className={errors.district ? 'border-red-500' : ''}>
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
                    {errors.district && (
                      <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={deliveryInfo.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className={errors.postalCode ? 'border-red-500' : ''}
                      placeholder="12345"
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  Delivery Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deliveryMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        deliveryInfo.deliveryMethod === method.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('deliveryMethod', method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            checked={deliveryInfo.deliveryMethod === method.id}
                            onChange={() => handleInputChange('deliveryMethod', method.id)}
                            className="text-emerald-600"
                          />
                          <Icon className="h-5 w-5 text-gray-600" />
                          <div>
                            <h4 className="font-medium">{method.name}</h4>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={method.price === 0 ? 'secondary' : 'outline'}>
                            {method.price === 0 ? 'Free' : formatCurrency(method.price)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <div>
                  <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
                  <Textarea
                    id="deliveryInstructions"
                    value={deliveryInfo.deliveryInstructions}
                    onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
                    placeholder="Any special instructions for delivery..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="billingAddressSame"
                    checked={deliveryInfo.billingAddressSame}
                    onCheckedChange={(checked) => handleInputChange('billingAddressSame', checked)}
                  />
                  <Label htmlFor="billingAddressSame">
                    Same as delivery address
                  </Label>
                </div>
                
                {!deliveryInfo.billingAddressSame && (
                  <div className="space-y-4 border-t pt-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please provide your billing address details.
                      </AlertDescription>
                    </Alert>
                    
                    <div>
                      <Label htmlFor="billingAddressLine1">Billing Address Line 1 *</Label>
                      <Input
                        id="billingAddressLine1"
                        value={deliveryInfo.billingAddress.addressLine1}
                        onChange={(e) => handleBillingAddressChange('addressLine1', e.target.value)}
                        className={errors.billingAddressLine1 ? 'border-red-500' : ''}
                      />
                      {errors.billingAddressLine1 && (
                        <p className="text-red-500 text-sm mt-1">{errors.billingAddressLine1}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="billingAddressLine2">Billing Address Line 2</Label>
                      <Input
                        id="billingAddressLine2"
                        value={deliveryInfo.billingAddress.addressLine2}
                        onChange={(e) => handleBillingAddressChange('addressLine2', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="billingCity">City *</Label>
                        <Input
                          id="billingCity"
                          value={deliveryInfo.billingAddress.city}
                          onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                          className={errors.billingCity ? 'border-red-500' : ''}
                        />
                        {errors.billingCity && (
                          <p className="text-red-500 text-sm mt-1">{errors.billingCity}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="billingDistrict">District *</Label>
                        <Select
                          value={deliveryInfo.billingAddress.district}
                          onValueChange={(value) => handleBillingAddressChange('district', value)}
                        >
                          <SelectTrigger className={errors.billingDistrict ? 'border-red-500' : ''}>
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
                        {errors.billingDistrict && (
                          <p className="text-red-500 text-sm mt-1">{errors.billingDistrict}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="billingPostalCode">Postal Code *</Label>
                        <Input
                          id="billingPostalCode"
                          value={deliveryInfo.billingAddress.postalCode}
                          onChange={(e) => handleBillingAddressChange('postalCode', e.target.value)}
                          className={errors.billingPostalCode ? 'border-red-500' : ''}
                        />
                        {errors.billingPostalCode && (
                          <p className="text-red-500 text-sm mt-1">{errors.billingPostalCode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {checkoutItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <img
                        src={item.product.images?.[0]?.url || 'https://res.cloudinary.com/dckoipgrs/image/upload/v1758703047/helagovi/phmyhhixdps9vqrh9a7g.jpg'}
                        alt={item.product.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.product.title}</h4>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × {formatCurrency(item.product.price)}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({checkoutItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                    <span>{formatCurrency(checkoutSubtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Shipping ({deliveryMethods.find(m => m.id === deliveryInfo.deliveryMethod)?.name})</span>
                    <span>
                      {deliveryMethods.find(m => m.id === deliveryInfo.deliveryMethod)?.price === 0 
                        ? 'Free' 
                        : formatCurrency(deliveryMethods.find(m => m.id === deliveryInfo.deliveryMethod)?.price || 0)
                      }
                    </span>
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-emerald-600">
                        {formatCurrency(checkoutSubtotal + (deliveryMethods.find(m => m.id === deliveryInfo.deliveryMethod)?.price || 0))}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleProceedToPayment}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <p>🔒 Your information is secure and encrypted</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInformation;