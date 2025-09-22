import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import jsPDF from "jspdf";

const PaymentSuccessPage = () => {
  const [transactionId, setTransactionId] = useState("");

  const orderSummary = {
    subtotal: 299.99,
    tax: 24.0,
    total: 323.99,
    items: [{ name: "Premium Subscription", price: 299.99 }],
  };

  useEffect(() => {
    // Generate a fake transaction ID on load
    setTransactionId(`TXN-${Date.now()}`);
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Invoice", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Transaction ID: ${transactionId}`, 20, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);

    let yOffset = 70;
    orderSummary.items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name}`, 20, yOffset);
      doc.text(`$${item.price}`, 160, yOffset, { align: "right" });
      yOffset += 10;
    });

    doc.text(`Subtotal: $${orderSummary.subtotal}`, 160, yOffset, { align: "right" });
    yOffset += 10;
    doc.text(`Tax: $${orderSummary.tax}`, 160, yOffset, { align: "right" });
    yOffset += 10;
    doc.text(`Total: $${orderSummary.total}`, 160, yOffset, { align: "right" });

    doc.save(`Invoice-${transactionId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-success-content" />
          </div>

          {/* Success Message */}
          <h2 className="card-title text-2xl mb-2">Payment Successful!</h2>
          <p className="text-base-content/70 mb-6">
            Your transaction has been processed successfully.
          </p>

          {/* Transaction ID */}
          <div className="bg-base-200 rounded-lg p-4 mb-6 w-full">
            <p className="text-sm text-base-content/60">Transaction ID</p>
            <p className="font-mono text-base-content">{transactionId}</p>
          </div>

          {/* Order Summary */}
          <div className="card bg-base-100 shadow rounded-lg p-4 w-full mb-6">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            {orderSummary.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-base-content/70">{item.name}</span>
                <span className="font-medium">${item.price}</span>
              </div>
            ))}
            <div className="divider"></div>
            <div className="flex justify-between text-sm">
              <span className="text-base-content/70">Subtotal</span>
              <span>${orderSummary.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-base-content/70">Tax</span>
              <span>${orderSummary.tax}</span>
            </div>
            <div className="divider"></div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-success">${orderSummary.total}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="card-actions w-full flex flex-col gap-2">
            <button
              className="btn btn-primary w-full"
              onClick={() => window.location.href = "/"}
            >
              Continue
            </button>
            <button
              className="btn btn-outline w-full"
              onClick={generatePDF}
            >
              Download Invoice (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
