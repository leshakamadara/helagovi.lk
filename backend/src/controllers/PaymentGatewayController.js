import express from "express";
import crypto from "crypto";
import axios from "axios";
import SavedCard from "../models/SavedCard.js";


const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;

const PAYHERE_APP_ID = process.env.PAYHERE_APP_ID;
const PAYHERE_APP_SECRET = process.env.PAYHERE_APP_SECRET;
const PUBLIC_URL = process.env.PUBLIC_URL || process.env.FRONTEND_URL || "https://www.helagovi.lk";
const BACKEND_WEBHOOK_URL = process.env.BACKEND_WEBHOOK_URL || process.env.BACKEND_URL || "https://helagovi-lk.onrender.com";

// PayHere environment detection - Force sandbox for testing virtual payments
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const FORCE_SANDBOX_FOR_TESTING = process.env.FORCE_PAYHERE_SANDBOX === 'true';
const PAYHERE_BASE_URL = (IS_PRODUCTION && !FORCE_SANDBOX_FOR_TESTING) ? 'https://www.payhere.lk' : 'https://sandbox.payhere.lk';
const PAYHERE_MERCHANT_BASE_URL = (IS_PRODUCTION && !FORCE_SANDBOX_FOR_TESTING) ? 'https://www.payhere.lk/merchant/v1' : 'https://sandbox.payhere.lk/merchant/v1';


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








export async function preapprove(req,res){
  try {
    const { userId, first_name, last_name, email, phone, address, city } = req.body;
    if (!userId ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const currency = "LKR";
    const amount = "35.00"; // Preapproval amount
    const items = "saving card for future payments";
    const order_id="";

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
      custom_1: userId
    };

    res.json({ url: `${PAYHERE_BASE_URL}/pay/preapprove`, params });
  } catch (err) {
    console.error("Preapprove error:", err.message);
    res.status(500).json({ message: "Preapproval init failed" });
  }
};








export async function notify(req, res) {
  const body = req.body;
  console.log("PayHere notify:", body);

  try {
    
    const verified = verifyMd5(body);

    if (verified && body.status_code === "2" && body.customer_token && body.custom_1) {
      
      
      let savedCard = await SavedCard.findOne({ token: body.customer_token });
      if (!savedCard) {

        let expiry_month = null;
        let expiry_year = null;
        if (body.card_expiry && body.card_expiry.includes('/')) {
          const parts = body.card_expiry.split('/'); // ["09", "28"]
          if (parts.length === 2) {
            expiry_month = parts[0]; // "09"
            expiry_year = parts[1];  // "28"
          }
        }

        
            
        
        savedCard = await SavedCard.create({
          userId: body.custom_1,
          token: body.customer_token,
          orderId: body.order_id,
          card_holder_name: body.card_holder_name || "Unknown",
          card_name: `Card ending ${body.card_no ? body.card_no.slice(-4) : Math.random().toString(36).substr(2, 4)}`,
          card_no: body.card_no || "", 
          method: body.method || "", 
          expiry_month: expiry_month || null,
          expiry_year: expiry_year || null,
          card_type: body.card_type || "Unknown"
        });
        console.log("Full card info saved successfully:", savedCard);
      } else {
        console.log("Card token already exists, skipping save");
      }

    } else {
      console.warn(" Verification failed or payment not successful:", body);
    }

    res.sendStatus(200); 
  } catch (err) {
    console.error("Notify error:", err.message);
    res.sendStatus(500);
  }
}






export async function charge(req, res) {
  try {
    console.log("Charge request received:", req.body);
    
    const { userId, cardId, order_id, items, amount, currency = "LKR" } = req.body;
    if (!userId || !cardId || !order_id || !amount || !items) {
      console.error("Missing required fields:", { userId, cardId, order_id, items, amount, currency });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check PayHere credentials
    if (!PAYHERE_APP_ID || !PAYHERE_APP_SECRET) {
      console.error("PayHere credentials not configured");
      return res.status(500).json({ message: "PayHere credentials not configured" });
    }

    console.log("PayHere environment:", {
      PAYHERE_BASE_URL,
      PAYHERE_MERCHANT_BASE_URL,
      PUBLIC_URL,
      BACKEND_WEBHOOK_URL,
      APP_ID_PRESENT: !!PAYHERE_APP_ID,
      APP_SECRET_PRESENT: !!PAYHERE_APP_SECRET,
      MERCHANT_ID_PRESENT: !!MERCHANT_ID
    });

    // 1. Retrieve preapproved token by userId + cardId
    console.log("Looking for saved card:", { cardId, userId });
    const savedCard = await SavedCard.findOne({ _id: cardId, userId });

    if (!savedCard) {
      console.error("No preapproved token found for:", { cardId, userId });
      return res.status(404).json({ message: "No preapproved token found" });
    }

    console.log("Found saved card:", { 
      cardId: savedCard._id, 
      token: savedCard.token,
      cardName: savedCard.card_name 
    });

    // 2. Fetch a fresh access token
    console.log("Fetching PayHere access token...");
    const auth = Buffer.from(`${PAYHERE_APP_ID}:${PAYHERE_APP_SECRET}`).toString("base64");
    
    let accessToken;
    try {
      const tokenRes = await axios.post(
        `${PAYHERE_MERCHANT_BASE_URL}/oauth/token`,
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      
      accessToken = tokenRes.data.access_token;
      console.log("Successfully obtained access token");
      
      if (!accessToken) {
        console.error("No access token received from PayHere");
        return res.status(500).json({ message: "Failed to obtain PayHere access token" });
      }
    } catch (tokenError) {
      console.error("Error fetching PayHere access token:", tokenError.response?.data || tokenError.message);
      return res.status(500).json({ message: "Failed to authenticate with PayHere" });
    }

    // 3. Build charge body
    console.log("Building charge request body...");
    const body = {
      type: "PAYMENT",
      order_id,
      items,
      currency,
      amount,
      customer_token: savedCard.token,
      custom_1: userId,
      notify_url: `${BACKEND_WEBHOOK_URL}/api/payments/charge-notify`,
      itemList: [
        {
          name: items,
          number: order_id,
          quantity: 1,
          unit_amount: amount,
        },
      ],
    };

    // 4. Call PayHere charge API
    console.log("Calling PayHere charge API with body:", JSON.stringify(body, null, 2));
    console.log("PayHere API URL:", `${PAYHERE_MERCHANT_BASE_URL}/payment/charge`);
    console.log("Request headers:", {
      "Authorization": "Bearer [REDACTED]",
      "Content-Type": "application/json"
    });
    
    try {
      const response = await axios.post(
        `${PAYHERE_MERCHANT_BASE_URL}/payment/charge`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
        }
      );

      console.log("PayHere charge response:", response.data);
      const data = response.data;
      
      if (data.status === 1 && data.data.status_code === 2) {
        console.log("Payment successful");
        res.json({ message: "Payment successful", data: data.data });
      } else {
        console.log("Payment failed with response:", data);
        res.status(400).json({ message: "Payment failed", data });
      }
    } catch (chargeError) {
      console.error("PayHere charge API error:", chargeError.response?.data || chargeError.message);
      throw chargeError; // Re-throw to be caught by outer try-catch
    }
  } catch (err) {
    console.error("Charging error:", err.response?.data || err.message);
    res.status(500).json({ message: "Charging failed", error: err.response?.data || err.message });
  }
}



export async function createPayment(req, res) {
  try {
    if (!MERCHANT_ID || !MERCHANT_SECRET) {
      console.error(" Merchant credentials not set");
      return res.status(500).json({ error: "Merchant credentials not set" });
    }

    console.log("PayHere Environment Check:", {
      NODE_ENV: process.env.NODE_ENV,
      IS_PRODUCTION,
      FORCE_SANDBOX_FOR_TESTING,
      MERCHANT_ID: MERCHANT_ID.substring(0, 4) + "***", // Log first 4 chars only for security
      PAYHERE_BASE_URL,
      PAYHERE_MERCHANT_BASE_URL
    });

    const { order_id, amount, currency } = req.body;

    if (!order_id || !amount || !currency) {
      console.warn(" Missing required fields:", { order_id, amount, currency });
      return res.status(400).json({ error: "Missing required fields" });
    }

    const formattedAmount = Number(amount).toFixed(2);

    // Generate MD5 hash from merchant secret
    const md5Secret = crypto
      .createHash("md5")
      .update(MERCHANT_SECRET)
      .digest("hex")
      .toUpperCase();

    const hashString =
      MERCHANT_ID + order_id + formattedAmount + currency.toUpperCase() + md5Secret;

    const hash = crypto.createHash("md5").update(hashString).digest("hex").toUpperCase();

    console.log("Hash generated:", { hash });

    return res.json({
      merchant_id: MERCHANT_ID,
      order_id,
      amount: formattedAmount,
      currency,
      hash,
    });
  } catch (err) {
    console.error(" Error generating payment hash:", err.message);
    return res.status(500).json({ error: err.message });
  }
}