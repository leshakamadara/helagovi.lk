import express from 'express';
import { body } from 'express-validator';
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
  deactivateAccount,
  deleteAccount,
  upload
} from '../controllers/profile.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please enter a valid phone number')
];

// Routes
router.get('/', protect, getProfile);
router.put('/', protect, updateProfileValidation, updateProfile);
router.post('/upload-picture', protect, upload.single('profilePicture'), uploadProfilePicture);
router.delete('/remove-picture', protect, removeProfilePicture);
router.put('/deactivate', protect, deactivateAccount);
router.delete('/', protect, deleteAccount);

export default router;