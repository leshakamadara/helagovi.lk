import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';

/**
 * Order Service Class
 * Contains business logic for order management
 */
export class OrderService {
  
  /**
   * Create a new order with business logic
   */
  static async createOrderWithBusinessLogic(orderData, buyerId) {
    try {
      // Validate buyer exists and is active
      const buyer = await User.findById(buyerId);
      if (!buyer || !buyer.isActive || buyer.role !== 'buyer') {
        throw new Error('Invalid buyer account');
      }

      // Validate all products and check availability
      const productIds = orderData.items.map(item => item.productId);
      const products = await Product.find({
        _id: { $in: productIds },
        status: 'active'
      }).populate('farmer');

      if (products.length !== productIds.length) {
        throw new Error('Some products are no longer available');
      }

      // Check stock availability for each item
      for (const item of orderData.items) {
        const product = products.find(p => p._id.toString() === item.productId);
        if (product.availableQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.title}. Available: ${product.availableQuantity}`);
        }
      }

      // Create order with enhanced data
      const enhancedOrderData = {
        ...orderData,
        buyer: buyerId,
        expectedDeliveryDate: this.calculateExpectedDeliveryDate(orderData.deliveryAddress.district)
      };

      const order = new Order(enhancedOrderData);
      await order.save();

      // Send notifications
      await this.sendOrderCreatedNotifications(order);

      return order;

    } catch (error) {
      console.error('Order creation service error:', error);
      throw error;
    }
  }

  /**
   * Calculate expected delivery date based on district
   */
  static calculateExpectedDeliveryDate(district) {
    const baseDeliveryDays = 2;
    const districtDelays = {
      'Colombo': 0,
      'Gampaha': 1,
      'Kalutara': 1,
      'Kandy': 2,
      'Matale': 3,
      'Nuwara Eliya': 3,
      'Galle': 2,
      'Matara': 3,
      'Hambantota': 4,
      'Jaffna': 5,
      'Kilinochchi': 6,
      'Mannar': 6,
      'Vavuniya': 5,
      'Mullaitivu': 6,
      'Batticaloa': 4,
      'Ampara': 4,
      'Trincomalee': 4,
      'Kurunegala': 3,
      'Puttalam': 4,
      'Anuradhapura': 4,
      'Polonnaruwa': 4,
      'Badulla': 4,
      'Moneragala': 5,
      'Ratnapura': 3,
      'Kegalle': 2
    };

    const additionalDays = districtDelays[district] || 3;
    const totalDays = baseDeliveryDays + additionalDays;
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + totalDays);
    
    return deliveryDate;
  }

  /**
   * Update order status with business rules
   */
  static async updateOrderStatusWithBusinessLogic(orderId, newStatus, note, updatedBy) {
    try {
      const order = await Order.findById(orderId)
        .populate('buyer', 'firstName lastName email')
        .populate('farmers', 'firstName lastName email')
        .populate('items.product', 'title');

      if (!order) {
        throw new Error('Order not found');
      }

      const oldStatus = order.status;

      // Apply business rules based on status transition
      await this.applyStatusTransitionRules(order, newStatus);

      // Update the order status
      await order.updateStatus(newStatus, note, updatedBy);

      // Send notifications for status changes
      await this.sendStatusUpdateNotifications(order, oldStatus, newStatus);

      return order;

    } catch (error) {
      console.error('Order status update service error:', error);
      throw error;
    }
  }

  /**
   * Apply business rules for status transitions
   */
  static async applyStatusTransitionRules(order, newStatus) {
    switch (newStatus) {
      case 'confirmed':
        // Reserve product quantities
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          if (product && product.availableQuantity < item.quantity) {
            throw new Error(`Insufficient quantity for ${product.title}`);
          }
        }
        break;

      case 'shipped':
        // Generate tracking number
        if (!order.trackingNumber) {
          order.trackingNumber = this.generateTrackingNumber();
        }
        break;

      case 'delivered':
        // Mark as delivered and enable reviews
        order.actualDeliveryDate = new Date();
        order.canBeReviewed = true;
        break;

      case 'cancelled':
        // Handle refunds if payment was made
        if (order.paymentInfo.status === 'paid') {
          await this.initiateRefund(order);
        }
        break;
    }
  }

  /**
   * Generate unique tracking number
   */
  static generateTrackingNumber() {
    const prefix = 'HLG';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Initiate refund process
   */
  static async initiateRefund(order) {
    try {
      // In a real application, you would integrate with payment gateway
      console.log(`Initiating refund for order ${order.orderNumber}, amount: ${order.total}`);
      
      // Update payment status
      order.paymentInfo.status = 'refunded';
      order.refundAmount = order.total;
      order.refundedAt = new Date();
      
      await order.save();

      // Send refund confirmation email
      await this.sendRefundNotification(order);

    } catch (error) {
      console.error('Refund initiation error:', error);
      throw new Error('Failed to initiate refund');
    }
  }

  /**
   * Send order created notifications
   */
  static async sendOrderCreatedNotifications(order) {
    try {
      const populatedOrder = await Order.findById(order._id)
        .populate('buyer', 'firstName lastName email')
        .populate('farmers', 'firstName lastName email')
        .populate('items.product', 'title farmer');

      // Send confirmation email to buyer
      await this.sendOrderConfirmationToBuyer(populatedOrder);

      // Send new order notifications to farmers
      await this.sendNewOrderNotificationsToFarmers(populatedOrder);

    } catch (error) {
      console.error('Order notification error:', error);
      // Don't throw error here as order creation is successful
    }
  }

  /**
   * Send order confirmation email to buyer
   */
  static async sendOrderConfirmationToBuyer(order) {
    try {
      const emailContent = this.generateOrderConfirmationEmailContent(order);
      
      await sendEmail({
        to: order.buyer.email,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: emailContent
      });

    } catch (error) {
      console.error('Buyer email notification error:', error);
    }
  }

  /**
   * Send new order notifications to farmers
   */
  static async sendNewOrderNotificationsToFarmers(order) {
    try {
      // Group items by farmer
      const itemsByFarmer = {};
      for (const item of order.items) {
        const farmerId = item.productSnapshot.farmer.id.toString();
        if (!itemsByFarmer[farmerId]) {
          itemsByFarmer[farmerId] = {
            farmer: order.farmers.find(f => f._id.toString() === farmerId),
            items: []
          };
        }
        itemsByFarmer[farmerId].items.push(item);
      }

      // Send email to each farmer
      for (const [farmerId, data] of Object.entries(itemsByFarmer)) {
        const emailContent = this.generateFarmerOrderNotificationContent(order, data.items);
        
        await sendEmail({
          to: data.farmer.email,
          subject: `New Order Received - ${order.orderNumber}`,
          html: emailContent
        });
      }

    } catch (error) {
      console.error('Farmer email notification error:', error);
    }
  }

  /**
   * Send status update notifications
   */
  static async sendStatusUpdateNotifications(order, oldStatus, newStatus) {
    try {
      const emailContent = this.generateStatusUpdateEmailContent(order, oldStatus, newStatus);
      
      // Send to buyer
      await sendEmail({
        to: order.buyer.email,
        subject: `Order Status Update - ${order.orderNumber}`,
        html: emailContent
      });

      // Send to relevant farmers if needed
      if (['confirmed', 'shipped', 'delivered'].includes(newStatus)) {
        for (const farmer of order.farmers) {
          await sendEmail({
            to: farmer.email,
            subject: `Order Status Update - ${order.orderNumber}`,
            html: emailContent
          });
        }
      }

    } catch (error) {
      console.error('Status update notification error:', error);
    }
  }

  /**
   * Send refund notification
   */
  static async sendRefundNotification(order) {
    try {
      const emailContent = this.generateRefundNotificationContent(order);
      
      await sendEmail({
        to: order.buyer.email,
        subject: `Refund Processed - ${order.orderNumber}`,
        html: emailContent
      });

    } catch (error) {
      console.error('Refund notification error:', error);
    }
  }

  /**
   * Generate order confirmation email content
   */
  static generateOrderConfirmationEmailContent(order) {
    const itemsList = order.items.map(item => `
      <tr>
        <td>${item.productSnapshot.title}</td>
        <td>${item.quantity} ${item.productSnapshot.unit}</td>
        <td>LKR ${item.priceAtTime.toFixed(2)}</td>
        <td>LKR ${item.subtotal.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Order Confirmation</h2>
        
        <p>Dear ${order.buyer.firstName},</p>
        
        <p>Thank you for your order! We've received your order and it's being processed.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Expected Delivery:</strong> ${order.expectedDeliveryDate?.toLocaleDateString() || 'TBD'}</p>
        </div>
        
        <h3>Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Product</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Quantity</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Price</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
          <p><strong>Subtotal: LKR ${order.subtotal.toFixed(2)}</strong></p>
          <p><strong>Delivery Fee: LKR ${order.deliveryFee.toFixed(2)}</strong></p>
          <p><strong>Total: LKR ${order.total.toFixed(2)}</strong></p>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Delivery Address</h3>
          <p>${order.deliveryAddress.recipientName}<br>
          ${order.deliveryAddress.street}<br>
          ${order.deliveryAddress.city}, ${order.deliveryAddress.district} ${order.deliveryAddress.postalCode}</p>
        </div>
        
        <p>You will receive updates as your order progresses. If you have any questions, please contact us.</p>
        
        <p>Best regards,<br>Helagovi.lk Team</p>
      </div>
    `;
  }

  /**
   * Generate farmer order notification content
   */
  static generateFarmerOrderNotificationContent(order, items) {
    const itemsList = items.map(item => `
      <li>${item.productSnapshot.title} - ${item.quantity} ${item.productSnapshot.unit}</li>
    `).join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">New Order Received!</h2>
        
        <p>You have received a new order from ${order.buyer.firstName} ${order.buyer.lastName}.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
          <p><strong>Customer:</strong> ${order.buyer.firstName} ${order.buyer.lastName}</p>
        </div>
        
        <h3>Your Items in this Order</h3>
        <ul>${itemsList}</ul>
        
        <p>Please log in to your farmer dashboard to confirm this order and update its status.</p>
        
        <p>Best regards,<br>Helagovi.lk Team</p>
      </div>
    `;
  }

  /**
   * Generate status update email content
   */
  static generateStatusUpdateEmailContent(order, oldStatus, newStatus) {
    const statusMessages = {
      'confirmed': 'Your order has been confirmed by the farmer and is being prepared.',
      'preparing': 'Your order is being prepared for shipment.',
      'shipped': `Your order has been shipped! ${order.trackingNumber ? `Tracking number: ${order.trackingNumber}` : ''}`,
      'delivered': 'Your order has been delivered! We hope you enjoy your fresh produce.',
      'cancelled': 'Your order has been cancelled. If you made a payment, a refund will be processed shortly.'
    };

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Order Status Update</h2>
        
        <p>Dear ${order.buyer.firstName},</p>
        
        <p>Your order status has been updated.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order #${order.orderNumber}</h3>
          <p><strong>Status:</strong> ${newStatus}</p>
          ${statusMessages[newStatus] ? `<p>${statusMessages[newStatus]}</p>` : ''}
        </div>
        
        ${order.trackingNumber ? `
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Tracking Information</h3>
            <p>Tracking Number: ${order.trackingNumber}</p>
          </div>
        ` : ''}
        
        <p>You can track your order status in your account dashboard.</p>
        
        <p>Best regards,<br>Helagovi.lk Team</p>
      </div>
    `;
  }

  /**
   * Generate refund notification content
   */
  static generateRefundNotificationContent(order) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Refund Processed</h2>
        
        <p>Dear ${order.buyer.firstName},</p>
        
        <p>Your refund has been processed for order #${order.orderNumber}.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Refund Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Refund Amount:</strong> LKR ${order.refundAmount.toFixed(2)}</p>
          <p><strong>Processed Date:</strong> ${order.refundedAt.toLocaleDateString()}</p>
        </div>
        
        <p>The refund will appear in your original payment method within 3-5 business days.</p>
        
        <p>If you have any questions about this refund, please contact our support team.</p>
        
        <p>Best regards,<br>Helagovi.lk Team</p>
      </div>
    `;
  }

  /**
   * Get order insights for dashboard
   */
  static async getOrderInsights(userId, userRole, dateRange = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      let matchQuery = {
        createdAt: { $gte: startDate, $lte: endDate }
      };

      if (userRole === 'buyer') {
        matchQuery.buyer = userId;
      } else if (userRole === 'farmer') {
        matchQuery.farmers = userId;
      }

      const insights = await Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            avgOrderValue: { $avg: '$total' },
            pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
          }
        }
      ]);

      return insights[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0
      };

    } catch (error) {
      console.error('Order insights error:', error);
      throw error;
    }
  }
}

export default OrderService;