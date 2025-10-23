import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Loader,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import ChargeSummary from "../../components/payOrderSummary";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb';
import { H1, P } from '../../components/ui/typography';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';

const ChargePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const order = location.state?.order || {
    orderNumber: "ORD-UNKNOWN",
    buyer: { firstName: "", lastName: "" },
    summary: { items: [{ name: "Unknown", price: 0 }], tax: 0, total: 0 },
  };

  //  Use actual logged-in user ID
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
      setMessage(" User not logged in");
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
      setMessage(" Error loading saved cards");
    } finally {
      setIsLoadingCards(false);
    }
  };

  const handleCharge = async () => {
    // Validation checks
    if (!userId) {
      setMessage("User not logged in");
      return;
    }
    
    if (!selectedCardId) {
      setMessage("⚠️ Please select a card first");
      return;
    }
    
    if (!amount || amount <= 0) {
      setMessage(" Invalid order amount");
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
      
      // Step 1: Charge the card
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

      
      if (data.success || res.status === 200) {
        setMessage("Payment Successful - Creating Order...");
        setResult(data);
        
        // Step 2: Create order in database after successful payment
        try {
          // Get orderData from location.state (passed from billingHistory)
          const orderDataFromState = location.state?.orderData;
          
          console.log("Location state:", location.state);
          console.log("orderDataFromState:", orderDataFromState);
          console.log("order object:", order);
          
          // Prepare delivery address if available
          let deliveryAddress = {};
          if (orderDataFromState?.deliveryInfo) {
            // Valid districts for Sri Lanka
            const validDistricts = [
              'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
              'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
              'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
              'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
              'Moneragala', 'Ratnapura', 'Kegalle'
            ];
            
            const district = orderDataFromState.deliveryInfo.district;
            const validDistrict = validDistricts.includes(district) ? district : 'Colombo';
            
            // Ensure postal code is exactly 5 digits
            let postalCode = orderDataFromState.deliveryInfo.postalCode?.toString() || '';
            postalCode = postalCode.replace(/\D/g, ''); // Remove non-digits
            postalCode = postalCode.padStart(5, '0').slice(-5); // Ensure exactly 5 digits
            
            deliveryAddress = {
              recipientName: `${orderDataFromState.deliveryInfo.firstName} ${orderDataFromState.deliveryInfo.lastName}`.trim(),
              phone: orderDataFromState.deliveryInfo.phone.replace(/\s+/g, ''),
              street: (orderDataFromState.deliveryInfo.addressLine1 + (orderDataFromState.deliveryInfo.addressLine2 ? ', ' + orderDataFromState.deliveryInfo.addressLine2 : '')).trim(),
              city: orderDataFromState.deliveryInfo.city.trim(),
              district: validDistrict,
              postalCode: postalCode,
              specialInstructions: orderDataFromState.deliveryInfo.deliveryInstructions || ''
            };
            
            // Ensure street address meets minimum length requirement
            if (deliveryAddress.street.length < 5) {
              deliveryAddress.street = deliveryAddress.street + ', ' + deliveryAddress.city;
            }
          } else if (order.deliveryInfo) {
            // Fallback to order object
            deliveryAddress = {
              recipientName: `${order.buyer.firstName} ${order.buyer.lastName}`.trim(),
              phone: order.buyer.phone,
              street: order.buyer.address,
              city: order.buyer.city,
              district: order.deliveryInfo?.district || 'Colombo',
              postalCode: order.deliveryInfo?.postalCode || '00000',
              specialInstructions: ''
            };
          }
          
          // Validate we have items
          let items = [];
          if (orderDataFromState?.items && orderDataFromState.items.length > 0) {
            items = orderDataFromState.items.map(item => ({
              productId: item.productId,
              quantity: parseFloat(item.quantity) || 1
            }));
          } else if (order.summary?.items && order.summary.items.length > 0) {
            items = order.summary.items.map(item => ({
              productId: item.productId || item._id,
              quantity: parseFloat(item.quantity) || 1,
            }));
          } else {
            throw new Error("No items found in order data");
          }
          
          // Validate items have valid productIds and quantities
          for (const item of items) {
            if (!item.productId || !/^[a-fA-F0-9]{24}$/.test(item.productId)) {
              throw new Error(`Invalid product ID: ${item.productId}`);
            }
            if (!item.quantity || item.quantity < 0.1) {
              throw new Error(`Invalid quantity: ${item.quantity}`);
            }
          }
          
          // Validate delivery address
          if (!deliveryAddress.recipientName || deliveryAddress.recipientName.trim().length < 2) {
            throw new Error("Recipient name is required and must be at least 2 characters");
          }
          if (!deliveryAddress.phone || !/^\+?[1-9]\d{1,14}$/.test(deliveryAddress.phone.replace(/\s+/g, ''))) {
            throw new Error("Valid phone number is required");
          }
          if (!deliveryAddress.street || deliveryAddress.street.trim().length < 5) {
            throw new Error("Street address is required and must be at least 5 characters");
          }
          if (!deliveryAddress.city || deliveryAddress.city.trim().length < 2) {
            throw new Error("City is required and must be at least 2 characters");
          }
          if (!deliveryAddress.district) {
            deliveryAddress.district = 'Colombo'; // Default district
          }
          if (!deliveryAddress.postalCode || !/^\d{5}$/.test(deliveryAddress.postalCode)) {
            deliveryAddress.postalCode = '00000'; // Default postal code
          }
          
          const orderPayload = {
            items,
            deliveryAddress,
            paymentMethod: 'saved_card',
            paymentStatus: 'paid',
            transactionId: data.data?.payment_id || orderId,
            orderId: orderId, // Store PayHere order_id for refunds
            notes: deliveryAddress.specialInstructions || ''
          };
          
          console.log("Final order payload being sent:", JSON.stringify(orderPayload, null, 2));
          console.log("Items validation:", items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            productIdValid: /^[a-fA-F0-9]{24}$/.test(item.productId),
            quantityValid: item.quantity >= 0.1
          })));
          
          const orderRes = await api.post("/orders", orderPayload);
          const createdOrder = orderRes.data.data?.order || orderRes.data.order;
          console.log("Order created successfully:", createdOrder);
          
          // Step 3: Clear cart and navigate to success
          try {
            await api.delete("/cart");
            console.log("Cart cleared successfully");
          } catch (cartErr) {
            console.warn("Failed to clear cart:", cartErr);
          }
          
          navigate("/success", { 
            state: { 
              orderId: data.data?.payment_id || orderId,
              order: {
                ...order,
                orderNumber: createdOrder.orderNumber,
                id: createdOrder._id,
                summary: {
                  ...order.summary,
                  total: createdOrder.total
                }
              },
              transactionDetails: {
                paymentMethod: 'Saved Card',
                transactionId: data.data?.payment_id || orderId,
                status: 'completed'
              }
            } 
          });
        } catch (orderErr) {
          console.error("Error creating order:", {
            message: orderErr.message,
            response: orderErr.response?.data,
            status: orderErr.response?.status,
            fullError: orderErr
          });
          
          let errorDetails = orderErr.message;
          if (orderErr.response?.data) {
            const errorData = orderErr.response.data;
            if (errorData.message) {
              errorDetails = errorData.message;
            }
            if (errorData.errors && Array.isArray(errorData.errors)) {
              errorDetails += ": " + errorData.errors.map(err => 
                typeof err === 'string' ? err : `${err.field || 'Unknown'}: ${err.message || 'Invalid'}`
              ).join(', ');
            } else if (errorData.details && Array.isArray(errorData.details)) {
              errorDetails += ": " + errorData.details.map(detail => 
                `${detail.field}: ${detail.message}`
              ).join(', ');
            }
          }
          
          setMessage(`⚠️ Payment successful (ID: ${data.data?.payment_id || orderId}), but order creation failed: ${errorDetails}. Please contact support.`);
        }
      } else {
        setMessage("⚠️ Payment Failed");
        setResult(data);
      }
    } catch (err) {
      console.error("Charge error:", err);
      setMessage("❌ Error occurred while charging");
    } finally {
      setIsCharging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/cart">Cart</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/checkout/delivery">Delivery</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/PaymentPage">Payment</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Saved Cards</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Payment Methods
        </Button>

        {/* Header */}
        <div className="mb-8">
          <H1 className="text-gray-900 mb-2">Charge Saved Card</H1>
          <P className="text-gray-600">Process payment using your preapproved card</P>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChargeSummary summary={order.summary} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                Select Saved Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose card to charge
                </label>

                {isLoadingCards ? (
                  <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                    <Loader className="w-4 h-4 mr-2 animate-spin text-emerald-500" />
                    <span className="text-gray-600">Loading saved cards...</span>
                  </div>
                ) : savedCards.length > 0 ? (
                  <div className="space-y-3">
                    {savedCards.map((card) => (
                      <div
                        key={card.cardId}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedCardId === card.cardId
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:border-emerald-300"
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
                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
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

              <Alert className="border-emerald-200 bg-emerald-50">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertDescription>
                  <h4 className="font-semibold text-emerald-800">Secure Payment</h4>
                  <p className="text-xs text-emerald-600 mt-1">
                    Your payment is protected by 256-bit SSL encryption
                  </p>
                </AlertDescription>
              </Alert>

              {message && (
                <Alert 
                  variant={message.startsWith("❌") ? "destructive" : "default"}
                  className={
                    message.startsWith("✅") 
                      ? "border-emerald-200 bg-emerald-50" 
                      : message.startsWith("⚠️")
                      ? "border-yellow-200 bg-yellow-50"
                      : ""
                  }
                >
                  <AlertDescription>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleCharge}
                disabled={isCharging || savedCards.length === 0}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                size="lg"
              >
                {isCharging ? (
                  <>
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Charging...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Charge Card
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChargePage;
