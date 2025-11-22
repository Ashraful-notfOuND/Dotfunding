import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  RecommendationEngine,
  RecommendationStrategyFactory,
  InterestBasedStrategy,
  TrendingStrategy,
  CollaborativeFilteringStrategy,
  PastPledgeStrategy,
} from "../src/services/RecommendationStrategy.js";

vi.mock("../src/config/supabaseClient.js", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
  },
}));

describe("Recommendation Strategy Pattern", () => {
  describe("RecommendationStrategyFactory", () => {
    it("should create InterestBasedStrategy", () => {
      const strategy = RecommendationStrategyFactory.createStrategy("interest");
      expect(strategy).toBeInstanceOf(InterestBasedStrategy);
    });

    it("should create TrendingStrategy", () => {
      const strategy = RecommendationStrategyFactory.createStrategy("trending");
      expect(strategy).toBeInstanceOf(TrendingStrategy);
    });

    it("should create CollaborativeFilteringStrategy", () => {
      const strategy = RecommendationStrategyFactory.createStrategy("collaborative");
      expect(strategy).toBeInstanceOf(CollaborativeFilteringStrategy);
    });

    it("should create PastPledgeStrategy", () => {
      const strategy = RecommendationStrategyFactory.createStrategy("past-pledge");
      expect(strategy).toBeInstanceOf(PastPledgeStrategy);
    });

    it("should throw error for unknown strategy", () => {
      expect(() => {
        RecommendationStrategyFactory.createStrategy("unknown");
      }).toThrow("Unknown recommendation strategy");
    });
  });

  describe("RecommendationEngine", () => {
    it("should use the set strategy", async () => {
      const mockStrategy = {
        recommend: vi.fn().mockResolvedValue([{ id: "1", title: "Test Project" }]),
      };

      const engine = new RecommendationEngine(mockStrategy);
      const results = await engine.getRecommendations("user-123", 10);

      expect(mockStrategy.recommend).toHaveBeenCalledWith("user-123", 10);
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("Test Project");
    });

    it("should allow changing strategy", async () => {
      const strategy1 = {
        recommend: vi.fn().mockResolvedValue([{ id: "1" }]),
      };
      const strategy2 = {
        recommend: vi.fn().mockResolvedValue([{ id: "2" }]),
      };

      const engine = new RecommendationEngine(strategy1);
      await engine.getRecommendations("user-123", 10);
      expect(strategy1.recommend).toHaveBeenCalled();

      engine.setStrategy(strategy2);
      await engine.getRecommendations("user-123", 10);
      expect(strategy2.recommend).toHaveBeenCalled();
    });

    it("should throw error if no strategy set", async () => {
      const engine = new RecommendationEngine(null);
      await expect(engine.getRecommendations("user-123")).rejects.toThrow(
        "Recommendation strategy not set"
      );
    });
  });

  describe("Strategy Implementations", () => {
    it("InterestBasedStrategy should handle empty interests", async () => {
      const strategy = new InterestBasedStrategy();
      const results = await strategy.recommend("user-123", 10);
      expect(Array.isArray(results)).toBe(true);
    });

    it("TrendingStrategy should return projects", async () => {
      const strategy = new TrendingStrategy();
      const results = await strategy.recommend("user-123", 10);
      expect(Array.isArray(results)).toBe(true);
    });

    it("CollaborativeFilteringStrategy should handle no pledges", async () => {
      const strategy = new CollaborativeFilteringStrategy();
      const results = await strategy.recommend("user-123", 10);
      expect(Array.isArray(results)).toBe(true);
    });

    it("PastPledgeStrategy should handle no backed projects", async () => {
      const strategy = new PastPledgeStrategy();
      const results = await strategy.recommend("user-123", 10);
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
