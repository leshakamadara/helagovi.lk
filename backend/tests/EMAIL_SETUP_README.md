# Email Confirmation Setup Guide

## Overview
The support system now includes automatic email confirmation when users create tickets. This feature sends a professional HTML email with ticket details and a link to the support dashboard.

## Features
- ✅ Automatic email confirmation on ticket creation
- ✅ Professional HTML email template with ticket details
- ✅ Error handling (email failures don't block ticket creation)
- ✅ Personalized emails with user name and ticket information
- ✅ Direct link to support dashboard for easy access

## Email Template Includes
- Ticket ID and number
- Subject, category, priority, and status
- Creation date and time
- Next steps and support information
- Professional styling and branding

## Setup Instructions

### 1. Gmail SMTP Configuration
To enable email sending, you need to configure Gmail SMTP:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a 16-character password for "Mail"
3. **Update your `.env` file** with the credentials:

```env
# Email Configuration for Gmail SMTP
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASS="your-16-character-app-password"
CLIENT_URL="https://www.helagovi.lk"
```

### 2. Testing the Email Functionality

Run the email test to verify everything works:

```bash
cd backend
node tests/testEmail.js
```

This will attempt to send a test email and show you the result.

### 3. Production Deployment

For production, make sure:
- Environment variables are properly set
- Gmail account has sufficient sending limits
- Consider using a dedicated email service like SendGrid for high volume

## How It Works

1. **Ticket Creation**: When a user creates a ticket via the API
2. **Email Trigger**: The system automatically sends a confirmation email
3. **Error Handling**: If email fails, ticket creation still succeeds
4. **User Experience**: Users receive immediate confirmation with all ticket details

## API Integration

The email functionality is automatically integrated into the ticket creation endpoint:

```javascript
POST /api/tickets
```

No additional API changes needed - emails are sent automatically.

## Troubleshooting

### Common Issues:
- **"Authentication failed"**: Check Gmail credentials and app password
- **"ECONNREFUSED"**: Verify EMAIL_HOST and EMAIL_PORT settings
- **Emails not received**: Check spam folder, verify Gmail settings

### Testing Tips:
- Use a test Gmail account first
- Check Gmail's "Sent Mail" folder to confirm sending
- Verify the HTML email renders correctly in different email clients

## Security Notes
- App passwords are specific to applications and can be revoked
- Never commit real credentials to version control
- Use environment variables for all sensitive configuration