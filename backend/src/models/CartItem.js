import { Schema, model } from 'mongoose';

const cartItemSchema = new Schema({
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  // Store price at time of adding to cart for consistency
  priceAtTime: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
cartItemSchema.index({ buyer: 1, product: 1 }, { unique: true });

// Virtual for total price
cartItemSchema.virtual('totalPrice').get(function() {
  return this.priceAtTime * this.quantity;
});

// Transform output
cartItemSchema.set('toJSON', { virtuals: true });

const CartItem = model('CartItem', cartItemSchema);

export default CartItem;