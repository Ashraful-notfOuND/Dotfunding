import { describe, it, expect, vi } from "vitest";
import {
  NotificationFactory,
  InAppNotification,
  EmailNotification,
  SMSNotification,
  PushNotification,
} from "../src/services/NotificationFactory.js";

vi.mock("../src/config/supabaseClient.js");
vi.mock("nodemailer");

describe("Notification Factory Pattern", () => {
  const mockRecipient = {
    id: "user-123",
    email: "test@example.com",
    phone: "+1234567890",
  };

  const mockMessage = "You have a new recommendation!";
  const mockMetadata = {
    projectId: "project-456",
    type: "recommendation",
  };

  describe("NotificationFactory", () => {
    it("should create InAppNotification", () => {
      const notification = NotificationFactory.createNotification(
        "in-app",
        mockRecipient,
        mockMessage,
        mockMetadata
      );
      expect(notification).toBeInstanceOf(InAppNotification);
    });

    it("should create EmailNotification", () => {
      const notification = NotificationFactory.createNotification(
        "email",
        mockRecipient,
        mockMessage,
        mockMetadata
      );
      expect(notification).toBeInstanceOf(EmailNotification);
    });

    it("should create SMSNotification", () => {
      const notification = NotificationFactory.createNotification(
        "sms",
        mockRecipient,
        mockMessage,
        mockMetadata
      );
      expect(notification).toBeInstanceOf(SMSNotification);
    });

    it("should create PushNotification", () => {
      const notification = NotificationFactory.createNotification(
        "push",
        mockRecipient,
        mockMessage,
        mockMetadata
      );
      expect(notification).toBeInstanceOf(PushNotification);
    });

    it("should throw error for unknown channel", () => {
      expect(() => {
        NotificationFactory.createNotification(
          "unknown",
          mockRecipient,
          mockMessage
        );
      }).toThrow("Unknown notification channel");
    });

    it("should create multi-channel notifications", () => {
      const channels = ["in-app", "email", "sms"];
      const notifications = NotificationFactory.createMultiChannel(
        channels,
        mockRecipient,
        mockMessage,
        mockMetadata
      );

      expect(notifications).toHaveLength(3);
      expect(notifications[0]).toBeInstanceOf(InAppNotification);
      expect(notifications[1]).toBeInstanceOf(EmailNotification);
      expect(notifications[2]).toBeInstanceOf(SMSNotification);
    });
  });

  describe("Notification Base Class", () => {
    it("should store recipient, message, and metadata", () => {
      const notification = NotificationFactory.createNotification(
        "in-app",
        mockRecipient,
        mockMessage,
        mockMetadata
      );

      expect(notification.recipient).toEqual(mockRecipient);
      expect(notification.message).toBe(mockMessage);
      expect(notification.metadata).toEqual(mockMetadata);
      expect(notification.timestamp).toBeInstanceOf(Date);
    });
  });

  describe("EmailNotification", () => {
    it("should format HTML email correctly", () => {
      const notification = new EmailNotification(
        mockRecipient,
        mockMessage,
        {
          projectTitle: "Test Project",
          projectDescription: "A great project",
          projectUrl: "https://example.com/project/123",
        }
      );

      const html = notification.formatEmailHTML();
      expect(html).toContain("DotFunding Recommendation");
      expect(html).toContain(mockMessage);
      expect(html).toContain("Test Project");
      expect(html).toContain("View Project");
    });
  });
});
