import React, { useState } from "react";

const RefundForm = () => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);


  const orderId = "ORD-1759176586564"; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("http://localhost:5001/api/payments/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,
          description,
        }),
      });

      const data = await res.json();

      if (res.status==1) {
        setResponse({
          type: "success",
          message: "Refund processed successfully ✅",
          data: data,

          
        });
        setTimeout(() => {
          setDescription("");
          setResponse(null);
        }, 3000);
      } else {
        setResponse({
          type: "error",
          message: data.error || "Refund failed or already refunded ❌",
          details: data.details || null,
        });
      }
    } catch (err) {
      setResponse({
        type: "error",
        message: "Network error. Please try again.",
        details: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Request Refund
          </h1>
          <p className="text-green-600">Please provide a reason for your refund</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-green-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-green-700 font-medium">
                  Reason for Refund
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24 w-full 
                          border-green-200 focus:border-green-500 
                          focus:ring-2 focus:ring-green-200 
                          bg-white text-gray-700 resize-none"
                placeholder="Please explain why you're requesting a refund..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className={`w-full btn border-0 ${
                loading 
                  ? "bg-green-400" 
                  : "bg-green-600 hover:bg-green-700"
              } text-white font-semibold py-3 rounded-md 
                transition duration-200 ease-in-out
                disabled:bg-green-300 disabled:cursor-not-allowed`}
              disabled={loading || !description}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Submit Request"
              )}
            </button>
          </form>

          {response && (
            <div
              className={`mt-6 p-4 rounded-md ${
                response.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <p className={`font-medium ${
                response.type === "success" 
                  ? "text-green-700" 
                  : "text-red-700"
              }`}>
                {response.message}
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-green-600 text-sm">
            🔒 Your refund request will be processed securely
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundForm;