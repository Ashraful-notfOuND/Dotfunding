import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  TrendingDown,
  Eye,
  MousePointerClick,
  Share2,
  Calendar,
  Info,
  ArrowRight,
  BarChart3
} from "lucide-react";

/**
 * PAGE 2: Campaign Insights
 * Purpose: Analytical breakdown without blame
 * Tone: Informative, neutral, helpful
 */
export default function CampaignInsights() {
  const navigate = useNavigate();

  const insights = [
    {
      icon: <MousePointerClick className="h-6 w-6" />,
      title: "Conversion Rate",
      value: "1.2%",
      description: "Out of 583 visitors, 7 became backers. Industry average is 3-5%.",
      type: "metric"
    },
    {
      icon: <TrendingDown className="h-6 w-6" />,
      title: "Activity Drop-Off",
      value: "After Day 3",
      description: "Most pledges came in the first 3 days, with minimal activity afterward.",
      type: "timing"
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: "Limited Traffic Sources",
      value: "2 sources",
      description: "Traffic came primarily from direct visits and one social platform.",
      type: "reach"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Repeat Visitor Rate",
      value: "18%",
      description: "Fewer visitors returned after their first visit compared to successful campaigns.",
      type: "engagement"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Campaign Insights</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Understanding what might have affected your campaign
          </p>
        </div>

        <Card className="shadow-xl border-2 mb-6">
          <CardHeader className="bg-muted/30 border-b">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Performance Indicators</CardTitle>
                <p className="text-sm text-muted-foreground">
                  These are observations from your campaign data, not judgments of your effort.
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 pb-8">
            {/* Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {insights.map((insight, index) => (
                <div 
                  key={index}
                  className="bg-muted/20 rounded-lg p-5 border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                      <div className="text-primary">
                        {insight.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-base">{insight.title}</h3>
                        <Badge variant="outline" className="bg-background">
                          {insight.value}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline Overview */}
            <div className="bg-muted/30 rounded-lg p-5 mb-6 border border-border">
              <div className="flex items-start gap-3 mb-4">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Campaign Timeline</h3>
                  <p className="text-sm text-muted-foreground">
                    Your 30-day campaign ran from Nov 20 - Dec 20, 2025
                  </p>
                </div>
              </div>
              
              {/* Simple activity visualization */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20">Week 1</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-primary h-full rounded-full" style={{ width: '65%' }} />
                  </div>
                  <span className="text-xs font-medium">65% activity</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20">Week 2</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-primary h-full rounded-full" style={{ width: '20%' }} />
                  </div>
                  <span className="text-xs font-medium">20% activity</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20">Week 3-4</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-primary h-full rounded-full" style={{ width: '15%' }} />
                  </div>
                  <span className="text-xs font-medium">15% activity</span>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <span className="font-semibold">These are indicators, not judgments.</span> Many factors 
                  influence campaign success, including timing, market conditions, and external trends. 
                  Use these insights to inform your next steps.
                </p>
              </div>
            </div>

            {/* CTA */}
            <Button 
              size="lg" 
              onClick={() => navigate('/campaign/next-steps')}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-white font-semibold"
            >
              Explore Next Steps
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Want a deeper analysis? Export your campaign data from the Creator Dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
