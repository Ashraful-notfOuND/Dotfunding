import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CreatorCard from "@/components/CreatorCard";
import ProjectCard from "@/components/ProjectCard";
import { Card, CardContent } from "@/components/ui/card";

const CreatorProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState<any | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    // Debug: log the user ID being fetched
    // eslint-disable-next-line no-console
    console.log("Fetching data for user ID:", id);
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const backend = (import.meta.env as any).VITE_BACKEND_URL || "http://localhost:5000";
        const [uRes, pRes] = await Promise.all([
          fetch(`${backend}/api/users/${id}`),
          fetch(`${backend}/api/projects/userProjects/${id}`),
        ]);

        const uJson = uRes.ok ? await uRes.json() : null;
        const pJson = pRes.ok ? await pRes.json() : null;

        // Debug: log raw responses to help identify response shape during development
        // (kept short to avoid noisy logs in production)
        try {
          // eslint-disable-next-line no-console
          console.log("CreatorProfile: user response shape:", uJson);
          // eslint-disable-next-line no-console
          console.log("CreatorProfile: projects response shape:", Array.isArray(pJson?.projects) ? `projects(${pJson.projects.length})` : pJson);
        } catch (e) {
          // ignore logging errors
        }

        // Normalize possible backend response shapes. Some APIs return { user: {...} }, others return {...} directly.
        const extractUser = (raw: any) => {
          if (!raw) return null;
          if (raw.user) return raw.user;
          if (raw.data && raw.data.user) return raw.data.user;
          if (raw.data && (raw.data.full_name || raw.data.email)) return raw.data;
          if (raw.full_name || raw.email || raw.profile_pic || raw.profilePicture) return raw;
          return null;
        };

        const normalizedUser = extractUser(uJson);
        setUser(normalizedUser || null);

        const projList = Array.isArray(pJson?.projects) ? pJson.projects : [];
        // normalize to ProjectCard props
        const mapped = projList.map((p: any) => ({
          id: p.id,
          title: p.title,
          creator: normalizedUser?.full_name || "",
          creatorId: id,
          image: p.imageUrl || p.image_url || "",
          fundingGoal: Number(p.fundingGoal || p.funding_goal || 0),
          fundingCurrent: Number(p.fundingCurrent || 0),
          daysLeft: p.fundingDeadline ? Math.max(0, Math.ceil((new Date(p.fundingDeadline).getTime() - Date.now())/(1000*60*60*24))) : 0,
          category: p.category || "General",
        }));
        setProjects(mapped);
      } catch (e: any) {
        console.error("CreatorProfile fetch error:", e);
        setError(e.message || "Failed to fetch creator data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Card>
            <CardContent>
              {loading && <p>Loading creator...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {!loading && !error && user && (
                <CreatorCard
                  name={user.full_name || 'Unknown'}
                  avatar={user.profile_pic || (user.full_name ? user.full_name.split(' ').map((n:any)=>n[0]).join('') : '?')}
                  email={user.email}
                  bio={user.bio || ''}
                  location={user.location || ''}
                  projectsCreated={projects.length}
                  onViewProfile={() => { /* already on profile */ }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Projects by this creator</h2>
          {projects.length === 0 && !loading ? (
            <p className="text-muted-foreground">No projects found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <ProjectCard key={proj.id} {...proj} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreatorProfile;
