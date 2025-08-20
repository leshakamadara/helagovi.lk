import express from "express";
const router = express.Router();

// Example GET route
router.get("/", (req, res) => {
  res.send("Order API works!");
});

export default router;
