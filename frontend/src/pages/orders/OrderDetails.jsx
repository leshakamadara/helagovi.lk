import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Truck,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { 
  formatDate, 
  formatDateTime, 
  formatCurrency, 
  getOrderStatusColor, 
  getPaymentStatusColor,
  formatOrderStatus,
  formatPaymentMethod,
  canCancelOrder
} from '../../lib/orderUtils';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch order');
      
      const data = await response.json();
      setOrder(data.data);
    } catch (err) {
      setError(err.message);
      // Mock data for demo
      setOrder({
        _id: id,
        orderNumber: 'ORD-2024-000001',
        items: [
          {
            product: { 
              _id: '1', 
              title: 'Fresh Organic Tomatoes', 
              images: [{ url: 'https://images.unsplash.com/photo-1546470427-227e8e7dfde8?w=100&h=100&fit=crop' }],
              unit: 'kg',
              category: { name: 'Vegetables' }
            },
            quantity: 2,
            unitPrice: 250,
            totalPrice: 500
          },
          {
            product: { 
              _id: '2', 
              title: 'Organic Carrots', 
              images: [{ url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=100&h=100&fit=crop' }],
              unit: 'kg',
              category: { name: 'Vegetables' }
            },
            quantity: 1,
            unitPrice: 200,
            totalPrice: 200
          }
        ],
        subtotal: 700,
        deliveryFee: 200,
        totalAmount: 900,
        deliveryAddress: {
          addressLine1: '123 Main Street',
          addressLine2: 'Apartment 4B',
          city: 'Colombo',
          district: 'Colombo',
          postalCode: '10000',
          coordinates: { coordinates: [79.8612, 6.9271] }
        },
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'pending',
        orderStatus: 'confirmed',
        deliveryInstructions: 'Please ring the bell twice',
        createdAt: '2024-01-20T10:30:00.000Z',
        estimatedDelivery: '2024-01-22T10:30:00.000Z',
        farmer: { 
          _id: 'farmer1',
          name: 'Sunil Perera', 
          email: 'sunil@example.com',
          phone: '+94 77 123 4567',
          district: 'Colombo',
          city: 'Colombo'
        },
        customer: { 
          _id: 'customer1',
          name: 'John Customer', 
          email: 'john@example.com',
          phone: '+94 77 987 6543' 
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await fetch(`/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update order status');
      
      const data = await response.json();
      setOrder(data.data);
      alert('Order status updated successfully');
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  if (error || !order) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );

  const userRole = 'customer'; // This should come from authentication context

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Orders
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Order Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Order #{order.orderNumber}</h1>
                <p className="text-blue-100 mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Placed on {formatDateTime(order.createdAt)}
                </p>
              </div>
              
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.orderStatus)}`}>
                  {formatOrderStatus(order.orderStatus)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Items */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </h2>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img
                      src={item.product.images[0]?.url}
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/64x64?text=Product'}
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.title}</h3>
                      <p className="text-sm text-gray-600">{item.product.category.name}</p>
                      <p className="text-sm text-gray-600">{item.quantity} {item.product.unit}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(item.unitPrice)}/{item.product.unit}</p>
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </h2>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{order.deliveryAddress.addressLine1}</p>
                  {order.deliveryAddress.addressLine2 && (
                    <p>{order.deliveryAddress.addressLine2}</p>
                  )}
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.district}</p>
                  {order.deliveryAddress.postalCode && (
                    <p>{order.deliveryAddress.postalCode}</p>
                  )}
                  
                  {order.deliveryInstructions && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium text-gray-900">Delivery Instructions:</p>
                      <p className="text-sm text-gray-600">{order.deliveryInstructions}</p>
                    </div>
                  )}
                </div>
                
                {order.estimatedDelivery && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Estimated Delivery</p>
                    <p className="text-blue-700">{formatDate(order.estimatedDelivery)}</p>
                  </div>
                )}
              </div>

              {/* Payment Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </h2>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{formatPaymentMethod(order.paymentMethod)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span>{formatCurrency(order.deliveryFee)}</span>
                    </div>
                    
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userRole === 'customer' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Farmer Information
                  </h2>
                  
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="font-medium">{order.farmer.name}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${order.farmer.phone}`} className="hover:text-blue-600">
                        {order.farmer.phone}
                      </a>
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${order.farmer.email}`} className="hover:text-blue-600">
                        {order.farmer.email}
                      </a>
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.farmer.city}, {order.farmer.district}
                    </p>
                  </div>
                </div>
              )}

              {userRole === 'farmer' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </h2>
                  
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${order.customer.phone}`} className="hover:text-blue-600">
                        {order.customer.phone}
                      </a>
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${order.customer.email}`} className="hover:text-blue-600">
                        {order.customer.email}
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Actions */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Actions</h2>
              
              <div className="flex flex-wrap gap-3">
                {userRole === 'farmer' && order.orderStatus === 'confirmed' && (
                  <button 
                    onClick={() => handleStatusUpdate('processing')}
                    disabled={updating}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    {updating ? 'Processing...' : 'Mark as Processing'}
                  </button>
                )}
                
                {userRole === 'farmer' && order.orderStatus === 'processing' && (
                  <button 
                    onClick={() => handleStatusUpdate('ready_for_delivery')}
                    disabled={updating}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    {updating ? 'Updating...' : 'Mark as Ready for Delivery'}
                  </button>
                )}
                
                {userRole === 'farmer' && order.orderStatus === 'ready_for_delivery' && (
                  <button 
                    onClick={() => handleStatusUpdate('out_for_delivery')}
                    disabled={updating}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Truck className="h-4 w-4" />
                    {updating ? 'Updating...' : 'Mark as Out for Delivery'}
                  </button>
                )}
                
                {userRole === 'farmer' && order.orderStatus === 'out_for_delivery' && (
                  <button 
                    onClick={() => handleStatusUpdate('delivered')}
                    disabled={updating}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {updating ? 'Updating...' : 'Mark as Delivered'}
                  </button>
                )}
                
                {canCancelOrder(order.orderStatus) && (
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this order?')) {
                        handleStatusUpdate('cancelled');
                      }
                    }}
                    disabled={updating}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    {updating ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
                
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact {userRole === 'customer' ? 'Farmer' : 'Customer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;