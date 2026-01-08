import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="group relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-card">
      {/* Gradient Header */}
      <div className="h-32 bg-gradient-to-br from-primary/80 via-accent/70 to-primary/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <CardContent className="pt-0 pb-8 px-8 bg-transparent relative">
        {/* Avatar - Overlapping header */}
        <div className="flex items-start gap-6 -mt-16 mb-8">
          <div className="relative group/avatar flex-shrink-0">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-background shadow-xl ring-2 ring-primary/20 transition-all group-hover:ring-primary/40">
              {showImg ? (
                <img
                  src={avatar}
                  alt={name}
                  onError={(e) => (e.currentTarget.src = defaultAvatar)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-white">
                  {avatar}
                </div>
              )}
            </div>
            {/* Online/Active indicator */}
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-background shadow-lg"></div>
          </div>

          {/* Name and basic info */}
          <div className="flex-1 mt-16">
            <h3 className="text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
              {name}
            </h3>

            {/* Contact Info */}
            <div className="flex flex-col gap-2.5">
              {email && (
                <div className="flex items-center gap-3 text-base text-muted-foreground">
                  <span className="text-xl">✉️</span>
                  <span>{email}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-base text-muted-foreground">
                <span className="text-xl">📍</span>
                <span>
                  {location
                    ? location
                    : "The creator did not share his / her location"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Badge */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 px-5 py-3 rounded-xl border border-primary/20">
            <span className="text-2xl">🚀</span>
            <span className="text-lg font-semibold text-foreground">
              {projectsCreated}
            </span>
            <span className="text-base text-muted-foreground">
              project{projectsCreated !== 1 ? "s" : ""} created
            </span>
          </div>
        </div>

        {/* About Creator Section */}
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-3 uppercase tracking-wide">
            About Creator
          </h4>
          <p className="text-base text-muted-foreground leading-relaxed">
            {bio}
          </p>
        </div>

        {/* Decorative bottom element */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </CardContent>
    </Card>
  );
};

export default CreatorCard;
