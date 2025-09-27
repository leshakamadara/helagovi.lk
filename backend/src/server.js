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
import uploadRoutes from "./routes/uploadRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import profileRoutes from "./routes/profile.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
// app.use(ratelimiter); // optional

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));


// Health check endpoint (route to check health , and monitor)
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/profile", profileRoutes);


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