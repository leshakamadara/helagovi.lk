import React, { useEffect, useState } from "react";
import axios from "axios";

const TransactionHistoryPage = () => {
  const order_id = "ORD-1759176586564";
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/payments/payhistory/${order_id}`
        );
        setTransaction(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [order_id]);

  const formatCurrency = (amount, currency = "LKR") =>
    amount
      ? new Intl.NumberFormat("en-LK", {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
        }).format(amount)
      : "-";

  const generatePDF = () => {
    if (!transaction) return;

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt-${transaction.payment_id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; background: white; }
          .receipt { max-width: 600px; margin: 0 auto; border: 2px solid #16a34a; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { font-size: 28px; margin-bottom: 8px; }
          .header p { font-size: 14px; opacity: 0.9; }
          .content { padding: 30px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: bold; color: #16a34a; margin-bottom: 15px; border-bottom: 2px solid #16a34a; padding-bottom: 8px; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 15px; margin-bottom: 8px; background: #f0fdf4; border-radius: 6px; }
          .detail-label { font-weight: 600; color: #15803d; }
          .detail-value { color: #166534; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
          .status-received { background: #16a34a; color: white; }
          .status-pending { background: #fbbf24; color: #78350f; }
          .status-failed { background: #dc2626; color: white; }
          .amount-summary { background: #f0fdf4; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .amount-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 15px; }
          .amount-row.total { border-top: 2px solid #16a34a; margin-top: 10px; padding-top: 15px; font-size: 18px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; background: #f0fdf4; color: #15803d; font-size: 12px; border-top: 1px solid #bbf7d0; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>Payment Receipt</h1>
            <p>Transaction Confirmation</p>
          </div>
          <div class="content">
            <div class="section">
              <div class="section-title">Transaction Details</div>
              <div class="detail-row">
                <span class="detail-label">Payment ID:</span>
                <span class="detail-value">${transaction.payment_id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">${order_id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${transaction.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="status-badge status-${transaction.status.toLowerCase()}">${transaction.status}</span>
              </div>
            </div>
            <div class="section">
              <div class="section-title">Amount Details</div>
              <div class="amount-summary">
                <div class="amount-row">
                  <span>Total Paid:</span>
                  <span>${formatCurrency(transaction.amount_detail?.gross, transaction.amount_detail?.currency)}</span>
                </div>
                <div class="amount-row">
                  <span>Processing Fee:</span>
                  <span>${formatCurrency(transaction.amount_detail?.fee, transaction.amount_detail?.currency)}</span>
                </div>
                <div class="amount-row total">
                  <span>Net Received:</span>
                  <span>${formatCurrency(transaction.amount_detail?.net, transaction.amount_detail?.currency)}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>This is a computer-generated receipt. No signature required.</p>
            <p style="margin-top: 10px;">Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${transaction.payment_id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-success"></span>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex justify-center items-center p-4">
        <div className="alert alert-error max-w-md shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-1">Transaction History</h1>
          <p className="text-sm text-green-600">View your payment details</p>
        </div>

        {/* Transaction Card */}
        <div className="card bg-white shadow-xl border-2 border-green-100">
          <div className="card-body p-5">
            {/* Title with Icon */}
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="card-title text-xl text-green-800">Transaction Summary</h2>
            </div>

            {transaction ? (
              <>
                {/* Transaction Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-semibold text-green-800">Payment ID:</span>
                    <span className="badge badge-md bg-green-600 text-white border-none">
                      {transaction.payment_id}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white border border-green-100 rounded-lg">
                    <span className="text-sm font-semibold text-green-800">Date:</span>
                    <span className="text-sm text-green-700">{transaction.date}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white border border-green-100 rounded-lg">
                    <span className="text-sm font-semibold text-green-800">Status:</span>
                    <span
                      className={`badge badge-md ${
                        transaction.status === "RECEIVED"
                          ? "bg-green-600 text-white border-none"
                          : transaction.status === "PENDING"
                          ? "badge-warning"
                          : "badge-error"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="divider text-sm text-green-700 font-semibold my-3">Amount Details</div>

                {/* Amount Breakdown */}
                <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100 space-y-3">
                  <div className="flex justify-between items-center bg-green-600 text-white p-4 rounded-lg shadow-md">
                    <span className="font-bold text-lg">Total Paid:</span>
                    <span className="text-2xl font-bold">
                      {formatCurrency(
                        transaction.amount_detail?.gross,
                        transaction.amount_detail?.currency
                      )}
                    </span>
                  </div>

                  <div className="divider my-2"></div>

                  <div className="flex justify-between items-center p-3 bg-white border border-green-200 rounded-lg">
                    <span className="text-sm font-semibold text-green-800">Net Received:</span>
                    <span className="text-lg font-bold text-green-700">
                      {formatCurrency(
                        transaction.amount_detail?.net,
                        transaction.amount_detail?.currency
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white border border-green-200 rounded-lg">
                    <span className="text-sm font-semibold text-green-800">Processing Fee:</span>
                    <span className="text-lg text-green-600">
                      {formatCurrency(
                        transaction.amount_detail?.fee,
                        transaction.amount_detail?.currency
                      )}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="card-actions justify-center mt-5">
                  <button 
                    onClick={generatePDF}
                    className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none px-6"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Receipt
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="text-green-600">No transaction found.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryPage;