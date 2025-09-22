import React, { useState } from "react";
import axios from "axios";

const CardForm = ({ onTokenSaved }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("/api/tokenize-card", {
        card_number: cardNumber,
        cvv,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        cardholder_name: cardholderName,
        saveCard,
        userId: "123", // Replace with logged-in user ID
      });

      const token = res.data.token;
      setMessage("Card tokenized successfully!");
      onTokenSaved(token);

      // Reset form
      setCardNumber("");
      setCvv("");
      setExpiryMonth("");
      setExpiryYear("");
      setCardholderName("");

    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Tokenization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "20px", marginBottom: "20px" }}>
      <h2>Add Card</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Card Number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="CVV"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Expiry Month (MM)"
          value={expiryMonth}
          onChange={(e) => setExpiryMonth(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Expiry Year (YYYY)"
          value={expiryYear}
          onChange={(e) => setExpiryYear(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Cardholder Name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
        />
        <label>
          <input
            type="checkbox"
            checked={saveCard}
            onChange={() => setSaveCard(!saveCard)}
          />{" "}
          Save card for future payments
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Add Card"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CardForm;
