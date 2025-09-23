
import express from "express";
import crypto from "crypto";
import axios from "axios";
import SavedCard from "../models/SavedCard.js";

const router = express.Router();

// ENV or defaults
const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || "1232059";
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || "MTUzNjMyNzg3NDMxNDAzNjE3MjgxMDU0MjM1MTI0Mzk2OTQzMDMw";
const PAYHERE_ACCESS_TOKEN = process.env.PAYHERE_ACCESS_TOKEN || "NE9WeUlQS01xcE00SkZuSnNnanJOSjNEMDo0T1pwcGkwZkdacDRlV2NQZ1RicHZhOFJqb2RkMkFneks4TVBuUWk3VlRmQQ==";

const PUBLIC_URL ="https://https://coraline-plastery-sheba.ngrok-free.dev.ngrok.io"; // ngrok public URL

// -----------------------------
// Helper: Verify MD5 Signature
// -----------------------------
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

// -----------------------------
// 1️⃣ Preapproval Route
// -----------------------------
router.post("/preapprove", async (req, res) => {
  try {
    const { userId, order_id, first_name, last_name, email, phone, address, city } = req.body;
    if (!userId || !order_id || !first_name || !last_name || !email || !phone || !address || !city) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const currency = "LKR";
    const amount = "10.00"; // Preapproval amount
    const items = "Preapproval for future payments";

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
      notify_url: `${PUBLIC_URL}/api/pay/notify`,
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
});

// -----------------------------
// 2️⃣ Notify Route
// -----------------------------
router.post("/notify", express.urlencoded({ extended: true }), async (req, res) => {
  const body = req.body;
  console.log("🔔 PayHere notify:", body);

  try {
    // Verify MD5 signature
    const verified = verifyMd5(body);

    if (verified && body.status_code === "2" && body.customer_token && body.custom_1) {
      // Save token to DB
      const saved = await SavedCard.create({
        userId: body.custom_1,
        token: body.customer_token,
        orderId: body.order_id
      });
      console.log("✅ Token saved successfully:", saved);
    } else {
      console.warn("⚠️ Verification failed or not successful:", body);
    }

    res.sendStatus(200); // Always respond 200
  } catch (err) {
    console.error("Notify error:", err.message);
    res.sendStatus(500);
  }
});

// -----------------------------
// 3️⃣ Charge Route
// -----------------------------
router.post("/charge", async (req, res) => {
  try {
    const { userId, order_id, items, amount, currency = "LKR" } = req.body;
    if (!userId || !order_id || !amount || !items) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Retrieve preapproved token
    const savedCard = await SavedCard.findOne({ userId });
    if (!savedCard) return res.status(404).json({ message: "No preapproved token found" });

    const body = {
      type: "PAYMENT",
      order_id,
      items,
      currency,
      amount,
      customer_token: savedCard.token,
      custom_1: userId,
      notify_url: `${PUBLIC_URL}/api/pay/charge-notify`,
      itemList: [{ name: items, number: order_id, quantity: 1, unit_amount: amount }]
    };

    const response = await axios.post(
      "https://sandbox.payhere.lk/merchant/v1/payment/charge",
      body,
      { headers: { Authorization: `Bearer ${PAYHERE_ACCESS_TOKEN}`, "Content-Type": "application/json" } }
    );

    const data = response.data;
    if (data.status === 1 && data.data.status_code === 2) {
      res.json({ message: "Payment successful ✅", data: data.data });
    } else {
      res.status(400).json({ message: "Payment failed ⚠️", data });
    }
  } catch (err) {
    console.error("Charging error:", err.response?.data || err.message);
    res.status(500).json({ message: "Charging failed", error: err.response?.data || err.message });
  }
});

export default router;
