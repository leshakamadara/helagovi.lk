import express from "express";
import { createTransaction, deleteTransaction, getAllTransaction, updateTransaction, getUserTransactions } from "../controllers/paymentController.js";
import {preapprove,notify,charge,createPayment} from "../controllers/PaymentGatewayController.js"
import {updateCardData,deleteCardData,getCardData} from "../controllers/PaymentCardController.js"
import { getWallet, getWithdrawals, createWithdrawal, creditFarmerWallet } from '../controllers/walletController.js'


const router = express.Router();

router.get("/:userId", getWallet);
router.get("/withdrawals/:userId", getWithdrawals);
router.post("/withdraw", createWithdrawal);
router.post("/wallet/:userId", creditFarmerWallet);


router.get("/Createtransaction", getAllTransaction);
router.get("/transactions/:userId", getUserTransactions);
router.post("/CreateTransaction", createTransaction);
router.put("/CreateTransaction/:id", updateTransaction);
router.delete("/CreateTransaction/:id", deleteTransaction);



router.get("/card/:userId", getCardData);
router.put("/card/:CardId", updateCardData);
router.delete("/card/:CardId", deleteCardData);


router.post("/preapprove", preapprove)
router.post("/notify",notify)
router.post("/charge",charge)
router.post("/pay",createPayment)

export default router;
