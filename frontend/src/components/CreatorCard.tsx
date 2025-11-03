import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, MapPin, Mail } from "lucide-react";
import defaultAvatar from "@/assets/default-avatar.png";

interface CreatorCardProps {
  name: string;
  avatar: string;
  email?: string;
  bio: string;
  location: string;
  projectsCreated: number;
  onViewProfile: () => void;
}

const isImageUrl = (value: string) => {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:" || value.startsWith("data:");
  } catch (_) {
    return value.includes("/");
  }
};

const CreatorCard = ({
  name,
  avatar,
  email,
  bio,
  location,
  projectsCreated,
  onViewProfile,
}: CreatorCardProps) => {
  const showImg = isImageUrl(avatar);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            {showImg ? (
              <img
                src={avatar}
                alt={name}
                onError={(e) => (e.currentTarget.src = defaultAvatar)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                {avatar}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-lg">{name}</div>
            {email && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <a href={`mailto:${email}`} className="underline">
                  {email}
                </a>
              </div>
            )}
            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
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
