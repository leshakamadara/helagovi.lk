import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from 'http';
import { connectDB } from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import initializeSocket from "./services/socket.js";
import { startEscalationWorkflow } from './services/ticketEscalationService.js';

// import ratelimiter from "./middleware/rateLimiter.js"; // optional

// Import route placeholders
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import ticketRoutes from './routes/ticketRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
// app.use(ratelimiter); // optional


// Health check endpoint (route to check health , and monitor)
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/support", supportRoutes);
app.use('/api/tickets', ticketRoutes);

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
  // Start the escalation
  startEscalationWorkflow();

});


export default app;
