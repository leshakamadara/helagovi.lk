import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentId: {
      type: Number,
      required: true,
    },
    status: {
      type: String, // e.g., RECEIVED, REFUNDED, CHARGEBACKED
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    customer: {
      fist_name: String,
      last_name: String,
      email: String,
      phone: String,
      delivery_details: {
        address: String,
        city: String,
        country: String,
      },
    },
    amount_detail: {
      currency: String,
      gross: Number,
      fee: Number,
      net: Number,
      exchange_rate: Number,
      exchange_from: String,
      exchange_to: String,
    },
    payment_method: {
      method: String, // VISA, MasterCard, etc.
      card_customer_name: String,
      card_no: String,
    },
    raw_response: {
      type: Object, // Store full retrieval API response for debugging
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
