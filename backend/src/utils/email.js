import { Resend } from 'resend';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Test email connection
export const testEmailConnection = async () => {
  try {
    console.log('Testing Resend connection...');
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');

    // Test with a simple API call
    const { data, error } = await resend.domains.list();

    if (error) {
      console.error('Resend connection failed:', error);
      return { success: false, error: error.message };
    }

    console.log('Resend connection successful!');
    return { success: true, message: 'Resend connection verified' };
  } catch (error) {
    console.error('Resend connection failed:', error);
    return { success: false, error: error.message };
  }
};

// Send verification email
export const sendVerificationEmail = async (email, token, firstName) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: `Helagovi.lk <noreply@helagovi.lk>`,
    to: [email],
    subject: 'Verify Your Email - Helagovi.lk',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header with Logo -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #e9ecef;">
          <img src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/Logo_uf3yae.png"
               alt="Helagovi.lk Logo"
               style="max-width: 150px; height: auto;">
          <h1 style="color: #4CAF50; margin: 10px 0 0 0; font-size: 24px;">Welcome to Helagovi.lk!</h1>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Hi ${firstName},</p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Thank you for registering with Helagovi.lk! To complete your registration and start exploring our platform,
            please verify your email address by clicking the button below.
          </p>

          <!-- Verification Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #4CAF50; color: white; padding: 15px 30px;
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);">
              Verify My Email Address
            </a>
          </div>

          <!-- Alternative Link -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>If the button doesn't work,</strong> copy and paste this link into your browser:
            </p>
            <p style="margin: 10px 0 0 0; word-break: break-all; color: #4CAF50; font-size: 12px;">
              ${verificationUrl}
            </p>
          </div>

          <!-- Benefits Section -->
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">What you can do after verification:</h3>
            <ul style="color: #666; margin: 10px 0 0 20px; padding: 0;">
              <li>Create and manage your products</li>
              <li>Access your personalized dashboard</li>
              <li>Connect with buyers and farmers</li>
              <li>Receive important notifications</li>
              <li>Access all platform features</li>
            </ul>
          </div>

          <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
            If you didn't create an account with Helagovi.lk, please ignore this email.
          </p>

          <p style="color: #666; line-height: 1.6;">
            Need help? Contact our support team at any time.
          </p>

          <p>Important: This verification link will expire in 1 hour for security reasons. If it expires, you can request a new verification email from your profile page.</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Best regards,<br>
            <strong>The Helagovi.lk Team</strong>
          </p>
          <div style="margin-top: 15px;">
            <a href="https://www.helagovi.lk" style="color: #4CAF50; text-decoration: none; margin: 0 10px;">Visit Helagovi.lk</a> |
            <a href="https://www.helagovi.lk/support" style="color: #4CAF50; text-decoration: none; margin: 0 10px;">Support</a> |
            <a href="https://www.helagovi.lk/contact" style="color: #4CAF50; text-decoration: none; margin: 0 10px;">Contact Us</a>
          </div>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
            © ${new Date().getFullYear()} Helagovi.lk. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }

  return data;
};

// Send password reset email
export const sendPasswordResetEmail = async (email, token, firstName) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: `Helagovi.lk <noreply@helagovi.lk>`,
    to: [email],
    subject: 'Reset Your Password - Helagovi.lk',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>You requested to reset your password. Click the button below to reset it.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #4CAF50; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The Helagovi.lk Team</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }

  return data;
};

// Send ticket confirmation email
export const sendTicketConfirmationEmail = async (email, ticketData, userName) => {
  const ticketUrl = `${process.env.CLIENT_URL}/support`;

  const { data, error } = await resend.emails.send({
    from: `Helagovi.lk Support <support@helagovi.lk>`,
    to: [email],
    subject: `Ticket Created - ${ticketData.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header with Logo -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #e9ecef;">
          <img src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/Logo_uf3yae.png"
               alt="Helagovi.lk Logo"
               style="max-width: 150px; height: auto;">
          <h1 style="color: #4CAF50; margin: 10px 0 0 0; font-size: 24px;">Helagovi.lk Support</h1>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Support Ticket Created Successfully</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Hi ${userName},</p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Thank you for contacting Helagovi.lk support. Your ticket has been created and our support team will respond to you as soon as possible.
          </p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Ticket Details:</h3>
            <p><strong>Ticket ID:</strong> ${ticketData.ticketNumber || ticketData._id}</p>
            <p><strong>Subject:</strong> ${ticketData.title}</p>
            <p><strong>Category:</strong> ${ticketData.category}</p>
            <p><strong>Priority:</strong> ${ticketData.priority}</p>
            <p><strong>Status:</strong> ${ticketData.status}</p>
            <p><strong>Created:</strong> ${new Date(ticketData.createdAt).toLocaleDateString()}</p>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${ticketUrl}"
               style="background-color: #4CAF50; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              View Your Ticket
            </a>
          </p>

          <p>You can track your ticket status and communicate with our support team by visiting your support dashboard.</p>

          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0;"><strong>What happens next?</strong></p>
            <ul style="margin: 10px 0 0 20px;">
              <li>Our support team will review your ticket within 24 hours</li>
              <li>You'll receive email notifications for any updates</li>
              <li>You can reply to this email or use the support dashboard to add more details</li>
            </ul>
          </div>

          <p>If you have any additional information or screenshots that might help resolve your issue, please don't hesitate to provide them.</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Best regards,<br>
            <strong>The Helagovi.lk Support Team</strong>
          </p>
          <div style="margin-top: 15px;">
            <a href="https://www.helagovi.lk" style="color: #4CAF50; text-decoration: none; margin: 0 10px;">Visit Helagovi.lk</a> |
            <a href="https://www.helagovi.lk/support" style="color: #4CAF50; text-decoration: none; margin: 0 10px;">Support</a> |
            <a href="https://www.helagovi.lk/contact" style="color: #4CAF50; text-decoration: none; margin: 0 10px;">Contact Us</a>
          </div>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
            © ${new Date().getFullYear()} Helagovi.lk. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send ticket confirmation email: ${error.message}`);
  }

  return data;
};

// Send promotional email
export const sendPromotionalEmail = async (email, firstName, promotionData = {}) => {
  const {
    title = "Special Offer Just for You!",
    description = "Discover amazing deals and exclusive offers on our platform.",
    discountCode = "WELCOME20",
    discountValue = "20%",
    expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    ctaText = "Shop Now",
    ctaUrl = `https://www.helagovi.lk/products`
  } = promotionData;

  const { data, error } = await resend.emails.send({
    from: `Helagovi.lk <promotions@helagovi.lk>`,
    to: [email],
    subject: title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header with Logo -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #e9ecef;">
          <img src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/Logo_uf3yae.png"
               alt="Helagovi.lk Logo"
               style="max-width: 150px; height: auto;">
          <h1 style="color: #4CAF50; margin: 10px 0 0 0; font-size: 24px;">Helagovi.lk</h1>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">${title}</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Hi ${firstName},</p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">${description}</p>

          <!-- Promotion Box -->
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);">
            <h3 style="margin: 0 0 15px 0; font-size: 28px;">${discountValue} OFF</h3>
            <p style="margin: 0 0 20px 0; font-size: 16px;">Use code: <strong>${discountCode}</strong></p>
            <p style="margin: 0; font-size: 14px;">Valid until ${expiryDate}</p>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${ctaUrl}"
               style="background-color: #4CAF50; color: white; padding: 15px 30px;
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);">
              ${ctaText}
            </a>
          </p>

          <p style="text-align: center; margin: 20px 0;">
            <a href="https://helagovi.lk"
               style="background-color: #FF9800; color: white; padding: 12px 25px;
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);">
              Join Now
            </a>
          </p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #333; margin-top: 0;">Why choose Helagovi.lk?</h3>
            <ul style="color: #666; margin: 10px 0 0 20px; padding: 0;">
              <li>Fresh, locally sourced products</li>
              <li>Direct from farmers to your table</li>
              <li>Competitive prices and great quality</li>
              <li>Fast and reliable delivery</li>
              <li>Excellent customer support</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Best regards,<br>
            <strong>The Helagovi.lk Team</strong>
          </p>
          <div style="margin-top: 15px;">
            <a href="https://www.helagovi.lk" style="color: #4CAF50; text-decoration: none; margin: 0 10px;">Visit Helagovi.lk</a> |
            <a href="https://www.helagovi.lk/products" style="color: #4CAF50; text-decoration: none; margin: 0 10px;">Shop Now</a> |
            <a href="https://helagovi.lk" style="color: #FF9800; text-decoration: none; margin: 0 10px;">Join Now</a> |
            <a href="https://www.helagovi.lk/contact" style="color: #4CAF50; text-decoration: none; margin: 0 10px;">Contact Us</a>
          </div>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
            © ${new Date().getFullYear()} Helagovi.lk. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send promotional email: ${error.message}`);
  }

  return data;
};

// Send "Join Us" email
export const sendJoinUsEmail = async (email, firstName, joinData = {}) => {
  const {
    title = "Join the Helagovi.lk Community!",
    message = "Be part of Sri Lanka's growing agricultural marketplace.",
    benefits = [
      "Connect directly with farmers",
      "Access fresh, local produce",
      "Support sustainable agriculture",
      "Build your business network"
    ],
    ctaText = "Join Now",
    ctaUrl = `https://www.helagovi.lk`
  } = joinData;

  const { data, error } = await resend.emails.send({
    from: `Helagovi.lk <welcome@helagovi.lk>`,
    to: [email],
    subject: title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header with Logo -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #e9ecef;">
          <img src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/Logo_uf3yae.png"
               alt="Helagovi.lk Logo"
               style="max-width: 150px; height: auto;">
          <h1 style="color: #4CAF50; margin: 10px 0 0 0; font-size: 24px;">Welcome to Helagovi.lk</h1>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">${title}</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Hi ${firstName},</p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">${message}</p>

          <!-- Benefits Section -->
          <div style="background-color: #e8f5e8; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #4CAF50;">
            <h3 style="color: #2e7d32; margin-top: 0;">What you'll get by joining us:</h3>
            <ul style="color: #666; margin: 15px 0 0 20px; padding: 0;">
              ${benefits.map(benefit => `<li style="margin-bottom: 8px;">${benefit}</li>`).join('')}
            </ul>
          </div>

          <!-- Community Stats -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <h3 style="color: #333; margin-top: 0;">Join Our Growing Community</h3>
            <div style="display: flex; justify-content: space-around; margin: 20px 0;">
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">1000+</div>
                <div style="color: #666; font-size: 14px;">Active Farmers</div>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">5000+</div>
                <div style="color: #666; font-size: 14px;">Happy Customers</div>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">50+</div>
                <div style="color: #666; font-size: 14px;">Product Categories</div>
              </div>
            </div>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${ctaUrl}"
               style="background-color: #4CAF50; color: white; padding: 15px 30px;
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);">
              ${ctaText}
            </a>
          </p>

          <p style="color: #666; line-height: 1.6; text-align: center;">
            Ready to start your journey with Helagovi.lk? Join thousands of satisfied users today!
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Best regards,<br>
            <strong>The Helagovi.lk Team</strong>
          </p>
          <div style="margin-top: 15px;">
            <a href="https://www.helagovi.lk" style="color: #4CAF50; text-decoration: none; margin: 0 10px;">Visit Helagovi.lk</a> |
            <a href="https://www.helagovi.lk" style="color: #4CAF50; text-decoration: none; margin: 0 10px;">Join Now</a> |
            <a href="https://www.helagovi.lk/contact" style="color: #4CAF50; text-decoration: none; margin: 0 10px;">Contact Us</a>
          </div>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
            © ${new Date().getFullYear()} Helagovi.lk. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send join us email: ${error.message}`);
  }

  return data;
};

// Send custom email
export const sendCustomEmail = async (email, subject, htmlContent, fromName = "Helagovi.lk") => {
  const { data, error } = await resend.emails.send({
    from: `${fromName} <noreply@helagovi.lk>`,
    to: [email],
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header with Logo -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #e9ecef;">
          <img src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/Logo_uf3yae.png"
               alt="Helagovi.lk Logo"
               style="max-width: 150px; height: auto;">
          <h1 style="color: #4CAF50; margin: 10px 0 0 0; font-size: 24px;">Helagovi.lk</h1>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px 20px;">
          ${htmlContent}
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Best regards,<br>
            <strong>The Helagovi.lk Team</strong>
          </p>
          <div style="margin-top: 15px;">
            <a href="https://www.helagovi.lk" style="color: #4CAF50; text-decoration: none; margin: 0 10px;">Visit Helagovi.lk</a> |
            <a href="https://www.helagovi.lk/contact" style="color: #4CAF50; text-decoration: none; margin: 0 10px;">Contact Us</a>
          </div>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
            © ${new Date().getFullYear()} Helagovi.lk. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send custom email: ${error.message}`);
  }

  return data;
};