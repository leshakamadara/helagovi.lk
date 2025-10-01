import express from "express";
import crypto from "crypto";
import axios from "axios";
import qs from "querystring";
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
      return_url: `${PUBLIC_URL}/success`,
      cancel_url: `${PUBLIC_URL}/cancel`,
      notify_url: `${BACKEND_WEBHOOK_URL}/api/payments/notify`,
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
    res.json({ url: "https://sandbox.payhere.lk/pay/preapprove", params });
  } catch (err) {
    console.error("Preapprove error:", err.message);
    res.status(500).json({ message: "Preapproval init failed" });
  }
}

export async function notify(req, res) {
  const body = req.body;
  try {
    const verified = verifyMd5(body);
    if (verified && body.status_code === "2" && body.customer_token && body.custom_1) {
      let savedCard = await SavedCard.findOne({ token: body.customer_token });
      if (!savedCard) {
        let expiry_month = null;
        let expiry_year = null;
        if (body.card_expiry && body.card_expiry.includes("/")) {
          const parts = body.card_expiry.split("/");
          if (parts.length === 2) {
            expiry_month = parts[0];
            expiry_year = parts[1];
          }
        }
        savedCard = await SavedCard.create({
          userId: body.custom_1,
          token: body.customer_token,
          orderId: body.order_id,
          card_holder_name: body.card_holder_name || "",
          card_no: body.card_no || "",
          method: body.method || "",
          expiry_month: expiry_month || null,
          expiry_year: expiry_year || null,
        });
        console.log("Saved new card:", savedCard);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("Notify error:", err.message);
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

    // Get the token
    const auth = Buffer.from(`${PAYHERE_APP_ID}:${PAYHERE_APP_SECRET}`).toString("base64");
    
    try {
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
      
      if (!tokenRes.data || !tokenRes.data.access_token) {
        console.error("Failed to get access token:", tokenRes.data);
        return res.status(500).json({ message: "Failed to get PayHere access token" });
      }
      
      const accessToken = tokenRes.data.access_token;
      
      // Prepare the charge request body
      const body = {
        type: "PAYMENT",
        order_id,
        items,
        currency,
        amount: parseFloat(amount),  // Ensure amount is a number
        customer_token: savedCard.token,
        custom_1: userId,
        notify_url: `${BACKEND_WEBHOOK_URL}/api/payments/charge-notify`,
        itemList: [
          {
            name: items,
            number: order_id,
            quantity: 1,
            unit_amount: parseFloat(amount),  // Ensure unit_amount is a number
          },
        ],
      };

      // Use domain without www to match what's likely in PayHere whitelist
      const domain = PUBLIC_URL.replace('www.', '');
      
      console.log("Calling PayHere charge API with payload:", {
        ...body,
        customer_token: "[REDACTED]"  // Don't log the actual token
      });
      
      const response = await axios.post(
        "https://sandbox.payhere.lk/merchant/v1/payment/charge",
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            // Remove Origin and Referer headers as they're causing domain validation issues
            "Host": "sandbox.payhere.lk"
          },
        }
      );
      
      const data = response.data;
      if (data.status === 1 && data.data.status_code === 2) {
        console.log("Payment successful", data.data);
        res.json({ message: "Payment successful", data: data.data });
      } else {
        console.error("Payment failed", data);
        res.status(400).json({ message: "Payment failed", data });
      }
    } catch (apiErr) {
      console.error("API error:", apiErr.response?.data || apiErr.message);
      res.status(500).json({ 
        message: "API error", 
        error: apiErr.response?.data || apiErr.message
      });
    }
  } catch (err) {
    console.error("Charging error:", err.response?.data || err.message);
    res.status(500).json({ message: "Charging failed", error: err.response?.data || err.message });
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
  try {
    const response = await axios.post(
      url,
      "grant_type=client_credentials", // Don't use qs.stringify as it's causing issues
      {
        headers: {
          Authorization: `Basic ${getAuthorizationCode()}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Host": "sandbox.payhere.lk"
        },
      }
    );
    if (!response.data || !response.data.access_token) {
      console.error("Invalid access token response:", response.data);
      throw new Error("Failed to get valid access token");
    }
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error.response?.data || error.message);
    throw error;
  }
};

const getPaymentDetails = async (accessToken, order_id) => {
  const url = `${PAYHERE_BASE_URL}/merchant/v1/payment/search?order_id=${order_id}`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Host": "sandbox.payhere.lk"
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting payment details:", error.response?.data || error.message);
    throw error;
  }
};

const refundPayment = async (accessToken, payment_id, description) => {
  const url = `${PAYHERE_BASE_URL}/merchant/v1/payment/refund`;
  try {
    const response = await axios.post(
      url,
      { payment_id, description },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Host": "sandbox.payhere.lk"
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error processing refund:", error.response?.data || error.message);
    throw error;
  }
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

export async function verifyPayhereConnection(req, res) {
  try {
    console.log("Verifying PayHere connection...");
    console.log("App ID:", PAYHERE_APP_ID ? "Set" : "Not set");
    console.log("App Secret:", PAYHERE_APP_SECRET ? "Set" : "Not set");
    console.log("Merchant ID:", MERCHANT_ID ? "Set" : "Not set");
    console.log("PUBLIC_URL:", PUBLIC_URL);
    console.log("BACKEND_WEBHOOK_URL:", BACKEND_WEBHOOK_URL);
    
    try {
      const accessToken = await getAccessToken();
      
      return res.status(200).json({
        status: "success",
        message: "PayHere connection verified successfully",
        accessToken: accessToken ? "Valid" : "Invalid",
        domains: {
          public_url: PUBLIC_URL,
          webhook_url: BACKEND_WEBHOOK_URL
        },
        info: "If you are experiencing 'Access denied for the domain' errors, ensure the domains are whitelisted in the PayHere merchant dashboard"
      });
    } catch (tokenError) {
      return res.status(401).json({
        status: "error",
        message: "Failed to get PayHere access token",
        error: tokenError.response?.data || tokenError.message,
        suggestion: "Check your PayHere credentials (APP_ID and APP_SECRET)"
      });
    }
  } catch (error) {
    console.error("PayHere verification error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error during PayHere verification",
      error: error.message
    });
  }
}