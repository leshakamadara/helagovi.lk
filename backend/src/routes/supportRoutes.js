// routes/supportRoutes.js
import express from "express";
import { mockAuth, requireSupport } from "../middleware/mockAuth.js";

const router = express.Router();

// Mock tickets data
const mockTickets = [
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0t1",
    title: "Price inquiry for rice",
    description: "Customer asking about bulk pricing for basmati rice",
    status: "open",
    priority: "medium",
    user: {
      id: "64f1a2b3c4d5e6f7g8h9i0j2",
      name: "Kamala Silva",
      email: "kamala.silva@example.com"
    },
    createdAt: "2024-01-20T10:30:00Z"
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0t2",
    title: "Payment issue",
    description: "Payment gateway timeout during checkout",
    status: "resolved",
    priority: "high",
    user: {
      id: "64f1a2b3c4d5e6f7g8h9i0j1",
      name: "Sunil Perera",
      email: "sunil.perera@example.com"
    },
    resolvedAt: "2024-01-19T15:45:00Z",
    createdAt: "2024-01-19T09:15:00Z"
  }
];

// Get all support tickets (support agents only)
router.get("/tickets", mockAuth, requireSupport, (req, res) => {
  const { status, priority } = req.query;
  
  let filteredTickets = mockTickets;
  
  if (status) {
    filteredTickets = filteredTickets.filter(t => t.status === status);
  }
  
  if (priority) {
    filteredTickets = filteredTickets.filter(t => t.priority === priority);
  }
  
  res.json({
    message: `Support tickets for ${req.user.name}`,
    tickets: filteredTickets,
    totalCount: filteredTickets.length,
    summary: {
      open: filteredTickets.filter(t => t.status === "open").length,
      inProgress: filteredTickets.filter(t => t.status === "in-progress").length,
      resolved: filteredTickets.filter(t => t.status === "resolved").length
    }
  });
});

// Get specific ticket
router.get("/tickets/:id", mockAuth, requireSupport, (req, res) => {
  const ticket = mockTickets.find(t => t._id === req.params.id);
  
  if (!ticket) {
    return res.status(404).json({
      error: "Ticket not found"
    });
  }
  
  res.json({
    ticket,
    message: "Ticket retrieved successfully"
  });
});

// Update ticket status
router.patch("/tickets/:id/status", mockAuth, requireSupport, (req, res) => {
  const { status } = req.body;
  
  if (!status || !["open", "in-progress", "resolved", "closed"].includes(status)) {
    return res.status(400).json({
      error: "Invalid status",
      validStatuses: ["open", "in-progress", "resolved", "closed"]
    });
  }
  
  const ticketIndex = mockTickets.findIndex(t => t._id === req.params.id);
  
  if (ticketIndex === -1) {
    return res.status(404).json({
      error: "Ticket not found"
    });
  }
  
  mockTickets[ticketIndex].status = status;
  mockTickets[ticketIndex].updatedAt = new Date().toISOString();
  
  if (status === "resolved") {
    mockTickets[ticketIndex].resolvedAt = new Date().toISOString();
  }
  
  res.json({
    ticket: mockTickets[ticketIndex],
    message: "Ticket status updated successfully"
  });
});

// Support dashboard stats
router.get("/dashboard", mockAuth, requireSupport, (req, res) => {
  res.json({
    message: `Support dashboard for ${req.user.name}`,
    stats: {
      totalTickets: mockTickets.length,
      openTickets: mockTickets.filter(t => t.status === "open").length,
      resolvedToday: mockTickets.filter(t => 
        t.resolvedAt && new Date(t.resolvedAt).toDateString() === new Date().toDateString()
      ).length,
      avgResolutionTime: "2.5 hours"
    },
    recentTickets: mockTickets.slice(0, 5)
  });
});

export default router;