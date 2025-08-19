import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./config/db.js";
import ratelimiter from "./middleware/rateLimiter.js";

// Feature routes
import userRoutes from "./routes/users/userRoutes.js";
import productRoutes from "./routes/products/productRoutes.js";
import orderRoutes from "./routes/orders/orderRoutes.js";
import paymentRoutes from "./routes/payments/paymentRoutes.js";
import supportRoutes from "./routes/support/supportRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin
  })
);
app.use(express.json());

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




// What is Endpoint?
// An endpoint is is a combination of URL+HTTP method that lets clients to interact with specefic resource.

// Start server after DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
  });
});
