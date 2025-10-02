import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";

const addCard = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // ✅ Pre-fill form with user data
  useEffect(() => {
    if (!user) {
      setMessage("Please log in to add a card");
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
  }, [user, navigate]);

  const handlePreapprove = async () => {
    if (!user || !user._id) {
      setMessage("User not authenticated. Please log in.");
      return;
    }
    
    // Validation
    if (!firstName || !lastName || !email || !phone) {
      setMessage("Please fill in all required fields");
      return;
    }
    
    setIsLoading(true);
    setMessage("");

    try {
      console.log("Initiating preapproval for user:", user._id);
      
      const response = await api.post("/payments/preapprove", {
        userId: user._id || user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        address: "",
        city: "",
      });

      const data = response.data;
      console.log("Preapproval response:", data);
      if (data.url && data.params) {
        const form = document.createElement("form");
        form.action = data.url;
        form.method = "POST";

        for (const key in data.params) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = data.params[key];
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
      } else {
        setMessage("Preapproval request failed. Please try again.");
      }
    } catch (err) {
      console.error("Preapproval error:", err);
      setMessage("Error initiating preapproval. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card bg-white shadow-xl border border-green-200">
          <div className="card-body">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="card-title text-3xl font-bold text-green-700 justify-center mb-2">
                💳 Save Card
              </h1>
              <p className="text-green-900/70 text-lg">
                Securely save your card for future automated payments
              </p>
            </div>

            {/* Alert for additional info */}
            <div className="alert alert-info mb-6 border-l-4 border-green-500 bg-green-100 text-green-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 className="font-bold">Safe & Secure</h3>
                <div className="text-xs">Your payment information is encrypted and processed securely through PayHere.</div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-green-800">First Name</span>
                  </label>
                  <input 
                    type="text"
                    placeholder="Enter your first name" 
                    className="input input-bordered bg-white w-full text-green-900 placeholder-green-400 border-green-300 focus:border-green-500 focus:ring focus:ring-green-200" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-green-800">Last Name</span>
                  </label>
                  <input 
                    type="text"
                    placeholder="Enter your last name" 
                    className="input input-bordered bg-white w-full text-green-900 placeholder-green-400 border-green-300 focus:border-green-500 focus:ring focus:ring-green-200" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-green-800">Email Address</span>
                </label>
                <input 
                  type="email"
                  placeholder="your.email@example.com" 
                  className="input input-bordered bg-white w-full text-green-900 placeholder-green-400 border-green-300 focus:border-green-500 focus:ring focus:ring-green-200" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-green-800">Phone Number</span>
                </label>
                <input 
                  type="tel"
                  placeholder="+94 77 123 4567" 
                  className="input input-bordered bg-white w-full text-green-900 placeholder-green-400 border-green-300 focus:border-green-500 focus:ring focus:ring-green-200" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  required 
                />
              </div>

              {/* Submit Button */}
              <div className="form-control mt-8">
                <button 
                  type="button" 
                  className={`btn btn-success btn-lg w-full ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                  onClick={handlePreapprove}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Preapprove Card
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`alert mt-6 ${message.includes('failed') || message.includes('Error') ? 'alert-error border-red-500 bg-red-100 text-red-700' : 'alert-success border-green-500 bg-green-100 text-green-700'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={message.includes('failed') || message.includes('Error') ? "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                </svg>
                <span>{message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-green-900/60">
          <p className="text-sm">
            🔒 Powered by HelaGovi - Sri Lanka's most trusted Marketplace
          </p>
        </div>
      </div>
    </div>
  );
};

export default addCard;
