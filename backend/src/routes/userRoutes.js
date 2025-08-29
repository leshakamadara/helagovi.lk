// routes/userRoutes.js
import express from "express";
import { mockAuth, requireFarmer, mockUsers } from "../middleware/mockAuth.js";

const router = express.Router();

// Auth info endpoint (requires mock auth)
router.get("/auth/me", mockAuth, (req, res) => {
  res.json({
    user: req.user,
    message: "User authenticated successfully"
  });
});

// Mock user switching endpoint for testing
router.get("/mock-users", (req, res) => {
  res.json({
    availableUsers: Object.keys(mockUsers),
    users: mockUsers,
    instruction: "Use x-mock-user header with values: farmer, buyer, or agent"
  });
});

// Farmer dashboard
router.get("/farmer/dashboard", mockAuth, requireFarmer, (req, res) => {
  res.json({
    message: `Welcome to farmer dashboard, ${req.user.name}!`,
    district: req.user.district,
    roles: req.user.roles,
    stats: {
      activeListings: 12,
      totalSales: "LKR 45,000",
      pendingOrders: 3,
      completedOrders: 28
    }
  });
});

// User profile
router.get("/profile", mockAuth, (req, res) => {
  const { _id, name, roles, district, email, phone } = req.user;
  res.json({
    profile: { _id, name, roles, district, email, phone },
    message: "Profile retrieved successfully"
  });
});

// Update user profile (mock)
router.put("/profile", mockAuth, (req, res) => {
  const { name, email, phone } = req.body;
  
  // In a real app, you would validate and update in database
  const updatedProfile = {
    ...req.user,
    ...(name && { name }),
    ...(email && { email }),
    ...(phone && { phone }),
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    profile: updatedProfile,
    message: "Profile updated successfully"
  });
});

export default router;