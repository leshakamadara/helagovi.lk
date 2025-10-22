import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  },
  method: {
    type: String,
    default: "bank_transfer"
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountHolderName: String,
    branchCode: String
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  transactionId: String,
  failureReason: String,
  estimatedCompletion: Date
});

export default mongoose.model("Withdrawal", withdrawalSchema);
