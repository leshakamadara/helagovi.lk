import express from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

const router = express.Router();

// GET /api/categories - Get all categories as tree structure
router.get('/', async (req, res) => {
  try {
    const { level, parent, includeCounts } = req.query;
    
    let categories;
    
    if (level !== undefined) {
      // Get categories by specific level
      const query = { isActive: true, level: parseInt(level) };
      if (parent) {
        query.parent = parent === 'null' ? null : parent;
      }
      
      categories = await Category.find(query)
        .populate('parent', 'name slug')
        .sort({ sortOrder: 1, 'name.en': 1 });
      
      if (includeCounts === 'true') {
        // Add product counts for each category
        for (let category of categories) {
          const productCount = await Product.countDocuments({ 
            category: category._id, 
            isActive: true 
          });
          category._doc.productCount = productCount;
        }
      }
      
      res.json({
        success: true,
        categories,
        count: categories.length,
        level: parseInt(level)
      });
    } else {
      // Get full tree structure
      categories = await Category.getCategoryTree();
      
      if (includeCounts === 'true') {
        // Recursively add product counts
        const addProductCounts = async (cats) => {
          for (let category of cats) {
            const productCount = await Product.countDocuments({ 
              category: category._id, 
              isActive: true 
            });
            category.productCount = productCount;
            
            if (category.children && category.children.length > 0) {
              await addProductCounts(category.children);
            }
          }
        };
        
        await addProductCounts(categories);
      }
      
      res.json({
        success: true,
        categories,
        count: categories.length
      });
    }
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
    const { level, search, lang = 'en' } = req.query;
    
    let query = { isActive: true };
    
    if (level !== undefined) {
      query.level = parseInt(level);
    }
    
    let categories;
    
    if (search) {
      // Search categories by name
      categories = await Category.searchCategories(search, lang);
    } else {
      categories = await Category.find(query)
        .populate('parent', 'name slug')
        .sort({ level: 1, sortOrder: 1, 'name.en': 1 });
    }
    
    // Add product counts
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          category: category._id, 
          isActive: true 
        });
        return {
          ...category.toObject(),
          productCount
        };
      })
    );
    
    res.json({
      success: true,
      categories: categoriesWithCounts,
      count: categoriesWithCounts.length,
      ...(level !== undefined && { level: parseInt(level) }),
      ...(search && { searchTerm: search })
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

// GET /api/categories/roots - Get only root categories (level 0)
router.get('/roots', async (req, res) => {
  try {
    const { includeCounts } = req.query;
    
    const categories = await Category.getRootCategories();
    
    if (includeCounts === 'true') {
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({ 
            category: category._id, 
            isActive: true 
          });
          
          // Get total products in all subcategories
          const descendants = await category.getDescendants();
          const descendantIds = descendants.map(d => d._id);
          const totalProductCount = await Product.countDocuments({ 
            category: { $in: [category._id, ...descendantIds] }, 
            isActive: true 
          });
          
          return {
            ...category.toObject(),
            directProductCount: productCount,
            totalProductCount
          };
        })
      );
      
      res.json({
        success: true,
        categories: categoriesWithCounts,
        count: categoriesWithCounts.length
      });
    } else {
      res.json({
        success: true,
        categories,
        count: categories.length
      });
    }
  } catch (error) {
    console.error('Error fetching root categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch root categories',
      error: error.message
    });
  }
});

// GET /api/categories/children/:parentId - Get children of a specific category
router.get('/children/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    const { includeCounts } = req.query;
    
    const categories = await Category.find({ 
      parent: parentId, 
      isActive: true 
    }).sort({ sortOrder: 1, 'name.en': 1 });
    
    if (includeCounts === 'true') {
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({ 
            category: category._id, 
            isActive: true 
          });
          return {
            ...category.toObject(),
            productCount
          };
        })
      );
      
      res.json({
        success: true,
        categories: categoriesWithCounts,
        count: categoriesWithCounts.length,
        parentId
      });
    } else {
      res.json({
        success: true,
        categories,
        count: categories.length,
        parentId
      });
    }
  } catch (error) {
    console.error('Error fetching category children:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category children',
      error: error.message
    });
  }
});

// GET /api/categories/search - Search categories
router.get('/search', async (req, res) => {
  try {
    const { q, lang = 'en', level } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    let categories = await Category.searchCategories(q, lang);
    
    if (level !== undefined) {
      categories = categories.filter(cat => cat.level === parseInt(level));
    }
    
    // Add product counts
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          category: category._id, 
          isActive: true 
        });
        return {
          ...category.toObject(),
          productCount
        };
      })
    );
    
    res.json({
      success: true,
      categories: categoriesWithCounts,
      count: categoriesWithCounts.length,
      searchQuery: q,
      language: lang
    });
  } catch (error) {
    console.error('Error searching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search categories',
      error: error.message
    });
  }
});

// GET /api/categories/slug/:slug - Get category by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { includeCounts, includeAncestors, includeDescendants } = req.query;
    
    const category = await Category.findBySlug(slug);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    let result = category.toObject();
    
    if (includeCounts === 'true') {
      const productCount = await Product.countDocuments({ 
        category: category._id, 
        isActive: true 
      });
      result.productCount = productCount;
    }
    
    if (includeAncestors === 'true') {
      result.ancestors = await category.getAncestors();
    }
    
    if (includeDescendants === 'true') {
      result.descendants = await category.getDescendants();
    }
    
    res.json({
      success: true,
      category: result
    });
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
});

// GET /api/categories/:id - Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { includeCounts, includeAncestors, includeDescendants } = req.query;
    
    const category = await Category.findById(id).populate('parent');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    let result = category.toObject();
    
    if (includeCounts === 'true') {
      const productCount = await Product.countDocuments({ 
        category: category._id, 
        isActive: true 
      });
      result.productCount = productCount;
    }
    
    if (includeAncestors === 'true') {
      result.ancestors = await category.getAncestors();
    }
    
    if (includeDescendants === 'true') {
      result.descendants = await category.getDescendants();
    }
    
    res.json({
      success: true,
      category: result
    });
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
});

export default router;