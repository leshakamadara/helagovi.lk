import express from "express";
import crypto from "crypto";
import axios from "axios";
import SavedCard from "../models/SavedCard.js";



const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || "1232059";
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || "MjE3Njk1NDAyNTEwNjY0Mjc4MzIzNDQxNTIwMTYzNTk4MTk2NjA2";
const PAYHERE_APP_ID = process.env.PAYHERE_APP_ID || "4OVyIPKMqpM4JFnJsgjrNJ3D0";
const PAYHERE_APP_SECRET = process.env.PAYHERE_APP_SECRET || "8m37JU8FMHr48febsV1al94ZJ45SNZyPX8LTWkYlVIrC";
// Use frontend domain for PayHere domain validation
const PUBLIC_URL = process.env.PUBLIC_URL || "https://www.helagovi.lk";
// PayHere webhooks go to frontend proxy (no subdomain restrictions)
const BACKEND_WEBHOOK_URL = process.env.BACKEND_WEBHOOK_URL || "https://www.helagovi.lk";
const PAYHERE_BASE_URL = "https://sandbox.payhere.lk";

function verifyMd5(params) {
  const localMd5 = crypto
    .createHash("md5")
    .update(
      params.merchant_id +
        params.order_id +
        params.payhere_amount +
        params.payhere_currency +
        params.status_code +
        crypto.createHash("md5").update(MERCHANT_SECRET).digest("hex").toUpperCase()
    )
    .digest("hex")
    .toUpperCase();
  return localMd5 === params.md5sig;
}

export async function preapprove(req, res) {
  try {
    const { userId, first_name, last_name, email, phone, address, city } = req.body;
    if (!userId) {
      console.error("Missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }
    const currency = "LKR";
    const amount = "35.00";
    const items = "saving card for future payments";
    const order_id = "";
    const hash = crypto
      .createHash("md5")
      .update(
        MERCHANT_ID +
          order_id +
          amount +
          currency +
          crypto.createHash("md5").update(MERCHANT_SECRET).digest("hex").toUpperCase()
      )
      .digest("hex")
      .toUpperCase();
    const params = {
      merchant_id: MERCHANT_ID,
      return_url: `${PUBLIC_URL}/card-preapproval-success`,
      cancel_url: `${PUBLIC_URL}/card-preapproval-cancel`,
      // ✅ For sandbox, PayHere can POST to any URL. Use your actual backend URL
      notify_url: `https://helagovi-lk.onrender.com/api/payments/notify`,
      order_id,
      items,
      currency,
      amount,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      country: "Sri Lanka",
      hash,
      custom_1: userId,
    };
    
    console.log("Preapproval params:", {
      merchant_id: params.merchant_id,
      return_url: params.return_url,
      cancel_url: params.cancel_url,
      notify_url: params.notify_url,
      userId: params.custom_1
    });
    
    res.json({ url: "https://sandbox.payhere.lk/pay/preapprove", params });
  } catch (err) {
    console.error("Preapprove error:", err.message);
    res.status(500).json({ message: "Preapproval init failed" });
  }
}

export async function notify(req, res) {
  const body = req.body;
  console.log("=" .repeat(60));
  console.log("📥 PayHere Notify Webhook Received");
  console.log("=" .repeat(60));
  console.log("Request body:", JSON.stringify(body, null, 2));
  
  try {
    const verified = verifyMd5(body);
    console.log("🔐 MD5 Verification:", verified ? "✅ PASSED" : "❌ FAILED");
    
    if (!verified) {
      console.error("⚠️  MD5 verification failed!");
      return res.sendStatus(200); // Still return 200 to PayHere
    }
    
    console.log("Status Code:", body.status_code);
    console.log("Customer Token:", body.customer_token);
    console.log("User ID (custom_1):", body.custom_1);
    
    if (verified && body.status_code === "2" && body.customer_token && body.custom_1) {
      console.log("✅ All conditions met, proceeding to save card...");
      
      let savedCard = await SavedCard.findOne({ token: body.customer_token });
      
      if (savedCard) {
        console.log("ℹ️  Card already exists in database:", savedCard._id);
      } else {
        console.log("💾 Saving new card to database...");
        
        let expiry_month = null;
        let expiry_year = null;
        if (body.card_expiry && body.card_expiry.includes("/")) {
          const parts = body.card_expiry.split("/");
          if (parts.length === 2) {
            expiry_month = parts[0];
            expiry_year = parts[1];
          }
        }
        
        const cardData = {
          userId: body.custom_1,
          token: body.customer_token,
          orderId: body.order_id,
          card_holder_name: body.card_holder_name || "",
          card_no: body.card_no || "",
          method: body.method || "",
          expiry_month: expiry_month || null,
          expiry_year: expiry_year || null,
        };
        
        console.log("Card data to save:", cardData);
        
        savedCard = await SavedCard.create(cardData);
        console.log("✅ Card saved successfully!");
        console.log("Saved card ID:", savedCard._id);
        console.log("User ID:", savedCard.userId);
        console.log("Token:", savedCard.token.substring(0, 10) + "...");
      }
    } else {
      console.log("⚠️  Conditions not met for saving card:");
      console.log("  - Verified:", verified);
      console.log("  - Status Code:", body.status_code, "(expected: 2)");
      console.log("  - Customer Token:", body.customer_token ? "Present" : "Missing");
      console.log("  - User ID:", body.custom_1 ? "Present" : "Missing");
    }
    
    console.log("=" .repeat(60));
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Notify error:", err.message);
    console.error("Stack trace:", err.stack);
    console.log("=" .repeat(60));
    res.sendStatus(500);
  }
}

export async function charge(req, res) {
  try {
    const { userId, cardId, order_id, items, amount, currency = "LKR" } = req.body;
    if (!userId || !cardId || !order_id || !amount || !items) {
      console.error("Missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }
    const savedCard = await SavedCard.findOne({ _id: cardId, userId });
    if (!savedCard) {
      console.error("No preapproved token found");
      return res.status(404).json({ message: "No preapproved token found" });
    }
    const auth = Buffer.from(`${PAYHERE_APP_ID}:${PAYHERE_APP_SECRET}`).toString("base64");
    
    console.log("Requesting PayHere access token...");
    const tokenRes = await axios.post(
      "https://sandbox.payhere.lk/merchant/v1/oauth/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    
    const accessToken = tokenRes.data.access_token;
    console.log("Access token received:", {
      token_type: tokenRes.data.token_type,
      expires_in: tokenRes.data.expires_in,
      scope: tokenRes.data.scope
    });
    const body = {
      type: "PAYMENT",
      order_id,
      items,
      currency,
      amount,
      customer_token: savedCard.token,
      custom_1: userId,
      // ✅ Use the existing notify endpoint (works for both preapproval and charging)
      notify_url: `https://helagovi-lk.onrender.com/api/payments/notify`,
      itemList: [
        {
          name: items,
          number: order_id,
          quantity: 1,
          unit_amount: amount,
        },
      ],
    };
    console.log("Calling PayHere charge API with body:", {
      type: body.type,
      order_id: body.order_id,
      amount: body.amount,
      currency: body.currency,
      customer_token: body.customer_token.substring(0, 10) + "..."
    });
    
    // ✅ For sandbox, don't send custom Origin/Referer headers
    // PayHere sandbox doesn't check domain whitelist
    const response = await axios.post(
      "https://sandbox.payhere.lk/merchant/v1/payment/charge",
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
      }
    );
    const data = response.data;
    console.log("PayHere charge response:", data);
    
    if (data.status === 1 && data.data.status_code === 2) {
      console.log("✅ Payment successful", data.data);
      res.json({ success: true, message: "Payment successful", data: data.data });
    } else {
      console.error("⚠️ Payment failed", data);
      res.status(400).json({ success: false, message: "Payment failed", data });
    }
  } catch (err) {
    console.error("❌ Charging error:", {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data
    });
    
    // Return detailed error for debugging
    const errorMessage = err.response?.data?.msg || err.response?.data?.message || err.message;
    res.status(500).json({ 
      success: false,
      message: "Charging failed", 
      error: errorMessage,
      details: err.response?.data 
    });
  }
}

export async function createPayment(req, res) {
  try {
    if (!MERCHANT_ID || !MERCHANT_SECRET) {
      console.error("Merchant credentials not set");
      return res.status(500).json({ error: "Merchant credentials not set" });
    }
    const { order_id, amount, currency } = req.body;
    if (!order_id || !amount || !currency) {
      console.error("Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }
    const formattedAmount = Number(amount).toFixed(2);
    const md5Secret = crypto.createHash("md5").update(MERCHANT_SECRET).digest("hex").toUpperCase();
    const hashString = MERCHANT_ID + order_id + formattedAmount + currency.toUpperCase() + md5Secret;
    const hash = crypto.createHash("md5").update(hashString).digest("hex").toUpperCase();
    return res.json({
      merchant_id: MERCHANT_ID,
      order_id,
      amount: formattedAmount,
      currency,
      hash,
    });
  } catch (err) {
    console.error("Error generating payment hash:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

const getAuthorizationCode = () => {
  return Buffer.from(`${PAYHERE_APP_ID}:${PAYHERE_APP_SECRET}`).toString("base64");
};

const getAccessToken = async () => {
  const url = `${PAYHERE_BASE_URL}/merchant/v1/oauth/token`;
  const response = await axios.post(
    url,
    qs.stringify({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization: `Basic ${getAuthorizationCode()}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data.access_token;
};

const getPaymentDetails = async (accessToken, order_id) => {
  const url = `${PAYHERE_BASE_URL}/merchant/v1/payment/search?order_id=${order_id}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

const refundPayment = async (accessToken, payment_id, description) => {
  const url = `${PAYHERE_BASE_URL}/merchant/v1/payment/refund`;
  const response = await axios.post(
    url,
    { payment_id, description },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};




export async function processRefund(req, res) {
  const { order_id, description } = req.body;
  if (!order_id || !description) {
    console.error("Missing order_id or description");
    return res.status(400).json({ error: "Missing order_id or description" });
  }
  try {
    const accessToken = await getAccessToken();
    const details = await getPaymentDetails(accessToken, order_id);
    if (!details.data || details.data.length === 0) {
      console.error("No payment found for order_id");
      return res.status(404).json({ error: "No payment found for order_id" });
    }
    const payment_id = details.data[0].payment_id;
    const refundResult = await refundPayment(accessToken, payment_id, description);
    console.log("Refund processed successfully", refundResult);
    res.status(200).json({
      message: "Refund processed successfully",
      refundResult,
    });
  } catch (error) {
    console.error("Refund failed:", error.response?.data || error.message);
    res.status(500).json({
      error: "Refund failed",
      details: error.response?.data || error.message,
    });
  }
}

export async function getPayHistory(req, res) {
  const { order_id } = req.params;
  if (!order_id) {
    console.error("Missing order_id");
    return res.status(400).json({ error: "Missing order_id" });
  }
  try {
    const accessToken = await getAccessToken();
    const details = await getPaymentDetails(accessToken, order_id);
    if (!details.data || details.data.length === 0) {
      console.error("No payment found for order_id");
      return res.status(404).json({ error: "No payment found for order_id" });
    }
    const payment = details.data[0];
    const amountDetail = payment.amount_detail || {};
    const responseData = {
      payment_id: payment.payment_id,
      date: payment.date,
      status: payment.status,
      amount_detail: {
        currency: amountDetail.currency || payment.currency || "LKR",
        gross: amountDetail.gross,
        fee: amountDetail.fee,
        net: amountDetail.net,
        exchange_rate: amountDetail.exchange_rate || 1,
        exchange_from: amountDetail.exchange_from || amountDetail.currency || payment.currency || "LKR",
        exchange_to: amountDetail.exchange_to || amountDetail.currency || payment.currency || "LKR",
      },
    };
    console.log("Transaction history fetched:", responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Transaction history fetch failed:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch transaction history",
      details: error.response?.data || error.message,
    });
  }
}