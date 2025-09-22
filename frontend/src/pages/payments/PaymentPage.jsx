import React, { useState } from "react";
import CardForm from "../components/CardForm";
import ChargeForm from "../components/ChargeForm";

const PaymentPage = () => {
  const [savedToken, setSavedToken] = useState(null);

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h1>PayHere Automated Payments</h1>

      <CardForm onTokenSaved={setSavedToken} />

      {savedToken && <ChargeForm token={savedToken} />}
    </div>
  );
};

export default PaymentPage;
