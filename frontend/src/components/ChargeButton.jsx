import React, { useState } from "react";
import axios from "axios";

function ChargeButton({ userId, amount, items }) {
  const [status, setStatus] = useState("");

  const handleCharge = async () => {
    setStatus("Processing...");
    try {
      const res = await axios.post("/api/payhere/charge", {
        userId,
        amount,
        order_id: `ORDER_${Date.now()}`,
        items
      });

      if (res.data.status_code === 2) {
        setStatus("Payment successful!");
      } else {
        setStatus("Payment failed: " + res.data.msg);
      }
    } catch (err) {
      console.error(err);
      setStatus("Payment failed, try again.");
    }
  };

  return (
    <div>
      <button onClick={handleCharge}>{status ? status : "Charge Customer"}</button>
    </div>
  );
}

export default ChargeButton;
