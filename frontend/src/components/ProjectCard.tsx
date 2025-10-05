import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Heart, Share2 } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "@/hooks/use-toast";

interface ProjectCardProps {
  id: string;
  title: string;
  creator: string;
  image: string;
  fundingGoal: number;
  fundingCurrent: number;
  daysLeft: number;
  category: string;
  isTrending?: boolean;
}

const ProjectCard = ({
  id,
  title,
  creator,
  image,
  fundingGoal,
  fundingCurrent,
  daysLeft,
  category,
  isTrending = false,
}: ProjectCardProps) => {
  const fundingPercentage = Math.min((fundingCurrent / fundingGoal) * 100, 100);
  const backers = Math.floor(fundingCurrent / 50); // Simulated backers count
  const { isInWishlist, toggleWishlist } = useWishlist();

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${window.location.origin}/project/${id}`);
    toast({
      title: "Link copied!",
      description: "Project link copied to clipboard",
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(id, title);
  };

  return (
    <div className="group bg-card rounded-lg overflow-hidden shadow-smooth hover:shadow-lg transition-smooth border border-border animate-fade-in relative">
      <Link to={`/project/${id}`}>
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
          />
          {isTrending && (
            <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Trending
            </div>
          )}
          <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
            {category}
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-lg"
              onClick={handleWishlist}
            >
              <Heart className={`h-4 w-4 ${isInWishlist(id) ? 'fill-destructive text-destructive' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-lg"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-smooth">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">by {creator}</p>

          {/* Funding Progress */}
          <div className="space-y-2">
            <Progress value={fundingPercentage} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-bold text-foreground">
                  ${fundingCurrent.toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  of ${fundingGoal.toLocaleString()}
                </span>
              </div>
              <div className="text-muted-foreground">{Math.round(fundingPercentage)}%</div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">{backers} backers</span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{daysLeft} days left</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProjectCard;
