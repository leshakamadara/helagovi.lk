import express from 'express';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendTicketConfirmationEmail,
  sendPromotionalEmail,
  sendJoinUsEmail,
  sendCustomEmail,
  sendOrderPlacedEmail,
  sendOrderAcceptedEmail,
  sendOrderCancelledEmail,
  sendOrderCompletedEmail,
  sendOrderDeliveredEmail,
  testEmailConnection
} from '../utils/email.js';

const router = express.Router();

// Test email connection
router.get('/test-connection', async (req, res) => {
  try {
    const result = await testEmailConnection();
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error testing email connection:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send test verification email
router.post('/test/verification', async (req, res) => {
  try {
    const { email, firstName = 'Test User' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: 'Email service not configured',
        details: 'Missing RESEND_API_KEY environment variable'
      });
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

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: 'Email service not configured',
        details: 'Missing RESEND_API_KEY environment variable'
      });
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

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: 'Email service not configured',
        details: 'Missing RESEND_API_KEY environment variable'
      });
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
    const {
      email,
      subject,
      htmlContent,
      textContent
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!subject || !htmlContent) {
      return res.status(400).json({ error: 'Subject and HTML content are required' });
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: 'Email service not configured',
        details: 'Missing RESEND_API_KEY environment variable'
      });
    }

    await sendCustomEmail(email, subject, htmlContent, textContent);

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

// Send test order placed email
router.post('/test/order-placed', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: 'Email service not configured',
        details: 'Missing RESEND_API_KEY environment variable'
      });
    }

    const mockOrder = {
      orderNumber: 'ORD-001',
      status: 'pending',
      createdAt: new Date(),
      buyer: {
        name: 'Test Customer',
        email: email
      },
      items: [
        {
          productSnapshot: {
            title: 'Fresh Tomatoes',
            price: 150,
            image: 'https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/sample_tomato.jpg',
            farmer: {
              name: 'John Farmer'
            }
          },
          quantity: 2,
          totalPrice: 300
        },
        {
          productSnapshot: {
            title: 'Organic Carrots',
            price: 120,
            image: 'https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/sample_carrot.jpg',
            farmer: {
              name: 'Jane Farmer'
            }
          },
          quantity: 1,
          totalPrice: 120
        }
      ],
      subtotal: 420,
      deliveryFee: 100,
      total: 520,
      deliveryAddress: {
        street: '123 Main Street',
        city: 'Colombo',
        district: 'Colombo',
        postalCode: '00100',
        instructions: 'Please ring the doorbell'
      }
    };

    await sendOrderPlacedEmail(mockOrder);

    res.json({
      success: true,
      message: 'Order placed email sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Error sending order placed email:', error);
    res.status(500).json({
      error: 'Failed to send order placed email',
      details: error.message
    });
  }
});

// Send test order accepted email
router.post('/test/order-accepted', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: 'Email service not configured',
        details: 'Missing RESEND_API_KEY environment variable'
      });
    }

    const mockOrder = {
      orderNumber: 'ORD-001',
      status: 'confirmed',
      createdAt: new Date(),
      buyer: {
        name: 'Test Customer',
        email: email
      },
      items: [
        {
          productSnapshot: {
            title: 'Fresh Tomatoes',
            price: 150,
            image: 'https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/sample_tomato.jpg',
            farmer: {
              name: 'John Farmer'
            }
          },
          quantity: 2,
          totalPrice: 300
        }
      ],
      subtotal: 300,
      deliveryFee: 100,
      total: 400,
      deliveryAddress: {
        street: '123 Main Street',
        city: 'Colombo',
        district: 'Colombo',
        postalCode: '00100'
      }
    };

    await sendOrderAcceptedEmail(mockOrder);

    res.json({
      success: true,
      message: 'Order accepted email sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Error sending order accepted email:', error);
    res.status(500).json({
      error: 'Failed to send order accepted email',
      details: error.message
    });
  }
});

// Send test order cancelled email
router.post('/test/order-cancelled', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: 'Email service not configured',
        details: 'Missing RESEND_API_KEY environment variable'
      });
    }

    const mockOrder = {
      orderNumber: 'ORD-001',
      status: 'cancelled',
      createdAt: new Date(),
      buyer: {
        name: 'Test Customer',
        email: email
      },
      items: [
        {
          productSnapshot: {
            title: 'Fresh Tomatoes',
            price: 150,
            image: 'https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/sample_tomato.jpg',
            farmer: {
              name: 'John Farmer'
            }
          },
          quantity: 2,
          totalPrice: 300
        }
      ],
      subtotal: 300,
      deliveryFee: 100,
      total: 400,
      deliveryAddress: {
        street: '123 Main Street',
        city: 'Colombo',
        district: 'Colombo',
        postalCode: '00100'
      }
    };

    await sendOrderCancelledEmail(mockOrder);

    res.json({
      success: true,
      message: 'Order cancelled email sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Error sending order cancelled email:', error);
    res.status(500).json({
      error: 'Failed to send order cancelled email',
      details: error.message
    });
  }
});

// Send test order completed email
router.post('/test/order-completed', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: 'Email service not configured',
        details: 'Missing RESEND_API_KEY environment variable'
      });
    }

    const mockOrder = {
      orderNumber: 'ORD-001',
      status: 'shipped',
      createdAt: new Date(),
      buyer: {
        name: 'Test Customer',
        email: email
      },
      items: [
        {
          productSnapshot: {
            title: 'Fresh Tomatoes',
            price: 150,
            image: 'https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/sample_tomato.jpg',
            farmer: {
              name: 'John Farmer'
            }
          },
          quantity: 2,
          totalPrice: 300
        }
      ],
      subtotal: 300,
      deliveryFee: 100,
      total: 400,
      deliveryAddress: {
        street: '123 Main Street',
        city: 'Colombo',
        district: 'Colombo',
        postalCode: '00100',
        instructions: 'Leave at doorstep'
      }
    };

    await sendOrderCompletedEmail(mockOrder);

    res.json({
      success: true,
      message: 'Order completed email sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Error sending order completed email:', error);
    res.status(500).json({
      error: 'Failed to send order completed email',
      details: error.message
    });
  }
});

// Send test order delivered email
router.post('/test/order-delivered', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: 'Email service not configured',
        details: 'Missing RESEND_API_KEY environment variable'
      });
    }

    const mockOrder = {
      _id: '507f1f77bcf86cd799439011',
      orderNumber: 'ORD-001',
      status: 'delivered',
      createdAt: new Date(),
      buyer: {
        name: 'Test Customer',
        email: email
      },
      items: [
        {
          productSnapshot: {
            title: 'Fresh Tomatoes',
            price: 150,
            image: 'https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/sample_tomato.jpg',
            farmer: {
              name: 'John Farmer'
            }
          },
          quantity: 2,
          totalPrice: 300
        }
      ],
      subtotal: 300,
      deliveryFee: 100,
      total: 400,
      deliveryAddress: {
        street: '123 Main Street',
        city: 'Colombo',
        district: 'Colombo',
        postalCode: '00100'
      }
    };

    await sendOrderDeliveredEmail(mockOrder);

    res.json({
      success: true,
      message: 'Order delivered email sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Error sending order delivered email:', error);
    res.status(500).json({
      error: 'Failed to send order delivered email',
      details: error.message
    });
  }
});

export default router;
