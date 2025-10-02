import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Loader,
  CheckCircle,
} from "lucide-react";
import ChargeSummary from "../../components/payOrderSummary";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";

const ChargePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const order = location.state?.order || {
    orderNumber: "ORD-UNKNOWN",
    buyer: { firstName: "", lastName: "" },
    summary: { items: [{ name: "Unknown", price: 0 }], tax: 0, total: 0 },
  };

  // ✅ Use actual logged-in user ID
  const userId = user?._id || user?.id;
  const orderId = order.orderNumber || `ORD-${Date.now()}`;
  const items = order.summary.items.map((i) => i.name).join(", ");
  const amount = order.summary.total;
  const currency = "LKR";

  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [isCharging, setIsCharging] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      alert("Please log in to continue with payment");
      navigate("/login");
      return;
    }
    fetchSavedCards();
  }, [user, navigate]);

  const fetchSavedCards = async () => {
    if (!userId) {
      console.error("No userId available");
      setMessage("❌ User not logged in");
      setIsLoadingCards(false);
      return;
    }
    
    setIsLoadingCards(true);
    try {
      console.log("Fetching cards for userId:", userId);
      const response = await api.get(`/payments/card/${userId}`);
      
      const data = response.data;
      console.log("Fetched cards data:", data);

      
      const cardsArr = data.cards ?? data; 
      const cards = (Array.isArray(cardsArr) ? cardsArr : []).map((card) => ({
        cardId: card.cardId || card._id,
        last4: card.last4 || card.card_no || "••••",
        cardType: card.cardType || card.brand || "Card",
        expiry: card.expiry || card.expiryDate || "XX/XX",
        card_holder_name: card.card_holder_name || "",
      }));

      setSavedCards(cards);
      if (cards.length > 0) {
        setSelectedCardId(cards[0].cardId);
      }
    } catch (err) {
      console.error("Error fetching saved cards:", err);
      setMessage("❌ Error loading saved cards");
    } finally {
      setIsLoadingCards(false);
    }
  };

  const handleCharge = async () => {
    // Validation checks
    if (!userId) {
      setMessage("❌ User not logged in");
      return;
    }
    
    if (!selectedCardId) {
      setMessage("⚠️ Please select a card first");
      return;
    }
    
    if (!amount || amount <= 0) {
      setMessage("❌ Invalid order amount");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to charge LKR ${amount.toFixed(2)} using this card?`)) {
      return;
    }

    setMessage("");
    setResult(null);
    setIsCharging(true);

    try {
      console.log("Initiating charge with data:", {
        userId,
        cardId: selectedCardId,
        order_id: orderId,
        items,
        amount: parseFloat(amount),
        currency
      });
      
      const res = await api.post(`/payments/charge`, {
        userId,
        cardId: selectedCardId,
        order_id: orderId,
        items,
        amount: parseFloat(amount),
        currency,
      });
      
      const data = res.data;
      console.log("Charge response:", data);

      if (data.success || (data.data && data.data.status_code === 2)) {
        setMessage("✅ Payment Successful");
        setResult(data);
        
        // Navigate to success page
        setTimeout(() => {
          navigate("/success", { 
            state: { 
              order, 
              chargeResult: data,
              transactionDetails: {
                paymentMethod: 'Saved Card',
                transactionId: data.data?.payment_id || orderId,
                status: 'completed'
              }
            } 
          });
        }, 1500);
      } else {
        const errorMsg = data.data?.status_message || data.message || "Payment failed";
        setMessage(`⚠️ ${errorMsg}`);
        setResult(data);
      }
    } catch (err) {
      console.error("Charge error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          "Error occurred while charging";
      
      setMessage(`❌ ${errorMessage}`);
      
      // Show more detailed error if available
      if (err.response?.data?.details) {
        console.error("Detailed error:", err.response.data.details);
      }
    } finally {
      setIsCharging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Charge Saved Card</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Process payment using preapproved customer card
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChargeSummary summary={order.summary} />

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-6">
              <CreditCard className="w-6 h-6 text-green-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-800">Payment Action</h2>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Card to Charge
              </label>

              {isLoadingCards ? (
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <Loader className="w-5 h-5 mr-2 animate-spin text-green-500" />
                  <span className="text-gray-600">Loading saved cards...</span>
                </div>
              ) : savedCards.length > 0 ? (
                <div className="space-y-3">
                  {savedCards.map((card) => (
                    <div
                      key={card.cardId}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedCardId === card.cardId
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                      onClick={() => setSelectedCardId(card.cardId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="w-5 h-5 text-gray-500 mr-3" />
                          <div>
                            <p className="font-medium text-gray-800">{card.last4}</p>
                            <p className="text-sm text-gray-500">
                              {card.card_holder_name} ••• Expires {card.expiry}
                            </p>
                          </div>
                        </div>
                        {selectedCardId === card.cardId && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No saved cards found</p>
                  <p className="text-sm text-gray-500">
                    Please add a card first to proceed with payment
                  </p>
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6 flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-800">Secure Payment</h4>
                <p className="text-xs text-green-600">
                  Your payment is protected by 256-bit SSL encryption
                </p>
              </div>
            </div>

            {message && (
              <div
                className={`mb-4 p-3 rounded ${
                  message.startsWith("✅")
                    ? "bg-green-100 text-green-700"
                    : message.startsWith("❌")
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {message}
              </div>
            )}

            <button
              onClick={handleCharge}
              disabled={isCharging || savedCards.length === 0}
              className={`w-full flex justify-center items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                isCharging ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isCharging ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Charging...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Charge Card
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargePage;
