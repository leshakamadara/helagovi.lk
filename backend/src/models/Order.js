import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const orderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  productSnapshot: {
    // Store product details at time of order for historical accuracy
    title: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    image: {
      url: { type: String, required: true },
      alt: { type: String }
    },
    farmer: {
      id: { type: Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      phone: { type: String, required: true }
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.1, 'Quantity must be at least 0.1'],
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'Quantity must be greater than 0'
    }
  },
  priceAtTime: {
    type: Number,
    required: [true, 'Price at time of order is required'],
    min: [0, 'Price cannot be negative']
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  }
}, { _id: false });

const deliveryAddressSchema = new Schema({
  recipientName: {
    type: String,
    required: [true, 'Recipient name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    enum: [
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
      'Moneragala', 'Ratnapura', 'Kegalle'
    ]
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    match: [/^\d{5}$/, 'Postal code must be 5 digits']
  },
  specialInstructions: {
    type: String,
    maxLength: [500, 'Special instructions cannot exceed 500 characters']
  }
}, { _id: false });

const paymentInfoSchema = new Schema({
  method: {
    type: String,
    enum: ['cash_on_delivery', 'bank_transfer', 'mobile_payment', 'credit_card'],
    required: [true, 'Payment method is required']
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    sparse: true // Allow multiple null values
  },
  paidAt: {
    type: Date
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR', 'USD']
  }
}, { _id: false });

const statusHistorySchema = new Schema({
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    maxLength: [500, 'Status note cannot exceed 500 characters']
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { _id: false });

const orderSchema = new Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    index: true
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required'],
    index: true
  },
  farmers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: [0, 'Delivery fee cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
  deliveryAddress: deliveryAddressSchema,
  paymentInfo: paymentInfoSchema,
  statusHistory: [statusHistorySchema],
  notes: {
    type: String,
    maxLength: [1000, 'Notes cannot exceed 1000 characters']
  },
  expectedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  trackingNumber: {
    type: String,
    sparse: true
  },
  // Multi-farmer order support
  isMultiFarmerOrder: {
    type: Boolean,
    default: false
  },
  // Reviews and ratings
  canBeReviewed: {
    type: Boolean,
    default: false
  },
  reviewedAt: {
    type: Date
  },
  // Cancellation info
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    maxLength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative']
  },
  refundedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ 'farmers': 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
// Note: orderNumber, trackingNumber, and paymentInfo.transactionId indexes 
// are already defined at field level with 'index: true'

// Virtual for delivery time
orderSchema.virtual('deliveryTimeInDays').get(function() {
  if (!this.actualDeliveryDate || !this.createdAt) return null;
  const diffTime = Math.abs(this.actualDeliveryDate - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for order age
orderSchema.virtual('orderAgeInDays').get(function() {
  if (!this.createdAt) return null;
  const diffTime = Math.abs(new Date() - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for payment status
orderSchema.virtual('isPaid').get(function() {
  return this.paymentInfo.status === 'paid';
});

// Virtual for can be cancelled
orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

// Generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Count orders for today to generate sequential number
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayOrderCount = await this.constructor.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    const sequentialNumber = String(todayOrderCount + 1).padStart(3, '0');
    this.orderNumber = `ORD-${year}${month}${day}-${sequentialNumber}`;
  }
  
  // Calculate totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.total = this.subtotal + this.deliveryFee + this.tax - this.discount;
  
  // Update payment amount if not set
  if (!this.paymentInfo.amount) {
    this.paymentInfo.amount = this.total;
  }
  
  // Set multi-farmer flag
  const uniqueFarmers = new Set(this.items.map(item => item.productSnapshot.farmer.id.toString()));
  this.isMultiFarmerOrder = uniqueFarmers.size > 1;
  this.farmers = Array.from(uniqueFarmers);
  
  next();
});

// Add status change to history
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    // Only add to history if status actually changed and it's not a new document
    const lastHistory = this.statusHistory[this.statusHistory.length - 1];
    if (!lastHistory || lastHistory.status !== this.status) {
      this.statusHistory.push({
        status: this.status,
        timestamp: new Date(),
        updatedBy: this.buyer // Default to buyer, should be updated by controller
      });
    }
  }
  next();
});

// Post-save middleware for status updates
orderSchema.post('save', async function(doc) {
  // Update product quantities when order is confirmed
  if (doc.status === 'confirmed') {
    const Product = mongoose.model('Product');
    for (const item of doc.items) {
      try {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { availableQuantity: -item.quantity } },
          { runValidators: true }
        );
      } catch (error) {
        console.error(`Error updating product quantity for ${item.product}:`, error);
      }
    }
  }
  
  // Mark as reviewable when delivered
  if (doc.status === 'delivered' && !doc.canBeReviewed) {
    doc.canBeReviewed = true;
    doc.actualDeliveryDate = new Date();
    await doc.save();
  }
  
  // Set cancellation timestamp
  if (doc.status === 'cancelled' && !doc.cancelledAt) {
    doc.cancelledAt = new Date();
    await doc.save();
  }
});

// Static methods
orderSchema.statics.findByBuyer = function(buyerId, status = null) {
  const query = { buyer: buyerId };
  if (status) query.status = status;
  
  // Add filter to exclude test orders
  const testOrderFilter = {
    $and: [
      // Exclude orders from the future (test data)
      { createdAt: { $lte: new Date() } },
      // Exclude orders with test buyer names
      {
        $nor: [
          { 'buyer.firstName': { $regex: '^test$', $options: 'i' } },
          { 'buyer.firstName': { $regex: '^dummy$', $options: 'i' } },
          { 'buyer.firstName': { $regex: '^sample$', $options: 'i' } },
          { 'buyer.lastName': { $regex: '^test$', $options: 'i' } },
          { 'buyer.lastName': { $regex: '^dummy$', $options: 'i' } },
          { 'buyer.lastName': { $regex: '^sample$', $options: 'i' } }
        ]
      },
      // Exclude orders with suspicious order numbers (future timestamps)
      { orderNumber: { $not: { $regex: '1758640665029' } } }
    ]
  };
  
  // Combine filters
  const finalQuery = { ...query, ...testOrderFilter };
  
  return this.find(finalQuery)
    .populate('buyer', 'firstName lastName email phone')
    .populate('farmers', 'firstName lastName email phone')
    .populate('items.product', 'title images unit')
    .sort({ createdAt: -1 });
};

orderSchema.statics.findByFarmer = function(farmerId, status = null) {
  const query = { farmers: farmerId };
  if (status) query.status = status;
  
  // Add filter to exclude test orders
  const testOrderFilter = {
    $and: [
      // Exclude orders from the future (test data)
      { createdAt: { $lte: new Date() } },
      // Exclude orders with test buyer names
      {
        $nor: [
          { 'buyer.firstName': { $regex: '^test$', $options: 'i' } },
          { 'buyer.firstName': { $regex: '^dummy$', $options: 'i' } },
          { 'buyer.firstName': { $regex: '^sample$', $options: 'i' } },
          { 'buyer.lastName': { $regex: '^test$', $options: 'i' } },
          { 'buyer.lastName': { $regex: '^dummy$', $options: 'i' } },
          { 'buyer.lastName': { $regex: '^sample$', $options: 'i' } }
        ]
      },
      // Exclude orders with suspicious order numbers (future timestamps)
      { orderNumber: { $not: { $regex: '1758640665029' } } }
    ]
  };
  
  // Combine filters
  const finalQuery = { ...query, ...testOrderFilter };
  
  return this.find(finalQuery)
    .populate('buyer', 'firstName lastName email phone')
    .populate('farmers', 'firstName lastName email phone')
    .populate('items.product', 'title images unit')
    .sort({ createdAt: -1 });
};

orderSchema.statics.findByOrderNumber = function(orderNumber) {
  return this.findOne({ orderNumber })
    .populate('buyer', 'firstName lastName email phone')
    .populate('farmers', 'firstName lastName email phone')
    .populate('items.product', 'title images unit farmer')
    .populate('statusHistory.updatedBy', 'firstName lastName role');
};

// Instance methods
orderSchema.methods.updateStatus = async function(newStatus, note = '', updatedBy) {
  const validTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['shipped', 'cancelled'],
    'shipped': ['delivered', 'cancelled'],
    'delivered': ['refunded'],
    'cancelled': [],
    'refunded': []
  };
  
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  
  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note,
    updatedBy: updatedBy || this.buyer
  });
  
  return await this.save();
};

orderSchema.methods.cancel = async function(reason, updatedBy) {
  if (!this.canBeCancelled) {
    throw new Error('This order cannot be cancelled');
  }
  
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  
  // Add to status history
  this.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: reason,
    updatedBy: updatedBy || this.buyer
  });
  
  // Restore product quantities if order was confirmed
  if (this.statusHistory.some(h => h.status === 'confirmed')) {
    const Product = mongoose.model('Product');
    for (const item of this.items) {
      try {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { availableQuantity: item.quantity } },
          { runValidators: true }
        );
      } catch (error) {
        console.error(`Error restoring product quantity for ${item.product}:`, error);
      }
    }
  }
  
  return await this.save();
};

orderSchema.methods.calculateDeliveryFee = function() {
  // Simple distance-based delivery fee calculation
  // In a real app, you'd use a more sophisticated algorithm
  const baseDeliveryFee = 200; // LKR 200 base fee
  const districtFee = {
    'Colombo': 0,
    'Gampaha': 50,
    'Kalutara': 100,
    'Kandy': 150,
    // Add more districts...
  };
  
  const additionalFee = districtFee[this.deliveryAddress.district] || 200;
  this.deliveryFee = baseDeliveryFee + additionalFee;
  
  return this.deliveryFee;
};

const Order = model('Order', orderSchema);

export default Order;