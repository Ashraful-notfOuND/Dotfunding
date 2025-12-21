import { Link } from "react-router-dom";
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
  backers?: number;
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
  backers,
  daysLeft,
  category,
  isTrending = false,
}: ProjectCardProps) => {
  // Calculate actual percentage - can exceed 100% for overfunded projects
  const fundingPercentage = fundingGoal > 0 ? (fundingCurrent / fundingGoal) * 100 : 0;
  // Use real backers from API, or estimate if not provided
  const backersCount = backers !== undefined ? backers : Math.floor(fundingCurrent / 50);
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
    <div className="group bg-card/80 backdrop-blur-sm border border-border rounded-xl overflow-hidden shadow-sm transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in relative">
      <Link to={`/project/${id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {isTrending && (
            <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-3 py-0.5 rounded-full text-xs font-semibold shadow">
              <TrendingUp className="h-3 w-3" />
              <span className="ml-1">Trending</span>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-0.5 rounded-full text-xs font-medium">
            {category}
          </div>

          {/* Quick Actions (fade+translate) */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full shadow-lg bg-background/90"
              onClick={handleWishlist}
            >
              <Heart className={`h-4 w-4 ${isInWishlist(id) ? 'fill-destructive text-destructive' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full shadow-lg bg-background/90"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg md:text-xl font-semibold text-card-foreground line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">by {creator}</p>

          {/* Compact stats block: amount on one line, backers + time on second line */}
          <div className="mt-4 border-t border-border pt-3 text-sm">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-foreground">৳{fundingCurrent.toLocaleString()}</span>
              </div>
              <div>
                <span
                  className={`text-sm font-medium ${fundingPercentage > 100 ? 'text-green-600 font-bold' : 'text-emerald-600'}`}
                  aria-label={`${Math.round(fundingPercentage)} percent funded`}
                >
                  {Math.round(fundingPercentage)}% {fundingPercentage > 100 && '🎉'}
                </span>
              </div>
            </div>
            <div className="mt-1 text-muted-foreground text-sm">
              <div>{backersCount} backers</div>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-4 w-4" />
                <span>{daysLeft}d</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProjectCard;
