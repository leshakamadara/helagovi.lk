import React from 'react';
import { Truck, Package } from 'lucide-react';

const OrderSummary = ({ summary }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getDeliveryMethodName = (method) => {
    const methods = {
      'standard': 'Standard Delivery (3-5 days)',
      'express': 'Express Delivery (1-2 days)',
      'pickup': 'Pickup Point (Free)'
    };
    return methods[method] || 'Standard Delivery';
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Package className="w-5 h-5 mr-2 text-emerald-600" />
        Order Summary
      </h3>
      
      <div className="space-y-3">
        {/* Items */}
        <div className="space-y-2">
          {summary.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <div className="flex-1">
                <span className="text-gray-700 text-sm">{item.name}</span>
                {item.quantity && (
                  <div className="text-xs text-gray-500">
                    Quantity: {item.quantity} {item.unit || 'units'}
                  </div>
                )}
              </div>
              <span className="text-gray-800 font-medium ml-4">
                {formatCurrency(item.price)}
              </span>
            </div>
          ))}
        </div>

        <hr className="my-3 border-gray-200" />

        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-700">{formatCurrency(summary.subtotal)}</span>
        </div>

        {/* Shipping */}
        {summary.shipping !== undefined && (
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <Truck className="w-4 h-4 mr-1 text-gray-500" />
              <span className="text-gray-600">
                {summary.deliveryMethod ? getDeliveryMethodName(summary.deliveryMethod) : 'Shipping'}
              </span>
            </div>
            <span className="text-gray-700">
              {summary.shipping === 0 ? 'Free' : formatCurrency(summary.shipping)}
            </span>
          </div>
        )}

        {/* Tax */}
        {summary.tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-700">{formatCurrency(summary.tax)}</span>
          </div>
        )}

        <hr className="my-3 border-gray-300" />

        {/* Total */}
        <div className="flex justify-between font-bold text-lg">
          <span className="text-gray-800">Total</span>
          <span className="text-emerald-600">{formatCurrency(summary.total)}</span>
        </div>

        {/* Item count summary */}
        <div className="text-xs text-gray-500 text-center mt-2">
          {summary.items.length} {summary.items.length === 1 ? 'item' : 'items'} • 
          {summary.shipping === 0 ? ' Free delivery' : ' Delivery included'}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
