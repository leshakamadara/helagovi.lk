import React, { useState } from "react";
import axios from "axios";

const ChargeForm = ({ token }) => {
  const [amount, setAmount] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCharge = async (e) => {
    e.preventDefault();
    if (!token) return setMessage("No card token available");

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("/api/charge", {
        token,
        amount: parseFloat(amount),
        order_id: orderId || `Order_${Date.now()}`,
      });

      if (res.data.success) {
        setMessage(`Payment successful: ${res.data.data.payment_id}`);
      } else {
        setMessage(res.data.message || "Payment failed");
      }

      setAmount("");
      setOrderId("");

    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "20px" }}>
      <h2>Charge Card</h2>
      <form onSubmit={handleCharge}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Order ID (optional)"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Charge Card"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ChargeForm;
