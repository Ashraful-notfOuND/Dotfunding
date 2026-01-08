import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, User, ExternalLink } from "lucide-react";
import defaultAvatar from "@/assets/default-avatar.png";

interface CreatorProfile {
  id?: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  projectsCreated: number;
  totalBackers: number;
}

const CreatorTab = ({ projectId }: { projectId: string }) => {
  const navigate = useNavigate();
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/projects/creator/${projectId}`);
        const data = await res.json();

        if (res.ok && data.user) {
          const creatorId = data.user.id || data.user.user_id || data.user.uid || data.user.userId;
          setCreator({
            id: creatorId,
            name: data.user.full_name,
            avatar: data.user.profile_pic || defaultAvatar,
            bio: data.user.bio || "No bio provided yet.",
            location: data.user.location || "Not specified",
            projectsCreated: data.user.projectsCount || 0, // Ensure your backend sends this
            totalBackers: data.user.backersCount || 0,    // Ensure your backend sends this
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
      <Card className="border-none shadow-md animate-pulse">
        <CardContent className="pt-10 pb-10 text-center text-muted-foreground">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          </div>
          Loading creator story...
        </CardContent>
      </Card>
    );
  }

  if (!creator) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="pt-6 text-center text-muted-foreground">
          Creator information not available.
        </CardContent>
      </Card>
    );
  }

  return (
<Card className="overflow-hidden border-none shadow-xl bg-white/90 backdrop-blur-md">
  {/* Pink Accent Line */}
  <div className="h-2 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600" />
  
  <CardContent className="pt-8 space-y-8 px-6 md:px-8 pb-8">
    <div className="flex flex-col md:flex-row items-start gap-6">
      {/* Avatar with Pinkish Glow */}
      <div className="relative flex-shrink-0 mx-auto md:mx-0">
        <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg relative z-10">
          <img
            src={creator.avatar}
            alt={creator.name}
            onError={(e) => (e.currentTarget.src = defaultAvatar)}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -inset-1 bg-gradient-to-tr from-rose-400 to-fuchsia-400 rounded-2xl blur-md opacity-20 -z-0"></div>
      </div>

      <div className="flex-1 text-center md:text-left space-y-2">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <h3 className="font-black text-3xl text-slate-800 tracking-tight">
            {creator.name}
          </h3>
          <span className="inline-flex items-center self-center md:self-auto px-2.5 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-full uppercase tracking-widest border border-rose-100">
            Verified Creator
          </span>
        </div>

        <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-400" />
            {creator.location}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-rose-400" />
            Member
          </span>
        </div>

        <p className="text-slate-600 leading-relaxed text-sm pt-2 italic">
          "{creator.bio}"
        </p>
      </div>
    </div>


    {/* Action Button */}
    <Button
      variant="outline"
      className="w-full h-12 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-all font-bold shadow-sm"
      onClick={() => {
        if (creator?.id) navigate(`/creator/${creator.id}`);
      }}
    >
      View Full Creator Profile
    </Button>
  </CardContent>
</Card>
  );
};

export default CreatorTab;