import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import ratelimiter from "./middleware/rateLimiter.js";
import { swaggerUi, specs } from "./config/swagger.js"; // ✅ Add this

// Feature routes


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // frontend origin
}));
app.use(express.json());

//  Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "MERN API Documentation"
}));

// Rate limiter middleware
app.use(async (req, res, next) => {
  try {
    const { success } = await ratelimiter.limit(req.ip);
    if (!success) return res.status(429).json({ message: "Too many requests" });
    next();
  } catch (err) {
    console.error("Rate limiter error:", err);
    next();
  }
});

//  API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'MERN API is running',
    version: '1.0.0',
    documentation: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders',
      payments: '/api/payments',
      support: '/api/support'
    }
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/support", supportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server after DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
    console.log(` API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(` API Info: http://localhost:${PORT}/api`); 
  });
});