import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';

// Get all reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      rating
    } = req.query;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Build query
    const query = {
      product: new mongoose.Types.ObjectId(productId),
      status: 'approved'
    };

    if (rating) {
      query.rating = parseInt(rating);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get reviews with pagination
    const reviews = await Review.find(query)
      .populate('buyer', 'firstName lastName avatar')
      .populate('farmer', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalReviews = await Review.countDocuments(query);

    // Try to get review stats, but don't fail if it errors
    let reviewStats = {
      totalReviews: totalReviews,
      averageRating: 0,
      ratingDistribution: {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
      }
    };

    try {
      reviewStats = await Review.getProductReviewStats(productId);
    } catch (error) {
      console.warn('Failed to get review stats:', error);
    }

    const totalPages = Math.ceil(totalReviews / limitNum);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        stats: reviewStats,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalReviews,
          reviewsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create a new review
export const createReview = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors for createReview:', errors.array());
      console.log('Request body:', req.body);
      console.log('Request params:', req.params);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productId } = req.params;
    const { rating, title, comment, images = [] } = req.body;
    const buyerId = req.user.id;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId).populate('farmer');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user can review this product
    const reviewEligibility = await Review.canUserReview(productId, buyerId);
    if (!reviewEligibility || !reviewEligibility.canReview) {
      return res.status(403).json({
        success: false,
        message: reviewEligibility?.reason || 'You cannot review this product'
      });
    }

    // Create review
    const review = new Review({
      product: productId,
      buyer: buyerId,
      farmer: product.farmer._id,
      order: reviewEligibility.order,
      rating: parseInt(rating),
      title: title.trim(),
      comment: comment.trim(),
      images: images || []
    });

    await review.save();

    // Populate the review for response
    const populatedReview = await Review.findById(review._id)
      .populate('buyer', 'firstName lastName avatar')
      .populate('farmer', 'firstName lastName')
      .populate('product', 'title');

    // Update product's average rating (don't fail the entire operation if this fails)
    // This could be done in a background job for better performance
    try {
      const reviewStats = await Review.getProductReviewStats(productId);
      await Product.findByIdAndUpdate(productId, {
        averageRating: reviewStats.averageRating,
        totalReviews: reviewStats.totalReviews
      });
      console.log('Product stats updated successfully after review creation');
    } catch (statsError) {
      console.warn('Failed to update product stats, but review creation was successful:', statsError);
      // Don't fail the entire operation - the review creation was successful
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: populatedReview
    });

  } catch (error) {
    console.error('Create review error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { reviewId } = req.params;
    const { rating, title, comment, images } = req.body;
    const userId = req.user?.id;

    console.log('updateReview called:', {
      reviewId,
      rating,
      title,
      comment,
      images: images?.length,
      userId,
      user: req.user
    });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in request'
      });
    }

    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    console.log('Looking for review with ID:', reviewId);
    const review = await Review.findById(reviewId);
    console.log('Found review:', review ? 'Yes' : 'No', review?._id);
    
    if (!review) {
      console.log('Review not found with ID:', reviewId);
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    console.log('Review buyer:', review.buyer, 'Current user:', userId);
    
    // Check if user owns this review
    if (!review.buyer.equals(userId)) {
      console.log('User does not own this review');
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Update fields
    console.log('Updating review fields...');
    if (rating !== undefined) {
      console.log('Updating rating from', review.rating, 'to', rating);
      review.rating = parseInt(rating);
    }
    if (title) {
      console.log('Updating title from', review.title, 'to', title);
      review.title = title.trim();
    }
    if (comment) {
      console.log('Updating comment...');
      review.comment = comment.trim();
    }
    if (images !== undefined) {
      console.log('Updating images, count:', images?.length);
      review.images = images;
    }

    console.log('Saving review...');
    await review.save();
    console.log('Review saved successfully');

    // Update product's average rating (don't fail the entire operation if this fails)
    try {
      console.log('Updating product stats for product:', review.product);
      const reviewStats = await Review.getProductReviewStats(review.product);
      await Product.findByIdAndUpdate(review.product, {
        averageRating: reviewStats.averageRating,
        totalReviews: reviewStats.totalReviews
      });
      console.log('Product stats updated successfully');
    } catch (statsError) {
      console.warn('Failed to update product stats, but review update was successful:', statsError);
      // Don't fail the entire operation - the review update was successful
    }

    console.log('Fetching updated review with population...');
    const updatedReview = await Review.findById(reviewId)
      .populate('buyer', 'firstName lastName avatar')
      .populate('farmer', 'firstName lastName')
      .populate('product', 'title');

    console.log('Sending success response...');
    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });

  } catch (error) {
    console.error('Update review error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check permissions
    const canDelete = review.buyer.equals(userId) || userRole === 'admin';
    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    const productId = review.product;
    await review.deleteOne();

    // Update product's average rating
    const reviewStats = await Review.getProductReviewStats(productId);
    await Product.findByIdAndUpdate(productId, {
      averageRating: reviewStats.averageRating,
      totalReviews: reviewStats.totalReviews
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Mark review as helpful/not helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { vote } = req.body; // 'helpful' or 'not-helpful'
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    if (!['helpful', 'not-helpful'].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: 'Vote must be either "helpful" or "not-helpful"'
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Users cannot vote on their own reviews
    if (review.buyer.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot vote on your own review'
      });
    }

    await review.markHelpful(userId, vote);

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        helpfulCount: review.isHelpful.helpfulCount,
        notHelpfulCount: review.isHelpful.notHelpfulCount,
        helpfulPercentage: review.helpfulPercentage
      }
    });

  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vote',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add farmer response to review
export const addFarmerResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { response } = req.body;
    const farmerId = req.user.id;

    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if the user is the farmer for this review
    if (!review.farmer.equals(farmerId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to reviews of your products'
      });
    }

    await review.addFarmerResponse(response.trim());

    const updatedReview = await Review.findById(reviewId)
      .populate('buyer', 'firstName lastName avatar')
      .populate('farmer', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: updatedReview
    });

  } catch (error) {
    console.error('Add farmer response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    const userId = req.user.id;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, totalReviews] = await Promise.all([
      Review.find({ buyer: userId })
        .populate('product', 'title images')
        .populate('farmer', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments({ buyer: userId })
    ]);

    const totalPages = Math.ceil(totalReviews / limitNum);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalReviews,
          reviewsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Check if user can review a product
export const checkReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params;
    const buyerId = req.user.id;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const eligibility = await Review.canUserReview(productId, buyerId);

    res.status(200).json({
      success: true,
      data: eligibility
    });

  } catch (error) {
    console.error('Check review eligibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check review eligibility',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

