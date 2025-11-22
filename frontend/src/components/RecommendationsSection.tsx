import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { recommendationService, RecommendedProject } from "@/services/recommendationService";
import ProjectCard from "./ProjectCard";
import { Button } from "./ui/button";
import { Sparkles, TrendingUp, Users, History } from "lucide-react";

const RecommendationsSection = () => {
  const { user, isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<'interest' | 'trending' | 'collaborative' | 'past-pledge'>('interest');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadRecommendations();
    }
  }, [isAuthenticated, user, strategy]);

  const loadRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await recommendationService.getRecommendations(user.id, strategy, 8);
      setRecommendations(data);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null; // Don't show recommendations to non-logged-in users
  }

  const strategyConfig = {
    interest: { label: 'For You', icon: Sparkles, color: 'text-purple-500' },
    trending: { label: 'Trending', icon: TrendingUp, color: 'text-orange-500' },
    collaborative: { label: 'Similar Users', icon: Users, color: 'text-blue-500' },
    'past-pledge': { label: 'Like Your Backs', icon: History, color: 'text-green-500' },
  };

  const StrategyIcon = strategyConfig[strategy].icon;

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <StrategyIcon className={`w-8 h-8 ${strategyConfig[strategy].color}`} />
            <div>
              <h2 className="text-3xl font-bold">
                {strategyConfig[strategy].label}
              </h2>
              <p className="text-muted-foreground mt-1">
                Personalized project recommendations just for you
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {(Object.keys(strategyConfig) as Array<typeof strategy>).map((strat) => {
              const Icon = strategyConfig[strat].icon;
              return (
                <Button
                  key={strat}
                  variant={strategy === strat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStrategy(strat)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {strategyConfig[strat].label}
                </Button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                creator={project.user_id}
                description={project.tagline}
                image={project.image_url}
                category={project.category}
                fundingGoal={project.funding_goal}
                currentFunding={project.current_funding || 0}
                backers={0}
                daysLeft={Math.ceil((new Date(project.funding_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No recommendations yet</h3>
            <p className="text-muted-foreground mb-4">
              {strategy === 'interest' 
                ? "Set your interests to get personalized recommendations"
                : "Browse some projects to get better recommendations"}
            </p>
            <Button onClick={loadRecommendations}>Refresh</Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendationsSection;
