import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Heart,
  Users, 
  DollarSign, 
  Target,
  ArrowRight,
  Lightbulb
} from "lucide-react";

/**
 * PAGE 1: Unsuccessful Campaign Outcome
 * Purpose: Empathetic message acknowledging the outcome
 * Tone: Supportive, respectful, not judgmental
 */
export default function CampaignUnsuccessful() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <Card className="border shadow-xl">
          <CardContent className="pt-12 pb-12 px-8 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="bg-muted p-6 rounded-full">
                  <Heart className="h-16 w-16 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Your campaign didn't reach its goal this time
            </h1>
            
            {/* Empathetic Message */}
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-3">
              We know how much courage it takes to put your idea out there.
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-10">
              Many successful creators didn't succeed on their first try. This is part of the journey, 
              not the end of it. Let's look at what happened and how you can move forward.
            </p>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto">
              {/* Amount Raised */}
              <div className="bg-muted/30 rounded-lg p-5 border border-border">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">Raised</p>
                </div>
                <p className="text-2xl font-bold text-foreground">৳2,847</p>
              </div>

              {/* Goal */}
              <div className="bg-muted/30 rounded-lg p-5 border border-border">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">Goal</p>
                </div>
                <p className="text-2xl font-bold text-foreground">৳10,000</p>
              </div>

              {/* Backers */}
              <div className="bg-muted/30 rounded-lg p-5 border border-border">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">Backers</p>
                </div>
                <p className="text-2xl font-bold text-foreground">7</p>
              </div>

              {/* Percentage */}
              <div className="bg-muted/30 rounded-lg p-5 border border-border">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">Reached</p>
                </div>
                <p className="text-2xl font-bold text-foreground">28%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-10">
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all"
                  style={{ width: '28%' }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                28% of your ৳10,000 goal
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col items-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/campaign/insights')}
                className="bg-primary hover:bg-primary-hover text-white px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                View Campaign Insights
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <p className="text-sm text-muted-foreground">
                Understand what happened and explore your options
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
