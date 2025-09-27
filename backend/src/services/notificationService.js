import { Server } from 'socket.io';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';

/**
 * Notification Service
 * Handles real-time notifications and status management
 */
export class NotificationService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });

    this.connectedUsers = new Map(); // Store user socket connections
    this.setupSocketHandlers();
  }

  /**
   * Setup socket event handlers
   */
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle user authentication and room joining
      socket.on('authenticate', (data) => {
        const { userId, role } = data;
        socket.userId = userId;
        socket.userRole = role;
        
        // Store user connection
        this.connectedUsers.set(userId, {
          socketId: socket.id,
          role: role,
          socket: socket
        });

        // Join role-specific room
        socket.join(`role_${role}`);
        
        // Join user-specific room
        socket.join(`user_${userId}`);

        console.log(`User ${userId} authenticated with role ${role}`);
      });

      // Handle order status updates
      socket.on('update_order_status', async (data) => {
        try {
          const { orderId, status, note } = data;
          const userId = socket.userId;

          if (!userId) {
            socket.emit('error', { message: 'Not authenticated' });
            return;
          }

          // Update order status
          const order = await Order.findById(orderId)
            .populate('buyer', 'firstName lastName email')
            .populate('farmers', 'firstName lastName email');

          if (!order) {
            socket.emit('error', { message: 'Order not found' });
            return;
          }

          // Check permissions
          const canUpdate = this.canUserUpdateOrder(order, userId, socket.userRole);
          if (!canUpdate) {
            socket.emit('error', { message: 'Permission denied' });
            return;
          }

          // Update status
          await order.updateStatus(status, note, userId);

          // Broadcast to relevant users
          await this.broadcastOrderUpdate(order, status);

          socket.emit('order_status_updated', {
            orderId: order._id,
            status: status,
            message: 'Order status updated successfully'
          });

        } catch (error) {
          console.error('Socket order update error:', error);
          socket.emit('error', { message: error.message });
        }
      });

      // Handle real-time order tracking
      socket.on('track_order', async (orderId) => {
        try {
          const order = await Order.findById(orderId)
            .populate('buyer farmers', 'firstName lastName');
          
          if (!order) {
            socket.emit('error', { message: 'Order not found' });
            return;
          }

          // Check if user has access to this order
          const hasAccess = this.userHasOrderAccess(order, socket.userId, socket.userRole);
          if (!hasAccess) {
            socket.emit('error', { message: 'Access denied' });
            return;
          }

          socket.emit('order_tracking_data', {
            orderId: order._id,
            status: order.status,
            statusHistory: order.statusHistory,
            trackingNumber: order.trackingNumber,
            expectedDeliveryDate: order.expectedDeliveryDate
          });

        } catch (error) {
          console.error('Socket track order error:', error);
          socket.emit('error', { message: 'Failed to track order' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });
    });
  }

  /**
   * Check if user can update order
   */
  canUserUpdateOrder(order, userId, userRole) {
    if (userRole === 'admin') return true;
    if (userRole === 'farmer' && order.farmers.some(f => f._id.toString() === userId)) return true;
    if (userRole === 'buyer' && order.buyer._id.toString() === userId && order.status === 'pending') return true;
    return false;
  }

  /**
   * Check if user has access to order
   */
  userHasOrderAccess(order, userId, userRole) {
    if (userRole === 'admin') return true;
    if (order.buyer._id.toString() === userId) return true;
    if (order.farmers.some(f => f._id.toString() === userId)) return true;
    return false;
  }

  /**
   * Broadcast order update to relevant users
   */
  async broadcastOrderUpdate(order, newStatus) {
    const notification = {
      type: 'order_status_change',
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: newStatus,
      timestamp: new Date()
    };

    // Notify buyer
    if (this.connectedUsers.has(order.buyer._id.toString())) {
      const buyerConnection = this.connectedUsers.get(order.buyer._id.toString());
      buyerConnection.socket.emit('order_notification', {
        ...notification,
        message: `Your order #${order.orderNumber} status changed to ${newStatus}`
      });
    }

    // Notify farmers
    for (const farmer of order.farmers) {
      if (this.connectedUsers.has(farmer._id.toString())) {
        const farmerConnection = this.connectedUsers.get(farmer._id.toString());
        farmerConnection.socket.emit('order_notification', {
          ...notification,
          message: `Order #${order.orderNumber} status changed to ${newStatus}`
        });
      }
    }

    // Broadcast to admin room
    this.io.to('role_admin').emit('admin_order_update', {
      ...notification,
      buyerId: order.buyer._id,
      farmerIds: order.farmers.map(f => f._id)
    });
  }

  /**
   * Send new order notification
   */
  async notifyNewOrder(order) {
    const notification = {
      type: 'new_order',
      orderId: order._id,
      orderNumber: order.orderNumber,
      timestamp: new Date()
    };

    // Notify farmers
    for (const farmer of order.farmers) {
      if (this.connectedUsers.has(farmer._id.toString())) {
        const farmerConnection = this.connectedUsers.get(farmer._id.toString());
        farmerConnection.socket.emit('order_notification', {
          ...notification,
          message: `New order received #${order.orderNumber}`
        });
      }
    }

    // Notify admins
    this.io.to('role_admin').emit('admin_order_notification', {
      ...notification,
      message: `New order created #${order.orderNumber}`
    });
  }

  /**
   * Send system notification to specific user
   */
  async sendNotificationToUser(userId, notification) {
    if (this.connectedUsers.has(userId)) {
      const userConnection = this.connectedUsers.get(userId);
      userConnection.socket.emit('system_notification', notification);
    }
  }

  /**
   * Send notification to all users with specific role
   */
  async sendNotificationToRole(role, notification) {
    this.io.to(`role_${role}`).emit('role_notification', notification);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Get connected users by role
   */
  getConnectedUsersByRole(role) {
    return Array.from(this.connectedUsers.values()).filter(user => user.role === role);
  }
}

/**
 * Order Status Manager
 * Handles automated status transitions and rules
 */
export class OrderStatusManager {
  constructor(notificationService) {
    this.notificationService = notificationService;
    this.setupAutomatedProcesses();
  }

  /**
   * Setup automated processes for order management
   */
  setupAutomatedProcesses() {
    // Check for overdue orders every hour
    setInterval(() => {
      this.checkOverdueOrders();
    }, 60 * 60 * 1000); // 1 hour

    // Auto-update delivery status for orders
    setInterval(() => {
      this.updateDeliveryStatuses();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  /**
   * Check for overdue orders and send notifications
   */
  async checkOverdueOrders() {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      // Find orders that are pending for more than 24 hours
      const overdueOrders = await Order.find({
        status: 'pending',
        createdAt: { $lt: oneDayAgo }
      }).populate('buyer farmers', 'firstName lastName email');

      for (const order of overdueOrders) {
        // Notify farmers about overdue confirmation
        for (const farmer of order.farmers) {
          await this.notificationService.sendNotificationToUser(farmer._id.toString(), {
            type: 'order_overdue',
            orderId: order._id,
            orderNumber: order.orderNumber,
            message: `Order #${order.orderNumber} needs confirmation - it's been pending for over 24 hours`,
            priority: 'high'
          });

          // Send email notification
          await sendEmail({
            to: farmer.email,
            subject: `Urgent: Order Confirmation Required - ${order.orderNumber}`,
            html: this.generateOverdueOrderEmail(order, farmer)
          });
        }
      }

      console.log(`Checked ${overdueOrders.length} overdue orders`);
    } catch (error) {
      console.error('Error checking overdue orders:', error);
    }
  }

  /**
   * Update delivery statuses for shipped orders
   */
  async updateDeliveryStatuses() {
    try {
      const now = new Date();
      
      // Find orders that should have been delivered by now
      const shippedOrders = await Order.find({
        status: 'shipped',
        expectedDeliveryDate: { $lt: now }
      }).populate('buyer farmers', 'firstName lastName email');

      for (const order of shippedOrders) {
        // Send notification asking for delivery confirmation
        await this.notificationService.sendNotificationToUser(order.buyer._id.toString(), {
          type: 'delivery_confirmation_request',
          orderId: order._id,
          orderNumber: order.orderNumber,
          message: `Has your order #${order.orderNumber} been delivered? Please confirm.`,
          priority: 'medium'
        });

        // Notify farmers too
        for (const farmer of order.farmers) {
          await this.notificationService.sendNotificationToUser(farmer._id.toString(), {
            type: 'delivery_confirmation_request',
            orderId: order._id,
            orderNumber: order.orderNumber,
            message: `Order #${order.orderNumber} expected delivery date has passed. Please confirm delivery status.`,
            priority: 'medium'
          });
        }
      }

      console.log(`Processed ${shippedOrders.length} orders for delivery status update`);
    } catch (error) {
      console.error('Error updating delivery statuses:', error);
    }
  }

  /**
   * Generate overdue order email template
   */
  generateOverdueOrderEmail(order, farmer) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ Order Confirmation Required</h2>
        
        <p>Dear ${farmer.firstName},</p>
        
        <p>You have an order that has been pending for over 24 hours and requires immediate attention.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
          <h3 style="color: #dc2626; margin: 0;">Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Customer:</strong> ${order.buyer.firstName} ${order.buyer.lastName}</p>
          <p><strong>Order Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> LKR ${order.total.toFixed(2)}</p>
        </div>
        
        <p><strong>Action Required:</strong> Please log in to your farmer dashboard immediately to confirm or cancel this order.</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/farmer/orders" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Confirm Order Now
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          <strong>Note:</strong> Orders that remain unconfirmed for more than 48 hours may be automatically cancelled.
        </p>
        
        <p>Best regards,<br>Helagovi.lk Team</p>
      </div>
    `;
  }

  /**
   * Handle automatic order cancellation for extremely overdue orders
   */
  async handleAutoCancellation() {
    try {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const extremelyOverdueOrders = await Order.find({
        status: 'pending',
        createdAt: { $lt: twoDaysAgo }
      });

      for (const order of extremelyOverdueOrders) {
        await order.cancel('Automatically cancelled due to no response from farmer', null);
        
        // Notify all parties
        await this.notificationService.broadcastOrderUpdate(order, 'cancelled');
        
        console.log(`Auto-cancelled order ${order.orderNumber} due to no farmer response`);
      }

    } catch (error) {
      console.error('Error in auto-cancellation process:', error);
    }
  }
}

export default { NotificationService, OrderStatusManager };