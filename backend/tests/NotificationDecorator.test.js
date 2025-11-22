import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  PriorityDecorator,
  PersonalizationDecorator,
  RichFormattingDecorator,
  TrackingDecorator,
  RetryDecorator,
  NotificationBuilder,
} from "../src/services/NotificationDecorator.js";

describe("Notification Decorator Pattern", () => {
  let mockNotification;

  beforeEach(() => {
    mockNotification = {
      message: "Test message",
      recipient: { id: "user-123", email: "test@example.com" },
      metadata: {},
      send: vi.fn().mockResolvedValue({ success: true, channel: "test" }),
    };
  });

  describe("PriorityDecorator", () => {
    it("should add urgent priority prefix", async () => {
      const decorator = new PriorityDecorator(mockNotification, "urgent");
      await decorator.send();

      expect(mockNotification.message).toContain("🚨 URGENT:");
      expect(mockNotification.metadata.priority).toBe("urgent");
      expect(mockNotification.send).toHaveBeenCalled();
    });

    it("should add high priority prefix", async () => {
      const decorator = new PriorityDecorator(mockNotification, "high");
      await decorator.send();

      expect(mockNotification.message).toContain("⚠️ IMPORTANT:");
    });

    it("should not add prefix for normal priority", async () => {
      const originalMessage = mockNotification.message;
      const decorator = new PriorityDecorator(mockNotification, "normal");
      await decorator.send();

      expect(mockNotification.message).toBe(originalMessage);
    });
  });

  describe("PersonalizationDecorator", () => {
    it("should add user name to message", async () => {
      const decorator = new PersonalizationDecorator(mockNotification, "John");
      await decorator.send();

      expect(mockNotification.message).toContain("Hi John!");
      expect(mockNotification.metadata.personalized).toBe(true);
      expect(mockNotification.metadata.userName).toBe("John");
    });
  });

  describe("RichFormattingDecorator", () => {
    it("should add emoji to message", async () => {
      const decorator = new RichFormattingDecorator(mockNotification, {
        emoji: "🎉",
      });
      await decorator.send();

      expect(mockNotification.message).toContain("🎉");
    });

    it("should add formatting metadata", async () => {
      const decorator = new RichFormattingDecorator(mockNotification, {
        bold: true,
        color: "#FF0000",
      });
      await decorator.send();

      expect(mockNotification.metadata.formatting).toEqual({
        bold: true,
        italic: false,
        color: "#FF0000",
      });
    });
  });

  describe("TrackingDecorator", () => {
    it("should add tracking ID", async () => {
      const decorator = new TrackingDecorator(mockNotification);
      const result = await decorator.send();

      expect(result.trackingId).toBeDefined();
      expect(result.trackingId).toContain("notif_");
      expect(result.duration).toBeDefined();
      expect(mockNotification.metadata.trackingId).toBeDefined();
    });
  });

  describe("RetryDecorator", () => {
    it("should succeed on first attempt", async () => {
      const decorator = new RetryDecorator(mockNotification, 3, 100);
      const result = await decorator.send();

      expect(result.success).toBe(true);
      expect(result.attempt).toBe(1);
      expect(result.retried).toBe(false);
      expect(mockNotification.send).toHaveBeenCalledTimes(1);
    });

    it("should retry on failure", async () => {
      mockNotification.send
        .mockResolvedValueOnce({ success: false, error: "Network error" })
        .mockResolvedValueOnce({ success: false, error: "Network error" })
        .mockResolvedValueOnce({ success: true, channel: "test" });

      const decorator = new RetryDecorator(mockNotification, 3, 10);
      const result = await decorator.send();

      expect(result.success).toBe(true);
      expect(result.attempt).toBe(3);
      expect(result.retried).toBe(true);
      expect(mockNotification.send).toHaveBeenCalledTimes(3);
    });

    it("should fail after max retries", async () => {
      mockNotification.send.mockResolvedValue({
        success: false,
        error: "Persistent error",
      });

      const decorator = new RetryDecorator(mockNotification, 2, 10);
      const result = await decorator.send();

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(2);
      expect(result.error).toContain("Failed after 2 attempts");
    });
  });

  describe("NotificationBuilder", () => {
    it("should chain multiple decorators", async () => {
      const builder = new NotificationBuilder(mockNotification)
        .withPriority("urgent")
        .withPersonalization("Jane")
        .withFormatting({ emoji: "🚀" })
        .withTracking();

      const enhanced = builder.build();
      const result = await enhanced.send();

      expect(mockNotification.message).toContain("🚨 URGENT:");
      expect(mockNotification.message).toContain("Hi Jane!");
      expect(mockNotification.message).toContain("🚀");
      expect(result.trackingId).toBeDefined();
    });

    it("should send directly from builder", async () => {
      const result = await new NotificationBuilder(mockNotification)
        .withPersonalization("Alice")
        .withTracking()
        .send();

      expect(result.trackingId).toBeDefined();
      expect(mockNotification.send).toHaveBeenCalled();
    });

    it("should apply decorators in correct order", async () => {
      const messages = [];
      mockNotification.send = vi.fn(async function() {
        messages.push(this.message);
        return { success: true };
      });

      await new NotificationBuilder(mockNotification)
        .withFormatting({ emoji: "🎯" })  // First: adds emoji
        .withPriority("high")              // Second: adds priority
        .withPersonalization("Bob")        // Third: adds personalization
        .send();

      const finalMessage = messages[0];
      // Should be: "Hi Bob! ⚠️ IMPORTANT: 🎯 Test message"
      expect(finalMessage).toContain("Hi Bob!");
      expect(finalMessage).toContain("⚠️ IMPORTANT:");
      expect(finalMessage).toContain("🎯");
    });
  });
});
