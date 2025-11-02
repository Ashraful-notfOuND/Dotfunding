import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import defaultAvatar from "@/assets/default-avatar.png";

interface CreatorProfile {
  name: string;
  avatar: string;
  bio: string;
  location: string;
  projectsCreated: number;
  totalBackers: number;
}

const CreatorTab = ({ projectId }: { projectId: string }) => {
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/projects/creator/${projectId}`);
        const data = await res.json();

        if (res.ok && data.user) {
          setCreator({
            name: data.user.full_name,
            avatar: data.user.profile_pic || defaultAvatar,
            bio: data.user.bio || "No bio provided yet.",
            location: data.user.location || "Not specified",
            projectsCreated: 0,
            totalBackers: 0,
          });
        } else {
          setCreator(null);
        }
      } catch (err) {
        console.error("Error fetching creator:", err);
        setCreator(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCreator();
  }, [projectId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Loading creator info...
        </CardContent>
      </Card>
    );
  }

  if (!creator) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Creator information not available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={creator.avatar}
              alt={creator.name}
              onError={(e) => (e.currentTarget.src = defaultAvatar)}
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
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
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
              <div className="text-sm text-muted-foreground">Projects Created</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {creator.totalBackers}
              </div>
              <div className="text-sm text-muted-foreground">Total Backers</div>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            View Full Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorTab;
