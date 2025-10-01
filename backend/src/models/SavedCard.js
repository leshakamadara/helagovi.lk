import mongoose from "mongoose";

const savedCardSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    orderId: { type: String},
    card_holder_name: { type: String, default: "" },
    card_no: { type: String, default: "" }, 
    method: { type: String, default: "" }, 
    expiry_month: { type: Number, default: null },
    expiry_year: { type: Number, default: null },
    card_type: { type: String, default: "" }, 
    
  },
  {
    timestamps: true,
  }
);

const SavedCard = mongoose.model("SavedCard", savedCardSchema);
export default SavedCard;
