import Order from '../models/Order.js';
import Product from '../models/Product.js';

import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Helper function to build search query
const buildSearchQuery = (queryParams, userRole, userId) => {
  const {
    status,
    paymentStatus,
    customer,
    farmer,
    district,
    startDate,
    endDate,
    minAmount,
    maxAmount
  } = queryParams;

  let query = {};

  // Role-based filtering
  if (userRole === 'customer') {
    query.customer = userId;
  } else if (userRole === 'farmer') {
    query.farmer = userId;
  }

  // Status filters
  if (status) {
    query.orderStatus = status;
  }
  
  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  // User filters (admin only)
  if ((userRole === 'admin' || userRole === 'moderator') && customer) {
    if (mongoose.isValidObjectId(customer)) {
      query.customer = customer;
    }
  }
  
  if ((userRole === 'admin' || userRole === 'moderator') && farmer) {
    if (mongoose.isValidObjectId(farmer)) {
      query.farmer = farmer;
    }
  }

  // Location filter
  if (district) {
    query['deliveryAddress.district'] = district;
  }

  // Date range
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Amount range
  if (minAmount || maxAmount) {
    query.totalAmount = {};
    if (minAmount) query.totalAmount.$gte = Number(minAmount);
    if (maxAmount) query.totalAmount.$lte = Number(maxAmount);
  }

  return query;
};

// Create new order
export const createOrder = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, deliveryAddress, paymentMethod, deliveryInstructions } = req.body;
    
    // Verify items and calculate totals
    let subtotal = 0;
    const orderItems = [];
    let farmerId = null;

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (product.status !== 'active' || product.availableQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.title} is not available in the requested quantity`
        });
      }

      // Set farmer ID (all items should be from the same farmer)
      if (!farmerId) {
        farmerId = product.farmer;
      } else if (farmerId.toString() !== product.farmer.toString()) {
        return res.status(400).json({
          success: false,
          message: 'All products in an order must be from the same farmer'
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal
      });
    }

    // Verify farmer exists
    const farmer = await User.findById(farmerId);
    if (!farmer || farmer.role !== 'farmer') {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Calculate delivery fee (simplified logic)
    const deliveryFee = calculateDeliveryFee(deliveryAddress.district);
    const totalAmount = subtotal + deliveryFee;

    // Create order
    const orderData = {
      customer: req.user.id,
      farmer: farmerId,
      items: orderItems,
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      deliveryInstructions
    };

    const order = new Order(orderData);
    await order.save();

    // Update product quantities
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { availableQuantity: -item.quantity } }
      );
    }

    // Populate references before sending response
    await order.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'farmer', select: 'name email phone' },
      { path: 'items.product', select: 'title images unit' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper function to calculate delivery fee
const calculateDeliveryFee = (district) => {
  // Simplified delivery fee calculation based on district
  const metroDistricts = ['Colombo', 'Gampaha', 'Kalutara'];
  const urbanDistricts = ['Kandy', 'Galle', 'Matara'];
  
  if (metroDistricts.includes(district)) {
    return 200;
  } else if (urbanDistricts.includes(district)) {
    return 300;
  } else {
    return 500;
  }
};

// Get all orders with filtering and pagination
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      fields
    } = req.query;

    // Build query based on user role
    const query = buildSearchQuery(req.query, req.user.role, req.user.id);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build aggregation pipeline for better performance
    const pipeline = [
      { $match: query },
      { $sort: sort },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNum },
            {
              $lookup: {
                from: 'users',
                localField: 'customer',
                foreignField: '_id',
                as: 'customer'
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: 'farmer',
                foreignField: '_id',
                as: 'farmer'
              }
            },
            {
              $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productDetails'
              }
            },
            {
              $unwind: '$customer'
            },
            {
              $unwind: '$farmer'
            },
            {
              $project: {
                orderNumber: 1,
                items: 1,
                subtotal: 1,
                deliveryFee: 1,
                totalAmount: 1,
                deliveryAddress: 1,
                paymentMethod: 1,
                paymentStatus: 1,
                orderStatus: 1,
                estimatedDelivery: 1,
                deliveredAt: 1,
                createdAt: 1,
                updatedAt: 1,
                'customer._id': 1,
                'customer.name': 1,
                'customer.email': 1,
                'customer.phone': 1,
                'farmer._id': 1,
                'farmer.name': 1,
                'farmer.email': 1,
                'farmer.phone': 1,
                ...(fields && fields.split(',').reduce((acc, field) => {
                  acc[field] = 1;
                  return acc;
                }, {}))
              }
            }
          ],
          totalCount: [{ $count: 'count' }]
        }
      }
    ];

    const [result] = await Order.aggregate(pipeline);
    const orders = result.data;
    const totalOrders = result.totalCount[0]?.count || 0;

    // Calculate pagination info
    const totalPages = Math.ceil(totalOrders / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalOrders,
        ordersPerPage: limitNum,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        status: req.query.status || null,
        paymentStatus: req.query.paymentStatus || null,
        district: req.query.district || null,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(id)
      .populate('customer', 'name email phone')
      .populate('farmer', 'name email phone district city')
      .populate('items.product', 'title images unit category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has permission to view this order
    if (req.user.role !== 'admin' && 
        req.user.role !== 'moderator' &&
        order.customer._id.toString() !== req.user.id &&
        order.farmer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, reason } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has permission to update this order
    const isOwner = order.farmer.toString() === req.user.id;
    const isCustomer = order.customer.toString() === req.user.id;
    
    if (req.user.role !== 'admin' && 
        req.user.role !== 'moderator' && 
        !isOwner && 
        !(isCustomer && status === 'cancelled')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Customers can only cancel orders that are still pending/confirmed
    if (isCustomer && status === 'cancelled' && 
        !['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order at this stage'
      });
    }

    // Update order status
    await order.updateStatus(status, reason);

    // If order is cancelled, restore product quantities
    if (status === 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { availableQuantity: item.quantity } }
        );
      }
    }

    // Repopulate the order before sending response
    await order.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'farmer', select: 'name email phone' },
      { path: 'items.product', select: 'title images unit' }
    ]);

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    
    if (error.message.startsWith('Cannot transition from')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only admins and moderators can update payment status
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update payment status'
      });
    }

    // Update payment status
    await order.updatePaymentStatus(paymentStatus);

    // Repopulate the order before sending response
    await order.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'farmer', select: 'name email phone' },
      { path: 'items.product', select: 'title images unit' }
    ]);

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      data: order
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    
    if (error.message.startsWith('Cannot transition from')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get orders by customer (for customer dashboard)
export const getMyOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { customer: req.user.id };
    if (status) query.orderStatus = status;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('farmer', 'name phone')
        .populate('items.product', 'title images unit'),
      Order.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalOrders / limitNum);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalOrders,
        ordersPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get orders by farmer (for farmer dashboard)
export const getFarmerOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { farmer: req.user.id };
    if (status) query.orderStatus = status;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('customer', 'name phone')
        .populate('items.product', 'title images unit'),
      Order.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalOrders / limitNum);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalOrders,
        ordersPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get farmer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isFarmer = req.user.role === 'farmer';
    
    const matchStage = isAdmin ? {} : { farmer: mongoose.Types.ObjectId(userId) };
    
    // Get overall stats
    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          pendingOrders: { 
            $sum: { 
              $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0] 
            } 
          },
          completedOrders: { 
            $sum: { 
              $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] 
            } 
          },
          cancelledOrders: { 
            $sum: { 
              $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] 
            } 
          },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);
    
    // Get recent orders count by status
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentStats = await Order.aggregate([
      { 
        $match: { 
          ...matchStage,
          createdAt: { $gte: thirtyDaysAgo } 
        } 
      },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get revenue by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const revenueByMonth = await Order.aggregate([
      { 
        $match: { 
          ...matchStage,
          createdAt: { $gte: sixMonthsAgo },
          orderStatus: 'delivered'
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          averageOrderValue: 0
        },
        recentStatus: recentStats,
        revenueByMonth: revenueByMonth
      }
    });
    
  } catch (error) {
    console.error('Order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get order statistics for dashboard (detailed variant)
export const getOrderStatsDetailed = async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    const farmerId = req.user.id;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7days':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
        break;
      case '30days':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
        break;
      case '90days':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 90)) } };
        break;
      case 'year':
        dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
        break;
    }

    const stats = await Order.aggregate([
      { $match: { farmer: mongoose.Types.ObjectId(farmerId), ...dateFilter } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          pendingOrders: { 
            $sum: { $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0] } 
          },
          confirmedOrders: { 
            $sum: { $cond: [{ $eq: ['$orderStatus', 'confirmed'] }, 1, 0] } 
          },
          processingOrders: { 
            $sum: { $cond: [{ $eq: ['$orderStatus', 'processing'] }, 1, 0] } 
          },
          shippedOrders: { 
            $sum: { $cond: [{ $eq: ['$orderStatus', 'shipped'] }, 1, 0] } 
          },
          deliveredOrders: { 
            $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] } 
          },
          cancelledOrders: { 
            $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] } 
          },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Get daily order trends for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyTrends = await Order.aggregate([
      { 
        $match: { 
          farmer: mongoose.Types.ObjectId(farmerId),
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          confirmedOrders: 0,
          processingOrders: 0,
          shippedOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0,
          averageOrderValue: 0
        },
        dailyTrends,
        period
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Send notification to buyer
export const notifyBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, type = 'order_update' } = req.body;

    const order = await Order.findById(id)
      .populate('customer', 'name email')
      .populate('farmer', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has permission
    if (order.farmer._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send notifications for this order'
      });
    }

    // Create notification (you would integrate with your notification service)
    const notification = {
      recipient: order.customer._id,
      sender: req.user.id,
      type,
      title: `Order ${order.orderNumber} Update`,
      message: message || `Your order status has been updated to ${order.orderStatus}`,
      relatedEntity: order._id,
      relatedEntityModel: 'Order'
    };

    // Save to database (or send via email/SMS/push notification)
    // await Notification.create(notification);

    // Here you would integrate with your email service, SMS service, or push notification service
    console.log('Notification would be sent:', notification);

    res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      data: notification
    });

  } catch (error) {
    console.error('Notify buyer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

