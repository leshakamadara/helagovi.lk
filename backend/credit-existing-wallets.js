import mongoose from 'mongoose';
import Order from './src/models/Order.js';
import Wallet from './src/models/wallet.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const creditExistingWallets = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/helagovi');
    console.log('Connected to MongoDB');

    // Run the wallet crediting for existing orders
    const result = await Order.creditExistingDeliveredOrders();

    if (result.success) {
      console.log(`✅ Successfully credited wallets for ${result.ordersProcessed} existing orders`);
      console.log(`💰 Total amount credited: LKR ${result.totalCredited}`);
    } else {
      console.error('❌ Failed to credit existing wallets:', result.error);
    }

  } catch (error) {
    console.error('Error running wallet credit script:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
creditExistingWallets();