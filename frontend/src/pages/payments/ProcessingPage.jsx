import React, { useEffect } from "react";
import { Lock, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProcessingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate payment processing (3s delay)
    const timer = setTimeout(() => {
      navigate("/success");
    }, 100000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-success rounded-lg flex items-center justify-center mr-3">
              <Lock className="w-5 h-5 text-success-content" />
            </div>
            <h1 className="text-3xl font-bold">Secure Checkout</h1>
          </div>
          <p className="text-base-content/70">Processing your payment...</p>
        </div>

        <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
          <div className="card-body">
            {/* Steps */}
            <div className="steps steps-horizontal w-full mb-8">
              <div className="step step-success">Payment</div>
              <div className="step step-success">Processing</div>
              <div className="step">Complete</div>
            </div>

            <div className="text-center py-12">
              <div className="loading loading-spinner loading-lg text-success mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
              <p className="text-base-content/70">
                Please wait while we process your transaction...
              </p>

              <div className="mt-6 bg-base-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-base-content/60 mb-2">Steps:</p>
                <div className="space-y-2 text-left">
                  <div className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-success mr-2" />
                    <span>Validating payment information</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="loading loading-spinner loading-sm mr-2"></div>
                    <span>Authorizing transaction</span>
                  </div>
                  <div className="flex items-center text-sm text-base-content/50">
                    <div className="w-4 h-4 border-2 border-base-300 rounded-full mr-2"></div>
                    <span>Confirming payment</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-base-content/60 mt-6">
                <p>• Do not refresh this page</p>
                <p>• Processing usually takes 10–30 seconds</p>
                <p>• You will receive a confirmation email</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPage;
