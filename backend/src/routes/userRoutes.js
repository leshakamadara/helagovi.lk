import express from "express";
const router = express.Router();

// Example GET route
router.get("/", (req, res) => {
  res.send("User API works!");
});

export default router;