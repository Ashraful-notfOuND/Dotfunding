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
import { Community } from "@/components/Community";
import { BackerOnboarding } from "@/components/BackerOnboarding";
import { CreatorDashboard } from "@/components/creator/CreatorDashboard";
import { CreatorOnly } from "@/components/RoleGate";
import ProjectMilestones from "@/components/ProjectMilestones";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useProjectRole } from "@/hooks/useProjectRole";

type Reward = {
  id: string;
  amount: number;
  title: string;
  description: string;
  delivery?: string;
  backers?: number;
  available?: number;
};

type ProjectStatus = 'LIVE' | 'ENDED_SUCCESS' | 'ENDED_FAILED';

type Project = {
  id: string;
  title: string;
  tagline?: string;
  creator?: string;
  creatorEmail?: string;
  images?: string[];
  videoUrl?: string | null;
  status?: ProjectStatus;
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
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('campaign');
  const [showCreatorDashboard, setShowCreatorDashboard] = useState(false);
  
  // Track selected reward IDs from database (if exists = payment successful)
  const [selectedRewardIds, setSelectedRewardIds] = useState<string[]>([]);

  // Role-based access control
  const projectRole = useProjectRole(ownerId, false);

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

      const projectData = (data && data.project) ? data.project : data;
      const isCreator = user?.id === (data?.project?.user_id || null);
      if (isCreator && projectData?.status && ['ENDED_SUCCESS', 'ENDED_FAILED'].includes(projectData.status)) {
        if (!projectData.outcome_acknowledged) {
          navigate(`/project/${id}/outcome`, { state: { project: projectData } });
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("Error fetching project:", err);
      setError(err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, user]);

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
    if (!project) return;
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

  // Fetch user's selected rewards - if exists in table, payment was successful
  useEffect(() => {
    if (!user?.id || !id) return;

    const fetchSelectedRewards = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/projects/${id}/rewards/selected?userId=${user.id}`
        );
        
        if (res.ok) {
          const data = await res.json();
          setSelectedRewardIds(data.selected || []);
        }
      } catch (err) {
        console.error("Failed to fetch selected rewards:", err);
      }
    };

    fetchSelectedRewards();
  }, [user?.id, id]);

  // React to payment redirect params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("payment_status");
    const tran = params.get("tran_id");

    if (status) {
      const handlePaymentSuccess = async () => {
        if (status === "success") {
          toast({ title: "Payment successful", description: `Transaction ${tran} completed.` });

          // Retrieve from localStorage
          const savedRewardId = localStorage.getItem("pendingRewardId");
          const savedProjectId = localStorage.getItem("pendingProjectId");

          if (savedRewardId && user?.id && savedProjectId) {
            try {
              const response = await fetch(
                `http://localhost:5000/api/projects/${savedProjectId}/rewards/${savedRewardId}/save`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId: user.id }),
                }
              );
              
              if (response.ok) {
                setSelectedRewardIds(prev => [...prev, savedRewardId]);
                // Clean up
                localStorage.removeItem("pendingRewardId");
                localStorage.removeItem("pendingProjectId");
              }
            } catch (err) {
              console.error("Failed to save reward:", err);
            }
          }

          fetchProject();
          setTimeout(() => setShowOnboarding(true), 1000);
        } else if (status === "failed") {
          toast({ title: "Payment failed", variant: "destructive" });
          localStorage.removeItem("pendingRewardId");
          localStorage.removeItem("pendingProjectId");
        }

        const clean = window.location.pathname;
        navigate(clean, { replace: true });
      };

      handlePaymentSuccess();
    }
  }, [location.search, navigate, toast, fetchProject, user?.id]);

  // Handle reward selection/deselection
  const handleRewardToggle = async (reward: Reward) => {
    if (!user?.id) {
      toast({ 
        title: "Please log in", 
        description: "You must be logged in to manage rewards",
        variant: "destructive"
      });
      return;
    }

    // Check if this reward is already selected
    const isAlreadySelected = selectedRewardIds.includes(reward.id);

    if (isAlreadySelected) {
      // User wants to deselect this paid reward
      try {
        const res = await fetch(
          `http://localhost:5000/api/projects/${id}/rewards/${reward.id}/deselect`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              userId: user.id,
              rewardId: reward.id
            }),
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to deselect reward");
        }

        // Remove from array
        setSelectedRewardIds(prev => prev.filter(id => id !== reward.id));
        
        toast({ 
          title: "Reward deselected", 
          description: "Your reward selection has been removed successfully."
        });

        // Refresh project stats (to update backer counts)
        fetchProject();
        
      } catch (err) {
        console.error("Error deselecting reward:", err);
        toast({ 
          title: "Error", 
          description: err instanceof Error ? err.message : "Failed to deselect reward",
          variant: "destructive" 
        });
      }
    } else {
      // User wants to select a new reward - proceed to payment
      setSelectedReward(reward);
      setPledgeAmount(String(reward.amount));
      
      // Persist to localStorage so it survives the redirect
      localStorage.setItem("pendingRewardId", reward.id);
      localStorage.setItem("pendingProjectId", id || "");
      
      setIsPledgeModalOpen(true);
    }
  };

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

  const relatedProjects: any[] = [];

  const heroImages: string[] =
    (project.images && project.images.length > 0)
      ? project.images
      : project.image_urls
        ? [project.image_urls]
        : [];

  const getHeroStatus = () => {
    if (project.status === 'ENDED_SUCCESS') return 'ended-success';
    if (project.status === 'ENDED_FAILED') return 'ended-failed';
    if (project.status === 'LIVE') return 'active';
    return 'active';
  };
  const heroStatus = getHeroStatus();

  const heroCreator = project.creator || "Unknown Creator";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        showAnalyticsButton={projectRole.isCreator}
        showingAnalytics={showCreatorDashboard}
        onAnalyticsClick={() => setShowCreatorDashboard(prev => !prev)}
      />

      {showCreatorDashboard && (
        <CreatorOnly currentRole={projectRole.role}>
          <div className="w-full bg-background border-b">
            <div className="container mx-auto px-4 py-6">
              <CreatorDashboard 
                projectId={project.id}
                creatorId={user?.id || ''}
                projectTitle={project.title}
              />
            </div>
          </div>
        </CreatorOnly>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ProjectHero
              title={project?.title || "Untitled Project"}
              creator={heroCreator}
              tagline={project?.tagline || ""}
              images={heroImages}
              videoUrl={project?.videoUrl}
              status={heroStatus}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="campaign">Campaign</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
                <TabsTrigger value="creator">Creator</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="milestones" className="relative">
                  Milestones
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="campaign" className="mt-6">
                <Campaign projectId={project.id} />
              </TabsContent>

              <TabsContent value="faq" className="mt-6">
                <FAQ
                  projectId={project.id}
                  isOwner={user?.email === project.creatorEmail}
                />
              </TabsContent>

              <TabsContent value="creator" className="mt-6">
                <CreatorTab projectId={project.id} />
              </TabsContent>

              <TabsContent value="updates" className="mt-6">
                <Updates 
                  currentUser={user} 
                  ownerEmail={project.creatorEmail} 
                  projectId={project.id} 
                />
              </TabsContent>

              <TabsContent value="milestones" className="mt-6">
                <ProjectMilestones 
                  projectId={project.id}
                  isCreator={user?.email === project.creatorEmail}
                />
              </TabsContent>

              <TabsContent value="community" className="mt-6">
                <Community 
                  projectId={project.id}
                  projectCreatorId={ownerId || ''}
                />
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                {/* Pass the project.id as a prop */}
                <Comments projectId={project.id} />
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

            {project.status && project.status !== 'LIVE' && (
              <Card className="border-2 animate-fade-in" style={{
                borderColor: project.status === 'ENDED_SUCCESS' ? 'rgb(34 197 94)' : 'rgb(239 68 68)'
              }}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {project.status === 'ENDED_SUCCESS' ? '🎉' : '⏰'}
                    </div>
                    <h3 className="font-bold text-lg mb-1">
                      {project.status === 'ENDED_SUCCESS' ? 'Successfully Funded!' : 'Campaign Ended'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {project.status === 'ENDED_SUCCESS' 
                        ? `This project reached its funding goal of ৳${project.fundingGoal?.toLocaleString() || 0}` 
                        : `This project did not reach its funding goal and is no longer accepting pledges.`
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {user && user.email === project.creatorEmail && (
              <div className="animate-fade-in mb-2">
                <Link to={`/project/${project.id}/edit`}>
                  <Button variant="outline" className="w-full">
                    Edit Project
                  </Button>
                </Link>
              </div>
            )}

            {user?.isAdmin ? (
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center animate-fade-in">
                <p className="text-gray-700 font-medium">Admins cannot back projects</p>
                <p className="text-gray-500 text-sm mt-1">You can only moderate and manage projects</p>
              </div>
            ) : project.status === 'LIVE' ? (
<Card className="border-2 border-primary/20 animate-fade-in">
  <CardHeader>
    <CardTitle className="text-lg flex items-center gap-2">
      {/* <Heart className="h-5 w-5 text-primary" /> */}
      Pledge Without A Reward
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    <p className="text-sm text-muted-foreground">
      Support this project by backing it. You won't receive a reward, but you'll help bring this project to life.
    </p>

    <Button
      className="w-full bg-accent hover:bg-accent-hover"
      size="lg"
      onClick={() => {
        setSelectedReward(null); // no reward selected
        setIsPledgeModalOpen(true); // open the pledge modal
      }}
    >
      Back this project
    </Button>
  </CardContent>
</Card>

            ) : (
              <Button
                className="w-full animate-fade-in"
                size="lg"
                disabled
                variant="secondary"
              >
                {project.status === 'ENDED_SUCCESS' ? '✓ Funding Successful' : project.status === 'ENDED_FAILED' ? '✗ Funding Closed' : 'Funding Closed'}
              </Button>
            )}

            <ShareButtons projectTitle={project.title} />

            {/* <ProjectDonations projectId={project.id} /> */}

            {/* <Card className="border-2 border-primary/20 animate-fade-in">
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
            </Card> */}

            {/* Rewards with multiple selection support */}
            {!user?.isAdmin && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-bold text-xl">Rewards</h3>
                {rewards.length > 0 ? rewards.map((reward) => (
                  <RewardTierCard
                    key={reward.id}
                    amount={reward.amount}
                    title={reward.title}
                    description={reward.description}
                    delivery={reward.delivery}
                    backers={reward.backers ?? 0}
                    available={reward.available ?? 999}
                    isSelected={selectedRewardIds.includes(reward.id)}
                    onSelect={() => handleRewardToggle(reward)}
                  />
                )) : (
                  <p className="text-muted-foreground">No rewards available yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

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
        projectId={project?.id}
        ownerId={ownerId}
        userId={user?.id}
        userEmail={user?.email}
        userName={user?.name}
        userPhone={user?.phone}
      />

      <BackerOnboarding
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        projectTitle={project?.title || ""}
        onGoToCommunity={() => setActiveTab('community')}
        onGoToReviews={() => setActiveTab('reviews')}
      />
    </div>
  );
};

export default ProjectDetail;