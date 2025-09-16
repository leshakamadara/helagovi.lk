import cron from 'node-cron';
import Ticket from '../models/Ticket.js';

// Escalation workflow function
const escalateOldTickets = async () => {
  try {
    console.log('Running escalation check...');

    // Calculate 48 hours ago
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    // Find tickets older than 48 hours with Open or In Progress status
    const ticketsToEscalate = await Ticket.find({
      status: { $in: ['Open', 'In Progress'] },
      createdAt: { $lt: fortyEightHoursAgo },
    }).populate('assignedTo createdBy');

    if (ticketsToEscalate.length === 0) {
      console.log('No tickets require escalation');
      return;
    }

    console.log(`Found ${ticketsToEscalate.length} tickets to escalate`);

    // Update tickets to escalated status
    const escalatedTickets = [];

    for (const ticket of ticketsToEscalate) {
      ticket.status = 'Escalated';
      await ticket.save();
      escalatedTickets.push(ticket);

      // Notify assigned agent and admin (console log for now)
      console.log(`🚨 TICKET ESCALATED:`);
      console.log(`   Ticket ID: ${ticket._id}`);
      console.log(`   Title: ${ticket.title}`);
      console.log(`   Category: ${ticket.category}`);
      console.log(`   Priority: ${ticket.priority}`);
      console.log(`   Created: ${ticket.createdAt}`);
      console.log(`   Created By: ${ticket.createdBy?.name || 'Unknown'}`);

      if (ticket.assignedTo) {
        console.log(`   📧 NOTIFY AGENT: ${ticket.assignedTo.name} (${ticket.assignedTo.email})`);
      } else {
        console.log(`   ⚠️  NO AGENT ASSIGNED - NOTIFY ADMIN`);
      }
      console.log('   -----------------------------------');
    }

    console.log(`✅ Escalated ${escalatedTickets.length} tickets successfully`);
  } catch (error) {
    console.error('❌ Escalation workflow error:', error.message);
  }
};

// Schedule cron job to run every 10 minutes
const startEscalationWorkflow = () => {
  // Run every 10 minutes: '*/10 * * * *'
  cron.schedule('*/10 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Starting escalation workflow...`);
    await escalateOldTickets();
  });

  console.log('📅 Escalation cron job started - running every 10 minutes');
};

// Manual escalation trigger (for testing)
const runEscalationNow = async () => {
  console.log('🔧 Manual escalation triggered');
  await escalateOldTickets();
};

export { startEscalationWorkflow, runEscalationNow, escalateOldTickets };
