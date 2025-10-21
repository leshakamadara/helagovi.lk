import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Technical', 'Payment', 'Product', 'Account'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'],
      default: 'Open',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    ticketNumber: {
      type: Number,
      unique: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to generate ticket number
ticketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    // Find the highest ticket number and increment
    const lastTicket = await this.constructor.findOne({}, {}, { sort: { 'ticketNumber': -1 } });
    this.ticketNumber = lastTicket && lastTicket.ticketNumber ? lastTicket.ticketNumber + 1 : 1;
  }
  next();
});

const Ticket = model('Ticket', ticketSchema);

export default Ticket;
