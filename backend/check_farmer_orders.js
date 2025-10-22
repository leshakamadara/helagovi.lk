import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './src/config/db.js';
import Order from './src/models/Order.js';

async function checkFarmerOrders() {
  await connectDB();
  const farmerId = '68d1922ece415324ea53907f';
  
  const orders = await Order.find({
    farmers: farmerId
  }).limit(1000);
  
  console.log('Total orders found:', orders.length);
  
  let totalDelivered = 0;
  let totalPending = 0;
  let totalAll = 0;
  
  orders.forEach(order => {
    const farmerItems = order.items.filter(item => item.productSnapshot.farmer.id.toString() === farmerId);
    const farmerRevenue = farmerItems.reduce((sum, item) => sum + item.subtotal, 0);
    
    totalAll += farmerRevenue;
    
    if (order.status === 'delivered') {
      totalDelivered += farmerRevenue;
    } else if (!['delivered', 'cancelled'].includes(order.status)) {
      totalPending += farmerRevenue;
      console.log(`Order ${order.orderNumber}: Status=${order.status}, Farmer Revenue=LKR ${farmerRevenue}`);
    } else {
      console.log(`Order ${order.orderNumber}: Status=${order.status}, Farmer Revenue=LKR ${farmerRevenue} (excluded)`);
    }
  });
  
  console.log('');
  console.log('Summary:');
  console.log('Total revenue from delivered orders: LKR', totalDelivered);
  console.log('Total revenue from pending orders: LKR', totalPending);
  console.log('Total revenue from all orders: LKR', totalAll);
  
  process.exit(0);
}

checkFarmerOrders();