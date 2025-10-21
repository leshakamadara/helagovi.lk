import express from 'express';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendTicketConfirmationEmail,
  sendPromotionalEmail,
  sendJoinUsEmail,
  sendCustomEmail
} from '../utils/email.js';

const router = express.Router();

// Send test verification email
router.post('/test/verification', async (req, res) => {
  try {
    const { email, firstName = 'Test User' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await sendVerificationEmail(email, 'test-verification-token-12345', firstName);

    res.json({
      success: true,
      message: 'Verification email sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({
      error: 'Failed to send verification email',
      details: error.message
    });
  }
});

// Send test promotional email
router.post('/test/promotional', async (req, res) => {
  try {
    const {
      email,
      firstName = 'Test User',
      title,
      description,
      discountCode,
      discountValue,
      expiryDate,
      ctaText,
      ctaUrl
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const promotionData = {
      title,
      description,
      discountCode,
      discountValue,
      expiryDate,
      ctaText,
      ctaUrl
    };

    await sendPromotionalEmail(email, firstName, promotionData);

    res.json({
      success: true,
      message: 'Promotional email sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Error sending promotional email:', error);
    res.status(500).json({
      error: 'Failed to send promotional email',
      details: error.message
    });
  }
});

// Send test join us email
router.post('/test/join-us', async (req, res) => {
  try {
    const {
      email,
      firstName = 'Test User',
      title,
      message,
      benefits,
      ctaText,
      ctaUrl
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const joinData = {
      title,
      message,
      benefits,
      ctaText,
      ctaUrl
    };

    await sendJoinUsEmail(email, firstName, joinData);

    res.json({
      success: true,
      message: 'Join us email sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Error sending join us email:', error);
    res.status(500).json({
      error: 'Failed to send join us email',
      details: error.message
    });
  }
});

// Send test custom email
router.post('/test/custom', async (req, res) => {
  try {
    const { email, subject, htmlContent, fromName } = req.body;

    if (!email || !subject || !htmlContent) {
      return res.status(400).json({
        error: 'Email, subject, and htmlContent are required'
      });
    }

    await sendCustomEmail(email, subject, htmlContent, fromName);

    res.json({
      success: true,
      message: 'Custom email sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Error sending custom email:', error);
    res.status(500).json({
      error: 'Failed to send custom email',
      details: error.message
    });
  }
});

// Send test ticket confirmation email
router.post('/test/ticket', async (req, res) => {
  try {
    const { email, userName = 'Test User' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const ticketData = {
      ticketNumber: 'TICKET-001',
      _id: '507f1f77bcf86cd799439011',
      title: 'Test Support Ticket',
      category: 'Technical Support',
      priority: 'Medium',
      status: 'Open',
      createdAt: new Date()
    };

    await sendTicketConfirmationEmail(email, ticketData, userName);

    res.json({
      success: true,
      message: 'Ticket confirmation email sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Error sending ticket confirmation email:', error);
    res.status(500).json({
      error: 'Failed to send ticket confirmation email',
      details: error.message
    });
  }
});

export default router;
