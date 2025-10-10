import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

import { useAuth } from "@/hooks/useAuth";
import { allProjects } from "@/data/allProjects";

const ProjectDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  // Find project from allProjects
  const project = allProjects.find((p) => p.id === id);

  useEffect(() => {
    if (!project) navigate("/404");
  }, [project, navigate]);

  if (!project) return null;

  const [pledgeAmount, setPledgeAmount] = useState("");
  const [customPledgeAmount, setCustomPledgeAmount] = useState("");
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<{
    amount: number;
    title: string;
    description: string;
  } | null>(null);

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

  const relatedProjects = allProjects
  .filter((p) => p.category === project.category && p.id !== project.id)
  .map((p) => ({
    id: p.id,
    title: p.title,
    creator: p.creator,
    image: p.image,
    fundingGoal: p.fundingGoal,
    fundingCurrent: p.fundingCurrent,
    backers: p.backers,
    daysLeft: p.daysLeft,
    category: p.category,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ProjectHero
              title={project.title}
              creator={project.creator}
              tagline={project.tagline}
              images={project.images}
              videoUrl={project.videoUrl}
              status={project.status}
            />

            {/* Tabs */}
            <Tabs defaultValue="campaign" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="campaign">Campaign</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="creator">Creator</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="campaign" className="mt-6">
              <Campaign />
            </TabsContent>

            <TabsContent value="faq" className="mt-6">
              <FAQ />
            </TabsContent>

            <TabsContent value="creator" className="mt-6">
              <CreatorTab />
            </TabsContent>

            <TabsContent value="updates" className="mt-6">
              <Updates />
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <Comments />
            </TabsContent>

            <TabsContent value="statistics" className="mt-6">
              <StatisticsTab />
            </TabsContent>
          </Tabs>

          </div>

          {/* Sidebar */}
          <div className="lg:sticky top-24 space-y-6">
            <FundingStats
              fundingCurrent={project.fundingCurrent}
              fundingGoal={project.fundingGoal}
              backers={project.backers}
              daysLeft={project.daysLeft}
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
              onClick={handlePledgeClick}
            >
              Back this project
            </Button>

            <ShareButtons projectTitle={project.title} />

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
                    onClick={handleCustomPledge}
                    disabled={!customPledgeAmount || parseFloat(customPledgeAmount) < 1}
                    className="bg-accent hover:bg-accent-hover"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Rewards */}
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-bold text-xl">Rewards</h3>
              {project.rewards.map((reward, index) => (
                <RewardTierCard
                  key={index}
                  {...reward}
                  onSelect={() => handleRewardSelect(reward)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Related Projects */}
        <div className="mt-16">
          <RelatedProjects projects={relatedProjects} category={project.category} />

        </div>
      </div>

      <Footer />

      <PledgeModal
        open={isPledgeModalOpen}
        onOpenChange={setIsPledgeModalOpen}
        projectTitle={project.title}
        defaultAmount={pledgeAmount}
        selectedReward={selectedReward}
      />
    </div>
  );
};

export default ProjectDetail;
