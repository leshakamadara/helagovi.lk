import express from "express";
import crypto from "crypto";

const router = express.Router();

const MERCHANT_ID ="1232059";
const MERCHANT_SECRET ="MTUzNjMyNzg3NDMxNDAzNjE3MjgxMDU0MjM1MTI0Mzk2OTQzMDMw";

router.post("/create-payment", (req, res) => {
  try {
    if (!MERCHANT_ID || !MERCHANT_SECRET) {
      console.error("❌ Merchant credentials not set");
      return res.status(500).json({ error: "Merchant credentials not set" });
    }

    const { order_id, amount, currency } = req.body;
    if (!order_id || !amount || !currency) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const formattedAmount = Number(amount).toFixed(2);

    const md5Secret = crypto
      .createHash("md5")
      .update(MERCHANT_SECRET)
      .digest("hex")
      .toUpperCase();

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
    console.error("Error generating PayHere hash:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
