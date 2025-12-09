import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, Clock, DollarSign, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Donation {
  id: string;
  amount: number;
  donorName: string;
  donorEmail: string | null;
  date: string;
}

interface ProjectDonationsProps {
  projectId: string;
}

const ProjectDonations = ({ projectId }: ProjectDonationsProps) => {
  const [recent, setRecent] = useState<Donation[]>([]);
  const [top, setTop] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const backend = (import.meta.env as any).VITE_BACKEND_URL || "http://localhost:5000";
        const url = `${backend}/api/projects/${projectId}/donations`;
        console.log("Fetching donations from:", url);
        
        const res = await fetch(url);
        
        if (!res.ok) {
          console.error("Failed to fetch donations, status:", res.status);
          const errorText = await res.text();
          console.error("Error response:", errorText);
          return;
        }
        
        const data = await res.json();
        console.log("Donations data received:", data);
        setRecent(data.recent || []);
        setTop(data.top || []);
      } catch (error) {
        console.error("Error fetching donations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchDonations();
    }
  }, [projectId]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const getBadge = (index: number) => {
    const badges = [
      { 
        color: "from-cyan-400 via-blue-500 to-purple-600", 
        label: "💎", 
        name: "Diamond Backer",
        ring: "ring-2 ring-cyan-400/50 ring-offset-2",
        glow: "shadow-lg shadow-cyan-500/50"
      },
      { 
        color: "from-slate-200 via-slate-300 to-slate-400", 
        label: "⭐", 
        name: "Platinum Backer",
        ring: "ring-2 ring-slate-300/50 ring-offset-2",
        glow: "shadow-lg shadow-slate-400/50"
      },
      { 
        color: "from-yellow-300 via-amber-400 to-yellow-500", 
        label: "👑", 
        name: "Gold Backer",
        ring: "ring-2 ring-amber-400/50 ring-offset-2",
        glow: "shadow-lg shadow-amber-500/50"
      },
      { 
        color: "from-gray-300 via-gray-400 to-gray-500", 
        label: "🥈", 
        name: "Silver Backer",
        ring: "ring-2 ring-gray-400/50 ring-offset-2",
        glow: "shadow-md shadow-gray-400/50"
      },
      { 
        color: "from-orange-400 via-amber-600 to-orange-700", 
        label: "🥉", 
        name: "Bronze Backer",
        ring: "ring-2 ring-orange-500/50 ring-offset-2",
        glow: "shadow-md shadow-orange-500/50"
      },
    ];
    return badges[index] || null;
  };

  const DonationItem = ({ donation, showTime = false, badge = null }: { donation: Donation; showTime?: boolean; badge?: { color: string; label: string; name: string; ring: string; glow: string } | null }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-all duration-300 group">
      <div className="relative">
        <Avatar className={`h-12 w-12 transition-all duration-300 ${badge ? `${badge.ring} ${badge.glow}` : 'bg-primary/10'}`}>
          <AvatarFallback className={`text-primary font-semibold ${badge ? 'text-base' : ''}`}>
            {getInitials(donation.donorName)}
          </AvatarFallback>
        </Avatar>
        {badge && (
          <div 
            className={`absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-sm shadow-xl border-2 border-white animate-pulse`} 
            title={badge.name}
          >
            {badge.label}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm truncate">{donation.donorName}</p>
          {badge && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${badge.color} text-white shadow-sm`}>
              {badge.name.split(' ')[0]}
            </span>
          )}
        </div>
        {showTime && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(donation.date)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 font-bold text-primary text-base">
        <DollarSign className="h-5 w-5" />
        {donation.amount.toLocaleString()}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">Loading Backers...</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state message if you're in development
  if (recent.length === 0 && top.length === 0) {
    console.log("No donations to display");
    return (
      <Card className="animate-fade-in border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No backers yet. Be the first to support this project!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 animate-fade-in overflow-hidden">
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Backers
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {top.length + (recent.length > 0 ? 1 : 0)} supporters
            </span>
          </CardTitle>
        </CardHeader>
      </div>
      <CardContent className="space-y-4 pt-4">
        {/* Top Donations */}
        {top.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" />
              Top Contributors
            </h4>
            <div className="space-y-1">
              {top.map((donation, index) => (
                <DonationItem key={donation.id} donation={donation} badge={getBadge(index)} />
              ))}
            </div>
          </div>
        )}

        {/* Divider if both sections exist */}
        {top.length > 0 && recent.length > 0 && (
          <div className="border-t border-border/60"></div>
        )}

        {/* Recent Donation - Show only 1 */}
        {recent.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Latest Backer
            </h4>
            <div className="space-y-1">
              <DonationItem donation={recent[0]} showTime />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectDonations;
