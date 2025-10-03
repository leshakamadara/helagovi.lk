import express from 'express';
import mongoose from 'mongoose';
import { body, param, query, validationResult } from 'express-validator';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  getMyProducts,
  updateQuantity
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import Product from '../models/Product.js';

const router = express.Router();

// Validation rules - DISABLED for debugging
const createProductValidation = [
  // Validation temporarily disabled to test form submission
];

const updateProductValidation = [
  body('title')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),
  
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  
  body('unit')
    .optional()
    .isIn(['kg', 'g', 'lb', 'piece', 'bunch', 'box', 'crate', 'bag'])
    .withMessage('Invalid unit type'),
  
  body('images')
    .optional()
    .isArray({ min: 1, max: 10 })
    .withMessage('Must provide at least 1 image and maximum 10 images'),
  
  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Invalid image URL')
    .matches(/\.(jpg|jpeg|png|webp)$/i)
    .withMessage('Image must be jpg, jpeg, png, or webp format'),
  
  body('district')
    .optional()
    .isIn([
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
      'Moneragala', 'Ratnapura', 'Kegalle'
    ])
    .withMessage('Invalid district'),
  
  body('city')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters')
    .trim(),
  
  body('coordinates.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),
  
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('qualityScore')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Quality score must be between 1 and 5'),
  
  body('isOrganic')
    .optional()
    .isBoolean()
    .withMessage('isOrganic must be a boolean'),
  
  body('harvestDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid harvest date format')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Harvest date cannot be in the future');
      }
      return true;
    }),
  
  body('availableQuantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Available quantity must be a non-negative number')
];

const statusValidation = [
  body('status')
    .isIn(['active', 'sold', 'expired', 'draft', 'suspended'])
    .withMessage('Status must be one of: active, sold, expired, draft, suspended')
];

const quantityValidation = [
  body('quantityUsed')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity used must be a positive number')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID')
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
    .isIn(['createdAt', 'updatedAt', 'price', 'title', 'harvestDate', 'qualityScore', 'averageRating'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a non-negative number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a non-negative number'),
  
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  
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
  
  query('isOrganic')
    .optional()
    .isBoolean()
    .withMessage('isOrganic must be true or false'),
  
  query('status')
    .optional()
    .isIn(['active', 'sold', 'expired', 'draft', 'suspended'])
    .withMessage('Invalid status'),
  
  query('qualityScore')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Quality score must be between 1 and 5'),
  
  query('latitude')
    .optional()
    .isFloat({ min: 5.9, max: 9.9 })
    .withMessage('Latitude must be valid for Sri Lanka'),
  
  query('longitude')
    .optional()
    .isFloat({ min: 79.5, max: 81.9 })
    .withMessage('Longitude must be valid for Sri Lanka'),
  
  query('maxDistance')
    .optional()
    .isInt({ min: 100, max: 100000 })
    .withMessage('Max distance must be between 100m and 100km'),
  
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters')
    .trim(),
  
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

// Public routes (no authentication required)
// GET /api/products - Get all products with filtering and pagination
router.get('/', queryValidation, getAllProducts);

// Protected routes (authentication required) - These need to come BEFORE the /:id route

// GET /api/products/my/products - Get current user's products
router.get('/my/products', 
  protect, 
  authorize('farmer', 'admin'), 
  queryValidation, 
  getMyProducts
);

// GET /api/products/:id - Get single product by ID
router.get('/:id', idValidation, getProductById);

// Protected routes (authentication required)
// POST /api/products - Create new product
router.post('/', 
  protect, 
  authorize('farmer', 'admin'), 
  createProductValidation, 
  createProduct
);

// PUT /api/products/:id - Update product
router.put('/:id', 
  protect, 
  authorize('farmer', 'admin'), 
  idValidation,
  updateProductValidation, 
  updateProduct
);

// DELETE /api/products/:id - Delete product
router.delete('/:id', 
  protect, 
  authorize('farmer', 'admin'), 
  idValidation,
  deleteProduct
);

// PATCH /api/products/:id/status - Update product status
router.patch('/:id/status', 
  protect, 
  authorize('farmer', 'admin'), 
  idValidation,
  statusValidation, 
  updateProductStatus
);

// PATCH /api/products/:id/quantity - Update product quantity (for sales)
router.patch('/:id/quantity', 
  protect, 
  authorize('farmer', 'admin', 'buyer'), 
  idValidation,
  quantityValidation, 
  updateQuantity
);

// Advanced search routes
// GET /api/products/search/nearby - Get products near coordinates
router.get('/search/nearby', 
  [
    query('latitude').isFloat({ min: 5.9, max: 9.9 }).withMessage('Valid latitude required'),
    query('longitude').isFloat({ min: 79.5, max: 81.9 }).withMessage('Valid longitude required'),
    query('maxDistance').optional().isInt({ min: 100, max: 100000 }).withMessage('Max distance must be between 100m and 100km')
  ],
  getAllProducts
);

// GET /api/products/search/category/:categoryId - Get products by category
router.get('/search/category/:categoryId', 
  [
    param('categoryId').isMongoId().withMessage('Invalid category ID'),
    ...queryValidation
  ],
  getAllProducts
);

// GET /api/products/search/location/:district - Get products by district
router.get('/search/location/:district', 
  [
    param('district').isIn([
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
      'Moneragala', 'Ratnapura', 'Kegalle'
    ]).withMessage('Invalid district'),
    ...queryValidation
  ],
  getAllProducts
);

// GET /api/products/search/organic - Get organic products only
router.get('/search/organic', queryValidation, (req, res, next) => {
  req.query.isOrganic = 'true';
  next();
}, getAllProducts);

// GET /api/products/search/fresh - Get fresh products (harvested within last 7 days)
router.get('/search/fresh', queryValidation, (req, res, next) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  req.query.harvestDateFrom = sevenDaysAgo.toISOString();
  next();
}, getAllProducts);

// Statistics routes (for dashboards)
// GET /api/products/stats/overview - Get product statistics overview
router.get('/stats/overview', protect, authorize('farmer', 'admin'), async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    const matchStage = isAdmin ? {} : { farmer: new mongoose.Types.ObjectId(userId) };
    
    const stats = await Product.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0] 
            } 
          },
          soldProducts: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] 
            } 
          },
          totalRevenue: { 
            $sum: { 
              $multiply: ['$price', { $subtract: ['$initialQuantity', '$availableQuantity'] }] 
            } 
          },
          averagePrice: { $avg: '$price' },
          totalQuantityListed: { $sum: '$initialQuantity' },
          totalQuantitySold: { $sum: { $subtract: ['$initialQuantity', '$availableQuantity'] } }
        }
      }
    ]);
    
    const overview = stats[0] || {
      totalProducts: 0,
      activeProducts: 0,
      soldProducts: 0,
      totalRevenue: 0,
      averagePrice: 0,
      totalQuantityListed: 0,
      totalQuantitySold: 0
    };
    
    res.json({
      success: true,
      data: overview
    });
    
  } catch (error) {
    console.error('Stats overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Utility routes
// GET /api/products/utils/districts - Get all districts
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

// GET /api/products/utils/units - Get all available units
router.get('/utils/units', (req, res) => {
  const units = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'lb', label: 'Pound (lb)' },
    { value: 'piece', label: 'Piece' },
    { value: 'bunch', label: 'Bunch' },
    { value: 'box', label: 'Box' },
    { value: 'crate', label: 'Crate' },
    { value: 'bag', label: 'Bag' }
  ];
  
  res.json({
    success: true,
    data: units
  });
});

// Bulk operations routes
// POST /api/products/bulk/status - Update multiple products status
router.patch('/bulk/status', 
  protect, 
  authorize('farmer', 'admin'),
  [
    body('productIds').isArray({ min: 1 }).withMessage('Product IDs array required'),
    body('productIds.*').isMongoId().withMessage('Invalid product ID'),
    body('status').isIn(['active', 'sold', 'expired', 'draft', 'suspended']).withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { productIds, status } = req.body;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';

      // Build query - admin can update any product, farmers only their own
      const query = { _id: { $in: productIds } };
      if (!isAdmin) {
        query.farmer = userId;
      }

      const result = await Product.updateMany(query, { status });

      res.json({
        success: true,
        message: `${result.modifiedCount} products updated to ${status}`,
        data: {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount
        }
      });

    } catch (error) {
      console.error('Bulk status update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update products',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// DELETE /api/products/bulk/delete - Delete multiple products
router.delete('/bulk/delete', 
  protect, 
  authorize('farmer', 'admin'),
  [
    body('productIds').isArray({ min: 1 }).withMessage('Product IDs array required'),
    body('productIds.*').isMongoId().withMessage('Invalid product ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { productIds } = req.body;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';

      // Build query - admin can delete any product, farmers only their own
      const query = { _id: { $in: productIds } };
      if (!isAdmin) {
        query.farmer = userId;
      }

      const result = await Product.deleteMany(query);

      res.json({
        success: true,
        message: `${result.deletedCount} products deleted successfully`,
        data: {
          deletedCount: result.deletedCount
        }
      });

    } catch (error) {
      console.error('Bulk delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete products',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

export default router;