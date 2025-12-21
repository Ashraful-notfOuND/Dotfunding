import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  RefreshCw,
  Edit3,
  Target,
  MessageSquare,
  Save,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";

/**
 * PAGE 3: Next Steps for Unsuccessful Campaign
 * Purpose: Forward-looking, constructive options
 * Tone: Encouraging, empowering, learning-focused
 */
export default function CampaignNextSteps() {
  const navigate = useNavigate();

  const options = [
    {
      icon: <RefreshCw className="h-6 w-6" />,
      title: "Relaunch Your Campaign",
      description: "Start fresh with what you've learned. Many creators find success on their second or third attempt.",
      action: "Relaunch Project",
      recommended: true
    },
    {
      icon: <Edit3 className="h-6 w-6" />,
      title: "Improve Your Story",
      description: "Refine your project description, add better images, or create a compelling video to connect with backers.",
      action: "Edit Campaign",
      recommended: false
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Adjust Your Goal",
      description: "Consider a smaller funding target or a longer timeline. Sometimes breaking it into phases works better.",
      action: "Modify Goal",
      recommended: false
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Gather Backer Feedback",
      description: "Reach out to your 7 backers and visitors. Their insights can help you understand what resonated—and what didn't.",
      action: "View Responses",
      recommended: false
    },
    {
      icon: <Save className="h-6 w-6" />,
      title: "Save as Draft",
      description: "Not ready to decide? Save your project and come back when you're ready to make changes or relaunch.",
      action: "Save Draft",
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">What You Can Do Next</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            This isn't the end—it's a chance to learn, adjust, and try again. 
            Here are your options moving forward.
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-2 mb-6">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
            <CardTitle className="text-2xl">Your Options</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Choose the path that feels right for you and your project
            </p>
          </CardHeader>
          
          <CardContent className="pt-6 pb-8">
            {/* Options List */}
            <div className="space-y-4 mb-8">
              {options.map((option, index) => (
                <div 
                  key={index}
                  className={`group hover:bg-muted/50 rounded-lg p-6 border-2 transition-all cursor-pointer ${
                    option.recommended 
                      ? 'border-primary/40 bg-primary/5 hover:bg-primary/10' 
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-lg flex-shrink-0 transition-colors ${
                      option.recommended 
                        ? 'bg-primary text-white' 
                        : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                    }`}>
                      {option.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {option.title}
                        </h3>
                        {option.recommended && (
                          <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0">
                            <CheckCircle2 className="h-3 w-3" />
                            Recommended
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {option.description}
                      </p>
                      <Button 
                        variant={option.recommended ? "default" : "outline"}
                        size="sm"
                        className={option.recommended ? "bg-primary hover:bg-primary-hover" : ""}
                      >
                        {option.action}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Encouragement Box */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-6 mb-6 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 p-3 rounded-lg flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 text-lg">
                    Learning is part of the process
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    Every creator's journey is different. Some find success immediately, while others 
                    refine their approach over time. The 7 people who backed you believed in your idea—build 
                    on that momentum. Your next campaign can benefit from everything you learned this time.
                  </p>
                </div>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-white font-semibold"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Relaunch Project
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/')}
                className="font-semibold"
              >
                Go to Creator Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need guidance? Check out our{" "}
            <span className="text-primary font-medium cursor-pointer hover:underline">
              Relaunch Guide
            </span>
            {" "}or{" "}
            <span className="text-primary font-medium cursor-pointer hover:underline">
              talk to a campaign advisor
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
