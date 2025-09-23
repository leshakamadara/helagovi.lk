import React, { useState } from "react";

const ChargePage = () => {
  const [userId, setUserId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [items, setItems] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("LKR");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  const handleCharge = async (e) => {
    e.preventDefault();
    setMessage("");
    setResult(null);

    if (!userId || !orderId || !items || !amount) {
      setMessage("Please fill all required fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/pay/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          order_id: orderId,
          items,
          amount: parseFloat(amount),
          currency,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Payment Successful ✅");
        setResult(data.data);
      } else {
        setMessage("Payment Failed ⚠️");
        setResult(data);
      }
    } catch (err) {
      console.error("Charging error:", err);
      setMessage("Error occurred while charging");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h1>Charge Preapproved Customer</h1>
      <p>Enter the details below to charge a preapproved customer using their saved token.</p>

      <form onSubmit={handleCharge} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input placeholder="User ID" value={userId} onChange={e => setUserId(e.target.value)} required />
        <input placeholder="Order ID" value={orderId} onChange={e => setOrderId(e.target.value)} required />
        <input placeholder="Items (description)" value={items} onChange={e => setItems(e.target.value)} required />
        <input placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
        <input placeholder="Currency" value={currency} onChange={e => setCurrency(e.target.value)} />
        <button type="submit" style={{ padding: "10px 20px", marginTop: 10 }}>Charge Customer</button>
      </form>

      {message && <p style={{ color: message.includes("Successful") ? "green" : "red", marginTop: 10 }}>{message}</p>}

      {result && (
        <div style={{ marginTop: 20, background: "#f5f5f5", padding: 10, borderRadius: 4 }}>
          <h3>Payment Response:</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ChargePage;
