import React from 'react';

const OrderSummary = ({ summary }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
      <div className="space-y-3">
        {summary.items.map((item, idx) => (
          <div key={idx} className="flex justify-between">
            <span className="text-gray-700">{item.name}</span>
            <span className="text-gray-800 font-medium">LKR {item.price.toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tax</span>
          <span className="text-gray-600">LKR {summary.tax.toFixed(2)}</span>
        </div>
        <hr className="my-3 border-gray-200" />
        <div className="flex justify-between font-bold text-lg">
          <span className="text-gray-800">Total</span>
          <span className="text-green-600">LKR {summary.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
