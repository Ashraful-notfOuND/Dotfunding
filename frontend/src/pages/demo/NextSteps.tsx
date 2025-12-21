import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2,
  MessageSquare, 
  Calendar, 
  Bell, 
  BarChart3,
  PackageCheck,
  ArrowRight,
  Lightbulb
} from "lucide-react";

/**
 * DEMO PAGE 3: What Happens Next
 * Purpose: Screenshot for presentation slides
 * Guides creator through post-funding responsibilities
 */
export default function NextSteps() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Prepare Updates for Backers",
      description: "Keep your community informed with regular progress updates. Transparency builds trust and keeps backers engaged.",
      status: "pending",
      priority: "high"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Finalize Delivery Timeline",
      description: "Set realistic delivery dates for each reward tier. Your backers are waiting to hear when they'll receive their rewards.",
      status: "pending",
      priority: "high"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Respond to Backer Messages",
      description: "Answer questions and address concerns promptly. Active communication shows you value your supporters.",
      status: "pending",
      priority: "medium"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Track Project Health",
      description: "Use the Creator Analytics dashboard to monitor engagement, track milestones, and stay on top of your project's progress.",
      status: "pending",
      priority: "medium"
    },
    {
      icon: <PackageCheck className="h-6 w-6" />,
      title: "Plan Fulfillment & Production",
      description: "Start coordinating with manufacturers and suppliers. Ensure you have everything needed to deliver on your promises.",
      status: "pending",
      priority: "low"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Lightbulb className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">What Happens Next?</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Congratulations on your successful campaign! Now it's time to deliver on your promises. 
            Here's your roadmap to success.
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              Your Responsibility Checklist
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Complete these steps to ensure a smooth project delivery and maintain backer trust
            </p>
          </CardHeader>
          
          <CardContent className="pt-6 pb-8">
            {/* Steps List */}
            <div className="space-y-4 mb-8">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className="group hover:bg-muted/50 rounded-lg p-5 border-2 border-border hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
                      <div className="text-primary">
                        {step.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`${getPriorityColor(step.priority)} flex-shrink-0 text-xs`}
                        >
                          {step.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Checkbox */}
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-5 mb-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Creator Analytics Dashboard
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Access real-time insights, track backer engagement, monitor project health, 
                    and manage all communications from your centralized creator dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Motivation Box */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-5 mb-6 border border-green-200 dark:border-green-800">
              <p className="text-center text-sm">
                <span className="font-semibold text-green-900 dark:text-green-100">
                  💪 The journey continues:
                </span>
                <span className="text-green-800 dark:text-green-200">
                  {" "}Your backers believed in your vision. Now it's time to bring it to life 
                  and exceed their expectations. You've got this!
                </span>
              </p>
            </div>

            {/* CTA */}
            <Button 
              size="lg" 
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-white font-semibold text-lg py-6"
            >
              Continue
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Need help getting started? Check out our{" "}
            <span className="text-primary font-medium cursor-pointer hover:underline">Creator Guide</span>
            {" "}or{" "}
            <span className="text-primary font-medium cursor-pointer hover:underline">contact support</span>
          </p>
        </div>
      </div>
    </div>
  );
}
