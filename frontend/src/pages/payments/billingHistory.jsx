import React, { useEffect, useState } from 'react';
import { Lock, CreditCard, ArrowLeft } from 'lucide-react';
import OrderSummary from '../../components/payOrderSummary';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../lib/axios'; // Assumes Axios instance is set up here
import { orderService } from '../../services/orderService';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb';
import { H1, P } from '../../components/ui/typography';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';

const PaymentPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { clearCart } = useCart();
  
  // Get order data from delivery page or use default
  const { orderData } = location.state || {};

  // ✅ Replace with actual env var if needed
  const PUBLIC_URL = window.location.origin;

  // Generate order from delivery data or use default
  const order = orderData ? {
    orderNumber: `ORD-${Date.now()}`,
    buyer: {
      firstName: orderData.deliveryInfo.firstName,
      lastName: orderData.deliveryInfo.lastName,
      email: orderData.deliveryInfo.email,
      phone: orderData.deliveryInfo.phone,
      address: `${orderData.deliveryInfo.addressLine1}${orderData.deliveryInfo.addressLine2 ? ', ' + orderData.deliveryInfo.addressLine2 : ''}`,
      city: `${orderData.deliveryInfo.city}, ${orderData.deliveryInfo.district}`,
      country: 'Sri Lanka',
    },
    summary: {
      subtotal: orderData.totals.subtotal,
      tax: 0, // Tax included in shipping for now
      total: orderData.totals.total,
      items: orderData.items.map(item => ({
        name: `${item.productTitle} (x${item.quantity})`,
        price: item.price * item.quantity,
        quantity: item.quantity,
        unit: 'kg' // Default unit, should come from product data
      })),
      shipping: orderData.totals.shipping,
      deliveryMethod: orderData.deliveryInfo.deliveryMethod
    },
    deliveryInfo: orderData.deliveryInfo
  } : {
    // Fallback default order
    orderNumber: 'ORD-20250928-001',
    buyer: {
      firstName: user?.firstName || 'Guest',
      lastName: user?.lastName || 'User',
      email: user?.email || 'guest@example.com',
      phone: '+94771234567',
      address: '123 Main Street',
      city: 'Colombo',
      country: 'Sri Lanka',
    },
    summary: {
      subtotal: 299.99,
      tax: 24.0,
      total: 323.99,
      items: [{ name: 'Premium Subscription', price: 299.99 }],
    },
  };

  // Redirect if no order data available
  useEffect(() => {
    if (!orderData && !user) {
      navigate('/cart');
    }
  }, [orderData, user, navigate]);

  useEffect(() => {
    const script = document.createElement('script');
    // ✅ Use sandbox for testing, live for production
    script.src = 'https://sandbox.payhere.lk/lib/payhere.js'; // Use sandbox SDK for testing
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handlePay = async () => {
    try {
      setIsLoading(true);
      setLoadingType('mobile');

      const order_id = order.orderNumber || 'ORDER_' + Date.now();
      const amount = order.summary.total.toFixed(2);

      console.log('Starting payment with:', { order_id, amount, currency: 'LKR' });

      // ✅ Axios request to correct endpoint
      const res = await api.post('/payments/pay', {
        order_id,
        amount,
        currency: 'LKR',
      });

      console.log('Payment API response:', res.data);
      const data = res.data;

      const paymentData = {
        sandbox: true, // Always use sandbox for testing virtual payments
        merchant_id: data.merchant_id,
        hash: data.hash,
        return_url: `${PUBLIC_URL}/payment-success`,
        cancel_url: `${PUBLIC_URL}/payment-cancel`,
        notify_url: `${PUBLIC_URL}/api/payhere-notify`,
        order_id,
        items: order.summary.items.map((i) => i.name).join(', '),
        amount,
        currency: 'LKR',
        first_name: order.buyer.firstName,
        last_name: order.buyer.lastName,
        email: order.buyer.email,
        phone: order.buyer.phone,
        address: order.buyer.address,
        city: order.buyer.city,
        country: order.buyer.country,
      };

      // ✅ PayHere Events
      window.payhere.onCompleted = async function (orderId) {
        console.log('Payment completed:', orderId);
        
        try {
          // Prepare order data for backend
          const deliveryAddress = {
            recipientName: `${orderData.deliveryInfo.firstName} ${orderData.deliveryInfo.lastName}`.trim(),
            phone: orderData.deliveryInfo.phone.replace(/\s+/g, ''), // Remove spaces
            street: orderData.deliveryInfo.addressLine1 + (orderData.deliveryInfo.addressLine2 ? ', ' + orderData.deliveryInfo.addressLine2 : ''),
            city: orderData.deliveryInfo.city.trim(),
            district: orderData.deliveryInfo.district,
            postalCode: orderData.deliveryInfo.postalCode.toString().padStart(5, '0'), // Ensure 5 digits
            specialInstructions: orderData.deliveryInfo.deliveryInstructions || ''
          };

          // Validate required fields
          if (!deliveryAddress.recipientName || !deliveryAddress.phone || !deliveryAddress.street || 
              !deliveryAddress.city || !deliveryAddress.district || !deliveryAddress.postalCode) {
            throw new Error('Missing required delivery address fields');
          }

          const orderDataPayload = {
            items: orderData.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            })),
            deliveryAddress,
            paymentMethod: 'credit_card', // Map PayHere to credit_card
            paymentStatus: 'paid',
            transactionId: orderId,
            orderId: orderId, // Store PayHere order_id for refunds
            notes: orderData.deliveryInfo.deliveryInstructions || ''
          };

          console.log('Validated order data:', orderDataPayload);

          console.log('Creating order with data:', orderDataPayload);
          
          // Create order in database
          const orderResponse = await orderService.createOrder(orderDataPayload);
          const createdOrder = orderResponse.data.order;
          
          console.log('Order created successfully:', createdOrder);
          
          // Clear the cart after successful order creation
          try {
            await clearCart();
            console.log('Cart cleared successfully');
          } catch (cartError) {
            console.warn('Failed to clear cart:', cartError);
            // Don't fail the order creation if cart clearing fails
          }
          
          setIsLoading(false);
          navigate('/success', { 
            state: { 
              orderId, 
              order: {
                ...order,
                orderNumber: createdOrder.orderNumber,
                id: createdOrder._id,
                summary: {
                  ...order.summary,
                  total: createdOrder.total
                }
              },
              transactionDetails: {
                paymentMethod: 'PayHere',
                transactionId: orderId,
                status: 'completed'
              }
            } 
          });
        } catch (orderError) {
          console.error('Failed to create order:', orderError);
          setIsLoading(false);
          alert('Payment was successful, but there was an issue creating your order. Please contact support with transaction ID: ' + orderId);
          navigate('/success', { 
            state: { 
              orderId, 
              order,
              transactionDetails: {
                paymentMethod: 'PayHere',
                transactionId: orderId,
                status: 'completed'
              }
            } 
          });
        }
      };

      window.payhere.onDismissed = function () {
        console.log('Payment dismissed');
        setIsLoading(false);
      };

      window.payhere.onError = function (error) {
        console.error('Payment error:', error);
        setIsLoading(false);
        alert('Payment error: ' + error);
      };

      // ✅ Start PayHere Payment
      window.payhere.startPayment(paymentData);
    } catch (err) {
      console.error('Payment start failed:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      setIsLoading(false);
      setLoadingType('');
      
      let errorMessage = 'Failed to start payment. Please try again.';
      if (err.response?.status === 404) {
        errorMessage = 'Payment service not available. Please make sure the backend server is running.';
      } else if (err.response?.data?.error) {
        errorMessage = `Payment failed: ${err.response.data.error}`;
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on port 5001.';
      }
      
      alert(errorMessage);
    }
  };

  const handlePayWithCard = () => {
    setIsLoading(true);
    setLoadingType('card');
    navigate('/ChargePage', { 
      state: { 
        order,
        orderData: orderData,
        fromPaymentPage: true 
      } 
    });
  };

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
                <BreadcrumbLink href="/checkout/delivery">Delivery</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Payment</BreadcrumbPage>
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
          Back to Delivery Information
        </Button>

        {/* Header */}
        <div className="mb-8">
          <H1 className="text-gray-900 mb-2">Secure Checkout</H1>
          <P className="text-gray-600">Complete your purchase securely</P>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-4">
            {orderData && (
              <Alert className="border-emerald-200 bg-emerald-50">
                <AlertDescription className="text-emerald-700">
                  <strong>Order #{order.orderNumber.slice(-6)}</strong> • 
                  Delivering to <strong>{order.buyer.firstName} {order.buyer.lastName}</strong>
                  <br />
                  <span className="text-emerald-600 text-sm">
                    {order.buyer.address}, {order.buyer.city}
                  </span>
                </AlertDescription>
              </Alert>
            )}
            <OrderSummary summary={order.summary} />
          </div>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                Choose Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Primary Payment Button */}
                <Button
                  onClick={handlePay}
                  disabled={isLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  size="lg"
                >
                  {isLoading && loadingType === 'mobile' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay {order.summary.total && `LKR ${order.summary.total.toFixed(2)}`} Now
                    </>
                  )}
                </Button>

                {/* Alternative Payment Button */}
                <Button
                  onClick={handlePayWithCard}
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full"
                  size="lg"
                >
                  {isLoading && loadingType === 'card' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Loading Cards...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay with Saved Cards
                    </>
                  )}
                </Button>
              </div>

              <Alert>
                <AlertDescription className="text-center">
                  <p className="text-sm mb-1">
                    💳 We accept Visa, MasterCard, and local bank cards
                  </p>
                  <p className="text-xs text-gray-500">
                    You can save the card and easily pay through "pay with saved cards"
                  </p>
                </AlertDescription>
              </Alert>

              <Alert className="border-green-200 bg-green-50">
                <Lock className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <h4 className="font-semibold text-green-800">Secure Payment</h4>
                  <p className="text-xs text-green-600 mt-1">
                    Your payment is protected by 256-bit SSL encryption
                  </p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
