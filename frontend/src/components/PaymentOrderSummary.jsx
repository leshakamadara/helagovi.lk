import React from 'react';
import { Check } from 'lucide-react';

const OrderSummary = ({ orderSummary }) => {
  return (
    <div className="card bg-base-100 shadow-xl sticky top-8">
      <div className="card-body">
        <h3 className="card-title">Order Summary</h3>
        
        <div className="space-y-3 mb-6">
          {orderSummary.items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-base-content/70">{item.name}</span>
              <span className="font-medium">${item.price}</span>
            </div>
          ))}
          <div className="divider"></div>
          <div className="flex justify-between text-sm">
            <span className="text-base-content/70">Subtotal</span>
            <span>${orderSummary.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-base-content/70">Tax</span>
            <span>${orderSummary.tax}</span>
          </div>
          <div className="divider"></div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-success">${orderSummary.total}</span>
          </div>
        </div>

        <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4">
          <div className="flex items-center text-success text-sm">
            <Check className="w-4 h-4 mr-2" />
            <span>Secure payment processing</span>
          </div>
        </div>

        <div className="text-xs text-base-content/60 space-y-1">
          <p>• 30-day money-back guarantee</p>
          <p>• Cancel anytime</p>
          <p>• 24/7 customer support</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
