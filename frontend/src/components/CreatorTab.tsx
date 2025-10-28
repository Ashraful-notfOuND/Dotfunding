import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth"; // ✅ make sure this path matches your project

interface CreatorProfile {
  name: string;
  avatar: string;
  bio: string;
  location: string;
  projectsCreated: number;
  totalBackers: number;
}

const CreatorTab = () => {
  const { user } = useAuth(); // ✅ Get current logged-in user

  // Build the creator profile from user data
  const creator: CreatorProfile | null = user
    ? {
        name: user.name || "Unknown Creator",
        avatar: user.profilePic || "/default-avatar.jpg", // ✅ fallback image
        bio: user.bio || "No bio provided yet.",
        location: user.location || "Not specified",
        // projectsCreated: user.projectsCreated || 0,
        // totalBackers: user.totalBackers || 0,
        projectsCreated: 0,
        totalBackers: 0,
      }
    : null;

  // Show message if user data is missing
  if (!creator) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Creator information not available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-start gap-4">
          {/* ✅ Avatar image instead of initials */}
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={creator.avatar}
              alt={creator.name}
              onError={(e) => (e.currentTarget.src = "/default-avatar.jpg")}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-2xl mb-1">{creator.name}</h3>

            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
              <span className="inline-flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {creator.location}
              </span>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {creator.bio}
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-2xl font-bold text-primary">
                {creator.projectsCreated}
              </div>
              <div className="text-sm text-muted-foreground">
                Projects Created
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {creator.totalBackers}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Backers
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => console.log("View profile")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            View Full Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorTab;
