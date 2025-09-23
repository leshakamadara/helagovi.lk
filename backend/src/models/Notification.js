import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'order_placed',
      'order_confirmed',
      'order_shipped',
      'order_delivered',
      'order_cancelled',
      'order_updated',
      'payment_received',
      'payment_failed',
      'system_alert'
    ]
  },
  title: {
    type: String,
    required: true,
    maxLength: 100
  },
  message: {
    type: String,
    required: true,
    maxLength: 500
  },
  relatedEntity: {
    type: Schema.Types.ObjectId,
    refPath: 'relatedEntityModel'
  },
  relatedEntityModel: {
    type: String,
    enum: ['Order', 'Product', 'Payment']
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Static methods
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};

const Notification = model('Notification', notificationSchema);

export default Notification;