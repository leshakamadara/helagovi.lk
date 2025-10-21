import express from 'express';
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getUserTickets,
  getUserTicketStats,
} from '../controllers/ticketController.js';
import { createMessage, getMessages } from '../controllers/messageController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /tickets/user/stats - Get user ticket statistics (users only)
router.get('/user/stats', protect, authorize('farmer', 'buyer'), getUserTicketStats);

// POST /tickets/:id/messages - Create message for ticket (users and admins)
router.post('/:id/messages', protect, authorize('farmer', 'buyer', 'admin'), createMessage);

// GET /tickets/:id/messages - Get messages for ticket (users and admins)
router.get('/:id/messages', protect, authorize('farmer', 'buyer', 'admin'), getMessages);

// POST /tickets - Create ticket (users can create tickets)
router.post('/', protect, authorize('farmer', 'buyer'), createTicket);

// GET /tickets/user - Get user's own tickets (users can view their own tickets)
router.get('/user', protect, authorize('farmer', 'buyer'), getUserTickets);

// GET /tickets - Get all tickets with filters (agents/admins can view all)
router.get('/', protect, authorize('admin'), getAllTickets);

// GET /tickets/:id - Get ticket by ID (users see own, agents/admins see all)
router.get('/:id', protect, authorize('farmer', 'buyer', 'admin'), getTicketById);

// PUT /tickets/:id - Update ticket (agents/admins can update)
router.put('/:id', protect, authorize('admin'), updateTicket);

// DELETE /tickets/:id - Delete ticket (only admins can delete)
router.delete('/:id', protect, authorize('admin'), deleteTicket);

export default router;
