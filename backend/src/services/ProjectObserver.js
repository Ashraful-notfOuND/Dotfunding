/**
 * Observer Pattern for Project Subscriptions
 * Manages subscribers and notifies them of project events
 */

import { supabase } from "../config/supabaseClient.js";
import { NotificationFactory } from "./NotificationFactory.js";
import { NotificationBuilder } from "./NotificationDecorator.js";

// Subject: Manages observers and notifies them
class ProjectSubject {
  constructor(projectId) {
    this.projectId = projectId;
    this.observers = [];
  }

  // Subscribe a user to project updates
  async subscribe(userId, preferences = {}) {
    try {
      const { data, error } = await supabase
        .from("project_subscriptions")
        .insert([{
          project_id: this.projectId,
          user_id: userId,
          notify_on_update: preferences.onUpdate !== false,
          notify_on_milestone: preferences.onMilestone !== false,
          notify_on_comment: preferences.onComment !== false,
          channels: preferences.channels || ["in-app"],
        }])
        .select();

      if (error) throw error;

      this.observers.push({ userId, preferences });
      return { success: true, subscription: data[0] };
    } catch (error) {
      console.error("Subscribe error:", error);
      return { success: false, error: error.message };
    }
  }

  // Unsubscribe a user
  async unsubscribe(userId) {
    try {
      const { error } = await supabase
        .from("project_subscriptions")
        .delete()
        .eq("project_id", this.projectId)
        .eq("user_id", userId);

      if (error) throw error;

      this.observers = this.observers.filter(obs => obs.userId !== userId);
      return { success: true };
    } catch (error) {
      console.error("Unsubscribe error:", error);
      return { success: false, error: error.message };
    }
  }

  // Load observers from database
  async loadObservers() {
    try {
      const { data, error } = await supabase
        .from("project_subscriptions")
        .select("*, users(id, full_name, email)")
        .eq("project_id", this.projectId);

      if (error) throw error;

      this.observers = data.map(sub => ({
        userId: sub.user_id,
        user: sub.users,
        preferences: {
          onUpdate: sub.notify_on_update,
          onMilestone: sub.notify_on_milestone,
          onComment: sub.notify_on_comment,
          channels: sub.channels || ["in-app"],
        },
      }));

      return this.observers;
    } catch (error) {
      console.error("Load observers error:", error);
      return [];
    }
  }

  // Notify all observers
  async notify(eventType, eventData) {
    await this.loadObservers();

    const notifications = [];

    for (const observer of this.observers) {
      // Check if user wants this type of notification
      const shouldNotify = this.shouldNotifyObserver(observer, eventType);
      
      if (!shouldNotify) continue;

      const message = this.createMessage(eventType, eventData, observer);
      const channels = observer.preferences.channels || ["in-app"];

      // Send notification through preferred channels
      for (const channel of channels) {
        try {
          const notification = NotificationFactory.createNotification(
            channel,
            observer.user,
            message,
            {
              projectId: this.projectId,
              type: eventType,
              ...eventData,
            }
          );

          // Add decorators
          const enhancedNotification = new NotificationBuilder(notification)
            .withPersonalization(observer.user.full_name)
            .withTracking()
            .withRetry(2, 2000)
            .build();

          const result = await enhancedNotification.send();
          notifications.push(result);
        } catch (error) {
          console.error(`Failed to notify ${observer.userId} via ${channel}:`, error);
        }
      }
    }

    return notifications;
  }

  // Check if observer should be notified for this event type
  shouldNotifyObserver(observer, eventType) {
    const prefs = observer.preferences;
    
    switch (eventType) {
      case "project_update":
        return prefs.onUpdate;
      case "milestone_reached":
        return prefs.onMilestone;
      case "new_comment":
        return prefs.onComment;
      default:
        return true;
    }
  }

  // Create appropriate message for event type
  createMessage(eventType, eventData, observer) {
    const projectTitle = eventData.projectTitle || "A project you follow";
    
    switch (eventType) {
      case "project_update":
        return `${projectTitle} has been updated: ${eventData.updateDescription}`;
      
      case "milestone_reached":
        return `${projectTitle} reached ${eventData.percentage}% of its funding goal!`;
      
      case "new_donation":
        return `${eventData.donorName} pledged $${eventData.amount} to ${projectTitle}${eventData.rewardTitle ? ` for ${eventData.rewardTitle}` : ''}!`;
      
      case "new_comment":
        return `New comment on ${projectTitle}`;
      
      case "project_created":
        return `New project in ${eventData.category}: ${projectTitle}`;
      
      case "funding_complete":
        return `${projectTitle} has been successfully funded!`;
      
      default:
        return `Update on ${projectTitle}`;
    }
  }
}

// Observer Manager: Centralized management of all project subscriptions
class ObserverManager {
  constructor() {
    this.subjects = new Map();
  }

  getSubject(projectId) {
    if (!this.subjects.has(projectId)) {
      this.subjects.set(projectId, new ProjectSubject(projectId));
    }
    return this.subjects.get(projectId);
  }

  async subscribeUser(projectId, userId, preferences) {
    const subject = this.getSubject(projectId);
    return await subject.subscribe(userId, preferences);
  }

  async unsubscribeUser(projectId, userId) {
    const subject = this.getSubject(projectId);
    return await subject.unsubscribe(userId);
  }

  async notifyProjectEvent(projectId, eventType, eventData) {
    const subject = this.getSubject(projectId);
    return await subject.notify(eventType, eventData);
  }

  // Notify users based on their interests when a new project is created
  async notifyInterestedUsers(project) {
    try {
      // Get users interested in this project's category
      const { data: interestedUsers, error } = await supabase
        .from("user_interests")
        .select("user_id, users(id, full_name, email, notification_preferences)")
        .eq("category", project.category);

      if (error) throw error;

      const notifications = [];

      for (const { user_id, users } of interestedUsers) {
        const preferences = users.notification_preferences || {};
        const channels = preferences.channels || ["in-app"];

        const message = `New project in ${project.category}: ${project.title}`;

        for (const channel of channels) {
          try {
            const notification = NotificationFactory.createNotification(
              channel,
              users,
              message,
              {
                projectId: project.id,
                projectTitle: project.title,
                projectDescription: project.tagline,
                projectUrl: `${process.env.FRONTEND_URL}/project/${project.id}`,
                type: "interest_match",
                category: project.category,
              }
            );

            const enhancedNotification = new NotificationBuilder(notification)
              .withPersonalization(users.full_name)
              .withFormatting({ emoji: "🎯" })
              .withTracking()
              .build();

            const result = await enhancedNotification.send();
            notifications.push(result);
          } catch (error) {
            console.error(`Failed to notify user ${user_id}:`, error);
          }
        }
      }

      return notifications;
    } catch (error) {
      console.error("Notify interested users error:", error);
      return [];
    }
  }
}

// Singleton instance
const observerManager = new ObserverManager();

export { ProjectSubject, ObserverManager, observerManager };
