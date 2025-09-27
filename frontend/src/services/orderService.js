import axios from '../lib/axios';

/**
 * Order API Service
 * Handles all API calls related to orders
 */
export const orderService = {
  /**
   * Create a new order
   * @param {Object} orderData - Order data including items, delivery address, payment method
   * @returns {Promise<Object>} Created order response
   */
  async createOrder(orderData) {
    try {
      const response = await axios.post('/api/orders', orderData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get current user's orders (buyer or farmer)
   * @param {Object} params - Query parameters (status, page, limit)
   * @returns {Promise<Object>} Orders list with pagination
   */
  async getMyOrders(params = {}) {
    try {
      const response = await axios.get('/api/orders/my', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get a specific order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderById(orderId) {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get order by order number
   * @param {string} orderNumber - Order number (e.g., ORD-20240101-001)
   * @returns {Promise<Object>} Order details
   */
  async getOrderByNumber(orderNumber) {
    try {
      const response = await axios.get(`/api/orders/number/${orderNumber}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @param {string} note - Optional note
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderId, status, note = '') {
    try {
      const response = await axios.patch(`/api/orders/${orderId}/status`, {
        status,
        note
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Cancel an order
   * @param {string} orderId - Order ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Updated order
   */
  async cancelOrder(orderId, reason = '') {
    try {
      const response = await axios.patch(`/api/orders/${orderId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get all orders (Admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} All orders with pagination
   */
  async getAllOrders(params = {}) {
    try {
      const response = await axios.get('/api/orders/all', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get order analytics (Admin only)
   * @param {Object} params - Date range parameters
   * @returns {Promise<Object>} Order analytics data
   */
  async getOrderAnalytics(params = {}) {
    try {
      const response = await axios.get('/api/orders/analytics', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get order insights for dashboard
   * @param {number} dateRange - Number of days to look back
   * @returns {Promise<Object>} Order insights
   */
  async getOrderInsights(dateRange = 30) {
    try {
      const response = await axios.get('/api/orders/insights', {
        params: { dateRange }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Search orders
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchOrders(searchParams) {
    try {
      const response = await axios.get('/api/orders/search', {
        params: searchParams
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get orders by status
   * @param {string} status - Order status
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Filtered orders
   */
  async getOrdersByStatus(status, params = {}) {
    try {
      const response = await axios.get('/api/orders/my', {
        params: { status, ...params }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get order statistics for user
   * @returns {Promise<Object>} User order statistics
   */
  async getOrderStatistics() {
    try {
      const response = await axios.get('/api/orders/statistics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Download order invoice/receipt
   * @param {string} orderId - Order ID
   * @returns {Promise<Blob>} PDF blob
   */
  async downloadOrderInvoice(orderId) {
    try {
      const response = await axios.get(`/api/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get order status history
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Status history
   */
  async getOrderStatusHistory(orderId) {
    try {
      const response = await axios.get(`/api/orders/${orderId}/status-history`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Add order review/rating
   * @param {string} orderId - Order ID
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Review response
   */
  async addOrderReview(orderId, reviewData) {
    try {
      const response = await axios.post(`/api/orders/${orderId}/review`, reviewData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Request order refund
   * @param {string} orderId - Order ID
   * @param {Object} refundData - Refund request data
   * @returns {Promise<Object>} Refund request response
   */
  async requestRefund(orderId, refundData) {
    try {
      const response = await axios.post(`/api/orders/${orderId}/refund`, refundData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Track order delivery
   * @param {string} orderId - Order ID or tracking number
   * @returns {Promise<Object>} Tracking information
   */
  async trackOrder(orderId) {
    try {
      const response = await axios.get(`/api/orders/${orderId}/track`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get order delivery estimation
   * @param {Object} deliveryAddress - Delivery address
   * @returns {Promise<Object>} Delivery estimation
   */
  async getDeliveryEstimation(deliveryAddress) {
    try {
      const response = await axios.post('/api/orders/delivery-estimation', deliveryAddress);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Validate order before creation
   * @param {Object} orderData - Order data to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateOrder(orderData) {
    try {
      const response = await axios.post('/api/orders/validate', orderData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get order summary for checkout
   * @param {Array} items - Cart items
   * @param {Object} deliveryAddress - Delivery address
   * @returns {Promise<Object>} Order summary
   */
  async getOrderSummary(items, deliveryAddress) {
    try {
      const response = await axios.post('/api/orders/summary', {
        items,
        deliveryAddress
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Export orders to CSV/Excel
   * @param {Object} params - Export parameters
   * @returns {Promise<Object>} Export response
   */
  async exportOrders(params = {}) {
    try {
      const response = await axios.get('/api/orders/export', { 
        params,
        responseType: 'blob'
      });
      
      if (response.status === 200) {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Get filename from headers or use default
        const contentDisposition = response.headers['content-disposition'];
        const filename = contentDisposition 
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : `orders-${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return { success: true, message: 'Orders exported successfully' };
      }
      
      return { success: false, message: 'Failed to export orders' };
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get recent order activity
   * @param {number} limit - Number of activities to fetch
   * @returns {Promise<Object>} Recent activity data
   */
  async getRecentActivity(limit = 10) {
    try {
      const response = await axios.get('/api/orders/recent-activity', { 
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Bulk update orders (admin only)
   * @param {Array} orderIds - Array of order IDs
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Bulk update response
   */
  async bulkUpdateOrders(orderIds, updateData) {
    try {
      const response = await axios.patch('/api/orders/bulk-update', {
        orderIds,
        ...updateData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get order delivery tracking
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Tracking data
   */
  async getDeliveryTracking(orderId) {
    try {
      const response = await axios.get(`/api/orders/${orderId}/tracking`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Add order note/comment
   * @param {string} orderId - Order ID
   * @param {string} note - Note content
   * @returns {Promise<Object>} Add note response
   */
  async addOrderNote(orderId, note) {
    try {
      const response = await axios.post(`/api/orders/${orderId}/notes`, { note });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get order notifications/alerts
   * @param {Object} params - Alert parameters
   * @returns {Promise<Object>} Alerts data
   */
  async getOrderAlerts(params = {}) {
    try {
      const response = await axios.get('/api/orders/alerts', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Handle API errors
   * @param {Object} error - Axios error object
   * @returns {Object} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        success: false,
        message: data?.message || 'An error occurred',
        errors: data?.errors || [],
        status,
        data: data || null
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        message: 'No response from server. Please check your connection.',
        status: 0,
        data: null
      };
    } else {
      // Something else happened
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        status: 0,
        data: null
      };
    }
  }
};

// Export individual functions for convenience
export const {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrderAnalytics,
  getOrderInsights,
  searchOrders,
  getOrdersByStatus,
  getOrderStatistics,
  downloadOrderInvoice,
  getOrderStatusHistory,
  addOrderReview,
  requestRefund,
  trackOrder,
  getDeliveryEstimation,
  validateOrder,
  getOrderSummary,
  exportOrders,
  getRecentActivity,
  bulkUpdateOrders,
  getDeliveryTracking,
  addOrderNote,
  getOrderAlerts
} = orderService;

export default orderService;