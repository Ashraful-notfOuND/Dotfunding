import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Confetti } from "@/components/ui/confetti";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Users, 
  DollarSign, 
  TrendingUp,
  ArrowRight,
  Loader2
} from "lucide-react";

interface ProjectData {
  id: string;
  title: string;
  fundingCurrent: number;
  fundingGoal: number;
  backers: number;
  fundingDeadline: string;
}

/**
 * DEMO PAGE 1: Full-Page Success Outcome
 * Purpose: Screenshot for presentation slides
 * Shows celebratory message after successful funding
 */
export default function ProjectSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState<ProjectData | null>(location.state?.project || null);
  const [loading, setLoading] = useState(!location.state?.project);

  useEffect(() => {
    console.log('ProjectSuccess - location.state:', location.state);
    console.log('ProjectSuccess - project:', project);
    
    // If project data wasn't passed via navigation state, fetch it
    if (!project && location.state?.projectId) {
      fetchProjectData(location.state.projectId);
    } else if (!project) {
      // No project data and no ID, redirect to home
      console.warn('No project data found, redirecting to home');
      navigate('/', { replace: true });
    } else {
      // Acknowledge the outcome when page loads
      acknowledgeOutcome(project.id);
    }
  }, []);

  const acknowledgeOutcome = async (projectId: string) => {
    try {
      // Get userId from localStorage (traditional login)
      const userId = localStorage.getItem('userId');
      
      await fetch(`http://localhost:5000/api/projects/${projectId}/acknowledge-outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      console.log('Outcome acknowledged for project:', projectId);
    } catch (error) {
      console.error('Error acknowledging outcome:', error);
    }
  };

  const fetchProjectData = async (projectId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch project');
      const data = await res.json();
      const fetchedProject = data.project || data;
      setProject(fetchedProject);
      // Acknowledge outcome after fetching
      acknowledgeOutcome(projectId);
    } catch (error) {
      console.error('Error fetching project:', error);
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) return null;

  const raisedAmount = project.fundingCurrent || 0;
  const goalAmount = project.fundingGoal || 1;
  const backersCount = project.backers || 0;
  const percentage = Math.round((raisedAmount / goalAmount) * 100);
  const endDate = new Date(project.fundingDeadline).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background flex items-center justify-center p-8">
      {/* Animated confetti effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="absolute top-10 right-1/4 w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="absolute top-5 left-1/2 w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <Card className="border-2 shadow-2xl">
          <CardContent className="pt-12 pb-12 px-8 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 rounded-full animate-pulse" />
                <CheckCircle2 className="h-24 w-24 text-green-600 relative z-10" />
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-primary bg-clip-text text-transparent">
              Congratulations! 🎉
            </h1>
            <p className="text-2xl font-semibold text-foreground mb-3">
              Your project was successfully funded!
            </p>
            
            {/* Supporting Message */}
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Your vision resonated with the community. You've turned an idea into reality 
              with the support of amazing backers who believe in what you're building.
            </p>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
              {/* Total Raised */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Total Raised</p>
                </div>
                <p className="text-4xl font-bold text-green-900 dark:text-green-100">৳{raisedAmount.toLocaleString()}</p>
              </div>

              {/* Backers */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Backers</p>
                </div>
                <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">{backersCount}</p>
              </div>

              {/* Funding Percentage */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Funded</p>
                </div>
                <p className="text-4xl font-bold text-purple-900 dark:text-purple-100">{percentage}%</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col items-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate(`/demo/payment-breakdown`, { state: { project } })}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-white px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                View Payment Breakdown
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <p className="text-sm text-muted-foreground">
                See detailed fee breakdown and payout information
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Project: <span className="font-semibold">{project.title}</span> • 
            Campaign ended: {endDate}
          </p>
        </div>
      </div>
    </div>
  );
}
