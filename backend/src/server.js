import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

// import ratelimiter from "./middleware/rateLimiter.js"; // optional

// Import route placeholders
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import profileRoutes from "./routes/profile.js";
import { seedCategories } from "./lib/seedCategories.js";
import { cache, CACHE_DURATION, cacheKeys } from "./lib/cache.js";
import { cacheMiddleware, cacheInvalidationMiddleware } from "./middleware/cache.js";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS Configuration with detailed logging
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://helagovi-lk-1.onrender.com", 
    "https://helagovi-lk.onrender.com",
    "https://www.helagovi.lk",
    "https://helagovi.lk"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
};

console.log("CORS configured for origins:", corsOptions.origin);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(ratelimiter); // optional

// CORS and request logging middleware for debugging
app.use((req, res, next) => {
  // Log CORS-related requests
  if (req.headers.origin && !req.headers.origin.includes('localhost')) {
    console.log(`🌐 CORS Request: ${req.method} ${req.path}`);
    console.log("Origin:", req.headers.origin);
    console.log("User-Agent:", req.headers['user-agent']);
  }
  
  // Detailed logging for payment requests
  if (req.path.includes('/payments/')) {
    console.log(`� ${req.method} ${req.path}`);
    console.log("Request headers:", {
      origin: req.headers.origin,
      referer: req.headers.referer,
      'user-agent': req.headers['user-agent'],
      host: req.headers.host,
      'x-forwarded-for': req.headers['x-forwarded-for']
    });
  }
  next();
});

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));


// Health check endpoint (route to check health , and monitor)
// Health check route (before other routes)
app.get("/api/health", async (req, res) => {
  const cacheInfo = await cache.getInfo();
  
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    cache: cacheInfo
  });
});

// Database seeding route (for production deployment)
app.get("/api/seed-database", async (req, res) => {
  try {
    console.log("Starting database seeding...");
    await seedCategories();
    res.status(200).json({
      success: true,
      message: "Database seeded successfully with categories",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database seeding failed:", error);
    res.status(500).json({
      success: false,
      message: "Database seeding failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get price range statistics for filtering (with caching)
app.get("/api/products/price-stats", 
  cacheMiddleware(cacheKeys.priceStats, CACHE_DURATION.MEDIUM),
  async (req, res) => {
    try {
      const Product = (await import("./models/Product.js")).default;
      
      const stats = await Product.aggregate([
        {
          $match: {
            status: 'active',
            availableQuantity: { $gt: 0 },
            price: { $exists: true, $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
            avgPrice: { $avg: "$price" },
            totalProducts: { $sum: 1 }
          }
        }
      ]);

      const result = stats[0] || {
        minPrice: 0,
        maxPrice: 10000,
        avgPrice: 1000,
        totalProducts: 0
      };

      res.status(200).json({
        success: true,
        data: {
          minPrice: Math.floor(result.minPrice),
          maxPrice: Math.ceil(result.maxPrice),
          avgPrice: Math.round(result.avgPrice),
          totalProducts: result.totalProducts
        }
      });
    } catch (error) {
      console.error("Get price stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch price statistics",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Cache management endpoint (for debugging)
app.get("/api/cache/info", async (req, res) => {
  try {
    const info = await cache.getInfo();
    res.status(200).json({
      success: true,
      data: info
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get cache info",
      error: error.message
    });
  }
});

// Clear cache endpoint (for debugging - remove in production)
app.delete("/api/cache/clear/:pattern?", async (req, res) => {
  try {
    const pattern = req.params.pattern || '*';
    const result = await cache.clearPattern(pattern);
    res.status(200).json({
      success: true,
      message: `Cache cleared for pattern: ${pattern}`,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear cache",
      error: error.message
    });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Products with caching and invalidation
app.use("/api/products", (req, res, next) => {
  if (req.method === 'GET' && req.originalUrl !== '/api/products/price-stats') {
    // Skip caching for authenticated endpoints that are user-specific
    const isUserSpecificEndpoint = req.url.startsWith('/my/') || req.url.includes('/farmer/');
    
    if (isUserSpecificEndpoint) {
      console.log(`Skipping cache for user-specific endpoint: ${req.originalUrl}`);
      return next();
    }
    
    // Check if this is an individual product request (/api/products/:id)
    const isIndividualProduct = req.url.match(/^\/[a-fA-F0-9]{24}$/);
    
    let cacheKey;
    if (isIndividualProduct) {
      // Individual product: /api/products/:id
      const productId = req.url.substring(1); // Remove leading slash
      cacheKey = cacheKeys.productDetails(productId);
    } else {
      // Product listing: /api/products with query params
      cacheKey = cacheKeys.products(
        req.query.page,
        req.query.limit,
        {
          category: req.query.category || req.query.categoryRoot,
          search: req.query.search,
          district: req.query.district,
          minPrice: req.query.minPrice,
          maxPrice: req.query.maxPrice,
          isOrganic: req.query.isOrganic,
          sortBy: req.query.sortBy
        }
      );
    }
    
    console.log(`Caching products request: ${req.originalUrl} with key: ${cacheKey}`);
    return cacheMiddleware(() => cacheKey, CACHE_DURATION.SHORT)(req, res, next);
  } else if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    // Invalidate cache for write operations
    return cacheInvalidationMiddleware([
      'products:*',
      'price-stats',
      'product:*' // Also clear individual product caches
    ])(req, res, next);
  }
  next();
}, productRoutes);

// Categories with caching (cache for 1 hour since categories don't change often)
app.use('/api/categories', (req, res, next) => {
  if (req.method === 'GET') {
    return cacheMiddleware(
      () => `categories:${req.originalUrl}`,
      CACHE_DURATION.LONG
    )(req, res, next);
  } else if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    // Invalidate categories cache for write operations
    return cacheInvalidationMiddleware([
      'categories:*'
    ])(req, res, next);
  }
  next();
}, categoryRoutes);

app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);

// Profile with caching
app.use("/api/profile", (req, res, next) => {
  if (req.method === 'GET' && req.user) {
    return cacheMiddleware(
      () => cacheKeys.userProfile(req.user.id),
      CACHE_DURATION.SHORT
    )(req, res, next);
  } else if (['PUT', 'PATCH', 'DELETE'].includes(req.method) && req.user) {
    // Invalidate user cache on profile updates
    return cacheInvalidationMiddleware([
      `user:${req.user.id}:*`
    ])(req, res, next);
  }
  next();
}, profileRoutes);




// Test endpoint
app.get("/", (req, res) => res.send("Backend is working!"));

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use(errorHandler);




// Connect DB and start server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} with database`));
}).catch((error) => {
  console.log('Database connection failed, starting server without DB:', error.message);
  app.listen(PORT, () => console.log(`Server running on port ${PORT} WITHOUT database`));
});


export default app;