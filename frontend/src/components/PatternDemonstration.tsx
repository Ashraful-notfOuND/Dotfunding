import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  History, 
  Bell, 
  BellOff,
  CheckCircle2,
  Loader2,
  Eye,
  Heart,
  Info
} from "lucide-react";
import ProjectCard from "./ProjectCard";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  tagline: string;
  image_url: string;
  category: string;
  funding_goal: number;
  current_funding?: number;
  user_id: string;
  recommendedBy?: string;
  recommendationScore?: number;
}

interface PatternDemoProps {
  userId?: string;
}

/**
 * COMPREHENSIVE DESIGN PATTERN DEMONSTRATION COMPONENT
 * 
 * This component demonstrates all 4 design patterns:
 * - Strategy Pattern: Different recommendation algorithms (interest-based, trending, collaborative, past-pledge)
 * - Factory Pattern: Multi-channel notifications (in-app, email, SMS, push)
 * - Decorator Pattern: Enhanced notifications with personalization, priority, tracking, retry
 * - Observer Pattern: Subscribe to projects and interests to receive automatic notifications
 */
const PatternDemonstration = ({ userId: propUserId }: PatternDemoProps) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const userId = propUserId || user?.id;

  // State
  const [recommendations, setRecommendations] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<'interest' | 'trending' | 'collaborative' | 'past-pledge'>('interest');
  const [interests, setInterests] = useState<string[]>([]);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState({
    channels: ['in-app'],
    recommendations: { enabled: true, frequency: 'daily' }
  });

  // STRATEGY PATTERN: Different recommendation strategies
  const strategies = {
    interest: {
      label: 'Interest-Based',
      icon: Sparkles,
      color: 'text-purple-500',
      description: 'Projects matching your interests',
      pattern: 'Strategy Pattern'
    },
    trending: {
      label: 'Trending',
      icon: TrendingUp,
      color: 'text-orange-500',
      description: 'Popular projects gaining momentum',
      pattern: 'Strategy Pattern'
    },
    collaborative: {
      label: 'Collaborative Filtering',
      icon: Users,
      color: 'text-blue-500',
      description: 'Based on similar users',
      pattern: 'Strategy Pattern'
    },
    'past-pledge': {
      label: 'Past Pledges',
      icon: History,
      color: 'text-green-500',
      description: 'Similar to projects you backed',
      pattern: 'Strategy Pattern'
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadRecommendations();
    }
  }, [userId, strategy]);

  const loadUserData = async () => {
    try {
      // Load user interests
      const interestsRes = await fetch(`http://localhost:5000/api/recommendations/interests/${userId}`);
      if (interestsRes.ok) {
        const data = await interestsRes.json();
        setInterests(data.categories || []);
      }

      // Load subscriptions
      const subsRes = await fetch(`http://localhost:5000/api/recommendations/subscriptions/user/${userId}`);
      if (subsRes.ok) {
        const data = await subsRes.json();
        setSubscriptions(data.subscriptions?.map((s: any) => s.project_id) || []);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  // STRATEGY PATTERN: Load recommendations using selected strategy
  const loadRecommendations = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/recommendations/recommendations/${userId}?strategy=${strategy}&limit=8`
      );
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // COMPREHENSIVE PATTERN DEMONSTRATION: Get recommendations with notifications
  const loadPersonalizedWithNotifications = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/recommendations/recommendations/${userId}/personalized?strategy=${strategy}&sendNotifications=true&limit=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        
        if (data.notificationsSent) {
          toast({
            title: "Notifications Sent! 🎉",
            description: (
              <div className="mt-2 space-y-2">
                <p>Recommendations loaded using all design patterns:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li><strong>Strategy:</strong> {data.patterns.strategy}</li>
                  <li><strong>Factory:</strong> {data.patterns.factory}</li>
                  <li><strong>Decorator:</strong> {data.patterns.decorator}</li>
                  <li><strong>Observer:</strong> {data.patterns.observer}</li>
                </ul>
              </div>
            ),
          });
        }
      }
    } catch (error) {
      console.error('Failed to load personalized recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  // OBSERVER PATTERN: Subscribe to project
  const toggleSubscription = async (projectId: string) => {
    if (!userId) return;

    try {
      const isSubscribed = subscriptions.includes(projectId);
      const method = isSubscribed ? 'DELETE' : 'POST';
      
      const response = await fetch(
        `http://localhost:5000/api/recommendations/subscriptions/${projectId}/${userId}`,
        { method }
      );

      if (response.ok) {
        if (isSubscribed) {
          setSubscriptions(subscriptions.filter(id => id !== projectId));
          toast({
            title: "Unsubscribed",
            description: "You won't receive updates about this project"
          });
        } else {
          setSubscriptions([...subscriptions, projectId]);
          toast({
            title: "Subscribed! 🔔",
            description: "You'll receive notifications about this project (Observer Pattern)"
          });
        }
      }
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
    }
  };

  // Update user interests
  const updateInterests = async (newInterests: string[]) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/recommendations/interests/${userId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories: newInterests })
        }
      );

      if (response.ok) {
        setInterests(newInterests);
        toast({
          title: "Interests Updated",
          description: "Your recommendations will be updated based on new interests"
        });
        loadRecommendations();
      }
    } catch (error) {
      console.error('Failed to update interests:', error);
    }
  };

  const StrategyIcon = strategies[strategy].icon;

  if (!isAuthenticated || !userId) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Design Pattern Demonstration</CardTitle>
          <CardDescription>
            Please log in to see personalized recommendations using all 4 design patterns
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Pattern Information Banner */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Design Patterns in Action:</strong> This section demonstrates Observer, Strategy, Factory, and Decorator patterns
          working together to provide personalized recommendations and smart notifications.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="interests">Interests</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Demo</TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          {/* Strategy Selector */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <StrategyIcon className={`w-6 h-6 ${strategies[strategy].color}`} />
                <div>
                  <CardTitle>{strategies[strategy].label}</CardTitle>
                  <CardDescription>{strategies[strategy].description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(strategies) as Array<typeof strategy>).map((strat) => {
                  const Icon = strategies[strat].icon;
                  return (
                    <Button
                      key={strat}
                      variant={strategy === strat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStrategy(strat)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {strategies[strat].label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={loadRecommendations} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                Load Recommendations
              </Button>
              <Button onClick={loadPersonalizedWithNotifications} disabled={loading} variant="secondary">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
                Load with Notifications
              </Button>
            </CardFooter>
          </Card>

          {/* Recommendations Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={project.image_url} 
                      alt={project.title}
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      size="icon"
                      variant={subscriptions.includes(project.id) ? "default" : "secondary"}
                      className="absolute top-2 right-2"
                      onClick={() => toggleSubscription(project.id)}
                    >
                      {subscriptions.includes(project.id) ? (
                        <Bell className="w-4 h-4" />
                      ) : (
                        <BellOff className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <CardHeader>
                    <Badge className="w-fit mb-2">{project.category}</Badge>
                    <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{project.tagline}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-2">
                    {project.recommendationScore && (
                      <div className="text-sm text-muted-foreground">
                        Match Score: {project.recommendationScore.toFixed(1)}
                      </div>
                    )}
                    <Button className="w-full" onClick={() => window.location.href = `/project/${project.id}`}>
                      View Project
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No recommendations found. Try a different strategy or add interests.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Interests Tab */}
        <TabsContent value="interests">
          <Card>
            <CardHeader>
              <CardTitle>Your Interests</CardTitle>
              <CardDescription>
                Select categories you're interested in to improve recommendations (Strategy Pattern - Interest-Based)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Technology', 'Art', 'Music', 'Film', 'Games', 'Food', 'Fashion', 'Design', 'Photography', 'Publishing'].map(category => (
                  <Badge
                    key={category}
                    variant={interests.includes(category) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (interests.includes(category)) {
                        updateInterests(interests.filter(i => i !== category));
                      } else {
                        updateInterests([...interests, category]);
                      }
                    }}
                  >
                    {interests.includes(category) && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pattern Demonstration Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Design Patterns Implementation</CardTitle>
              <CardDescription>
                This feature demonstrates all 4 design patterns working together
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Observer Pattern */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Observer Pattern</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Subscribe to projects to automatically receive notifications when they're updated or reach milestones.
                </p>
                <Badge variant="outline">Subscribed to {subscriptions.length} projects</Badge>
              </div>

              {/* Strategy Pattern */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold">Strategy Pattern</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Switch between different recommendation algorithms: Interest-based, Trending, Collaborative Filtering, and Past Pledge-based.
                </p>
                <Badge variant="outline">Current: {strategies[strategy].label}</Badge>
              </div>

              {/* Factory Pattern */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold">Factory Pattern</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Notifications are created through a factory that supports multiple channels: In-App, Email, SMS, and Push notifications.
                </p>
                <div className="flex gap-2">
                  {notificationPrefs.channels.map(channel => (
                    <Badge key={channel} variant="outline">{channel}</Badge>
                  ))}
                </div>
              </div>

              {/* Decorator Pattern */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold">Decorator Pattern</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Notifications are enhanced with dynamic features: Personalization, Priority levels, Tracking IDs, and Automatic retry logic.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Personalized</Badge>
                  <Badge variant="outline">Tracked</Badge>
                  <Badge variant="outline">Auto-Retry</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatternDemonstration;
