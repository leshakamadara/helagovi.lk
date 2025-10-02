import React, { useEffect } from 'react';
import { CheckCircle, CreditCard, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CardPreapprovalSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const orderId = searchParams.get('order_id');
  const statusCode = searchParams.get('status_code');

  useEffect(() => {
    // Log the preapproval success
    console.log('Card preapproval successful:', { orderId, statusCode });
  }, [orderId, statusCode]);

  const handleContinue = () => {
    navigate('/card-management');
  };

  const handleGoHome = () => {
    navigate('/homepage');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Card Preapproval Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your card has been successfully preapproved and saved for future payments. 
          You can now use this card for quick checkout.
        </p>

        {/* Transaction Details */}
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <CreditCard className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Preapproval ID</span>
            </div>
            <p className="text-sm font-mono text-gray-900">{orderId}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleContinue}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            View Saved Cards
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardPreapprovalSuccess;