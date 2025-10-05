import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Check, Users } from "lucide-react";

interface RewardTierCardProps {
  amount: number;
  title: string;
  description: string;
  delivery: string;
  backers: number;
  available: number;
  onSelect: () => void;
}

const RewardTierCard = ({
  amount,
  title,
  description,
  delivery,
  backers,
  available,
  onSelect,
}: RewardTierCardProps) => {
  const isSoldOut = available === 0;

  return (
    <Card className={`border-2 transition-smooth hover:border-primary ${isSoldOut ? 'opacity-60' : ''}`}>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">${amount}</span>
          {isSoldOut && (
            <span className="text-xs text-destructive font-semibold">SOLD OUT</span>
          )}
          {!isSoldOut && available < 50 && available > 0 && (
            <span className="text-xs text-orange-600 font-semibold">LIMITED</span>
          )}
        </div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="pt-2 space-y-1 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            Estimated delivery: {delivery}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="font-semibold">{backers}</span> backers
            {available > 0 && <span className="ml-2 text-orange-600 font-semibold">{` • ${available} left`}</span>}
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          disabled={isSoldOut}
          onClick={onSelect}
        >
          {isSoldOut ? "Sold Out" : "Select Reward"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RewardTierCard;
