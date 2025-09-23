import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const productSchema = new Schema({
  title: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String }],
  unit: { type: String, default: 'kg' },
  availableQuantity: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default model('Product', productSchema);




