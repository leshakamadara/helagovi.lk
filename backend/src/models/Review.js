import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const reviewSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
    index: true
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required'],
    index: true
  },
  farmer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer is required'],
    index: true
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required'],
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Rating must be a whole number'
    }
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxLength: [100, 'Review title cannot exceed 100 characters'],
    minLength: [5, 'Review title must be at least 5 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxLength: [1000, 'Review comment cannot exceed 1000 characters'],
    minLength: [10, 'Review comment must be at least 10 characters']
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
      default: 'Review image'
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: true,
    index: true
  },
  isHelpful: {
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0
    },
    notHelpfulCount: {
      type: Number,
      default: 0,
      min: 0
    },
    voters: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      vote: {
        type: String,
        enum: ['helpful', 'not-helpful']
      }
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved', // Auto-approve for now, can add moderation later
    index: true
  },
  moderationNote: {
    type: String,
    trim: true,
    maxLength: [500, 'Moderation note cannot exceed 500 characters']
  },
  farmerResponse: {
    comment: {
      type: String,
      trim: true,
      maxLength: [500, 'Farmer response cannot exceed 500 characters']
    },
    respondedAt: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ buyer: 1, createdAt: -1 });
reviewSchema.index({ farmer: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ product: 1, buyer: 1 }, { unique: true }); // One review per buyer per product

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
  const total = this.isHelpful.helpfulCount + this.isHelpful.notHelpfulCount;
  if (total === 0) return 0;
  return Math.round((this.isHelpful.helpfulCount / total) * 100);
});

// Static methods
reviewSchema.statics.getProductReviewStats = async function(productId) {
  try {
    console.log('Getting product review stats for:', productId);
    
    // Use a simpler approach with basic queries instead of complex aggregation
    const reviews = await this.find({
      product: new mongoose.Types.ObjectId(productId),
      status: 'approved'
    }).select('rating');

    console.log('Found reviews:', reviews.length);

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
      };
    }

    // Calculate stats manually
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    reviews.forEach(review => {
      if (ratingDistribution.hasOwnProperty(review.rating)) {
        ratingDistribution[review.rating]++;
      }
    });

    const result = {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      ratingDistribution
    };

    console.log('Calculated stats:', result);
    return result;

  } catch (error) {
    console.error('Error in getProductReviewStats:', error);
    console.error('Error stack:', error.stack);
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
      }
    };
  }
};

reviewSchema.statics.canUserReview = async function(productId, buyerId) {
  try {
    // Check if user has purchased this product
    const Order = mongoose.model('Order');
    const hasOrder = await Order.findOne({
      buyer: buyerId,
      'items.product': productId,
      status: { $in: ['delivered', 'completed'] }
    });

    if (!hasOrder) {
      return { canReview: false, reason: 'You must purchase this product before reviewing' };
    }

    // Check if user has already reviewed this product
    const existingReview = await this.findOne({
      product: productId,
      buyer: buyerId
    });

    if (existingReview) {
      return { canReview: false, reason: 'You have already reviewed this product' };
    }

    return { canReview: true, order: hasOrder._id };
  } catch (error) {
    console.error('Error in canUserReview:', error);
    return { canReview: false, reason: 'Error checking review eligibility' };
  }
};

// Instance methods
reviewSchema.methods.markHelpful = async function(userId, vote) {
  // Remove existing vote from this user
  this.isHelpful.voters = this.isHelpful.voters.filter(
    voter => !voter.user.equals(userId)
  );

  // Add new vote
  this.isHelpful.voters.push({ user: userId, vote });

  // Recalculate counts
  this.isHelpful.helpfulCount = this.isHelpful.voters.filter(
    voter => voter.vote === 'helpful'
  ).length;
  
  this.isHelpful.notHelpfulCount = this.isHelpful.voters.filter(
    voter => voter.vote === 'not-helpful'
  ).length;

  return this.save();
};

reviewSchema.methods.addFarmerResponse = async function(response) {
  this.farmerResponse = {
    comment: response,
    respondedAt: new Date()
  };
  return this.save();
};

// Pre-remove middleware to clean up associated data
reviewSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  // Could add cleanup logic here if needed (e.g., remove uploaded images)
  next();
});

const Review = model('Review', reviewSchema);

export default Review;