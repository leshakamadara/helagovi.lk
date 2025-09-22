const express = require('express');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
  deactivateAccount,
  deleteAccount,
  upload
} = require('../controllers/profile');
const { protect } = require('../middleware/auth');

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

module.exports = router;