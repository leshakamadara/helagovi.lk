import express from 'express';
import { body, param, query, validationResult } from 'express-validator';

import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getMyOrders,
  getFarmerOrders,
  getOrderStats,
  notifyBuyer
} from '../controllers/orderController.js';

const router = express.Router();

// Authentication middleware placeholder
const auth = (req, res, next) => {
  // Placeholder for authentication middleware
  // In a real app, this would verify JWT token and attach user to req
  
  // Mock authenticated user for development
  req.user = {
    id: '507f1f77bcf86cd799439011', // Mock ObjectId
    email: 'customer@example.com',
    name: 'John Customer',
    role: 'customer'
  };
  
  next();
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Validation rules
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('items.*.quantity')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be a positive number'),
  
  body('deliveryAddress.addressLine1')
    .isLength({ min: 5, max: 100 })
    .withMessage('Address line 1 must be between 5 and 100 characters')
    .trim(),
  
  body('deliveryAddress.city')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters')
    .trim(),
  
  body('deliveryAddress.district')
    .isIn([
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
      'Moneragala', 'Ratnapura', 'Kegalle'
    ])
    .withMessage('Invalid district'),
  
  body('paymentMethod')
    .isIn(['cash_on_delivery', 'card', 'bank_transfer', 'digital_wallet'])
    .withMessage('Invalid payment method'),
  
  body('deliveryInstructions')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Delivery instructions cannot exceed 500 characters')
    .trim()
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  
  body('reason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Cancellation reason cannot exceed 200 characters')
    .trim()
];

const updatePaymentStatusValidation = [
  body('paymentStatus')
    .isIn(['pending', 'processing', 'completed', 'failed', 'refunded'])
    .withMessage('Invalid payment status')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID')
];

// Query validation for filtering and pagination
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'totalAmount', 'estimatedDelivery'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'processing', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'processing', 'completed', 'failed', 'refunded'])
    .withMessage('Invalid payment status'),
  
  query('district')
    .optional()
    .isIn([
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
      'Moneragala', 'Ratnapura', 'Kegalle'
    ])
    .withMessage('Invalid district'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  
  query('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min amount must be a non-negative number'),
  
  query('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max amount must be a non-negative number'),
  
  query('customer')
    .optional()
    .isMongoId()
    .withMessage('Invalid customer ID'),
  
  query('farmer')
    .optional()
    .isMongoId()
    .withMessage('Invalid farmer ID')
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Routes

// Public routes (no authentication required) - None for orders

// Protected routes (authentication required)

// POST /api/orders - Create new order
router.post('/', 
  auth, 
  authorize('customer'), 
  createOrderValidation, 
  handleValidationErrors,
  createOrder
);

// GET /api/orders - Get all orders (with filters based on role)
router.get('/', 
  auth, 
  authorize('customer', 'farmer', 'admin', 'moderator'), 
  queryValidation, 
  handleValidationErrors,
  getAllOrders
);

// GET /api/orders/:id - Get single order by ID
router.get('/:id', 
  auth, 
  authorize('customer', 'farmer', 'admin', 'moderator'), 
  idValidation,
  getOrderById
);

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', 
  auth, 
  authorize('customer', 'farmer', 'admin', 'moderator'), 
  idValidation,
  updateStatusValidation, 
  handleValidationErrors,
  updateOrderStatus
);

// PATCH /api/orders/:id/payment-status - Update payment status
router.patch('/:id/payment-status', 
  auth, 
  authorize('admin', 'moderator'), 
  idValidation,
  updatePaymentStatusValidation, 
  handleValidationErrors,
  updatePaymentStatus
);

// GET /api/orders/my/orders - Get current user's orders (customer)
router.get('/my/orders', 
  auth, 
  authorize('customer'), 
  queryValidation, 
  handleValidationErrors,
  getMyOrders
);

// GET /api/orders/farmer/orders - Get farmer's orders
router.get('/farmer/orders', 
  auth, 
  authorize('farmer'), 
  queryValidation, 
  handleValidationErrors,
  getFarmerOrders
);

// GET /api/orders/stats/overview - Get order statistics
router.get('/stats/overview', 
  auth, 
  authorize('farmer', 'admin', 'moderator'), 
  getOrderStats
);

// Utility routes
// GET /api/orders/utils/districts - Get all districts
router.get('/utils/districts', (req, res) => {
  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];
  
  res.json({
    success: true,
    data: districts
  });
});

// GET /api/orders/utils/payment-methods - Get all payment methods
router.get('/utils/payment-methods', (req, res) => {
  const paymentMethods = [
    { value: 'cash_on_delivery', label: 'Cash on Delivery' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'digital_wallet', label: 'Digital Wallet' }
  ];
  
  res.json({
    success: true,
    data: paymentMethods
  });
});

// DELETE /api/orders/:id - Delete order (soft delete)
router.delete('/:id', 
  auth, 
  authorize('admin'), 
  idValidation,
  deleteOrder
);

// POST /api/orders/:id/notify - Send notification to buyer
router.post('/:id/notify', 
  auth, 
  authorize('farmer', 'admin'), 
  [
    body('message').optional().isLength({ max: 500 }).withMessage('Message too long'),
    body('type').optional().isIn(['order_update', 'shipping_update', 'payment_update'])
  ],
  handleValidationErrors,
  notifyBuyer
);

// GET /api/orders/farmer/summary - Get farmer order summary
router.get('/farmer/summary', 
  auth, 
  authorize('farmer'), 
  async (req, res) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const summary = await Order.aggregate([
        { 
          $match: { 
            farmer: mongoose.Types.ObjectId(req.user.id),
            createdAt: { $gte: thirtyDaysAgo }
          } 
        },
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 },
            totalValue: { $sum: '$totalAmount' }
          }
        }
      ]);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order summary'
      });
    }
  }
);
export default router;

