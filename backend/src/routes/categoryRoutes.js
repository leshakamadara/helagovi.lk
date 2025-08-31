import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// GET /api/categories - Get all categories as tree structure
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getCategoryTree();
    res.json({
      success: true,
      categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// GET /api/categories/flat - Get all categories as flat list
router.get('/flat', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parent', 'name slug')
      .sort({ level: 1, sortOrder: 1, 'name.en': 1 });
    
    res.json({
      success: true,
      categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Error fetching flat categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

export default router;