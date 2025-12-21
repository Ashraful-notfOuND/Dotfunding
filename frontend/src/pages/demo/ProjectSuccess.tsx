import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Confetti } from "@/components/ui/confetti";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  Users, 
  DollarSign, 
  TrendingUp,
  ArrowRight
} from "lucide-react";

/**
 * DEMO PAGE 1: Full-Page Success Outcome
 * Purpose: Screenshot for presentation slides
 * Shows celebratory message after successful funding
 */
export default function ProjectSuccess() {
  const navigate = useNavigate();

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
                <p className="text-4xl font-bold text-green-900 dark:text-green-100">৳2,847</p>
              </div>

              {/* Backers */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Backers</p>
                </div>
                <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">7</p>
              </div>

              {/* Funding Percentage */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Funded</p>
                </div>
                <p className="text-4xl font-bold text-purple-900 dark:text-purple-100">1076%</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col items-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/project/outcome/payment')}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-white px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Next
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <p className="text-sm text-muted-foreground">
                Let's review your payment breakdown
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Project: <span className="font-semibold">EcoSmart Water Bottle</span> • 
            Campaign ended: Dec 20, 2025
          </p>
        </div>
      </div>
    </div>
  );
}
