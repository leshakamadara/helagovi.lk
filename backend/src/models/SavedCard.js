import mongoose from "mongoose";

const savedCardSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  token: { type: String, required: true },
  orderId: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("SavedCard", savedCardSchema);
