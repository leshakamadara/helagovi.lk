import express from 'express';
import { body, param } from 'express-validator';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  addFarmerResponse,
  getUserReviews,
  checkReviewEligibility
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const createReviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters')
    .trim(),
  body('comment')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
    .trim(),
  body('images')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 images allowed')
];

const updateReviewValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters')
    .trim(),
  body('comment')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
    .trim(),
  body('images')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 images allowed')
];

const voteValidation = [
  body('vote')
    .isIn(['helpful', 'not-helpful'])
    .withMessage('Vote must be either "helpful" or "not-helpful"')
];

const farmerResponseValidation = [
  body('response')
    .isLength({ min: 10, max: 500 })
    .withMessage('Response must be between 10 and 500 characters')
    .trim()
];

// Public routes
// GET /api/reviews/product/:productId - Get all reviews for a product
router.get('/product/:productId', getProductReviews);

// Protected routes (require authentication)
// GET /api/reviews/my - Get current user's reviews
router.get('/my', protect, authorize('buyer'), getUserReviews);

// GET /api/reviews/eligibility/:productId - Check if user can review a product
router.get('/eligibility/:productId', protect, authorize('buyer'), checkReviewEligibility);



// POST /api/reviews/product/:productId - Create a review for a product
router.post(
  '/product/:productId',
  protect,
  authorize('buyer'),
  createReviewValidation,
  createReview
);

// PUT /api/reviews/:reviewId - Update a review
router.put(
  '/:reviewId',
  protect,
  authorize('buyer'),
  updateReviewValidation,
  updateReview
);

// DELETE /api/reviews/:reviewId - Delete a review
router.delete(
  '/:reviewId',
  protect,
  authorize('buyer', 'admin'),
  deleteReview
);

// POST /api/reviews/:reviewId/helpful - Mark review as helpful/not helpful
router.post(
  '/:reviewId/helpful',
  protect,
  authorize('buyer'),
  voteValidation,
  markReviewHelpful
);

// POST /api/reviews/:reviewId/response - Add farmer response to review
router.post(
  '/:reviewId/response',
  protect,
  authorize('farmer'),
  farmerResponseValidation,
  addFarmerResponse
);

export default router;