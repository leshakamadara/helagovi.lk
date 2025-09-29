import React, { useEffect, useState } from 'react';
import { Lock, CreditCard, ArrowLeft } from 'lucide-react';
import OrderSummary from '../../components/payOrderSummary';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios'; // Assumes Axios instance is set up here
import { orderService } from '../../services/orderService';

const PaymentPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
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
    script.src = import.meta.env.PROD 
      ? 'https://www.payhere.lk/lib/payhere.js' 
      : 'https://www.payhere.lk/lib/payhere.js'; // PayHere uses same script for both environments
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
          const orderData = {
            items: orderData.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            })),
            deliveryAddress: {
              firstName: orderData.deliveryInfo.firstName,
              lastName: orderData.deliveryInfo.lastName,
              email: orderData.deliveryInfo.email,
              phone: orderData.deliveryInfo.phone,
              addressLine1: orderData.deliveryInfo.addressLine1,
              addressLine2: orderData.deliveryInfo.addressLine2 || '',
              city: orderData.deliveryInfo.city,
              district: orderData.deliveryInfo.district,
              country: 'Sri Lanka'
            },
            paymentMethod: 'payhere',
            notes: orderData.deliveryInfo.notes || ''
          };

          console.log('Creating order with data:', orderData);
          
          // Create order in database
          const orderResponse = await orderService.createOrder(orderData);
          const createdOrder = orderResponse.data.order;
          
          console.log('Order created successfully:', createdOrder);
          
          setIsLoading(false);
          navigate('/success', { 
            state: { 
              orderId, 
              order: {
                ...order,
                orderNumber: createdOrder.orderNumber,
                id: createdOrder._id
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Delivery Information
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Secure Checkout</h1>
          </div>
          <p className="text-gray-600">Complete your purchase securely</p>
          
          {/* Order Info */}
          {orderData && (
            <div className="mt-4 p-4 bg-emerald-50 rounded-lg inline-block">
              <p className="text-sm text-emerald-700">
                <strong>Order #{order.orderNumber.slice(-6)}</strong> • 
                Delivering to <strong>{order.buyer.firstName} {order.buyer.lastName}</strong>
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                {order.buyer.address}, {order.buyer.city}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <OrderSummary summary={order.summary} />

          {/* Payment Section */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Choose Payment Method</h3>

            <div className="space-y-4 mb-6">
              {/* Primary Payment Button */}
              <button
                className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                  isLoading && loadingType === 'mobile' ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                onClick={handlePay}
                disabled={isLoading}
              >
                {isLoading && loadingType === 'mobile' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay {order.summary.total && `LKR ${order.summary.total.toFixed(2)}`} Now
                  </>
                )}
              </button>

              {/* Alternative Payment Button */}
              <button
                className={`w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                  isLoading && loadingType === 'card' ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                onClick={handlePayWithCard}
                disabled={isLoading}
              >
                {isLoading && loadingType === 'card' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Loading Cards...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay with Saved Cards
                  </>
                )}
              </button>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 text-center mb-1">
                💳 We accept Visa, MasterCard, and local bank cards
              </p>
              <p className="text-xs text-gray-500 text-center">
                You can save the card and easily pay through "pay with saved cards"
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center">
              <Lock className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-800">Secure Payment</h4>
                <p className="text-xs text-green-600">
                  Your payment is protected by 256-bit SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
