import express from "express";
import axios from "axios";
import SavedCard from "../models/SavedCard.js"; // MongoDB model

const router = express.Router();

// ✅ Use env variables or fallback to test keys (Not for production)
const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || "1232059";
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || "MTUzNjMyNzg3NDMxNDAzNjE3MjgxMDU0MjM1MTI0Mzk2OTQzMDMw";
const APP_ID = process.env.PAYHERE_APP_ID || "4OVyIPKMqpM4JFnJsgjrNJ3D0";
const APP_SECRET = process.env.PAYHERE_APP_SECRET || "4OZppi0fGZp4eWcPgTbpva8Rjodd2AgzK8MPnQi7VTfA";

// ✅ Validate configuration at startup
if (!MERCHANT_ID || !MERCHANT_SECRET || !APP_ID || !APP_SECRET) {
  console.error("❌ PayHere credentials not set");
  process.exit(1);
}

// -----------------------------------
// 1️⃣ Tokenize a Card (Save if needed)
// -----------------------------------
router.post("/tokenize-card", async (req, res) => {
  try {
    const { card_number, cvv, expiry_month, expiry_year, cardholder_name, saveCard, userId } = req.body;

    if (!card_number || !cvv || !expiry_month || !expiry_year || !cardholder_name) {
      return res.status(400).json({ message: "Missing card details" });
    }

    // 🚀 Request tokenization from PayHere
    const tokenResponse = await axios.post(
      "https://sandbox.payhere.lk/merchant/v1/payment/token",
      {
        card_no: card_number,
        exp_month: expiry_month,
        exp_year: expiry_year,
        cvc: cvv,
        holder_name: cardholder_name
      },
      {
        headers: {
          "Authorization": "Basic " + Buffer.from(`${MERCHANT_ID}:${MERCHANT_SECRET}`).toString("base64"),
          "Content-Type": "application/json"
        }
      }
    );

    const token = tokenResponse.data?.data?.token;
    if (!token) return res.status(400).json({ message: "Tokenization failed" });

    // 💾 Save token to DB if requested
    if (saveCard && userId) {
      await SavedCard.create({
        userId,
        token,
        cardholderName: cardholder_name,
        last4: card_number.slice(-4)
      });
    }

    res.json({ token });

  } catch (err) {
    console.error("❌ Tokenization error:", err.response?.data || err.message);
    res.status(500).json({ message: "Tokenization failed" });
  }
});

// -----------------------------------
// 2️⃣ Charge a Tokenized Card
// -----------------------------------
router.post("/charge", async (req, res) => {
  try {
    const { token, amount, order_id } = req.body;
    if (!token || !amount || !order_id) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // 🚀 Get Access Token for Charging API
    const authCode = Buffer.from(`${APP_ID}:${APP_SECRET}`).toString("base64");

    const tokenRes = await axios.post(
      "https://sandbox.payhere.lk/merchant/v1/oauth/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${authCode}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const access_token = tokenRes.data?.access_token;
    if (!access_token) return res.status(500).json({ message: "Failed to get access token" });

    // 🚀 Charge the customer
    const chargeRes = await axios.post(
      "https://sandbox.payhere.lk/merchant/v1/payment/charge",
      {
        type: "PAYMENT",
        order_id,
        items: "Test Order",
        currency: "LKR",
        amount,
        customer_token: token
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json"
        }
      }
    );

    const chargeData = chargeRes.data;

    if (chargeData?.status === 1) {
      return res.json({ success: true, data: chargeData.data });
    } else {
      return res.status(400).json({ success: false, message: chargeData?.msg || "Charge failed" });
    }

  } catch (err) {
    console.error("❌ Charge error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Payment failed" });
  }
});

export default router;
