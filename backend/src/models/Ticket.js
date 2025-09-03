import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ticketSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Technical', 'Payment', 'Product', 'Account'],
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'Agent'
  }
}, {
  timestamps: true
});

const Ticket = model('Ticket', ticketSchema);

export default Ticket;
