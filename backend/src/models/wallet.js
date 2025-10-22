import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  availableBalance: {
    type: Number,
    default: 0
  },
  pendingBalance: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  lastWithdrawal: {
    amount: Number,
    date: Date,
    status: String
  }
});

export default mongoose.model("Wallet", walletSchema);
