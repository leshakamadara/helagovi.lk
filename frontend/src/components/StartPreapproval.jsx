import React, { useState } from "react";
import axios from "axios";
import PreapprovalForm from "./PreapprovalForm";

function StartPreapproval({ user }) {
  const [preapprovalData, setPreapprovalData] = useState(null);
  const [error, setError] = useState("");

  const handlePreapproval = async () => {
    try {
      const res = await axios.post("/api/payhere/preapprove", {
        userId: user.id,
        order_id: `PREAPP_${Date.now()}`,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city
      });

      setPreapprovalData(res.data);
    } catch (err) {
      setError("Failed to start preapproval. Try again.");
      console.error(err);
    }
  };

  if (preapprovalData) {
    return <PreapprovalForm preapprovalData={preapprovalData} />;
  }

  return (
    <div>
      <h2>Preapprove Your Card for Automated Payments</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handlePreapproval}>Start Preapproval</button>
    </div>
  );
}

export default StartPreapproval;
