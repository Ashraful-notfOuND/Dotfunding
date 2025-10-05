import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectHero from "@/components/ProjectHero";
import FundingStats from "@/components/FundingStats";
import ShareButtons from "@/components/ShareButtons";
import RewardTierCard from "@/components/RewardTierCard";
import CreatorCard from "@/components/CreatorCard";
import RelatedProjects from "@/components/RelatedProjects";
import PledgeModal from "@/components/PledgeModal";
import { useState } from "react";
import { useParams } from "react-router-dom";
import Campaign from "@/components/Campaign";
import FAQ from "@/components/FAQ";
import Updates from "@/components/Updates";
import Comments from "@/components/Comments";
import CreatorTab from "@/components/CreatorTab";
import StatisticsTab from "@/components/StatisticsTab";
import projectTech from "@/assets/project-tech.jpg";
import projectArt from "@/assets/project-art.jpg";
import projectGame from "@/assets/project-game.jpg";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const ProjectDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
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
    if (!customPledgeAmount || parseFloat(customPledgeAmount) < 1) {
      return;
    }
    setSelectedReward(null);
    setPledgeAmount(customPledgeAmount);
    setIsPledgeModalOpen(true);
  };

  // Mock project data
  const project = {
    id: id || "1",
    title: "Revolutionary Smart Watch with Health Monitoring",
    tagline: "Track your health in real-time with AI-powered analytics",
    creator: "TechInnovate",
    creatorEmail: "tamimdewan2003@gmail.com",
    creatorAvatar: "T",
    creatorBio: "Hardware innovators creating the future of health technology. Based in San Francisco with a team of 15 engineers and designers.",
    creatorLocation: "San Francisco, CA",
    images: [projectTech, projectArt, projectGame],
    fundingGoal: 50000,
    fundingCurrent: 42350,
    backers: 847,
    daysLeft: 12,
    category: "Technology",
    status: "trending" as const,
    description: `We're creating the next generation of smartwatches with advanced health monitoring capabilities. Our device combines cutting-edge technology with elegant design to help you track your health metrics in real-time.

Key Features:
• Advanced heart rate monitoring with AI-powered analytics
• Blood oxygen level tracking
• Sleep quality analysis with personalized recommendations
• Water resistance up to 50m
• 7-day battery life
• Premium materials and craftsmanship

Our team has over 20 years of combined experience in hardware design and health technology. We've already completed the prototype phase and are ready for manufacturing with your support.`,
    story: `The idea for this smartwatch came from our founder's personal experience. After a health scare, they realized the importance of continuous health monitoring. Existing solutions were either too expensive or lacked accuracy.

We spent two years researching and developing a solution that's both affordable and reliable. We partnered with leading health researchers and engineers to create something truly special.

Your support will help us:
• Complete final manufacturing tooling
• Produce the first batch of 5,000 units
• Establish quality control systems
• Build a customer support team`,
    risks: `While we've completed extensive prototyping and testing, manufacturing at scale always carries risks:

Manufacturing Challenges:
• Component sourcing delays could affect delivery timeline
• Quality control requires rigorous testing of each unit
• We're working with established manufacturers to minimize risks

Mitigation Strategy:
• 6-month buffer built into timeline
• Multiple supplier agreements in place
• Daily quality control testing
• Regular updates to keep backers informed`,
    rewards: [
      {
        amount: 50,
        title: "Early Bird Special",
        description: "Get 40% off the retail price. Limited to first 100 backers.",
        delivery: "March 2025",
        backers: 100,
        available: 0,
      },
      {
        amount: 99,
        title: "Super Early Bird",
        description: "Get 30% off the retail price. Includes premium strap.",
        delivery: "March 2025",
        backers: 250,
        available: 150,
      },
      {
        amount: 129,
        title: "Standard Package",
        description: "One smartwatch with standard accessories.",
        delivery: "April 2025",
        backers: 400,
        available: 600,
      },
      {
        amount: 249,
        title: "Duo Pack",
        description: "Two smartwatches for you and a friend. Save 20%.",
        delivery: "April 2025",
        backers: 97,
        available: 103,
      },
    ],
  };

  const relatedProjects = [
    {
      id: "2",
      title: "Eco-Friendly Water Bottle",
      creator: "GreenTech",
      image: projectArt,
      fundingGoal: 20000,
      fundingCurrent: 18500,
      backers: 423,
      daysLeft: 8,
      category: "Design",
    },
    {
      id: "3",
      title: "Indie Game: Crystal Quest",
      creator: "PixelForge",
      image: projectGame,
      fundingGoal: 75000,
      fundingCurrent: 45000,
      backers: 1205,
      daysLeft: 20,
      category: "Games",
    },
    {
      id: "4",
      title: "Smart Home Hub",
      creator: "HomeAI",
      image: projectTech,
      fundingGoal: 100000,
      fundingCurrent: 82000,
      backers: 967,
      daysLeft: 15,
      category: "Technology",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <ProjectHero
              title={project.title}
              creator={project.creator}
              tagline={project.tagline}
              images={project.images}
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
            {/* Funding Stats */}
            <FundingStats
              fundingCurrent={project.fundingCurrent}
              fundingGoal={project.fundingGoal}
              backers={project.backers}
              daysLeft={project.daysLeft}
            />

            {user && user.email === project.creatorEmail && (
              <div className="animate-fade-in mb-2">
                <Link to={`/project/${project.id}/edit`}>
                  <Button variant="outline" className="w-full">Edit Project</Button>
                </Link>
              </div>
            )}
            <div className="animate-fade-in">
              <Button 
                className="w-full bg-accent hover:bg-accent-hover" 
                size="lg"
                onClick={handlePledgeClick}
              >
                Back this project
              </Button>
            </div>

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
                    className="bg-primary hover:bg-primary-hover"
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
          <RelatedProjects projects={relatedProjects} />
        </div>
      </div>

      <Footer />

      {/* Pledge Modal */}
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
