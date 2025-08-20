import express from "express";
const router = express.Router();

// Example GET route
router.get("/", (req, res) => {
  res.send("Product API works!");
});

export default router;
