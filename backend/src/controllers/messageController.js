import Message from '../models/Message.js';
import Ticket from '../models/Ticket.js';

// Create a new message in a ticket
export const createMessage = async (req, res) => {
  try {
    const { id: ticketId } = req.params;
    const { message } = req.body;
    const senderId = req.user.id;

    // Check if ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user is authorized to send messages to this ticket
    if (req.user.role !== 'admin' && ticket.createdBy.toString() !== senderId) {
      return res.status(403).json({ error: 'Not authorized to send messages to this ticket' });
    }

    // Determine receiver (if user is sending, receiver is admin; if admin is sending, receiver is the ticket creator)
    let receiverId;
    if (req.user.role === 'admin') {
      receiverId = ticket.createdBy;
    } else {
      // For now, set receiver to null or find an assigned admin
      // This could be improved to send to the assigned agent
      receiverId = null;
    }

    // Create message
    const newMessage = new Message({
      ticketId,
      senderId,
      receiverId,
      message
    });

    await newMessage.save();
    await newMessage.populate('senderId receiverId');

    // Update ticket's last activity
    ticket.updatedAt = new Date();
    await ticket.save();

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all messages for a ticket
export const getMessages = async (req, res) => {
  try {
    const { id: ticketId } = req.params;
    console.log('getMessages called with ticketId:', ticketId);
    console.log('User:', req.user);

    // Check if ticket exists
    const ticket = await Ticket.findById(ticketId);
    console.log('Ticket found:', ticket);
    if (!ticket) {
      console.log('Ticket not found for ID:', ticketId);
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user is authorized to view messages
    if (req.user.role !== 'admin' && ticket.createdBy.toString() !== req.user.id) {
      console.log('User not authorized. User ID:', req.user.id, 'Ticket createdBy:', ticket.createdBy.toString());
      return res.status(403).json({ error: 'Not authorized to view messages for this ticket' });
    }

    const messages = await Message.find({ ticketId })
      .populate('senderId receiverId')
      .sort({ createdAt: 1 });

    console.log('Messages found:', messages.length);

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ error: error.message });
  }
};