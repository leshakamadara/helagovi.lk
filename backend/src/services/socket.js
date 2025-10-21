import { Server } from 'socket.io';
import Message from '../models/Message.js';

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  const activeUsers = new Map();
  const agentRoom = 'agents';

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room based on userId or agent role
    socket.on('joinRoom', async ({ userId, userRole, ticketId }) => {
      try {
        if (userRole === 'agent') {
          socket.join(agentRoom);
          console.log(`Agent ${userId} joined agent room`);
        } else {
          socket.join(`user_${userId}`);
          activeUsers.set(userId, socket.id);
          console.log(`User ${userId} joined room`);
        }

        if (ticketId) {
          socket.join(`ticket_${ticketId}`);
        }

        socket.emit('joinedRoom', { success: true });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Send message (for real-time broadcasting only - message should already be saved via API)
    socket.on(
      'sendMessage',
      async ({ senderId, receiverId, ticketId, message }) => {
        try {
          // Find the message that was just saved via API (by content and recent timestamp)
          const recentMessage = await Message.findOne({
            senderId,
            ticketId,
            message,
            createdAt: { $gte: new Date(Date.now() - 5000) } // Within last 5 seconds
          }).populate(['senderId', 'receiverId', 'ticketId']).sort({ createdAt: -1 });

          if (recentMessage) {
            const messageData = {
              _id: recentMessage._id,
              senderId: recentMessage.senderId,
              receiverId: recentMessage.receiverId,
              ticketId: recentMessage.ticketId,
              message: recentMessage.message,
              isRead: recentMessage.isRead,
              timestamp: recentMessage.createdAt,
            };

            // Emit message to correct room/user
            if (ticketId) {
              io.to(`ticket_${ticketId}`).emit('receiveMessage', messageData);
            } else if (receiverId) {
              io.to(`user_${receiverId}`).emit('receiveMessage', messageData);
            } else {
              io.to(agentRoom).emit('receiveMessage', messageData);
            }

            socket.emit('messageSent', {
              success: true,
              messageId: recentMessage._id,
            });
          }
        } catch (error) {
          console.error('Error broadcasting message:', error);
          socket.emit('error', { message: 'Failed to broadcast message' });
        }
      },
    );

    // Typing indicator
    socket.on('typing', ({ userId, ticketId, isTyping }) => {
      const typingData = { userId, isTyping };

      if (ticketId) {
        socket.to(`ticket_${ticketId}`).emit('userTyping', typingData);
      } else {
        socket.to(agentRoom).emit('userTyping', typingData);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

export default initializeSocket;
