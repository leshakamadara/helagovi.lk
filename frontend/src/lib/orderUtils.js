// orderUtils.js

// Format a date into "January 15, 2024"
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format a date with time
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Order status color mapping
export const getOrderStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    ready_for_delivery: 'bg-purple-100 text-purple-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Payment status color mapping
export const getPaymentStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Format numbers as currency (Rs.)
export const formatCurrency = (amount) => {
  return `Rs. ${amount?.toLocaleString()}`;
};

// Format order status for display
export const formatOrderStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    ready_for_delivery: 'Ready for Delivery',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  return statusMap[status] || status;
};

// Format payment method for display
export const formatPaymentMethod = (method) => {
  const methodMap = {
    cash_on_delivery: 'Cash on Delivery',
    card: 'Credit/Debit Card',
    bank_transfer: 'Bank Transfer',
    digital_wallet: 'Digital Wallet'
  };
  return methodMap[method] || method;
};

// Calculate estimated delivery date
export const getEstimatedDeliveryDate = (orderDate, district) => {
  const date = new Date(orderDate);
  
  // Delivery time based on district (simplified)
  const deliveryDays = {
    'Colombo': 1,
    'Gampaha': 1,
    'Kalutara': 1,
    'Kandy': 2,
    'Galle': 2,
    'Matara': 2,
    'Jaffna': 3,
    'Other': 3
  };
  
  const days = deliveryDays[district] || deliveryDays.Other;
  date.setDate(date.getDate() + days);
  
  return date;
};

// Check if order can be cancelled
export const canCancelOrder = (orderStatus) => {
  return ['pending', 'confirmed'].includes(orderStatus);
};

// Check if order can be rated
export const canRateOrder = (orderStatus, paymentStatus) => {
  return orderStatus === 'delivered' && paymentStatus === 'completed';
};