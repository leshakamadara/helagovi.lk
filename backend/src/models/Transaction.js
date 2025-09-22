import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    buyerId: {
      type: String,
      required: true
    },
    orderId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "INR"
    },
    state: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING"
    }
  },
  {
    timestamps: true 
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
