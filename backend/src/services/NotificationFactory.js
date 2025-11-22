/**
 * Factory Pattern for Multi-Channel Notifications
 * Creates notification objects for different channels
 */

import { supabase } from "../config/supabaseClient.js";
import nodemailer from "nodemailer";

// Abstract Product
class Notification {
  constructor(recipient, message, metadata = {}) {
    this.recipient = recipient;
    this.message = message;
    this.metadata = metadata;
    this.timestamp = new Date();
  }

  async send() {
    throw new Error("send() must be implemented by subclass");
  }
}

// Concrete Product 1: In-App Notification
class InAppNotification extends Notification {
  async send() {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert([{
          receiver_id: this.recipient.id,
          sender_id: this.metadata.senderId || null,
          project_id: this.metadata.projectId || null,
          amount: this.metadata.amount || null,
          message: this.message,
          type: this.metadata.type || "recommendation",
          is_read: false,
        }])
        .select();

      if (error) throw error;

      return {
        success: true,
        channel: "in-app",
        data: data[0],
      };
    } catch (error) {
      console.error("InAppNotification error:", error);
      return {
        success: false,
        channel: "in-app",
        error: error.message,
      };
    }
  }
}

// Concrete Product 2: Email Notification
class EmailNotification extends Notification {
  async send() {
    try {
      // Configure email transporter (use environment variables in production)
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || '"DotFunding" <noreply@dotfunding.com>',
        to: this.recipient.email,
        subject: this.metadata.subject || "New Project Recommendation",
        html: this.formatEmailHTML(),
      };

      const info = await transporter.sendMail(mailOptions);

      return {
        success: true,
        channel: "email",
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("EmailNotification error:", error);
      return {
        success: false,
        channel: "email",
        error: error.message,
      };
    }
  }

  formatEmailHTML() {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">DotFunding Recommendation</h2>
        <p>${this.message}</p>
        ${this.metadata.projectTitle ? `
          <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${this.metadata.projectTitle}</h3>
            <p>${this.metadata.projectDescription || ""}</p>
            <a href="${this.metadata.projectUrl || "#"}" 
               style="display: inline-block; background: #4F46E5; color: white; 
                      padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Project
            </a>
          </div>
        ` : ""}
        <p style="color: #6B7280; font-size: 12px;">
          You received this email because you subscribed to DotFunding recommendations.
        </p>
      </div>
    `;
  }
}

// Concrete Product 3: SMS Notification
class SMSNotification extends Notification {
  async send() {
    try {
      // Placeholder for SMS integration (Twilio, AWS SNS, etc.)
      console.log(`SMS to ${this.recipient.phone}: ${this.message}`);
      
      // Example with Twilio (uncomment when credentials available):
      // const client = require('twilio')(accountSid, authToken);
      // await client.messages.create({
      //   body: this.message,
      //   from: process.env.TWILIO_PHONE,
      //   to: this.recipient.phone
      // });

      return {
        success: true,
        channel: "sms",
        message: "SMS functionality not yet configured",
      };
    } catch (error) {
      console.error("SMSNotification error:", error);
      return {
        success: false,
        channel: "sms",
        error: error.message,
      };
    }
  }
}

// Concrete Product 4: Push Notification
class PushNotification extends Notification {
  async send() {
    try {
      // Placeholder for push notification (Firebase Cloud Messaging, OneSignal, etc.)
      console.log(`Push to ${this.recipient.id}: ${this.message}`);
      
      // Example with Firebase (uncomment when configured):
      // const admin = require('firebase-admin');
      // await admin.messaging().send({
      //   token: this.recipient.fcmToken,
      //   notification: {
      //     title: this.metadata.title,
      //     body: this.message
      //   }
      // });

      return {
        success: true,
        channel: "push",
        message: "Push notification functionality not yet configured",
      };
    } catch (error) {
      console.error("PushNotification error:", error);
      return {
        success: false,
        channel: "push",
        error: error.message,
      };
    }
  }
}

// Factory Class
class NotificationFactory {
  static createNotification(channel, recipient, message, metadata = {}) {
    switch (channel.toLowerCase()) {
      case "in-app":
      case "app":
        return new InAppNotification(recipient, message, metadata);
      case "email":
        return new EmailNotification(recipient, message, metadata);
      case "sms":
        return new SMSNotification(recipient, message, metadata);
      case "push":
        return new PushNotification(recipient, message, metadata);
      default:
        throw new Error(`Unknown notification channel: ${channel}`);
    }
  }

  // Create multiple notifications for different channels
  static createMultiChannel(channels, recipient, message, metadata = {}) {
    return channels.map(channel => 
      this.createNotification(channel, recipient, message, metadata)
    );
  }
}

export {
  Notification,
  InAppNotification,
  EmailNotification,
  SMSNotification,
  PushNotification,
  NotificationFactory,
};
