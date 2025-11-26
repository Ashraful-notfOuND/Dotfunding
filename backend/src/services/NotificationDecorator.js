/**
 * Decorator Pattern for Notifications
 * Adds additional features to notifications dynamically
 */

// Base Decorator
class NotificationDecorator {
  constructor(notification) {
    this.notification = notification;
  }

  async send() {
    return await this.notification.send();
  }
}

// Concrete Decorator 1: Priority Decorator
class PriorityDecorator extends NotificationDecorator {
  constructor(notification, priority = "normal") {
    super(notification);
    this.priority = priority; // urgent, high, normal, low
  }

  async send() {
    // Add priority to message
    const priorityPrefix = {
      urgent: "🚨 URGENT: ",
      high: "⚠️ IMPORTANT: ",
      normal: "",
      low: "ℹ️ ",
    };

    const originalMessage = this.notification.message;
    const originalMetadata = this.notification.metadata;
    
    this.notification.message = 
      priorityPrefix[this.priority] + originalMessage;
    
    this.notification.metadata = {
      ...originalMetadata,
      priority: this.priority,
    };

    const result = await this.notification.send();
    
    // Restore original values for potential retries
    this.notification.message = originalMessage;
    this.notification.metadata = originalMetadata;
    
    return result;
  }
}

// Concrete Decorator 2: Personalization Decorator
class PersonalizationDecorator extends NotificationDecorator {
  constructor(notification, userName) {
    super(notification);
    this.userName = userName;
  }

  async send() {
    // Personalize message with user's name
    const originalMessage = this.notification.message;
    const originalMetadata = this.notification.metadata;
    
    this.notification.message = `Hi ${this.userName}! ${originalMessage}`;
    
    this.notification.metadata = {
      ...originalMetadata,
      personalized: true,
      userName: this.userName,
    };

    const result = await this.notification.send();
    
    // Restore original values for potential retries
    this.notification.message = originalMessage;
    this.notification.metadata = originalMetadata;
    
    return result;
  }
}

// Concrete Decorator 3: Rich Formatting Decorator
class RichFormattingDecorator extends NotificationDecorator {
  constructor(notification, formatting = {}) {
    super(notification);
    this.formatting = formatting; // { bold, italic, emoji, color }
  }

  async send() {
    let message = this.notification.message;

    // Add emoji if specified
    if (this.formatting.emoji) {
      message = `${this.formatting.emoji} ${message}`;
    }

    const originalMessage = this.notification.message;
    const originalMetadata = this.notification.metadata;
    
    // Add styling metadata for HTML rendering
    this.notification.metadata = {
      ...originalMetadata,
      formatting: {
        bold: this.formatting.bold || false,
        italic: this.formatting.italic || false,
        color: this.formatting.color || null,
      },
    };

    this.notification.message = message;

    const result = await this.notification.send();
    
    // Restore original values for potential retries
    this.notification.message = originalMessage;
    this.notification.metadata = originalMetadata;
    
    return result;
  }
}

// Concrete Decorator 4: Scheduled Decorator
class ScheduledDecorator extends NotificationDecorator {
  constructor(notification, sendAt) {
    super(notification);
    this.sendAt = new Date(sendAt);
  }

  async send() {
    const now = new Date();
    
    if (this.sendAt > now) {
      // Schedule for later
      const delay = this.sendAt - now;
      console.log(`Notification scheduled for ${this.sendAt}, delay: ${delay}ms`);
      
      this.notification.metadata = {
        ...this.notification.metadata,
        scheduled: true,
        sendAt: this.sendAt.toISOString(),
      };

      // In production, use a job queue (Bull, BullMQ, etc.)
      setTimeout(async () => {
        await this.notification.send();
      }, delay);

      return {
        success: true,
        scheduled: true,
        sendAt: this.sendAt,
      };
    }

    // Send immediately if time has passed
    return await this.notification.send();
  }
}

// Concrete Decorator 5: Tracking Decorator
class TrackingDecorator extends NotificationDecorator {
  constructor(notification) {
    super(notification);
    this.trackingId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async send() {
    const startTime = Date.now();
    
    this.notification.metadata = {
      ...this.notification.metadata,
      trackingId: this.trackingId,
      sentAt: new Date().toISOString(),
    };

    const result = await this.notification.send();
    
    const duration = Date.now() - startTime;
    
    // Find the base notification to get recipient info
    let baseNotif = this.notification;
    while (baseNotif.notification) {
      baseNotif = baseNotif.notification;
    }
    
    const recipientInfo = baseNotif.recipient ? 
      (baseNotif.recipient.id || baseNotif.recipient.email) : 
      'unknown';
    
    // Log notification metrics
    console.log(`Notification ${this.trackingId} sent in ${duration}ms:`, {
      success: result.success,
      channel: result.channel,
      recipient: recipientInfo,
    });

    return {
      ...result,
      trackingId: this.trackingId,
      duration,
    };
  }
}

// Concrete Decorator 6: Retry Decorator
class RetryDecorator extends NotificationDecorator {
  constructor(notification, maxRetries = 3, retryDelay = 1000) {
    super(notification);
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  async send() {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.notification.send();
        
        if (result.success) {
          return {
            ...result,
            attempt,
            retried: attempt > 1,
          };
        }
        
        lastError = result.error;
      } catch (error) {
        lastError = error.message;
      }

      if (attempt < this.maxRetries) {
        console.log(`Notification failed (attempt ${attempt}/${this.maxRetries}), retrying in ${this.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }

    return {
      success: false,
      error: `Failed after ${this.maxRetries} attempts: ${lastError}`,
      attempts: this.maxRetries,
    };
  }
}

// Helper class to chain decorators easily
class NotificationBuilder {
  constructor(notification) {
    this.notification = notification;
  }

  withPriority(priority) {
    this.notification = new PriorityDecorator(this.notification, priority);
    return this;
  }

  withPersonalization(userName) {
    this.notification = new PersonalizationDecorator(this.notification, userName);
    return this;
  }

  withFormatting(formatting) {
    this.notification = new RichFormattingDecorator(this.notification, formatting);
    return this;
  }

  withSchedule(sendAt) {
    this.notification = new ScheduledDecorator(this.notification, sendAt);
    return this;
  }

  withTracking() {
    this.notification = new TrackingDecorator(this.notification);
    return this;
  }

  withRetry(maxRetries, retryDelay) {
    this.notification = new RetryDecorator(this.notification, maxRetries, retryDelay);
    return this;
  }

  build() {
    return this.notification;
  }

  async send() {
    return await this.notification.send();
  }
}

export {
  NotificationDecorator,
  PriorityDecorator,
  PersonalizationDecorator,
  RichFormattingDecorator,
  ScheduledDecorator,
  TrackingDecorator,
  RetryDecorator,
  NotificationBuilder,
};
