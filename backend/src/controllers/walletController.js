import Wallet from "../models/wallet.js";
import Withdrawal from "../models/withdrawel.js";
import mongoose from "mongoose";





export const creditFarmerWallet = async (req, res) => {
  try {
    const { farmerId, amount } = req.body;

    if (!farmerId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid farmer ID or amount" });
    }

    
    let wallet = await Wallet.findOne({ userId: farmerId });
    if (!wallet) {
      wallet = new Wallet({ userId: farmerId });
    }

  
    wallet.availableBalance = (wallet.availableBalance || 0) + amount;
    wallet.totalEarnings = (wallet.totalEarnings || 0) + amount;

    await wallet.save();

    res.status(200).json({
      message: "Farmer wallet updated successfully",
      wallet
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update farmer wallet", error });
  }
};





export const getWallet = async (req, res) => {
  try {
    const { userId } = req.params;
    let wallet = await Wallet.findOne({ userId });

    
    if (!wallet) {
      wallet = new Wallet({ userId });
      await wallet.save();
    }

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wallet data", error });
  }
};


export const getWithdrawals = async (req, res) => {
  try {
    const { userId } = req.params;
    const withdrawals = await Withdrawal.find({ userId }).sort({ requestedAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch withdrawals", error });
  }
};


export const createWithdrawal = async (req, res) => {
  try {
    const { userId, amount, bankDetails } = req.body;
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    if (wallet.availableBalance < amount)
      return res.status(400).json({ message: "Insufficient balance" });

    const newWithdrawal = new Withdrawal({
      userId,
      amount,
      bankDetails,
      status: "pending",
      method: "bank_transfer",
      estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    });

    await newWithdrawal.save();

    wallet.availableBalance -= amount;
    wallet.pendingBalance += amount;
    wallet.lastWithdrawal = { amount, date: new Date(), status: "pending" };
    await wallet.save();

    res.status(201).json(newWithdrawal);


    setTimeout(async () => {
      const now = new Date();
      const datePart = now.getFullYear().toString() + 
                 (now.getMonth() + 1).toString().padStart(2, '0') +
                 now.getDate().toString().padStart(2, '0');
                 
      const txnId = "TXN" + datePart + Math.floor(Math.random() * 1e6);
      await Withdrawal.findByIdAndUpdate(newWithdrawal._id, {
        status: "completed",
        processedAt: new Date(),
        transactionId: txnId
      });
      const updatedWallet = await Wallet.findOne({ userId });
      updatedWallet.pendingBalance -= amount;
      await updatedWallet.save();
      console.log(`✅ Withdrawal ${txnId} completed for user ${userId}`);
    }, 3000);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Withdrawal failed", error });
  }
};
