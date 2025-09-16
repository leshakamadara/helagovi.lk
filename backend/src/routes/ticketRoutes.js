import express from 'express';
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket
} from '../controllers/ticketController.js';
import auth from '../middleware/mockAuth.js';
import { user, agent, admin } from '../middleware/roles.js';

const router = express.Router();

// POST /tickets - Create ticket (users can create tickets)
router.post('/', auth, user, createTicket);

// GET /tickets - Get all tickets with filters (agents/admins can view all)
router.get('/', auth, agent, getAllTickets);

// GET /tickets/:id - Get ticket by ID (users see own, agents/admins see all)
router.get('/:id', auth, user, getTicketById);

// PUT /tickets/:id - Update ticket (agents/admins can update)
router.put('/:id', auth, agent, updateTicket);

// DELETE /tickets/:id - Delete ticket (only admins can delete)
router.delete('/:id', auth, admin, deleteTicket);

export default router;
