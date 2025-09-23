import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const orderSchema = new Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer reference is required'],
    index: true
  },
  farmer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer reference is required'],
    index: true
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than 0']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0.01, 'Unit price must be greater than 0']
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0.01, 'Total price must be greater than 0']
    }
  }],
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0.01, 'Subtotal must be greater than 0']
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: [0, 'Delivery fee cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0.01, 'Total amount must be greater than 0']
  },
  deliveryAddress: {
    type: {
      addressLine1: {
        type: String,
        required: [true, 'Address line 1 is required'],
        trim: true,
        maxLength: [100, 'Address line 1 cannot exceed 100 characters']
      },
      addressLine2: {
        type: String,
        trim: true,
        maxLength: [100, 'Address line 2 cannot exceed 100 characters']
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxLength: [50, 'City name cannot exceed 50 characters']
      },
      district: {
        type: String,
        required: [true, 'District is required'],
        enum: {
          values: [
            'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
            'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
            'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
            'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
            'Moneragala', 'Ratnapura', 'Kegalle'
          ],
          message: 'Invalid district name'
        }
      },
      postalCode: {
        type: String,
        trim: true,
        maxLength: [10, 'Postal code cannot exceed 10 characters']
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          validate: {
            validator: function(v) {
              return v.length === 2 && 
                     v[0] >= 79.5 && v[0] <= 81.9 && // Longitude range for Sri Lanka
                     v[1] >= 5.9 && v[1] <= 9.9;     // Latitude range for Sri Lanka
            },
            message: 'Coordinates must be valid Sri Lankan coordinates [longitude, latitude]'
          }
        }
      }
    },
    required: [true, 'Delivery address is required']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['cash_on_delivery', 'card', 'bank_transfer', 'digital_wallet'],
      message: 'Payment method must be one of: cash_on_delivery, card, bank_transfer, digital_wallet'
    }
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      message: 'Payment status must be one of: pending, processing, completed, failed, refunded'
    },
    default: 'pending',
    index: true
  },
  orderStatus: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'processing', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'cancelled'],
      message: 'Order status must be one of: pending, confirmed, processing, ready_for_delivery, out_for_delivery, delivered, cancelled'
    },
    default: 'pending',
    index: true
  },
  deliveryInstructions: {
    type: String,
    trim: true,
    maxLength: [500, 'Delivery instructions cannot exceed 500 characters']
  },
  estimatedDelivery: {
    type: Date,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Estimated delivery must be in the future'
    }
  },
  deliveredAt: {
    type: Date,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Delivery date cannot be in the future'
    }
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxLength: [200, 'Cancellation reason cannot exceed 200 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxLength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ farmer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1 });
orderSchema.index({ 'deliveryAddress.district': 1, orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for order age (days since creation)
orderSchema.virtual('orderAgeDays').get(function() {
  if (!this.createdAt) return null;
  const now = new Date();
  const created = new Date(this.createdAt);
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
});

// Virtual for isDelayed
orderSchema.virtual('isDelayed').get(function() {
  if (!this.estimatedDelivery || this.orderStatus === 'delivered' || this.orderStatus === 'cancelled') {
    return false;
  }
  return new Date() > this.estimatedDelivery;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: new Date(year, 0, 1) }
    });
    this.orderNumber = `ORD-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isNew) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    this.totalAmount = this.subtotal + this.deliveryFee;
  }
  next();
});

// Pre-validate middleware
orderSchema.pre('validate', function(next) {
  // Set default estimated delivery if not provided (2 days from now)
  if (!this.estimatedDelivery && !this.deliveredAt) {
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    this.estimatedDelivery = twoDaysFromNow;
  }
  
  // Auto-update deliveredAt if status is delivered
  if (this.orderStatus === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  
  next();
});

// Static methods
orderSchema.statics.findByCustomer = function(customerId, status = null) {
  const query = { customer: customerId };
  if (status) query.orderStatus = status;
  return this.find(query)
    .populate('items.product', 'title images unit')
    .populate('farmer', 'name phone')
    .sort({ createdAt: -1 });
};

orderSchema.statics.findByFarmer = function(farmerId, status = null) {
  const query = { farmer: farmerId };
  if (status) query.orderStatus = status;
  return this.find(query)
    .populate('items.product', 'title images unit')
    .populate('customer', 'name phone')
    .sort({ createdAt: -1 });
};

orderSchema.statics.findRecentOrders = function(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.find({ 
    createdAt: { $gte: date } 
  }).populate('customer farmer', 'name');
};

// Instance methods
orderSchema.methods.updateStatus = async function(newStatus, reason = null) {
  const allowedTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['ready_for_delivery', 'cancelled'],
    ready_for_delivery: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered'],
    delivered: [],
    cancelled: []
  };

  if (!allowedTransitions[this.orderStatus].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.orderStatus} to ${newStatus}`);
  }

  this.orderStatus = newStatus;
  
  if (newStatus === 'cancelled' && reason) {
    this.cancellationReason = reason;
  }
  
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  }

  return await this.save();
};

orderSchema.methods.updatePaymentStatus = async function(newStatus) {
  const allowedTransitions = {
    pending: ['processing', 'failed'],
    processing: ['completed', 'failed'],
    completed: ['refunded'],
    failed: ['processing'],
    refunded: []
  };

  if (!allowedTransitions[this.paymentStatus].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.paymentStatus} to ${newStatus}`);
  }

  this.paymentStatus = newStatus;
  return await this.save();
};

const Order = model('Order', orderSchema);

export default Order;