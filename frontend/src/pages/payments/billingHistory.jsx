import React, { useState } from "react";

const PreapprovalPage = () => {
  const [userId, setUserId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");

  const handlePreapprove = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5001/api/pay/preapprove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          order_id: orderId,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          address,
          city,
        }),
      });

      const data = await response.json();
      if (data.url && data.params) {
        // Create and submit form to PayHere
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
        setMessage("Preapproval request failed");
      }
    } catch (err) {
      console.error("Preapproval error:", err);
      setMessage("Error initiating preapproval");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h1>PayHere Automated Preapproval</h1>
      <p>Fill the details below to pre-approve your card for future automated payments.</p>

      <form onSubmit={handlePreapprove} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input placeholder="User ID" value={userId} onChange={e => setUserId(e.target.value)} required />
        <input placeholder="Order ID" value={orderId} onChange={e => setOrderId(e.target.value)} required />
        <input placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        <input placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
        <input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} required />
        <input placeholder="City" value={city} onChange={e => setCity(e.target.value)} required />

        <button type="submit" style={{ padding: "10px 20px", marginTop: 10 }}>Preapprove Card</button>
      </form>

      {message && <p style={{ color: "red", marginTop: 10 }}>{message}</p>}
    </div>
  );
};

export default PreapprovalPage;
