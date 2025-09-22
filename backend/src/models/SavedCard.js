import mongoose from "mongoose";

const SavedCardSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  token: { type: String, required: true },
  cardholderName: { type: String, required: true },
  last4: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("SavedCard", SavedCardSchema);
