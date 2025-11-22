import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Service for sending notification emails
 */
class EmailService {
  constructor() {
    // Create transporter with your email service
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Send pledge notification email to project creator
   */
  async sendPledgeNotification({ recipientEmail, recipientName, donorName, amount, projectTitle, donorMessage }) {
    try {
      // Validate email configuration
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('Email service not configured. Skipping email notification.');
        return { success: false, error: 'Email not configured' };
      }

      console.log(`Attempting to send email to: ${recipientEmail}`);
      
      const mailOptions = {
        from: `"DotFunding" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: `🎉 New Pledge Alert - $${amount} received!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .amount { font-size: 36px; font-weight: bold; color: #10b981; margin: 20px 0; }
              .message-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 You Received a New Pledge!</h1>
              </div>
              <div class="content">
                <p>Hi ${recipientName},</p>
                <p>Great news! You've just received a new pledge for your project <strong>"${projectTitle}"</strong>.</p>
                
                <div class="amount">$${amount}</div>
                
                <p><strong>From:</strong> ${donorName || 'A generous supporter'}</p>
                
                ${donorMessage ? `
                <div class="message-box">
                  <p><strong>💬 Backer's Message:</strong></p>
                  <p style="font-style: italic;">"${donorMessage}"</p>
                </div>
                ` : ''}
                
                <p>This brings you one step closer to your funding goal. Keep up the great work!</p>
                
                <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/profile?tab=notifications" class="button">
                  View All Notifications
                </a>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  Thank you for being part of the DotFunding community!
                </p>
              </div>
              <div class="footer">
                <p>© 2025 DotFunding. All rights reserved.</p>
                <p>You're receiving this email because you created a project on DotFunding.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending email:', error.message);
      console.error('Full error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test email configuration
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email server is ready to send messages');
      return true;
    } catch (error) {
      console.error('Email server connection failed:', error);
      return false;
    }
  }
}

export default new EmailService();
