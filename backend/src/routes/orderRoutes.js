import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrderAnalytics
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules for creating an order
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  body('items.*.quantity')
    .isFloat({ min: 0.1 })
    .withMessage('Quantity must be at least 0.1'),
  body('deliveryAddress.recipientName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Recipient name must be between 2 and 100 characters'),
  body('deliveryAddress.phone')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Phone number must be valid'),
  body('deliveryAddress.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  body('deliveryAddress.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('deliveryAddress.district')
    .isIn([
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
      'Moneragala', 'Ratnapura', 'Kegalle'
    ])
    .withMessage('Invalid district name'),
  body('deliveryAddress.postalCode')
    .matches(/^\d{5}$/)
    .withMessage('Postal code must be 5 digits'),
  body('paymentMethod')
    .optional()
    .isIn(['cash_on_delivery', 'bank_transfer', 'mobile_payment', 'credit_card'])
    .withMessage('Invalid payment method'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Validation rules for updating order status
const updateStatusValidation = [
  param('orderId')
    .isMongoId()
    .withMessage('Order ID must be a valid MongoDB ObjectId'),
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid order status'),
  body('note')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters')
];

// Validation rules for cancelling an order
const cancelOrderValidation = [
  param('orderId')
    .isMongoId()
    .withMessage('Order ID must be a valid MongoDB ObjectId'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason cannot exceed 500 characters')
];

// Validation rules for order ID parameter
const orderIdValidation = [
  param('orderId')
    .isMongoId()
    .withMessage('Order ID must be a valid MongoDB ObjectId')
];

// Validation rules for order number parameter
const orderNumberValidation = [
  param('orderNumber')
    .matches(/^ORD-\d{8}-\d{3}$/)
    .withMessage('Invalid order number format')
];

// Validation rules for query parameters
const queryValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid status filter'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('buyerId')
    .optional()
    .isMongoId()
    .withMessage('Buyer ID must be a valid MongoDB ObjectId'),
  query('farmerId')
    .optional()
    .isMongoId()
    .withMessage('Farmer ID must be a valid MongoDB ObjectId'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO 8601 date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO 8601 date'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'total', 'status', 'orderNumber'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Routes

/**
 * POST /api/orders
 * Create a new order
 * Access: Authenticated buyers only
 */
router.post('/', 
  protect,
  authorize('buyer'),
  createOrderValidation,
  handleValidationErrors,
  createOrder
);

/**
 * GET /api/orders/my
 * Get current user's orders (buyer or farmer)
 * Access: Authenticated users (buyers and farmers)
 */
router.get('/my', 
  protect,
  authorize('buyer', 'farmer'),
  queryValidation,
  handleValidationErrors,
  getMyOrders
);

/**
 * GET /api/orders/all
 * Get all orders (Admin only)
 * Access: Admin only
 */
router.get('/all', 
  protect,
  authorize('admin'),
  queryValidation,
  handleValidationErrors,
  getAllOrders
);

/**
 * GET /api/orders/analytics
 * Get order analytics and statistics (Admin only)
 * Access: Admin only
 */
router.get('/analytics', 
  protect,
  authorize('admin'),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  handleValidationErrors,
  getOrderAnalytics
);

/**
 * GET /api/orders/number/:orderNumber
 * Get order by order number
 * Access: Order participants and admin
 */
router.get('/number/:orderNumber', 
  protect,
  orderNumberValidation,
  handleValidationErrors,
  getOrderByNumber
);

/**
 * GET /api/orders/:orderId
 * Get order by ID
 * Access: Order participants and admin
 */
router.get('/:orderId', 
  protect,
  orderIdValidation,
  handleValidationErrors,
  getOrderById
);

/**
 * PATCH /api/orders/:orderId/status
 * Update order status
 * Access: Farmers, buyers (limited), and admin
 */
router.patch('/:orderId/status', 
  protect,
  updateStatusValidation,
  handleValidationErrors,
  updateOrderStatus
);

/**
 * PATCH /api/orders/:orderId/cancel
 * Cancel an order
 * Access: Order participants and admin
 */
router.patch('/:orderId/cancel', 
  protect,
  cancelOrderValidation,
  handleValidationErrors,
  cancelOrder
);

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Order routes error:', error);
  
  // MongoDB validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // MongoDB duplicate key error
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry detected',
      error: 'Order with this identifier already exists'
    });
  }
  
  // MongoDB cast error
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      error: error.message
    });
  }
  
  // Generic error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

export default router;
