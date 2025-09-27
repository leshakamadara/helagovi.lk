import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const productSchema = new Schema({
  title: {
    type: String,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number
  },
  unit: {
    type: String
  },
  images: [{
    url: {
      type: String
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  district: {
    type: String,
    index: true
  },
  city: {
    type: String,
    trim: true,
    index: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number]
    }
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    index: true
  },
  qualityScore: {
    type: Number,
    default: 3
  },
  isOrganic: {
    type: Boolean,
    default: false,
    index: true
  },
  harvestDate: {
    type: Date
  },
  initialQuantity: {
    type: Number
  },
  availableQuantity: {
    type: Number
  },
  status: {
    type: String,
    default: 'active',
    index: true
  },
  farmer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  // Review fields
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    index: true
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ coordinates: '2dsphere' });
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ district: 1, category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ status: 1, availableQuantity: 1 });

// Virtual for freshness (days since harvest)
productSchema.virtual('freshnessDays').get(function() {
  if (!this.harvestDate) return null;
  const now = new Date();
  const harvestDate = new Date(this.harvestDate);
  return Math.floor((now - harvestDate) / (1000 * 60 * 60 * 24));
});

// Virtual for sold percentage
productSchema.virtual('soldPercentage').get(function() {
  if (this.initialQuantity === 0) return 0;
  return Math.round(((this.initialQuantity - this.availableQuantity) / this.initialQuantity) * 100);
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Pre-save middleware
productSchema.pre('save', async function(next) {
  // Ensure at least one image is marked as primary
  if (this.images && this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }

  // Auto-update status based on quantity
  if (this.availableQuantity === 0 && this.status === 'active') {
    this.status = 'sold';
  }

  next();
});

// Pre-validate middleware
productSchema.pre('validate', function(next) {
  // Set alt text for images if not provided
  if (this.images && this.images.length > 0) {
    this.images.forEach((img, index) => {
      if (!img.alt) {
        img.alt = `${this.title || 'Product'} - Image ${index + 1}`;
      }
    });
  }

  next();
});

// Post-save middleware
productSchema.post('save', async function(doc) {
  // Log significant events
  if (doc.status === 'sold') {
    console.log(`Product ${doc._id} has been sold out`);
  }
});

// Static methods
productSchema.statics.findActiveProducts = function() {
  return this.find({ 
    status: 'active', 
    availableQuantity: { $gt: 0 } 
  }).populate('category farmer');
};

productSchema.statics.findByLocation = function(district, city = null) {
  const query = { district, status: 'active' };
  if (city) query.city = new RegExp(city, 'i');
  return this.find(query).populate('category farmer');
};

productSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    status: 'active',
    availableQuantity: { $gt: 0 }
  }).populate('category farmer');
};

// Instance methods
productSchema.methods.updateQuantity = async function(quantityUsed) {
  if (this.availableQuantity && quantityUsed > this.availableQuantity) {
    throw new Error('Cannot use more quantity than available');
  }
  
  this.availableQuantity = (this.availableQuantity || 0) - quantityUsed;
  if (this.availableQuantity <= 0) {
    this.status = 'sold';
    this.availableQuantity = 0;
  }
  
  return await this.save();
};

productSchema.methods.isExpired = function() {
  if (!this.harvestDate) return false;
  const daysSinceHarvest = Math.floor((new Date() - this.harvestDate) / (1000 * 60 * 60 * 24));
  return daysSinceHarvest > 30;
};

const Product = model('Product', productSchema);

export default Product;