/**
 * Strategy Pattern for Project Recommendations
 * Allows different recommendation algorithms to be used interchangeably
 */

import { supabase } from "../config/supabaseClient.js";

// Abstract Strategy
class RecommendationStrategy {
  async recommend(userId, limit = 10) {
    throw new Error("recommend() must be implemented by subclass");
  }
}

// Concrete Strategy 1: Interest-Based Recommendations
class InterestBasedStrategy extends RecommendationStrategy {
  async recommend(userId, limit = 10) {
    try {
      // Get user interests with weights
      const { data: userInterests } = await supabase
        .from("user_interests")
        .select("category, weight")
        .eq("user_id", userId)
        .order("weight", { ascending: false });

      if (!userInterests || userInterests.length === 0) {
        console.log("No user interests found, returning empty array");
        return [];
      }

      const categories = userInterests.map(i => i.category);

      // Get projects from user's interested categories
      const { data: projects, error } = await supabase
        .from("main_projects")
        .select("*")
        .in("category", categories)
        .neq("user_id", userId) // Don't recommend user's own projects
        .order("created_at", { ascending: false })
        .limit(limit * 2); // Get more to filter

      if (error) {
        console.error("Query error:", error);
        return [];
      }

      if (!projects || projects.length === 0) {
        return [];
      }

      // Score projects based on category weight
      const scoredProjects = projects.map(project => {
        const interest = userInterests.find(i => i.category === project.category);
        const score = interest ? interest.weight : 1;
        return { ...project, recommendationScore: score };
      });

      // Sort by score and return top results
      return scoredProjects
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);
    } catch (error) {
      console.error("InterestBasedStrategy error:", error);
      return [];
    }
  }
}

// Concrete Strategy 2: Trending Projects
class TrendingStrategy extends RecommendationStrategy {
  async recommend(userId, limit = 10) {
    try {
      // Get trending projects based on trending_score
      const { data: trendingProjects, error } = await supabase
        .from("main_projects")
        .select("*")
        .neq("user_id", userId) // Don't recommend user's own projects
        .order("trending_score", { ascending: false })
        .order("view_count", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Trending query error:", error);
        return [];
      }

      return trendingProjects || [];
    } catch (error) {
      console.error("TrendingStrategy error:", error);
      return [];
    }
  }
}

// Concrete Strategy 3: Collaborative Filtering (Similar Users)
class CollaborativeFilteringStrategy extends RecommendationStrategy {
  async recommend(userId, limit = 10) {
    try {
      // Get projects the user has backed
      const { data: userPledges } = await supabase
        .from("pledges")
        .select("project_id")
        .eq("user_id", userId);

      if (!userPledges || userPledges.length === 0) {
        console.log("No user pledges found for collaborative filtering");
        return [];
      }

      const backedProjectIds = userPledges.map(p => p.project_id);

      // Find other users who backed the same projects
      const { data: similarUserPledges } = await supabase
        .from("pledges")
        .select("user_id, project_id")
        .in("project_id", backedProjectIds)
        .neq("user_id", userId);

      if (!similarUserPledges || similarUserPledges.length === 0) {
        return [];
      }

      // Count how many common projects each user has
      const userSimilarity = {};
      similarUserPledges.forEach(pledge => {
        userSimilarity[pledge.user_id] = (userSimilarity[pledge.user_id] || 0) + 1;
      });

      // Get top similar users
      const similarUsers = Object.entries(userSimilarity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([userId]) => userId);

      if (similarUsers.length === 0) {
        return [];
      }

      // Get projects backed by similar users that current user hasn't backed
      const { data: similarPledges } = await supabase
        .from("pledges")
        .select("project_id")
        .in("user_id", similarUsers)
        .not("project_id", "in", `(${backedProjectIds.join(",")})`);

      if (!similarPledges || similarPledges.length === 0) {
        return [];
      }

      // Count occurrences (popularity among similar users)
      const projectCounts = {};
      similarPledges.forEach(p => {
        projectCounts[p.project_id] = (projectCounts[p.project_id] || 0) + 1;
      });

      // Get top recommended project IDs
      const topProjectIds = Object.entries(projectCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([projectId]) => projectId);

      // Fetch full project details
      const { data: recommendations } = await supabase
        .from("main_projects")
        .select("*")
        .in("id", topProjectIds)
        .limit(limit);

      return recommendations || [];
    } catch (error) {
      console.error("CollaborativeFilteringStrategy error:", error);
      return [];
    }
  }
}

// Concrete Strategy 4: Past Pledge Based (Similar Projects)
class PastPledgeStrategy extends RecommendationStrategy {
  async recommend(userId, limit = 10) {
    try {
      // Get user's backed projects with categories
      const { data: backedProjects } = await supabase
        .from("pledges")
        .select("projects(id, category)")
        .eq("user_id", userId);

      if (!backedProjects || backedProjects.length === 0) {
        return [];
      }

      const backedCategories = [...new Set(
        backedProjects.map(p => p.projects?.category).filter(Boolean)
      )];
      const backedProjectIds = backedProjects.map(p => p.projects?.id).filter(Boolean);

      // Get similar projects in same categories
      const { data: similarProjects } = await supabase
        .from("main_projects")
        .select("*")
        .in("category", backedCategories)
        .not("id", "in", `(${backedProjectIds.join(",")})`)
        .order("created_at", { ascending: false })
        .limit(limit);

      return similarProjects || [];
    } catch (error) {
      console.error("PastPledgeStrategy error:", error);
      return [];
    }
  }
}

// Context Class - Uses a strategy
class RecommendationEngine {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async getRecommendations(userId, limit = 10) {
    if (!this.strategy) {
      throw new Error("Recommendation strategy not set");
    }
    return await this.strategy.recommend(userId, limit);
  }
}

// Factory to create strategies
class RecommendationStrategyFactory {
  static createStrategy(type) {
    switch (type.toLowerCase()) {
      case "interest":
      case "interest-based":
        return new InterestBasedStrategy();
      case "trending":
        return new TrendingStrategy();
      case "collaborative":
      case "similar-users":
        return new CollaborativeFilteringStrategy();
      case "past-pledge":
      case "similar-projects":
        return new PastPledgeStrategy();
      default:
        throw new Error(`Unknown recommendation strategy: ${type}`);
    }
  }
}

export {
  RecommendationStrategy,
  InterestBasedStrategy,
  TrendingStrategy,
  CollaborativeFilteringStrategy,
  PastPledgeStrategy,
  RecommendationEngine,
  RecommendationStrategyFactory,
};
