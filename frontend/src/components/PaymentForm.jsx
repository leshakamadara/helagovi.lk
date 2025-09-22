import React from 'react';
import { CreditCard, Lock, Calendar, User, Mail, MapPin } from 'lucide-react';

const PaymentForm = ({ formData, errors, handleInputChange, handleSubmit, orderSummary, formatCardNumber, formatExpiryDate }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        {/* Progress Steps */}
        <div className="steps steps-horizontal w-full mb-8">
          <div className="step step-success">Payment</div>
          <div className="step">Processing</div>
          <div className="step">Complete</div>
        </div>

        <div className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Contact Information
            </h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email Address</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`input input-bordered w-full ${errors.email ? 'input-error' : 'focus:border-success'}`}
                placeholder="your@email.com"
              />
              {errors.email && <div className="label">
                <span className="label-text-alt text-error">{errors.email}</span>
              </div>}
            </div>
          </div>

          {/* Card Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Information
            </h3>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Card Number</span>
                </label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                  className={`input input-bordered w-full ${errors.cardNumber ? 'input-error' : 'focus:border-success'}`}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
                {errors.cardNumber && <div className="label">
                  <span className="label-text-alt text-error">{errors.cardNumber}</span>
                </div>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Expiry Date
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                    className={`input input-bordered w-full ${errors.expiryDate ? 'input-error' : 'focus:border-success'}`}
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                  {errors.expiryDate && <div className="label">
                    <span className="label-text-alt text-error">{errors.expiryDate}</span>
                  </div>}
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">CVV</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className={`input input-bordered w-full ${errors.cvv ? 'input-error' : 'focus:border-success'}`}
                    placeholder="123"
                    maxLength="4"
                  />
                  {errors.cvv && <div className="label">
                    <span className="label-text-alt text-error">{errors.cvv}</span>
                  </div>}
                </div>
              </div>






              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Cardholder Name
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  className={`input input-bordered w-full ${errors.cardholderName ? 'input-error' : 'focus:border-success'}`}
                  placeholder="John Doe"
                />
                {errors.cardholderName && <div className="label">
                  <span className="label-text-alt text-error">{errors.cardholderName}</span>
                </div>}
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Billing Address
            </h3>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Street Address</span>
                </label>
                <input
                  type="text"
                  value={formData.billingAddress}
                  onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                  className="input input-bordered w-full focus:border-success"
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">City</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="input input-bordered w-full focus:border-success"
                    placeholder="New York"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">ZIP Code</span>
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="input input-bordered w-full focus:border-success"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button onClick={handleSubmit} className="btn btn-success w-full text-lg">
              <Lock className="w-5 h-5 mr-2" />
              Complete Payment - ${orderSummary.total}
            </button>
            <p className="text-xs text-base-content/60 text-center mt-2">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
