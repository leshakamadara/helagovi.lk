import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  resendVerification,
  manualVerifyUser,
  getUserStats
} from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('phone')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please enter a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['farmer', 'buyer', 'admin'])
    .withMessage('Role must be farmer, buyer, or admin')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.post('/resend-verification', protect, resendVerification);

// Development/Admin routes
router.put('/manual-verify/:userId', manualVerifyUser);
router.get('/stats', getUserStats);

export default router;