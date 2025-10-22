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
  const deliveryCharge = order.summary.deliveryCharge || (order.summary.total - subtotal - order.summary.tax);

  const generatePDF = async () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    // Add logo and header
    try {
      // Add logo
      const logoImg = new Image()
      logoImg.crossOrigin = 'anonymous'
      logoImg.src = 'https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/Logo_uf3yae.png'
      
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve
        logoImg.onerror = reject
      })

      // Add logo to PDF (positioned at top left)
      doc.addImage(logoImg, 'PNG', 20, yPosition, 30, 30)
      
      // Add main heading
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('Helagovi.lk', 60, yPosition + 15)
      
      // Add subtitle
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('Payment Receipt', 60, yPosition + 25)
      
      yPosition += 50
    } catch (error) {
      console.warn('Could not load logo, continuing without it')
      // Add heading without logo
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('Helagovi.lk', 20, yPosition)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('Payment Receipt', 20, yPosition + 10)
      
      yPosition += 30
    }

    // Add transaction information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Transaction Details', 20, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    // Transaction details
    doc.text(`Transaction ID: ${transactionId}`, 20, yPosition)
    yPosition += 8
    doc.text(`Order Number: ${order.orderNumber}`, 20, yPosition)
    yPosition += 8
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition)
    yPosition += 8
    doc.text(`Customer: ${order.buyer.firstName} ${order.buyer.lastName}`, 20, yPosition)
    yPosition += 15

    // Order items
    doc.setFont('helvetica', 'bold')
    doc.text('Order Items', 20, yPosition)
    yPosition += 10

    // Table headers
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Item', 20, yPosition)
    doc.text('Price', 165, yPosition, { align: 'right' })
    yPosition += 5
    
    // Draw line
    doc.line(20, yPosition, pageWidth - 20, yPosition)
    yPosition += 8

    // Items
    doc.setFont('helvetica', 'normal')
    order.summary.items.forEach((item, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = 20
      }

      const itemName = item.name.length > 30 ? item.name.substring(0, 27) + '...' : item.name
      doc.text(itemName, 20, yPosition)
      doc.text(`LKR ${item.price.toFixed(2)}`, 165, yPosition, { align: 'right' })
      
      yPosition += 8
    })

    // Total section
    if (yPosition > pageHeight - 40) {
      doc.addPage()
      yPosition = 20
    }
    
    yPosition += 5
    doc.line(20, yPosition, pageWidth - 20, yPosition)
    yPosition += 10
    
    doc.setFont('helvetica', 'bold')
    doc.text(`Subtotal: LKR ${subtotal.toFixed(2)}`, 165, yPosition, { align: 'right' })
    yPosition += 8
    doc.text(`Delivery Charge: LKR ${deliveryCharge.toFixed(2)}`, 165, yPosition, { align: 'right' })
    yPosition += 8
    doc.text(`Tax: LKR ${order.summary.tax.toFixed(2)}`, 165, yPosition, { align: 'right' })
    yPosition += 8
    doc.line(20, yPosition, pageWidth - 20, yPosition)
    yPosition += 10
    doc.setFontSize(12)
    doc.text(`Total: LKR ${order.summary.total.toFixed(2)}`, 165, yPosition, { align: 'right' })

    // Footer
    const footerY = pageHeight - 20
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Thank you for shopping with Helagovi.lk!', pageWidth / 2, footerY, { align: 'center' })
    doc.text('Payment processed successfully', pageWidth / 2, footerY + 5, { align: 'center' })

    doc.save(`Receipt-${transactionId}.pdf`)
  }


  const navigateToOrders = () => {
    navigate('/my-orders'); 
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
              <span style={{ color: 'black' }}>Delivery Charge</span>
              <span style={{ color: 'black' }}>LKR {deliveryCharge.toFixed(2)}</span>
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
              onClick={navigateToOrders}
            >
              View My Orders
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