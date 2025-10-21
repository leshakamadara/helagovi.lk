import nodemailer from 'nodemailer';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Submit ticket by email
const submitTicketByEmail = async (req, res) => {
  try {
    const { from, subject, body, category = 'Technical' } = req.body;

    // Find or create user based on email
    let user = await User.findOne({ email: from });
    if (!user) {
      user = new User({
        email: from,
        name: from.split('@')[0], // Use email prefix as name
        role: 'user',
      });
      await user.save();
    }

    // Create ticket from email
    const ticketData = {
      title: subject,
      description: body,
      category,
      status: 'Open',
      priority: 'Medium',
      createdBy: user._id,
    };

    const ticket = new Ticket(ticketData);
    await ticket.save();
    await ticket.populate('createdBy');

    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: from,
      subject: `Ticket Created - ${ticket.title}`,
      html: `
        <h3>Your support ticket has been created</h3>
        <p><strong>Ticket ID:</strong> ${ticket._id}</p>
        <p><strong>Subject:</strong> ${ticket.title}</p>
        <p><strong>Category:</strong> ${ticket.category}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <p>We'll get back to you as soon as possible.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully from email',
      ticket: {
        id: ticket._id,
        title: ticket.title,
        category: ticket.category,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    });
  } catch (error) {
    console.error('Email ticket submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create ticket from email',
    });
  }
};

// Mock IMAP email processing (for testing)
const processIncomingEmail = async (emailData) => {
  try {
    const { from, subject, text } = emailData;

    // Determine category from subject keywords
    let category = 'Technical';
    const subjectLower = subject.toLowerCase();

    if (subjectLower.includes('payment') || subjectLower.includes('billing')) {
      category = 'Payment';
    } else if (
      subjectLower.includes('product') ||
      subjectLower.includes('feature')
    ) {
      category = 'Product';
    } else if (
      subjectLower.includes('account') ||
      subjectLower.includes('login')
    ) {
      category = 'Account';
    }

    return {
      from,
      subject,
      body: text,
      category,
    };
  } catch (error) {
    throw new Error('Failed to process email data');
  }
};

export { submitTicketByEmail, processIncomingEmail };
