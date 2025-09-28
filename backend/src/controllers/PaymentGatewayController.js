import express from "express";
import crypto from "crypto";
import axios from "axios";
import SavedCard from "../models/SavedCard.js";


const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || "1232059";
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || "MTUzNjMyNzg3NDMxNDAzNjE3MjgxMDU0MjM1MTI0Mzk2OTQzMDMw";

const PAYHERE_APP_ID="4OVyIPKMqpM4JFnJsgjrNJ3D0"
const PAYHERE_APP_SECRET="4OZppi0fGZp4eWcPgTbpva8Rjodd2AgzK8MPnQi7VTfA"
const PUBLIC_URL ="https://coraline-plastery-sheba.ngrok-free.dev";


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
      return_url: `${PUBLIC_URL}/success`,
      cancel_url: `${PUBLIC_URL}/cancel`,
      notify_url: `${PUBLIC_URL}/api/payments/notify`,
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

    res.json({ url: "https://sandbox.payhere.lk/pay/preapprove", params });
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
          card_holder_name: body.card_holder_name || "",
          card_no: body.card_no || "", 
          method: body.method || "", 
          expiry_month: expiry_month || null,
          expiry_year: expiry_year || null,
          
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






export async function charge(req,res){
    {
  try {
    const { userId, cardId, order_id, items, amount, currency = "LKR" } = req.body;
    if (!userId || !cardId || !order_id || !amount || !items) {
      return res.status(400).json({ message: "Missing required fields" });
    }

// 1. Retrieve preapproved token by userId + cardId
  const savedCard = await SavedCard.findOne({ _id: cardId, userId });

    if (!savedCard) return res.status(404).json({ message: "No preapproved token found" });

    // 2. 🔑 Fetch a fresh access token
    const auth = Buffer.from(`${PAYHERE_APP_ID}:${PAYHERE_APP_SECRET}`).toString("base64");
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

    // 3. Build charge body
    const body = {
      type: "PAYMENT",
      order_id,
      items,
      currency,
      amount,
      customer_token: savedCard.token,
      custom_1: userId,
      notify_url: `${PUBLIC_URL}/api/payments/charge-notify`,
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
    const response = await axios.post(
      "https://sandbox.payhere.lk/merchant/v1/payment/charge",
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;
    if (data.status === 1 && data.data.status_code === 2) {
      res.json({ message: "Payment successful ", data: data.data });
    } else {
      res.status(400).json({ message: "Payment failed ", data });
    }
  } catch (err) {
    console.error("Charging error:", err.response?.data || err.message);
    res.status(500).json({ message: "Charging failed", error: err.response?.data || err.message });
  }
}
}



export async function createPayment(req, res) {
  try {
    if (!MERCHANT_ID || !MERCHANT_SECRET) {
      console.error(" Merchant credentials not set");
      return res.status(500).json({ error: "Merchant credentials not set" });
    }

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