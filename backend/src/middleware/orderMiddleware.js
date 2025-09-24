import Order from '../models/Order.js';

/**
 * Order Status Validation Middleware
 * Validates order status transitions and business rules
 */
export const validateOrderStatusTransition = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status: newStatus } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get the current order
    const order = await Order.findById(orderId).populate('farmers buyer');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Define valid status transitions
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': [],
      'refunded': []
    };

    // Check if transition is valid
    if (!validTransitions[order.status]?.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${order.status} to ${newStatus}`,
        currentStatus: order.status,
        allowedStatuses: validTransitions[order.status] || []
      });
    }

    // Role-based permission checks
    const permissionChecks = {
      farmer: () => {
        // Farmers can only update orders they're part of
        const isFarmerInOrder = order.farmers.some(farmer => farmer._id.toString() === userId);
        if (!isFarmerInOrder) {
          return { allowed: false, message: 'You are not associated with this order' };
        }
        
        // Farmers can update most statuses except 'delivered' (should be confirmed by buyer)
        const farmerAllowedStatuses = ['confirmed', 'preparing', 'shipped', 'cancelled'];
        if (!farmerAllowedStatuses.includes(newStatus)) {
          return { allowed: false, message: `Farmers cannot set status to ${newStatus}` };
        }
        
        return { allowed: true };
      },
      
      buyer: () => {
        // Buyers can only update their own orders
        if (order.buyer._id.toString() !== userId) {
          return { allowed: false, message: 'You can only update your own orders' };
        }
        
        // Buyers can only cancel pending orders or confirm delivery
        const buyerAllowedStatuses = ['cancelled', 'delivered'];
        if (!buyerAllowedStatuses.includes(newStatus)) {
          return { allowed: false, message: `Buyers cannot set status to ${newStatus}` };
        }
        
        // Additional check for cancellation - only pending or confirmed orders can be cancelled by buyer
        if (newStatus === 'cancelled' && !['pending', 'confirmed'].includes(order.status)) {
          return { allowed: false, message: 'You can only cancel pending or confirmed orders' };
        }
        
        // Additional check for delivery confirmation - only shipped orders can be marked as delivered
        if (newStatus === 'delivered' && order.status !== 'shipped') {
          return { allowed: false, message: 'Only shipped orders can be marked as delivered' };
        }
        
        return { allowed: true };
      },
      
      admin: () => {
        // Admins can update any status
        return { allowed: true };
      }
    };

    // Check permissions based on user role
    const permissionCheck = permissionChecks[userRole];
    if (!permissionCheck) {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role for order management'
      });
    }

    const permissionResult = permissionCheck();
    if (!permissionResult.allowed) {
      return res.status(403).json({
        success: false,
        message: permissionResult.message
      });
    }

    // Additional business rule validations
    const businessRuleValidation = await validateBusinessRules(order, newStatus);
    if (!businessRuleValidation.valid) {
      return res.status(400).json({
        success: false,
        message: businessRuleValidation.message
      });
    }

    // Attach order to request for use in controller
    req.order = order;
    next();

  } catch (error) {
    console.error('Order status validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating order status transition',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validate business rules for status transitions
 */
async function validateBusinessRules(order, newStatus) {
  try {
    switch (newStatus) {
      case 'confirmed':
        // Check product availability
        for (const item of order.items) {
          const Product = mongoose.model('Product');
          const product = await Product.findById(item.product);
          
          if (!product) {
            return {
              valid: false,
              message: `Product ${item.product} no longer exists`
            };
          }
          
          if (product.availableQuantity < item.quantity) {
            return {
              valid: false,
              message: `Insufficient quantity for ${product.title}. Available: ${product.availableQuantity}, Required: ${item.quantity}`
            };
          }
          
          if (product.status !== 'active') {
            return {
              valid: false,
              message: `Product ${product.title} is no longer active`
            };
          }
        }
        break;
        
      case 'shipped':
        // Ensure order has been confirmed and prepared
        if (!order.statusHistory.some(h => h.status === 'confirmed')) {
          return {
            valid: false,
            message: 'Order must be confirmed before shipping'
          };
        }
        break;
        
      case 'delivered':
        // Ensure order has been shipped
        if (!order.statusHistory.some(h => h.status === 'shipped')) {
          return {
            valid: false,
            message: 'Order must be shipped before marking as delivered'
          };
        }
        break;
        
      case 'cancelled':
        // Check if order can still be cancelled
        const nonCancellableStatuses = ['delivered', 'refunded'];
        if (nonCancellableStatuses.includes(order.status)) {
          return {
            valid: false,
            message: `Cannot cancel order with status ${order.status}`
          };
        }
        break;
    }
    
    return { valid: true };
    
  } catch (error) {
    console.error('Business rule validation error:', error);
    return {
      valid: false,
      message: 'Error validating business rules'
    };
  }
}

/**
 * Order Access Control Middleware
 * Ensures users can only access orders they're authorized to see
 */
export const validateOrderAccess = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(orderId).populate('farmers buyer');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check access permissions
    let hasAccess = false;
    
    switch (userRole) {
      case 'admin':
        hasAccess = true;
        break;
        
      case 'buyer':
        hasAccess = order.buyer._id.toString() === userId;
        break;
        
      case 'farmer':
        hasAccess = order.farmers.some(farmer => farmer._id.toString() === userId);
        break;
        
      default:
        hasAccess = false;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this order'
      });
    }

    req.order = order;
    next();

  } catch (error) {
    console.error('Order access validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating order access',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Order Creation Validation Middleware
 * Validates order data before creation
 */
export const validateOrderCreation = async (req, res, next) => {
  try {
    const { items, deliveryAddress } = req.body;
    const userId = req.user.id;

    // Check if user is a buyer
    if (req.user.role !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can create orders'
      });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Check for duplicate products in the same order
    const productIds = items.map(item => item.productId);
    const uniqueProductIds = [...new Set(productIds)];
    if (productIds.length !== uniqueProductIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate products in order. Please combine quantities.'
      });
    }

    // Validate each item
    const Product = mongoose.model('Product');
    const products = await Product.find({
      _id: { $in: productIds },
      status: 'active'
    }).populate('farmer');

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products are not available'
      });
    }

    // Check quantities and calculate total
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.productId);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not found or inactive`
        });
      }

      if (item.quantity > product.availableQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient quantity for ${product.title}. Available: ${product.availableQuantity}, Requested: ${item.quantity}`
        });
      }

      const subtotal = product.price * item.quantity;
      calculatedTotal += subtotal;

      validatedItems.push({
        ...item,
        product: product,
        priceAtTime: product.price,
        subtotal: subtotal
      });
    }

    // Validate delivery address
    if (!deliveryAddress || !deliveryAddress.recipientName || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.district) {
      return res.status(400).json({
        success: false,
        message: 'Complete delivery address is required'
      });
    }

    // Check minimum order value (optional)
    const minimumOrderValue = process.env.MINIMUM_ORDER_VALUE || 500; // LKR 500
    if (calculatedTotal < minimumOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value is LKR ${minimumOrderValue}`
      });
    }

    // Attach validated data to request
    req.validatedItems = validatedItems;
    req.calculatedTotal = calculatedTotal;
    
    next();

  } catch (error) {
    console.error('Order creation validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating order creation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Rate Limiting for Order Operations
 * Prevents abuse of order creation and updates
 */
export const orderRateLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const operation = req.route.path.includes('status') ? 'update' : 'create';
    const cacheKey = `order_${operation}_${userId}`;
    
    // Simple in-memory rate limiting (in production, use Redis)
    if (!global.orderRateLimit) {
      global.orderRateLimit = new Map();
    }
    
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = operation === 'create' ? 10 : 50; // 10 orders or 50 updates per 15 min
    
    const userAttempts = global.orderRateLimit.get(cacheKey) || { count: 0, resetTime: now + windowMs };
    
    if (now > userAttempts.resetTime) {
      // Reset the counter
      userAttempts.count = 1;
      userAttempts.resetTime = now + windowMs;
    } else {
      userAttempts.count += 1;
    }
    
    global.orderRateLimit.set(cacheKey, userAttempts);
    
    if (userAttempts.count > maxAttempts) {
      const resetIn = Math.ceil((userAttempts.resetTime - now) / 1000 / 60); // minutes
      return res.status(429).json({
        success: false,
        message: `Too many ${operation} attempts. Try again in ${resetIn} minutes.`,
        resetIn: resetIn
      });
    }
    
    next();
    
  } catch (error) {
    console.error('Rate limiting error:', error);
    next(); // Continue on error
  }
};

export default {
  validateOrderStatusTransition,
  validateOrderAccess,
  validateOrderCreation,
  orderRateLimit
};