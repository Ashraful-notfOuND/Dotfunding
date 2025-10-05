import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, MapPin } from "lucide-react";

interface CreatorCardProps {
  name: string;
  avatar: string;
  bio: string;
  location: string;
  projectsCreated: number;
  onViewProfile: () => void;
}

const CreatorCard = ({
  name,
  avatar,
  bio,
  location,
  projectsCreated,
  onViewProfile,
}: CreatorCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            {avatar}
          </div>
          <div>
            <div className="font-semibold text-lg">{name}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">{bio}</p>
        
        <div className="text-sm text-muted-foreground">
          {projectsCreated} projects created
        </div>
        
        <Button variant="outline" className="w-full" onClick={onViewProfile}>
          <User className="h-4 w-4 mr-2" />
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreatorCard;
