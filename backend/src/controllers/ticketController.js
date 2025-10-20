import Ticket from '../models/Ticket.js';
import { assignTicket } from '../services/assignTicketService.js';
import Message from '../models/Message.js';

// Create new ticket
export const createTicket = async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      createdBy: req.user.id // Use authenticated user ID
    };
    
    const ticket = new Ticket(ticketData);
    await ticket.save();
    await ticket.populate('createdBy assignedTo');

    // Auto-assign ticket to agent
    const assignmentResult = await assignTicket(ticket._id, ticket.category);

    res.status(201).json({
      ticket,
      assignment: assignmentResult,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all tickets with filters
export const getAllTickets = async (req, res) => {
  try {
    const { category, status, priority } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tickets = await Ticket.find(filter)
      .populate('createdBy assignedTo')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get ticket by ID with messages
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      'createdBy assignedTo',
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user is authorized to view this ticket
    if (req.user.role !== 'admin' && ticket.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this ticket' });
    }

    // Fetch all messages related to this ticket
    const messages = await Message.find({ ticketId: ticket._id })
      .populate('senderId receiverId')
      .sort({ createdAt: 1 });

    res.json({ ticket, messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update ticket
export const updateTicket = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body;
    const updateData = {};

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('createdBy assignedTo');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user's own tickets
export const getUserTickets = async (req, res) => {
  try {
    const { category, status, priority } = req.query;
    const filter = { createdBy: req.user.id };

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tickets = await Ticket.find(filter)
      .populate('createdBy assignedTo')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user ticket statistics
export const getUserTicketStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get ticket counts by status
    const statusStats = await Ticket.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get ticket counts by priority
    const priorityStats = await Ticket.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Get ticket counts by category
    const categoryStats = await Ticket.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get total tickets
    const totalTickets = await Ticket.countDocuments({ createdBy: userId });

    // Get recent tickets (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTickets = await Ticket.countDocuments({
      createdBy: userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get open tickets
    const openTickets = await Ticket.countDocuments({
      createdBy: userId,
      status: { $in: ['Open', 'In Progress'] }
    });

    res.json({
      success: true,
      stats: {
        total: totalTickets,
        open: openTickets,
        recent: recentTickets,
        byStatus: statusStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPriority: priorityStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byCategory: categoryStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete ticket
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
