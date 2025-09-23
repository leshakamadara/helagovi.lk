import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  X, 
  Package, 
  Truck, 
  Calendar,
  MapPin,
  DollarSign,
  Loader2,
  ArrowLeft
} from 'lucide-react';

const EditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    estimatedDelivery: '',
    deliveryNotes: ''
  });

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      // Replace with your API endpoint
      const response = await fetch(`/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch order');
      
      const data = await response.json();
      setOrder(data.data);
      setFormData({
        status: data.data.status,
        estimatedDelivery: data.data.estimatedDelivery ? new Date(data.data.estimatedDelivery).toISOString().split('T')[0] : '',
        deliveryNotes: data.data.deliveryNotes || ''
      });
    } catch (err) {
      console.error('Error fetching order:', err);
      alert('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      // Replace with your API endpoint
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to update order');
      
      alert('Order updated successfully!');
      navigate('/farmer/orders');
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setSaving(true);
      // Replace with your API endpoint
      const response = await fetch(`/api/orders/${id}/status`, {
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
      setFormData(prev => ({ ...prev, status: newStatus }));
      alert('Order status updated successfully!');
      
      // Send notification to buyer
      if (['confirmed', 'shipped', 'delivered'].includes(newStatus)) {
        await sendNotificationToBuyer(newStatus);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    } finally {
      setSaving(false);
    }
  };

  const sendNotificationToBuyer = async (status) => {
    try {
      // Replace with your API endpoint
      await fetch(`/api/orders/${id}/notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <button
            onClick={() => navigate('/farmer/orders')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/farmer/orders')}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Order</h1>
              <p className="text-gray-600">Order #{order.orderNumber}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Order Summary */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Customer Information</h3>
                <p className="text-gray-600">{order.customer?.name}</p>
                <p className="text-gray-600">{order.customer?.email}</p>
                <p className="text-gray-600">{order.customer?.phone}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Order Details</h3>
                <p className="text-gray-600 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Total: Rs. {order.totalAmount?.toLocaleString()}
                </p>
                <p className="text-gray-600 flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  Items: {order.items?.length}
                </p>
                <p className="text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.district}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <img
                      src={item.product?.images?.[0]?.url || '/placeholder-image.jpg'}
                      alt={item.product?.title}
                      className="w-12 h-12 object-cover rounded mr-3"
                    />
                    <div>
                      <h4 className="font-medium">{item.product?.title}</h4>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × Rs. {item.unitPrice?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">Rs. {(item.quantity * item.unitPrice)?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status Management */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => updateOrderStatus('confirmed')}
                disabled={saving || order.status === 'confirmed'}
                className={`px-4 py-2 rounded-lg ${
                  order.status === 'confirmed' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                } disabled:opacity-50`}
              >
                Confirm Order
              </button>
              
              <button
                onClick={() => updateOrderStatus('processing')}
                disabled={saving || order.status === 'processing'}
                className={`px-4 py-2 rounded-lg ${
                  order.status === 'processing' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                } disabled:opacity-50`}
              >
                Processing
              </button>
              
              <button
                onClick={() => updateOrderStatus('shipped')}
                disabled={saving || order.status === 'shipped'}
                className={`px-4 py-2 rounded-lg ${
                  order.status === 'shipped' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                } disabled:opacity-50`}
              >
                Shipped
              </button>
              
              <button
                onClick={() => updateOrderStatus('delivered')}
                disabled={saving || order.status === 'delivered'}
                className={`px-4 py-2 rounded-lg ${
                  order.status === 'delivered' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                } disabled:opacity-50`}
              >
                Delivered
              </button>
              
              <button
                onClick={() => updateOrderStatus('cancelled')}
                disabled={saving || order.status === 'cancelled'}
                className={`px-4 py-2 rounded-lg ${
                  order.status === 'cancelled' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                } disabled:opacity-50`}
              >
                Cancel Order
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  name="estimatedDelivery"
                  value={formData.estimatedDelivery}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Notes
                </label>
                <textarea
                  name="deliveryNotes"
                  value={formData.deliveryNotes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add delivery notes or instructions..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 flex justify-end space-x-3">
            <button
              onClick={() => navigate('/farmer/orders')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrder;