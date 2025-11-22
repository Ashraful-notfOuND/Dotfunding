import { supabase } from "../config/supabaseClient.js";
import {
  RecommendationEngine,
  RecommendationStrategyFactory,
} from "../services/RecommendationStrategy.js";
import { observerManager } from "../services/ProjectObserver.js";

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

export default {
  getRecommendations,
  getCombinedRecommendations,
  subscribeToProject,
  unsubscribeFromProject,
  getUserSubscriptions,
  updateUserInterests,
  getUserInterests,
  updateNotificationPreferences,
};
