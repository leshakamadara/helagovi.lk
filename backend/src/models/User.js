import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['customer', 'farmer', 'admin', 'moderator'], default: 'customer' },
  district: { type: String, trim: true },
  city: { type: String, trim: true }
}, { timestamps: true });

export default model('User', userSchema);




