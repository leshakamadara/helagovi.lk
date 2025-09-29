import React from 'react';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CardPreapprovalCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleTryAgain = () => {
    navigate('/saveCard');
  };

  const handleGoHome = () => {
    navigate('/homepage');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Cancel Icon */}
        <div className="mx-auto mb-6 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>

        {/* Cancel Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Card Preapproval Cancelled
        </h1>
        
        <p className="text-gray-600 mb-6">
          The card preapproval process was cancelled. Your card has not been saved. 
          You can try again if you'd like to save your card for future payments.
        </p>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <CreditCard className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-blue-700">Why save your card?</span>
          </div>
          <p className="text-sm text-blue-600">
            Saving your card allows for faster, more convenient checkout in future purchases.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleTryAgain}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Try Again
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

export default CardPreapprovalCancel;