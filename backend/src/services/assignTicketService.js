import Ticket from '../models/Ticket.js';
import User from '../models/User.js'; // Agents are users with role 'agent'

// Smart ticket assignment service
export const assignTicket = async (ticketId, category) => {
  try {
    // Find the ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    // Fetch available agents
    const availableAgents = await User.find({
      role: 'agent',
      isActive: true
    });

    if (availableAgents.length === 0) throw new Error('No available agents found');

    // Match agents with expertise for the category
    const categoryExperts = availableAgents.filter(agent => agent.expertise?.includes(category));

    // Use experts if available, otherwise use all agents
    const candidateAgents = categoryExperts.length > 0 ? categoryExperts : availableAgents;

    // Get workload for each candidate agent
    const agentWorkloads = await Promise.all(
      candidateAgents.map(async agent => {
        const activeTickets = await Ticket.countDocuments({
          assignedTo: agent._id,
          status: { $in: ['Open', 'In Progress', 'Escalated'] }
        });
        return { agent, workload: activeTickets };
      })
    );

    // Sort by workload (ascending) to find least-loaded agent
    agentWorkloads.sort((a, b) => a.workload - b.workload);

    // Assign to the least-loaded agent
    const selectedAgent = agentWorkloads[0].agent;
    ticket.assignedTo = selectedAgent._id;
    if (ticket.status === 'Open') ticket.status = 'In Progress';
    await ticket.save();

    // Populate agent details for response
    await ticket.populate('assignedTo createdBy');

    console.log(`✅ Ticket ${ticketId} assigned to agent ${selectedAgent.name}`);
    console.log(`   Category: ${category}`);
    console.log(`   Agent workload: ${agentWorkloads[0].workload} active tickets`);
    console.log(`   Expert match: ${categoryExperts.includes(selectedAgent) ? 'Yes' : 'No'}`);

    return {
      success: true,
      ticket,
      assignedAgent: {
        id: selectedAgent._id,
        name: selectedAgent.name,
        email: selectedAgent.email,
        expertise: selectedAgent.expertise,
        currentWorkload: agentWorkloads[0].workload
      },
      message: `Ticket assigned to ${selectedAgent.name}`
    };
  } catch (error) {
    console.error('❌ Ticket assignment error:', error.message);
    return { success: false, error: error.message };
  }
};

// Get agent workload statistics
export const getAgentWorkloads = async () => {
  try {
    const agents = await User.find({ role: 'agent', isActive: true });
    const workloads = await Promise.all(
      agents.map(async agent => {
        const activeTickets = await Ticket.countDocuments({
          assignedTo: agent._id,
          status: { $in: ['Open', 'In Progress', 'Escalated'] }
        });
        const totalTickets = await Ticket.countDocuments({ assignedTo: agent._id });
        return {
          agentId: agent._id,
          name: agent.name,
          email: agent.email,
          expertise: agent.expertise || [],
          activeTickets,
          totalTickets
        };
      })
    );
    return workloads;
  } catch (error) {
    throw new Error(`Failed to get agent workloads: ${error.message}`);
  }
};

// Auto-assign unassigned tickets
export const autoAssignUnassignedTickets = async () => {
  try {
    const unassignedTickets = await Ticket.find({
      assignedTo: null,
      status: { $in: ['Open', 'In Progress'] }
    });

    const results = [];
    for (const ticket of unassignedTickets) {
      const result = await assignTicket(ticket._id, ticket.category);
      results.push(result);
    }

    return { success: true, processed: results.length, results };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
