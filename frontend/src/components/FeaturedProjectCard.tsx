import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturedProjectCardProps {
  project: {
    id: string;
    title: string;
    creator: string;
    image: string;
    fundingGoal: number;
    fundingCurrent: number;
    daysLeft: number;
    category: string;
    description: string;
  };
}

const FeaturedProjectCard = ({ project }: FeaturedProjectCardProps) => {
  const fundingPercentage = Math.min(
    (project.fundingCurrent / project.fundingGoal) * 100,
    100
  );

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-smooth">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent to-primary p-4">
        <div className="flex items-center gap-2 text-accent-foreground">
          <Star className="h-5 w-5 fill-current" />
          <h3 className="font-semibold">Editor's Choice</h3>
        </div>
      </div>

      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
          {project.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <h4 className="font-semibold text-lg mb-2 line-clamp-2">{project.title}</h4>
          <p className="text-sm text-muted-foreground">by {project.creator}</p>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">
          {project.description}
        </p>

        {/* Funding Progress */}
        <div className="space-y-2">
          <Progress value={fundingPercentage} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-bold text-foreground">
                ${project.fundingCurrent.toLocaleString()}
              </span>
              <span className="text-muted-foreground"> raised</span>
            </div>
            <div className="text-muted-foreground">{Math.round(fundingPercentage)}%</div>
          </div>
        </div>

        {/* Days Left */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{project.daysLeft} days left</span>
        </div>

        {/* CTA Button */}
        <Button asChild className="w-full" size="lg">
          <Link to={`/project/${project.id}`}>View Project</Link>
        </Button>
      </div>
    </div>
  );
};

export default FeaturedProjectCard;
