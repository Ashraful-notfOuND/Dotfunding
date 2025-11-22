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
      // Get user interests
      const { data: userInterests } = await supabase
        .from("user_interests")
        .select("category")
        .eq("user_id", userId);

      if (!userInterests || userInterests.length === 0) {
        return [];
      }

      const categories = userInterests.map(i => i.category);

      // Get projects from categories that similar users liked
      const { data: projects, error } = await this.supabase
        .from("main_projects")
        .select("*")
        .gte("created_at", oneWeekAgo.toISOString())
        .in("category", popularCategories)

      return projects || [];
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
      // Get projects with most pledges in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: trendingProjects } = await supabase
        .from("projects")
        .select(`
          *,
          pledges!inner(amount, created_at)
        `)
        .gte("pledges.created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(limit);

      // Calculate trending score based on pledge count and recency
      const projectsWithScore = (trendingProjects || []).map(project => {
        const pledgeCount = project.pledges?.length || 0;
        const daysSinceCreated = Math.max(1, 
          (Date.now() - new Date(project.created_at)) / (1000 * 60 * 60 * 24)
        );
        const trendingScore = pledgeCount / daysSinceCreated;
        return { ...project, trendingScore };
      });

      return projectsWithScore
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, limit);
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
        .slice(0, 5)
        .map(([userId]) => userId);

      // Get projects backed by similar users that current user hasn't backed
      const { data: recommendations } = await supabase
        .from("pledges")
        .select("project_id, projects(*)")
        .in("user_id", similarUsers)
        .not("project_id", "in", `(${backedProjectIds.join(",")})`)
        .limit(limit);

      return recommendations?.map(r => r.projects).filter(Boolean) || [];
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
