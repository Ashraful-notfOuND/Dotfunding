import { supabase } from "../config/supabaseClient.js";
import {
  RecommendationEngine,
  RecommendationStrategyFactory,
} from "../services/RecommendationStrategy.js";
import { observerManager } from "../services/ProjectObserver.js";
import { NotificationFactory } from "../services/NotificationFactory.js";
import { NotificationBuilder } from "../services/NotificationDecorator.js";

// Get personalized project recommendations
export const getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { strategy = "interest", limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Create recommendation engine with specified strategy
    const recommendationStrategy = RecommendationStrategyFactory.createStrategy(strategy);
    const engine = new RecommendationEngine(recommendationStrategy);

    // Get recommendations
    const recommendations = await engine.getRecommendations(userId, parseInt(limit));

    return res.status(200).json({
      success: true,
      strategy,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Get combined recommendations from multiple strategies
export const getCombinedRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Get recommendations from all strategies
    const strategies = ["interest", "trending", "collaborative", "past-pledge"];
    const allRecommendations = {};

    for (const strategyType of strategies) {
      try {
        const strategy = RecommendationStrategyFactory.createStrategy(strategyType);
        const engine = new RecommendationEngine(strategy);
        const recommendations = await engine.getRecommendations(userId, 5);
        allRecommendations[strategyType] = recommendations;
      } catch (error) {
        console.error(`Error with ${strategyType} strategy:`, error);
        allRecommendations[strategyType] = [];
      }
    }

    // Remove duplicates and combine
    const seen = new Set();
    const combined = [];

    for (const strategyType of strategies) {
      for (const project of allRecommendations[strategyType]) {
        if (!seen.has(project.id) && combined.length < limit) {
          seen.add(project.id);
          combined.push({
            ...project,
            recommendedBy: strategyType,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      count: combined.length,
      byStrategy: allRecommendations,
      combined,
    });
  } catch (error) {
    console.error("Get combined recommendations error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Subscribe to project updates
export const subscribeToProject = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const preferences = req.body;

    if (!projectId || !userId) {
      return res.status(400).json({ error: "projectId and userId are required" });
    }

    const result = await observerManager.subscribeUser(projectId, userId, preferences);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(201).json({
      success: true,
      message: "Successfully subscribed to project updates",
      subscription: result.subscription,
    });
  } catch (error) {
    console.error("Subscribe to project error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Unsubscribe from project updates
export const unsubscribeFromProject = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    if (!projectId || !userId) {
      return res.status(400).json({ error: "projectId and userId are required" });
    }

    const result = await observerManager.unsubscribeUser(projectId, userId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully unsubscribed from project updates",
    });
  } catch (error) {
    console.error("Unsubscribe from project error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Get user's subscriptions
export const getUserSubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const { data: subscriptions, error } = await supabase
      .from("project_subscriptions")
      .select("*, projects(*)")
      .eq("user_id", userId);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error("Get user subscriptions error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Add/Update user interests
export const updateUserInterests = async (req, res) => {
  try {
    const { userId } = req.params;
    const { categories } = req.body;

    if (!userId || !Array.isArray(categories)) {
      return res.status(400).json({ error: "userId and categories array are required" });
    }

    // Delete existing interests
    await supabase
      .from("user_interests")
      .delete()
      .eq("user_id", userId);

    // Insert new interests
    const interests = categories.map(category => ({
      user_id: userId,
      category,
    }));

    const { data, error } = await supabase
      .from("user_interests")
      .insert(interests)
      .select();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "User interests updated successfully",
      interests: data,
    });
  } catch (error) {
    console.error("Update user interests error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Get user interests
export const getUserInterests = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const { data: interests, error } = await supabase
      .from("user_interests")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      interests,
      categories: interests.map(i => i.category),
    });
  } catch (error) {
    console.error("Get user interests error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        notification_preferences: preferences,
      })
      .eq("id", userId)
      .select();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      preferences: data[0].notification_preferences,
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// COMPREHENSIVE PATTERN DEMONSTRATION ENDPOINT
// Demonstrates: Strategy + Factory + Decorator + Observer patterns working together
export const getPersonalizedRecommendationsWithNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sendNotifications = false, limit = 10, strategyType = "interest" } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // STRATEGY PATTERN: Use specified recommendation strategy
    const strategy = RecommendationStrategyFactory.createStrategy(strategyType);
    const engine = new RecommendationEngine(strategy);
    
    // Get recommendations
    const recommendations = await engine.getRecommendations(userId, parseInt(limit));

    // Log recommendations for analytics
    for (const project of recommendations) {
      try {
        await supabase.rpc('log_recommendation', {
          p_user_id: userId,
          p_project_id: project.id,
          p_strategy: strategyType,
          p_score: project.recommendationScore || 0,
        });
      } catch (logError) {
        console.error('Failed to log recommendation:', logError);
      }
    }

    // If sendNotifications is enabled, send personalized notifications
    if (sendNotifications === 'true' && recommendations.length > 0) {
      try {
        // Get user info and preferences
        const { data: user } = await supabase
          .from("users")
          .select("full_name, email, notification_preferences")
          .eq("id", userId)
          .single();

        if (user) {
          const prefs = user.notification_preferences || {};
          const channels = prefs.channels || ["in-app"];
          const recommendationsEnabled = prefs.recommendations?.enabled !== false;

          if (recommendationsEnabled) {
            // Pick top 3 recommendations to notify about
            const topRecommendations = recommendations.slice(0, 3);
            
            for (const project of topRecommendations) {
              const message = `We found a project you might like: ${project.title}`;
              const metadata = {
                projectId: project.id,
                projectTitle: project.title,
                projectDescription: project.tagline,
                projectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/project/${project.id}`,
                type: 'recommendation',
                strategy: strategyType,
                category: project.category,
                subject: `Project Recommendation: ${project.title}`,
              };

              // Send through all user's preferred channels
              for (const channel of channels) {
                try {
                  // FACTORY PATTERN: Create notification for specific channel
                  const notification = NotificationFactory.createNotification(
                    channel,
                    user,
                    message,
                    metadata
                  );

                  // DECORATOR PATTERN: Add personalization and formatting
                  const enhancedNotification = new NotificationBuilder(notification)
                    .withPersonalization(user.full_name || 'there')
                    .withFormatting({ emoji: '🎯' })
                    .withTracking()
                    .withRetry(2, 1500)
                    .build();

                  await enhancedNotification.send();
                  console.log(`Recommendation notification sent via ${channel} for project ${project.title}`);
                } catch (channelError) {
                  console.error(`Failed to send via ${channel}:`, channelError);
                }
              }
            }
          }
        }
      } catch (notificationError) {
        console.error('Failed to send recommendation notifications:', notificationError);
        // Don't fail the request if notifications fail
      }
    }

    return res.status(200).json({
      success: true,
      strategy: strategyType,
      count: recommendations.length,
      recommendations,
      notificationsSent: sendNotifications === 'true',
      patterns: {
        strategy: `Used ${strategyType} recommendation strategy`,
        factory: "Notification creation abstracted via Factory",
        decorator: "Notifications enhanced with personalization, tracking, retry",
        observer: "Users subscribed to interests are notified automatically"
      }
    });
  } catch (error) {
    console.error("Get personalized recommendations error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Trigger manual notification for matching projects (demonstrates Observer pattern)
export const notifyUsersAboutProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    // Get project details
    const { data: project, error } = await supabase
      .from("main_projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error || !project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // OBSERVER PATTERN: Notify all interested users
    const notifications = await observerManager.notifyInterestedUsers(project);

    return res.status(200).json({
      success: true,
      message: `Notified ${notifications.length} interested users`,
      project: project.title,
      notificationsSent: notifications.length,
      pattern: "Observer Pattern - Users interested in project category were notified"
    });
  } catch (error) {
    console.error("Notify users about project error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default {
  getRecommendations,
  getCombinedRecommendations,
  subscribeToProject,
  unsubscribeFromProject,
  getUserSubscriptions,
  updateUserInterests,
  getUserInterests,
  updateNotificationPreferences,
  getPersonalizedRecommendationsWithNotifications,
  notifyUsersAboutProject,
};
