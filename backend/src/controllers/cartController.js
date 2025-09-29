import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get user's cart items
// @route   GET /api/cart
// @access  Private (Buyer only)
export const getCart = asyncHandler(async (req, res) => {
  const cartItems = await CartItem.find({ buyer: req.user._id })
    .populate({
      path: 'product',
      populate: {
        path: 'farmer',
        select: 'firstName lastName profilePicture'
      }
    })
    .sort({ addedAt: -1 });

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + item.totalPrice, 0);
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const shipping = itemCount > 0 ? 200 : 0; // Base shipping cost
  const total = subtotal + shipping;

  res.json({
    success: true,
    data: {
      items: cartItems,
      totals: {
        subtotal,
        shipping,
        total,
        itemCount
      }
    }
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private (Buyer only)
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  // Check if product exists and is available
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (product.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Product is not available for purchase'
    });
  }

  if (product.availableQuantity < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.availableQuantity} ${product.unit} available`
    });
  }

  // Check if item already exists in cart
  const existingCartItem = await CartItem.findOne({
    buyer: req.user._id,
    product: productId
  });

  let cartItem;

  if (existingCartItem) {
    // Update quantity
    const newQuantity = existingCartItem.quantity + quantity;
    
    if (newQuantity > product.availableQuantity) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more items. Only ${product.availableQuantity} ${product.unit} available, you already have ${existingCartItem.quantity} in cart`
      });
    }

    existingCartItem.quantity = newQuantity;
    cartItem = await existingCartItem.save();
  } else {
    // Create new cart item
    cartItem = await CartItem.create({
      buyer: req.user._id,
      product: productId,
      quantity,
      priceAtTime: product.price
    });
  }

  // Populate the cart item
  await cartItem.populate({
    path: 'product',
    populate: {
      path: 'farmer',
      select: 'firstName lastName profilePicture'
    }
  });

  res.status(201).json({
    success: true,
    message: 'Item added to cart successfully',
    data: cartItem
  });
});

// @desc    Update cart item quantity
// @route   PATCH /api/cart/:itemId
// @access  Private (Buyer only)
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  if (!quantity || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Valid quantity is required'
    });
  }

  const cartItem = await CartItem.findOne({
    _id: itemId,
    buyer: req.user._id
  }).populate('product');

  if (!cartItem) {
    return res.status(404).json({
      success: false,
      message: 'Cart item not found'
    });
  }

  // Check product availability
  if (quantity > cartItem.product.availableQuantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${cartItem.product.availableQuantity} ${cartItem.product.unit} available`
    });
  }

  cartItem.quantity = quantity;
  await cartItem.save();

  await cartItem.populate({
    path: 'product',
    populate: {
      path: 'farmer',
      select: 'firstName lastName profilePicture'
    }
  });

  res.json({
    success: true,
    message: 'Cart item updated successfully',
    data: cartItem
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private (Buyer only)
export const removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const cartItem = await CartItem.findOneAndDelete({
    _id: itemId,
    buyer: req.user._id
  });

  if (!cartItem) {
    return res.status(404).json({
      success: false,
      message: 'Cart item not found'
    });
  }

  res.json({
    success: true,
    message: 'Item removed from cart successfully'
  });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private (Buyer only)
export const clearCart = asyncHandler(async (req, res) => {
  await CartItem.deleteMany({ buyer: req.user._id });

  res.json({
    success: true,
    message: 'Cart cleared successfully'
  });
});

// @desc    Get cart summary (count and total)
// @route   GET /api/cart/summary
// @access  Private (Buyer only)
export const getCartSummary = asyncHandler(async (req, res) => {
  const cartItems = await CartItem.find({ buyer: req.user._id });

  const subtotal = cartItems.reduce((total, item) => total + item.totalPrice, 0);
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const shipping = itemCount > 0 ? 200 : 0;
  const total = subtotal + shipping;

  res.json({
    success: true,
    data: {
      itemCount,
      subtotal,
      shipping,
      total
    }
  });
});