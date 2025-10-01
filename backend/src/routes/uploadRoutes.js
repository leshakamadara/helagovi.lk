import express from 'express';
import { protect } from '../middleware/auth.js';

import { uploadProducts, uploadReviews, cloudinary } from '../config/cloudinary.js';

const router = express.Router();

// @desc    Upload product images
// @route   POST /api/upload/products
// @access  Private (farmers only)
router.post('/products', protect, uploadProducts.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // Extract image URLs from Cloudinary response
    const imageUrls = req.files.map((file, index) => ({
      url: file.path, // Cloudinary URL
      alt: `Product image ${index + 1}`,
      isPrimary: index === 0, // First image is primary
      publicId: file.filename // Cloudinary public ID for deletion
    }));

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images: imageUrls
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
});

// @desc    Upload review images
// @route   POST /api/upload/reviews
// @access  Private (buyers only)
router.post('/reviews', protect, uploadReviews.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // Extract image URLs from Cloudinary response
    const imageUrls = req.files.map((file, index) => ({
      url: file.path, // Cloudinary URL
      alt: `Review image ${index + 1}`,
      publicId: file.filename // Cloudinary public ID for deletion
    }));

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images: imageUrls
      }
    });

  } catch (error) {
    console.error('Review image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
});

export default router;