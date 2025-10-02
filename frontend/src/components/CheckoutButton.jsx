import React, { useEffect, useState } from "react";

const CheckoutButton = ({ onClick }) => {
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    if (!document.getElementById("payhere-sdk")) {
      const script = document.createElement("script");
      script.id = "payhere-sdk";
      script.src = "https://sandbox.payhere.lk/lib/payhere.js"; // ✅ Use sandbox for testing
      script.async = true;
      script.onload = () => setSdkLoaded(true); // ✅ Mark SDK loaded
      document.body.appendChild(script);

      return () => document.body.removeChild(script);
    } else {
      setSdkLoaded(true); // Already loaded
    }
  }, []);

  const handleClick = () => {
    if (!sdkLoaded) {
      alert("Payment SDK is still loading, please wait...");
      return;
    }
    onClick(); // Call parent handler (tokenize/charge)
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg w-full transition-colors"
    >
      Pay with PayHere
    </button>
  );
};

export default CheckoutButton;
