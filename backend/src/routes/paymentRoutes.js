import express from "express";
import { createTransaction, deleteTransaction, getAllTransaction, updateTransaction } from "../controllers/paymentController.js";



const router = express.Router();


router.get("/Createtransaction", getAllTransaction);
router.post("/CreateTransaction", createTransaction);
router.put("/CreateTransaction/:id", updateTransaction);
router.delete("/CreateTransaction/:id", deleteTransaction);



export default router;
