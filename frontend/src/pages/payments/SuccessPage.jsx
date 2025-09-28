import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import jsPDF from "jspdf";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();


  const paymentData = location.state || {};

  
  const {
    order = {
      orderNumber: "N/A",
      summary: { items: [], tax: 0, total: 0 },
      buyer: { firstName: "", lastName: "" },
    },
    transactionDetails = {}, 
  } = paymentData;

  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    
    setTransactionId(`TSN-${Date.now()}`);

    
    if (!order || !order.summary) {
      navigate("/", { replace: true });
    }
  }, [order, navigate]);

 
  const subtotal = order.summary.items.reduce((sum, item) => sum + item.price, 0);

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Invoice", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Transaction ID: ${transactionId}`, 20, 40);
    doc.text(`Order Number: ${order.orderNumber}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);

    let yOffset = 80;
    order.summary.items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name}`, 20, yOffset);
      doc.text(`LKR ${item.price.toFixed(2)}`, 160, yOffset, { align: "right" });
      yOffset += 10;
    });

    doc.text(`Subtotal: LKR ${subtotal.toFixed(2)}`, 160, yOffset, { align: "right" });
    yOffset += 10;
    doc.text(`Tax: LKR ${order.summary.tax.toFixed(2)}`, 160, yOffset, { align: "right" });
    yOffset += 10;
    doc.text(`Total: LKR ${order.summary.total.toFixed(2)}`, 160, yOffset, { align: "right" });

    doc.save(`Invoice-${transactionId}.pdf`);
  };


  const navigateHome = () => {
    if (!window.confirm("Are you sure you want to go Home page?")) return;
    window.location.href = `/homepage`; 
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#D3D3D3' }}>
      <div className="card w-full max-w-md shadow-xl" style={{ backgroundColor: 'white' }}>
        <div className="card-body items-center text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#22c55e' }}>
            <Check className="w-8 h-8 text-white" />
          </div>

          {/* Success Message */}
          <h2 className="card-title text-2xl mb-2" style={{ color: 'black' }}>Payment Successful!</h2>
          <p className="mb-6" style={{ color: 'black' }}>
            Thank you {order.buyer.firstName} {order.buyer.lastName}, your transaction has been processed successfully.
          </p>

          {/* Transaction ID */}
          <div className="rounded-lg p-4 mb-6 w-full" style={{ backgroundColor: '#D3D3D3' }}>
            <p className="text-sm" style={{ color: 'black' }}>Transaction ID</p>
            <p className="font-mono" style={{ color: 'black' }}>{transactionId}</p>
          </div>

          {/* Order Summary */}
          <div className="card shadow rounded-lg p-4 w-full mb-6" style={{ backgroundColor: 'white' }}>
            <h3 className="font-semibold mb-2" style={{ color: 'black' }}>Order Summary</h3>
            {order.summary.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span style={{ color: 'black' }}>{item.name}</span>
                <span className="font-medium" style={{ color: 'black' }}>LKR {item.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="divider"></div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'black' }}>Subtotal</span>
              <span style={{ color: 'black' }}>LKR {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'black' }}>Tax</span>
              <span style={{ color: 'black' }}>LKR {order.summary.tax.toFixed(2)}</span>
            </div>
            <div className="divider"></div>
            <div className="flex justify-between text-lg font-semibold">
              <span style={{ color: 'black' }}>Total</span>
              <span style={{ color: '#22c55e' }}>LKR {order.summary.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="card-actions w-full flex flex-col gap-2">
            <button
              className="btn w-full text-white"
              style={{ backgroundColor: '#22c55e' }}
              onClick={navigateHome}
            >
              Continue
            </button>
            <button
              className="btn w-full"
              style={{ backgroundColor: 'white', color: '#22c55e', border: '1px solid #22c55e' }}
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