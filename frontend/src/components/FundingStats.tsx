import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface FundingStatsProps {
  fundingCurrent: number;
  fundingGoal: number;
  backers: number;
  daysLeft: number;
}

const FundingStats = ({ fundingCurrent, fundingGoal, backers, daysLeft }: FundingStatsProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const fundingPercentage = Math.min((fundingCurrent / fundingGoal) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(fundingPercentage), 100);
    return () => clearTimeout(timer);
  }, [fundingPercentage]);

  const hours = daysLeft * 24;
  const [timeLeft, setTimeLeft] = useState({ days: daysLeft, hours: hours % 24, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="animate-scale-in">
      <CardContent className="pt-6 space-y-6">
        <div>
          <div className="text-3xl font-bold text-primary mb-1">
            ${fundingCurrent.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            pledged of ${fundingGoal.toLocaleString()} goal
          </div>
          <Progress value={animatedProgress} className="h-2 mb-2" />
          <div className="text-sm text-muted-foreground">{Math.round(fundingPercentage)}% funded</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{backers}</span>
            <span className="text-sm text-muted-foreground">backers</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{daysLeft}</span>
            </div>
            <span className="text-sm text-muted-foreground">days to go</span>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-2 text-center">Time Remaining</div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-2xl font-bold">{timeLeft.days}</div>
              <div className="text-xs text-muted-foreground">days</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{timeLeft.hours}</div>
              <div className="text-xs text-muted-foreground">hours</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{timeLeft.minutes}</div>
              <div className="text-xs text-muted-foreground">mins</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{timeLeft.seconds}</div>
              <div className="text-xs text-muted-foreground">secs</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FundingStats;
