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
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Campaign from "@/components/Campaign";
import FAQ from "@/components/FAQ";
import Updates from "@/components/Updates";
import Comments from "@/components/Comments";
import CreatorTab from "@/components/CreatorTab";
import StatisticsTab from "@/components/StatisticsTab";
import projectTech from "@/assets/project-tech.jpg";
import projectArt from "@/assets/project-art.jpg";
import projectGame from "@/assets/project-game.jpg";
import projectDesign from "@/assets/project-design.jpg";
import projectFilm from "@/assets/project-film.jpg";
import projectMusic from "@/assets/project-music.jpg";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const mockProjects = [
  {
    id: "1",
    title: "Revolutionary Smart Watch with Health Monitoring",
    tagline: "Track your health in real-time with AI-powered analytics",
    creator: "TechInnovate",
    creatorEmail: "tamimdewan2003@gmail.com",
    creatorAvatar: "T",
    creatorBio: "Hardware innovators creating the future of health technology. Based in San Francisco with a team of 15 engineers and designers.",
    creatorLocation: "San Francisco, CA",
    images: [projectTech, projectArt, projectGame],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Example YouTube embed URL
    fundingGoal: 50000,
    fundingCurrent: 42350,
    backers: 847,
    daysLeft: 12,
    category: "Technology",
    status: "trending" as const,
    description: `We're creating the next generation of smartwatches with advanced health monitoring capabilities. Our device combines cutting-edge technology with elegant design to help you track your health metrics in real-time.\n\nKey Features:\n• Advanced heart rate monitoring with AI-powered analytics\n• Blood oxygen level tracking\n• Sleep quality analysis with personalized recommendations\n• Water resistance up to 50m\n• 7-day battery life\n• Premium materials and craftsmanship\n\nOur team has over 20 years of combined experience in hardware design and health technology. We've already completed the prototype phase and are ready for manufacturing with your support.`,
    story: `The idea for this smartwatch came from our founder's personal experience. After a health scare, they realized the importance of continuous health monitoring. Existing solutions were either too expensive or lacked accuracy.\n\nWe spent two years researching and developing a solution that's both affordable and reliable. We partnered with leading health researchers and engineers to create something truly special.\n\nYour support will help us:\n• Complete final manufacturing tooling\n• Produce the first batch of 5,000 units\n• Establish quality control systems\n• Build a customer support team`,
    risks: `While we've completed extensive prototyping and testing, manufacturing at scale always carries risks:\n\nManufacturing Challenges:\n• Component sourcing delays could affect delivery timeline\n• Quality control requires rigorous testing of each unit\n• We're working with established manufacturers to minimize risks\n\nMitigation Strategy:\n• 6-month buffer built into timeline\n• Multiple supplier agreements in place\n• Daily quality control testing\n• Regular updates to keep backers informed`,
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
  },
  {
    id: "2",
    title: "Eco-Friendly Water Bottle",
    tagline: "Stay hydrated, save the planet.",
    creator: "GreenTech",
    creatorEmail: "other@example.com",
    creatorAvatar: "G",
    creatorBio: "Innovators in sustainable products.",
    creatorLocation: "Austin, TX",
    images: [projectArt, projectDesign],
    videoUrl: undefined, // No video for this project
    fundingGoal: 20000,
    fundingCurrent: 18500,
    backers: 423,
    daysLeft: 8,
    category: "Design",
    status: "nearly-funded" as const,
    description: `An innovative water bottle made from recycled materials.`, 
    story: `Our mission is to reduce plastic waste.`, 
    risks: `Production delays.`, 
    rewards: [
      {
        amount: 20,
        title: "Early Bird Bottle",
        description: "Get one bottle at a discount.",
        delivery: "June 2025",
        backers: 200,
        available: 50,
      },
    ],
  },
  {
    id: "3",
    title: "Indie Game: Crystal Quest",
    tagline: "A retro-inspired RPG adventure.",
    creator: "PixelForge",
    creatorEmail: "other@example.com",
    creatorAvatar: "P",
    creatorBio: "Passionate indie game developers.",
    creatorLocation: "Seattle, WA",
    images: [projectGame, projectTech],
    videoUrl: "https://www.youtube.com/embed/LXb3EKWsInQ", // Another example video
    fundingGoal: 75000,
    fundingCurrent: 45000,
    backers: 1205,
    daysLeft: 20,
    category: "Games",
    status: "trending" as const,
    description: `Embark on an epic journey in a pixel-art world.`, 
    story: `Inspired by classic 90s RPGs.`, 
    risks: `Development challenges.`, 
    rewards: [
      {
        amount: 25,
        title: "Digital Copy",
        description: "Get a digital copy of the game.",
        delivery: "July 2025",
        backers: 500,
        available: 0,
      },
    ],
  },
  {
    id: "4",
    title: "Sustainable Bamboo Home Furniture Collection",
    tagline: "Eco-friendly designs for your home.",
    creator: "EcoDesign Co.",
    creatorEmail: "other@example.com",
    creatorAvatar: "E",
    creatorBio: "Creating beautiful and sustainable products.",
    creatorLocation: "Portland, OR",
    images: [projectDesign, projectArt],
    videoUrl: undefined,
    fundingGoal: 25000,
    fundingCurrent: 12400,
    backers: 423,
    daysLeft: 20,
    category: "Design",
    status: "active" as const,
    description: `Our new collection of bamboo furniture combines modern aesthetics with environmental responsibility.`, 
    story: `We believe in a greener future.`, 
    risks: `Material sourcing.`, 
    rewards: [
      {
        amount: 100,
        title: "Bamboo Chair",
        description: "One beautifully crafted bamboo chair.",
        delivery: "August 2025",
        backers: 100,
        available: 20,
      },
    ],
  },
  {
    id: "5",
    title: "Independent Film: Stories from the City",
    tagline: "A raw look at urban life.",
    creator: "Urban Films",
    creatorEmail: "other@example.com",
    creatorAvatar: "U",
    creatorBio: "Capturing the essence of city living.",
    creatorLocation: "New York, NY",
    images: [projectFilm, projectMusic],
    videoUrl: undefined,
    fundingGoal: 45000,
    fundingCurrent: 31200,
    backers: 967,
    daysLeft: 18,
    category: "Film",
    status: "active" as const,
    description: `Our documentary explores the untold stories of individuals living in the heart of the city.`, 
    story: `Every street has a story.`, 
    risks: `Filming permits.`, 
    rewards: [
      {
        amount: 15,
        title: "Digital Download",
        description: "Get a digital copy of the film.",
        delivery: "September 2025",
        backers: 500,
        available: 100,
      },
    ],
  },
  {
    id: "6",
    title: "Album Recording: Jazz Fusion Experience",
    tagline: "A blend of classic jazz and modern fusion.",
    creator: "The Groove Collective",
    creatorEmail: "other@example.com",
    creatorAvatar: "G",
    creatorBio: "Pushing the boundaries of jazz music.",
    creatorLocation: "New Orleans, LA",
    images: [projectMusic, projectGame],
    videoUrl: undefined,
    fundingGoal: 20000,
    fundingCurrent: 8900,
    backers: 150,
    daysLeft: 25,
    category: "Music",
    status: "just-launched" as const,
    description: `Experience a unique blend of intricate melodies and powerful rhythms in our new jazz fusion album.`, 
    story: `Inspired by the legends.`, 
    risks: `Studio time.`, 
    rewards: [
      {
        amount: 10,
        title: "Digital Album",
        description: "Receive a digital download of the album.",
        delivery: "October 2025",
        backers: 100,
        available: 50,
      },
    ],
  },
];

const ProjectDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const project = mockProjects.find((p) => p.id === id);

  useEffect(() => {
    if (!project) {
      navigate("/404"); // Redirect to 404 if project not found
    }
  }, [project, navigate]);

  if (!project) {
    return null; // Or a loading spinner
  }

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
              videoUrl={project.videoUrl} // Pass the video URL
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