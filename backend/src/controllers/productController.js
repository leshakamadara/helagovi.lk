import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Helper function to build search query
const buildSearchQuery = async (queryParams) => {
  const {
    search,
    category,
    categoryRoot,
    district,
    city,
    minPrice,
    maxPrice,
    isOrganic,
    status,
    qualityScore,
    farmer,
    latitude,
    longitude,
    maxDistance = 10000
  } = queryParams;

  let query = {};

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Category filter - direct category match
  if (category) {
    if (mongoose.isValidObjectId(category)) {
      query.category = new mongoose.Types.ObjectId(category);
    }
  }

  // Category root filter - includes all subcategories
  if (categoryRoot && !category) {
    if (mongoose.isValidObjectId(categoryRoot)) {
      try {
        const rootCategory = await Category.findById(categoryRoot);
        if (rootCategory) {
          // Get all descendant categories
          const descendants = await rootCategory.getDescendants();
          const categoryIds = [new mongoose.Types.ObjectId(categoryRoot), ...descendants.map(d => new mongoose.Types.ObjectId(d._id))];
          query.category = { $in: categoryIds };
        }
      } catch (error) {
        console.error('Error fetching category descendants:', error);
        // Fallback to direct category match
        query.category = new mongoose.Types.ObjectId(categoryRoot);
      }
    }
  }

  // Location filters
  if (district) {
    query.district = district;
  }
  if (city) {
    query.city = new RegExp(city, 'i');
  }

  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Boolean filters
  if (isOrganic !== undefined) {
    query.isOrganic = isOrganic === 'true';
  }

  // Status filter
  if (status) {
    query.status = status;
  } else {
    query.status = 'active'; // Default to active products
    query.availableQuantity = { $gt: 0 };
  }

  // Quality score filter
  if (qualityScore) {
    query.qualityScore = { $gte: Number(qualityScore) };
  }

  // Farmer filter
  if (farmer && mongoose.isValidObjectId(farmer)) {
    query.farmer = farmer;
  }

  // Geospatial query for nearby products
  if (latitude && longitude) {
    query.coordinates = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [Number(longitude), Number(latitude)]
        },
        $maxDistance: Number(maxDistance)
      }
    };
  }

  return query;
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    // Debug: Log the incoming request data
    console.log('=== CREATE PRODUCT DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user?.email);
    console.log('============================');

    // Check for validation errors (currently disabled)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if user's email is verified (skip in development environment)
    const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    if (!req.user.isVerified && !isDevelopment) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required. Please verify your email address before creating products.',
        code: 'EMAIL_VERIFICATION_REQUIRED'
      });
    }

    // Verify category exists (make optional for now)
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        console.log('Category not found:', req.body.category);
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Create product with farmer from authenticated user
    const productData = {
      ...req.body,
      farmer: req.user.id // From auth middleware
    };

    console.log('Creating product with data:', JSON.stringify(productData, null, 2));

    const product = new Product(productData);
    await product.save();

    console.log('Product created successfully:', product._id);

    // Populate references before sending response
    await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'farmer', select: 'firstName lastName email phone profilePicture' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all products with filtering, search, and pagination
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      fields
    } = req.query;

    // Build query
    const query = await buildSearchQuery(req.query);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build projection object
    const projection = {
      title: 1,
      description: 1,
      price: 1,
      unit: 1,
      images: 1,
      district: 1,
      city: 1,
      coordinates: 1,
      qualityScore: 1,
      isOrganic: 1,
      harvestDate: 1,
      availableQuantity: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
      freshnessDays: 1,
      soldPercentage: 1,
      primaryImage: 1,
      averageRating: 1,
      totalReviews: 1,
      'category._id': 1,
      'category.name': 1,
      'category.slug': 1,
      'farmer._id': 1,
      'farmer.firstName': 1,
      'farmer.lastName': 1,
      'farmer.phone': 1,
      'farmer.profilePicture': 1
    };

    // Add text score for text search results
    if (req.query.search) {
      projection.score = { $meta: 'textScore' };
    }

    // Add custom fields if specified
    if (fields) {
      const customFields = fields.split(',');
      customFields.forEach(field => {
        projection[field.trim()] = 1;
      });
    }

    // Build aggregation pipeline for better performance
    const pipeline = [
      { $match: query }
    ];

    // Add text score calculation stage if searching
    if (req.query.search) {
      pipeline.push({
        $addFields: {
          score: { $meta: 'textScore' }
        }
      });
    }

    // Add sort stage
    pipeline.push({ $sort: sort });

    // Add facet stage for pagination and data processing
    pipeline.push({
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limitNum },
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'farmer',
              foreignField: '_id',
              as: 'farmer'
            }
          },
          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $unwind: {
              path: '$farmer',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: projection
          }
        ],
        totalCount: [{ $count: 'count' }]
      }
    });

    const [result] = await Product.aggregate(pipeline);
    const products = result.data;
    const totalProducts = result.totalCount[0]?.count || 0;

    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        productsPerPage: limitNum,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        search: req.query.search || null,
        category: req.query.category || null,
        district: req.query.district || null,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id)
      .populate('category', 'name slug description')
      .populate('farmer', 'firstName lastName email phone district city profilePicture');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count (if you have this field)
    // await Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Find product and check ownership
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product (unless admin)
    if (existingProduct.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Verify category exists if being updated
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...req.body },
      { 
        new: true, 
        runValidators: true 
      }
    ).populate([
      { path: 'category', select: 'name slug' },
      { path: 'farmer', select: 'firstName lastName email phone profilePicture' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Find product and check ownership
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product (unless admin)
    if (product.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update product status
export const updateProductStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Find product and check ownership
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product (unless admin)
    if (product.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Update status
    product.status = status;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product status updated to ${status}`,
      data: {
        id: product._id,
        status: product.status,
        updatedAt: product.updatedAt
      }
    });

  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get products by farmer (for farmer dashboard)
export const getMyProducts = async (req, res) => {
  try {
    console.log('=== GET MY PRODUCTS DEBUG ===');
    console.log('User:', req.user?.email, 'ID:', req.user?.id);
    
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { farmer: req.user.id };
    if (status) query.status = status;
    
    console.log('Query:', query);

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('category', 'name slug'),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalProducts / limitNum);

    console.log(`Found ${products.length} products for user ${req.user.id}`);
    
    const response = {
      success: true,
      data: products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        productsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };
    
    console.log('Sending response:', JSON.stringify({...response, data: `[${products.length} products]`}));
    res.status(200).json(response);

  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update product quantity (for sales)
export const updateQuantity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { quantityUsed } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);
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

    // Use the instance method from the model
    const updatedProduct = await product.updateQuantity(quantityUsed);

    res.status(200).json({
      success: true,
      message: 'Product quantity updated successfully',
      data: {
        id: updatedProduct._id,
        availableQuantity: updatedProduct.availableQuantity,
        status: updatedProduct.status,
        soldPercentage: updatedProduct.soldPercentage
      }
    });

  } catch (error) {
    console.error('Update quantity error:', error);
    
    if (error.message === 'Cannot use more quantity than available') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update product quantity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};