import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const productSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'Price must be greater than 0'
    }
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: {
      values: ['kg', 'g', 'lb', 'piece', 'bunch', 'box', 'crate', 'bag'],
      message: 'Unit must be one of: kg, g, lb, piece, bunch, box, crate, bag'
    }
  },
  images: [{
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v);
        },
        message: 'Invalid image URL format'
      }
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
    },
    index: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxLength: [50, 'City name cannot exceed 50 characters'],
    index: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= 79.5 && v[0] <= 81.9 && // Longitude range for Sri Lanka
                 v[1] >= 5.9 && v[1] <= 9.9;     // Latitude range for Sri Lanka
        },
        message: 'Coordinates must be valid Sri Lankan coordinates [longitude, latitude]'
      }
    }
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
    index: true
  },
  qualityScore: {
    type: Number,
    min: [1, 'Quality score must be at least 1'],
    max: [5, 'Quality score cannot exceed 5'],
    default: 3,
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Quality score must be an integer'
    }
  },
  isOrganic: {
    type: Boolean,
    default: false,
    index: true
  },
  harvestDate: {
    type: Date,
    required: [true, 'Harvest date is required'],
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Harvest date cannot be in the future'
    }
  },
  initialQuantity: {
    type: Number,
    required: [true, 'Initial quantity is required'],
    min: [0, 'Initial quantity cannot be negative']
  },
  availableQuantity: {
    type: Number,
    required: [true, 'Available quantity is required'],
    min: [0, 'Available quantity cannot be negative'],
    validate: {
      validator: function(v) {
        return v <= this.initialQuantity;
      },
      message: 'Available quantity cannot exceed initial quantity'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'sold', 'expired', 'draft', 'suspended'],
      message: 'Status must be one of: active, sold, expired, draft, suspended'
    },
    default: 'active',
    index: true
  },
  farmer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer reference is required'],
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
  if (this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }

  // Auto-update status based on quantity
  if (this.availableQuantity === 0 && this.status === 'active') {
    this.status = 'sold';
  }

  // Check if product has expired (more than 30 days old for perishables)
  const daysSinceHarvest = Math.floor((new Date() - this.harvestDate) / (1000 * 60 * 60 * 24));
  if (daysSinceHarvest > 30 && this.status === 'active') {
    this.status = 'expired';
  }

  next();
});

// Pre-validate middleware
productSchema.pre('validate', function(next) {
  // Set alt text for images if not provided
  this.images.forEach((img, index) => {
    if (!img.alt) {
      img.alt = `${this.title} - Image ${index + 1}`;
    }
  });

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
  if (quantityUsed > this.availableQuantity) {
    throw new Error('Cannot use more quantity than available');
  }
  
  this.availableQuantity -= quantityUsed;
  if (this.availableQuantity === 0) {
    this.status = 'sold';
  }
  
  return await this.save();
};

productSchema.methods.isExpired = function() {
  const daysSinceHarvest = Math.floor((new Date() - this.harvestDate) / (1000 * 60 * 60 * 24));
  return daysSinceHarvest > 30;
};

const Product = model('Product', productSchema);

export default Product;