import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    // Connect to the backend socket server
    const socketUrl = process.env.NODE_ENV === 'production'
      ? (import.meta.env?.VITE_SOCKET_URL || window.location.origin)
      : 'http://localhost:5001';

    console.log('Connecting to socket server:', socketUrl);

    this.socket = io(socketUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to socket server, socket ID:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from socket server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('joinedRoom', (data) => {
      console.log('✅ Joined room:', data);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a user room for personal messages
  joinUserRoom(userId) {
    if (this.socket && this.isConnected) {
      console.log('🔗 Joining user room for userId:', userId);
      this.socket.emit('joinRoom', { userId, userRole: 'user' });
    } else {
      console.warn('⚠️ Cannot join user room: socket not connected');
    }
  }

  // Join a ticket room for ticket-specific messages
  joinTicketRoom(ticketId) {
    if (this.socket && this.isConnected) {
      console.log('🔗 Joining ticket room for ticketId:', ticketId);
      this.socket.emit('joinRoom', { ticketId });
    } else {
      console.warn('⚠️ Cannot join ticket room: socket not connected');
    }
  }

  // Leave a ticket room
  leaveTicketRoom(ticketId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveTicketRoom', ticketId);
    }
  }

  // Listen for incoming messages
  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receiveMessage', callback);
      this.listeners.set('receiveMessage', callback);
    }
  }

  // Listen for typing indicators
  onTyping(callback) {
    if (this.socket) {
      this.socket.on('typing', callback);
      this.listeners.set('typing', callback);
    }
  }

  // Listen for stop typing
  onStopTyping(callback) {
    if (this.socket) {
      this.socket.on('stopTyping', callback);
      this.listeners.set('stopTyping', callback);
    }
  }

  // Send typing indicator
  sendTyping(ticketId, userId, userName) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { ticketId, userId, userName });
    }
  }

  // Send stop typing indicator
  sendStopTyping(ticketId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stopTyping', { ticketId, userId });
    }
  }

  // Send message via socket
  sendMessage(messageData) {
    if (this.socket && this.isConnected) {
      console.log('📤 Sending message via socket:', messageData);
      this.socket.emit('sendMessage', { messageData });
    } else {
      console.warn('⚠️ Cannot send message: socket not connected');
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event, callback);
      });
      this.listeners.clear();
    }
  }

  // Get connection status
  get isSocketConnected() {
    return this.isConnected;
  }

  // Get socket instance
  get socketInstance() {
    return this.socket;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;