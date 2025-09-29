import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
} from '../controllers/cartController.js';

const router = express.Router();

// Apply auth protection to all cart routes
router.use(protect);

// Routes
router.route('/')
  .get(getCart)      // GET /api/cart
  .post(addToCart)   // POST /api/cart
  .delete(clearCart); // DELETE /api/cart

router.get('/summary', getCartSummary); // GET /api/cart/summary

router.route('/:itemId')
  .patch(updateCartItem)   // PATCH /api/cart/:itemId
  .delete(removeFromCart); // DELETE /api/cart/:itemId

export default router;