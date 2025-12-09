// import { useState, useEffect, useCallback } from "react";
// import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Heart } from "lucide-react";

// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import ProjectHero from "@/components/ProjectHero";
// import FundingStats from "@/components/FundingStats";
// import ShareButtons from "@/components/ShareButtons";
// import RewardTierCard from "@/components/RewardTierCard";
// import RelatedProjects from "@/components/RelatedProjects";
// import PledgeModal from "@/components/PledgeModal";
// import Campaign from "@/components/Campaign";
// import FAQ from "@/components/FAQ";
// import Updates from "@/components/Updates";
// import Comments from "@/components/Comments";
// import CreatorTab from "@/components/CreatorTab";
// import StatisticsTab from "@/components/StatisticsTab";
// import { useAuth } from "@/hooks/useAuth";
// import { useToast } from "@/hooks/use-toast";

// type Reward = {
//   amount: number;
//   title: string;
//   description: string;
//   delivery?: string;
//   backers?: number;
//   available?: number;
// };

// type Project = {
//   id: string;
//   title: string;
//   tagline?: string;
//   creator?: string;
//   creatorEmail?: string;
//   images?: string[];
//   videoUrl?: string | null;
//   status?: string;
//   image_urls?: string;
//   fundingGoal?: number;
//   fundingCurrent?: number;
//   backers?: number;
//   daysLeft?: number;
//   category?: string;
//   location?: string;
//   description?: string;
//   rewards?: Reward[];
// };

// const ProjectDetail = () => {
//   const { user } = useAuth();
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { toast } = useToast();
//   const [project, setProject] = useState<Project | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [rawBody, setRawBody] = useState<any>(null);
//   const [pledgeAmount, setPledgeAmount] = useState("");
//   const [customPledgeAmount, setCustomPledgeAmount] = useState("");
//   const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
//   const [rewards, setRewards] = useState<Reward[]>([]);
//   const [selectedReward, setSelectedReward] = useState<{
//     amount: number;
//     title: string;
//     description: string;
//   } | null>(null);

//   const fetchProject = useCallback(async (signal?: AbortSignal) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
//         signal,
//       });

//       if (!res.ok) {
//         if (res.status === 404) {
//           console.error("Backend didn't find project");
//           navigate("/404");
//           return;
//         }
//         const body = await res.json().catch(() => ({}));
//         throw new Error(body.error || `Failed to fetch project (${res.status})`);
//       }

//       const data = await res.json();
//       setRawBody(data);
//       setProject((data && data.project) ? data.project : data ?? null);
//       console.log("ProjectDetail fetch response:", data);
//     } catch (err: any) {
//       if (err.name === "AbortError") return;
//       console.error("Error fetching project:", err);
//       setError(err.message || "Failed to load project");
//     } finally {
//       setLoading(false);
//     }
//   }, [id, navigate]);

//   useEffect(() => {
//     if (!id) {
//       console.error("No project ID provided in URL");
//       navigate("/404");
//       return;
//     }
//     const controller = new AbortController();
//     fetchProject(controller.signal);

//     return () => controller.abort();
//   }, [id, navigate, fetchProject]);
//   // Fetch rewards after project is loaded
//   useEffect(() => {
//     if (!project) return; // wait until project is loaded
//     console.log("Fetching rewards for projectId in frontend:", project.id);
//     const fetchRewards = async () => {
//       try {

//         const res = await fetch(`http://localhost:5000/api/projects/rewards/${project.id}`);
//         if (!res.ok) throw new Error("Failed to fetch rewards");
//         const data = await res.json();
//         setRewards(data.rewards || []);
//       } catch (err) {
//         console.error("Failed to fetch rewards:", err);
//       }
//     };

//     fetchRewards();
//   }, [project]);

//   // React to payment redirect params (payment_status) and show toast + refresh
//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const status = params.get("payment_status");
//     const tran = params.get("tran_id");
//     if (status) {
//       if (status === "success") {
//         toast({ title: "Payment successful", description: `Transaction ${tran} completed.` });
//         // refetch project to update funding and progress
//         fetchProject();
//       } else if (status === "failed") {
//         toast({ title: "Payment failed", description: "Your payment did not complete." });
//       }

//       // remove params from URL to keep it clean
//       try {
//         const clean = window.location.pathname;
//         navigate(clean, { replace: true });
//       } catch (e) {
//         // ignore navigation errors
//       }
//     }
//   }, [location.search, navigate, toast, fetchProject]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div>Loading project...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-red-600">{error}</div>
//       </div>
//     );
//   }

//   // If no project after fetch, show a helpful message instead of returning null
//   if (!project) {
//     const showDebug = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1";
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-lg font-semibold mb-2">Project data not available.</p>
//           <p className="text-sm text-muted-foreground mb-4">The backend returned no project for this id.</p>
//           {error && <div className="text-red-600 mb-4">Error: {error}</div>}
//           {showDebug && (
//             <pre className="text-left max-w-3xl overflow-auto text-xs bg-surface border p-3 rounded">
//               {JSON.stringify(rawBody, null, 2)}
//             </pre>
//           )}
//         </div>
//       </div>
//     );
//   }


//   const handleRewardSelect = (reward: { amount: number; title: string; description: string }) => {
//     setSelectedReward(reward);
//     setPledgeAmount(reward.amount.toString());
//     setIsPledgeModalOpen(true);
//   };

//   const handlePledgeClick = () => {
//     setSelectedReward(null);
//     setIsPledgeModalOpen(true);
//   };

//   const handleCustomPledge = () => {
//     if (!customPledgeAmount || parseFloat(customPledgeAmount) < 1) return;
//     setSelectedReward(null);
//     setPledgeAmount(customPledgeAmount);
//     setIsPledgeModalOpen(true);
//   };

//   // TODO: replace with backend related-projects API. For now, show none.
//   const relatedProjects: any[] = [];

//   // Derive safe props for ProjectHero to avoid runtime errors when backend fields differ
//   const heroImages: string[] =
//     (project.images && project.images.length > 0)
//       ? project.images
//       : project.image_urls
//         ? [project.image_urls]
//         : [];

//   // ProjectHero expects a specific status union; default to 'active' if missing/unknown
//   const allowedStatuses = ["just-launched", "trending", "funded", "nearly-funded", "active"] as const;
//   const heroStatus = allowedStatuses.includes(project.status as any)
//     ? (project.status as any)
//     : "active";

//   const heroCreator = project.creator || "Unknown Creator";

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Navbar />

//       <div className="container mx-auto px-4 py-8">
//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-6">
//             <ProjectHero
//               title={project?.title || "Untitled Project"}
//               creator={heroCreator}
//               tagline={project?.tagline || ""}
//               images={heroImages}
//               videoUrl={project?.videoUrl}
//               status={heroStatus}
//             />

//             {/* Tabs */}
//             <Tabs defaultValue="campaign" className="w-full">
//               <TabsList className="w-full justify-start">
//                 <TabsTrigger value="campaign">Campaign</TabsTrigger>
//                 <TabsTrigger value="faq">FAQ</TabsTrigger>
//                 <TabsTrigger value="creator">Creator</TabsTrigger>
//                 <TabsTrigger value="updates">Updates</TabsTrigger>
//                 <TabsTrigger value="comments">Comments</TabsTrigger>
//                 <TabsTrigger value="statistics">Statistics</TabsTrigger>
//               </TabsList>

//               <TabsContent value="campaign" className="mt-6">
//                 <Campaign projectId={project.id} />
//               </TabsContent>

//               <TabsContent value="faq" className="mt-6">
//                 <FAQ projectId={project.id} />
//               </TabsContent>

//               <TabsContent value="creator" className="mt-6">
//                 <CreatorTab projectId={project.id} />
//               </TabsContent>

//               <TabsContent value="updates" className="mt-6">
//                 <Updates />
//               </TabsContent>

//               <TabsContent value="comments" className="mt-6">
//                 <Comments />
//               </TabsContent>

//               <TabsContent value="statistics" className="mt-6">
//                 <StatisticsTab />
//               </TabsContent>
//             </Tabs>

//           </div>

//           {/* Sidebar */}
//           <div className="lg:sticky top-24 space-y-6">
//             <FundingStats
//               fundingCurrent={500}
//               fundingGoal={project?.fundingGoal ?? 0}
//               backers={project?.backers ?? 0}
//               daysLeft={project?.daysLeft ?? 0}
//             />

//             {user && user.email === project.creatorEmail && (
//               <div className="animate-fade-in mb-2">
//                 <Link to={`/project/${project.id}/edit`}>
//                   <Button variant="outline" className="w-full">
//                     Edit Project
//                   </Button>
//                 </Link>
//               </div>
//             )}

//             <Button
//               className="w-full bg-accent hover:bg-accent-hover animate-fade-in"
//               size="lg"
//               onClick={() => {
//                 // open pledge modal
//                 setSelectedReward(null);
//                 setIsPledgeModalOpen(true);
//               }}
//             >
//               Back this project
//             </Button>

//             <ShareButtons projectTitle={project.title} />

//             {/* Pledge without rewards */}
//             <Card className="border-2 border-primary/20 animate-fade-in">
//               <CardHeader>
//                 <CardTitle className="text-lg flex items-center gap-2">
//                   <Heart className="h-5 w-5 text-primary" />
//                   Pledge without a reward
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <p className="text-sm text-muted-foreground">
//                   Support this project with any amount you choose. You won't receive a reward, but you'll help bring this project to life.
//                 </p>
//                 <div className="flex gap-2">
//                   <Input
//                     type="number"
//                     placeholder="Enter amount"
//                     min="1"
//                     value={customPledgeAmount}
//                     onChange={(e) => setCustomPledgeAmount(e.target.value)}
//                     className="flex-1"
//                   />
//                   <Button
//                     onClick={() => {
//                       if (!customPledgeAmount || parseFloat(customPledgeAmount) < 1) return;
//                       setSelectedReward(null);
//                       setPledgeAmount(customPledgeAmount);
//                       setIsPledgeModalOpen(true);
//                     }}
//                     disabled={!customPledgeAmount || parseFloat(customPledgeAmount) < 1}
//                     className="bg-accent hover:bg-accent-hover"
//                   >
//                     Continue
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Rewards */}
//             {/* Rewards */}
//             <div className="space-y-4 animate-fade-in">
//               <h3 className="font-bold text-xl">Rewards</h3>
//               {rewards.length > 0 ? rewards.map((reward, index) => (
//                 <RewardTierCard
//                   key={index}
//                   amount={reward.amount}
//                   title={reward.title}
//                   description={reward.description}
//                   delivery={reward.delivery}
//                   backers={reward.backers ?? 0}
//                   available={reward.available ?? 999}
//                   onSelect={() => {
//                     setSelectedReward(reward as any);
//                     setPledgeAmount(String(reward.amount));
//                     setIsPledgeModalOpen(true);
//                   }}
//                 />
//               )) : (
//                 <p className="text-muted-foreground">No rewards available yet.</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Related Projects */}
//         <div className="mt-16">
//           <RelatedProjects projects={relatedProjects} category={project?.category || ""} />

//         </div>
//       </div>

//       <Footer />

//       <PledgeModal
//         open={isPledgeModalOpen}
//         onOpenChange={setIsPledgeModalOpen}
//         projectTitle={project?.title || ""}
//         defaultAmount={pledgeAmount}
//         selectedReward={selectedReward}
//         projectId={project?.id}
//         userId={user?.id}
//       />
//     </div>
//   );
// };

// export default ProjectDetail;

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectHero from "@/components/ProjectHero";
import FundingStats from "@/components/FundingStats";
import ShareButtons from "@/components/ShareButtons";
import RewardTierCard from "@/components/RewardTierCard";
import RelatedProjects from "@/components/RelatedProjects";
import PledgeModal from "@/components/PledgeModal";
import Campaign from "@/components/Campaign";
import FAQ from "@/components/FAQ";
import Updates from "@/components/Updates";
import Comments from "@/components/Comments";
import CreatorTab from "@/components/CreatorTab";
import StatisticsTab from "@/components/StatisticsTab";
import ProjectReviews from "@/components/ProjectReviews";
import ProjectDonations from "@/components/ProjectDonations";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type Reward = {
  amount: number;
  title: string;
  description: string;
  delivery?: string;
  backers?: number;
  available?: number;
};

type Project = {
  id: string;
  title: string;
  tagline?: string;
  creator?: string;
  creatorEmail?: string;
  images?: string[];
  videoUrl?: string | null;
  status?: string;
  image_urls?: string;
  fundingGoal?: number;
  fundingCurrent?: number;
  backers?: number;
  daysLeft?: number;
  category?: string;
  location?: string;
  description?: string;
  rewards?: Reward[];
};

const ProjectDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawBody, setRawBody] = useState<any>(null);
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [customPledgeAmount, setCustomPledgeAmount] = useState("");
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<{
    amount: number;
    title: string;
    description: string;
  } | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  const fetchProject = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        signal,
      });

      if (!res.ok) {
        if (res.status === 404) {
          console.error("Backend didn't find project");
          navigate("/404");
          return;
        }
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to fetch project (${res.status})`);
      }

      const data = await res.json();
      setRawBody(data);
      setProject((data && data.project) ? data.project : data ?? null);
      setOwnerId(data?.project?.user_id || null);
      console.log("ProjectDetail fetch response:", data);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("Error fetching project:", err);
      setError(err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!id) {
      console.error("No project ID provided in URL");
      navigate("/404");
      return;
    }
    const controller = new AbortController();
    fetchProject(controller.signal);

    return () => controller.abort();
  }, [id, navigate, fetchProject]);
  // Fetch rewards after project is loaded
  useEffect(() => {
    if (!project) return; // wait until project is loaded
    console.log("Fetching rewards for projectId in frontend:", project.id);
    const fetchRewards = async () => {
      try {

        const res = await fetch(`http://localhost:5000/api/projects/rewards/${project.id}`);
        if (!res.ok) throw new Error("Failed to fetch rewards");
        const data = await res.json();
        setRewards(data.rewards || []);
      } catch (err) {
        console.error("Failed to fetch rewards:", err);
      }
    };

    fetchRewards();
  }, [project]);

  // React to payment redirect params (payment_status) and show toast + refresh
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("payment_status");
    const tran = params.get("tran_id");
    if (status) {
      if (status === "success") {
        toast({ title: "Payment successful", description: `Transaction ${tran} completed.` });
        // refetch project to update funding and progress
        fetchProject();
      } else if (status === "failed") {
        toast({ title: "Payment failed", description: "Your payment did not complete." });
      }

      // remove params from URL to keep it clean
      try {
        const clean = window.location.pathname;
        navigate(clean, { replace: true });
      } catch (e) {
        // ignore navigation errors
      }
    }
  }, [location.search, navigate, toast, fetchProject]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading project...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  // If no project after fetch, show a helpful message instead of returning null
  if (!project) {
    const showDebug = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1";
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Project data not available.</p>
          <p className="text-sm text-muted-foreground mb-4">The backend returned no project for this id.</p>
          {error && <div className="text-red-600 mb-4">Error: {error}</div>}
          {showDebug && (
            <pre className="text-left max-w-3xl overflow-auto text-xs bg-surface border p-3 rounded">
              {JSON.stringify(rawBody, null, 2)}
            </pre>
          )}
        </div>
      </div>
    );
  }


  const handleRewardSelect = (reward: { amount: number; title: string; description: string }) => {
    setSelectedReward(reward);
    setPledgeAmount(reward.amount.toString());
    setIsPledgeModalOpen(true);
  };

  const handlePledgeClick = () => {
    setSelectedReward(null);
    setIsPledgeModalOpen(true);
  };

  const handleCustomPledge = () => {
    if (!customPledgeAmount || parseFloat(customPledgeAmount) < 1) return;
    setSelectedReward(null);
    setPledgeAmount(customPledgeAmount);
    setIsPledgeModalOpen(true);
  };

  // TODO: replace with backend related-projects API. For now, show none.
  const relatedProjects: any[] = [];

  // Derive safe props for ProjectHero to avoid runtime errors when backend fields differ
  const heroImages: string[] =
    (project.images && project.images.length > 0)
      ? project.images
      : project.image_urls
        ? [project.image_urls]
        : [];

  // ProjectHero expects a specific status union; default to 'active' if missing/unknown
  const allowedStatuses = ["just-launched", "trending", "funded", "nearly-funded", "active"] as const;
  const heroStatus = allowedStatuses.includes(project.status as any)
    ? (project.status as any)
    : "active";

  const heroCreator = project.creator || "Unknown Creator";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ProjectHero
              title={project?.title || "Untitled Project"}
              creator={heroCreator}
              tagline={project?.tagline || ""}
              images={heroImages}
              videoUrl={project?.videoUrl}
              status={heroStatus}
            />

            {/* Tabs */}
            <Tabs defaultValue="campaign" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="campaign">Campaign</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
                <TabsTrigger value="creator">Creator</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
              </TabsList>

              <TabsContent value="campaign" className="mt-6">
                <Campaign projectId={project.id} />
              </TabsContent>

              <TabsContent value="faq" className="mt-6">
                <FAQ projectId={project.id} />
              </TabsContent>

              <TabsContent value="creator" className="mt-6">
                <CreatorTab projectId={project.id} />
              </TabsContent>

              <TabsContent value="updates" className="mt-6">
                <Updates />
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <Comments />
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <ProjectReviews projectId={project.id} />
              </TabsContent>

              <TabsContent value="statistics" className="mt-6">
                <StatisticsTab />
              </TabsContent>
            </Tabs>

          </div>

          {/* Sidebar */}
          <div className="lg:sticky top-24 space-y-6">
            <FundingStats
              fundingCurrent={project?.fundingCurrent ?? 0}
              fundingGoal={project?.fundingGoal ?? 0}
              backers={project?.backers ?? 0}
              daysLeft={project?.daysLeft ?? 0}
            />

            {user && user.email === project.creatorEmail && (
              <div className="animate-fade-in mb-2">
                <Link to={`/project/${project.id}/edit`}>
                  <Button variant="outline" className="w-full">
                    Edit Project
                  </Button>
                </Link>
              </div>
            )}

            <Button
              className="w-full bg-accent hover:bg-accent-hover animate-fade-in"
              size="lg"
              onClick={() => {
                // open pledge modal
                setSelectedReward(null);
                setIsPledgeModalOpen(true);
              }}
            >
              Back this project
            </Button>

            <ShareButtons projectTitle={project.title} />

            {/* Donations Section */}
            <ProjectDonations projectId={project.id} />

            {/* Pledge without rewards */}
            <Card className="border-2 border-primary/20 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Pledge without a reward
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Support this project with any amount you choose. You won't receive a reward, but you'll help bring this project to life.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    min="1"
                    value={customPledgeAmount}
                    onChange={(e) => setCustomPledgeAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      if (!customPledgeAmount || parseFloat(customPledgeAmount) < 1) return;
                      setSelectedReward(null);
                      setPledgeAmount(customPledgeAmount);
                      setIsPledgeModalOpen(true);
                    }}
                    disabled={!customPledgeAmount || parseFloat(customPledgeAmount) < 1}
                    className="bg-accent hover:bg-accent-hover"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Rewards */}
            {/* Rewards */}
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-bold text-xl">Rewards</h3>
              {rewards.length > 0 ? rewards.map((reward, index) => (
                <RewardTierCard
                  key={index}
                  amount={reward.amount}
                  title={reward.title}
                  description={reward.description}
                  delivery={reward.delivery}
                  backers={reward.backers ?? 0}
                  available={reward.available ?? 999}
                  onSelect={() => {
                    setSelectedReward(reward as any);
                    setPledgeAmount(String(reward.amount));
                    setIsPledgeModalOpen(true);
                  }}
                />
              )) : (
                <p className="text-muted-foreground">No rewards available yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Related Projects */}
        <div className="mt-16">
          <RelatedProjects projects={relatedProjects} category={project?.category || ""} />

        </div>
      </div>

      <Footer />
      <PledgeModal
        open={isPledgeModalOpen}
        onOpenChange={setIsPledgeModalOpen}
        projectTitle={project?.title || ""}
        defaultAmount={pledgeAmount}
        selectedReward={selectedReward}
        projectId={project?.id}     // project id
        ownerId={ownerId}           // ✅ owner id from simple variable
        userId={user?.id}           // current logged in user
        userEmail={user?.email}
        userName={user?.name}
        userPhone={user?.phone}
      />
    </div>
  );
};

export default ProjectDetail;

