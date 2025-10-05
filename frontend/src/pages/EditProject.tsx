import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, DollarSign, Image, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";

// Mock project data - in a real app, you'd fetch this from an API
const mockProject = {
  title: "Revolutionary Smart Watch with Health Monitoring",
  description: `We're creating the next generation of smartwatches with advanced health monitoring capabilities. Our device combines cutting-edge technology with elegant design to help you track your health metrics in real-time.`,
  category: "technology",
  location: "San Francisco, CA",
  fundingGoal: 50000,
  deadline: "2025-12-15",
  rewards: [
    { amount: 50, title: "Early Bird Special", description: "Get 40% off the retail price." },
    { amount: 99, title: "Super Early Bird", description: "Get 30% off the retail price." },
  ],
};

const EditProject = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [fundingGoal, setFundingGoal] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [rewardTiers, setRewardTiers] = useState([{ amount: "", title: "", description: "" }]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to edit a project");
      navigate("/login");
      return;
    }
    // In a real app, you would fetch project data using the `id`
    // For this demo, we'll use mock data.
    toast.info(`Loading project ${id} for editing...`);
    setTitle(mockProject.title);
    setDescription(mockProject.description);
    setCategory(mockProject.category);
    setLocation(mockProject.location);
    setFundingGoal(mockProject.fundingGoal);
    setDeadline(mockProject.deadline);
    setRewardTiers(mockProject.rewards.map(r => ({...r, amount: r.amount.toString() })));

  }, [isAuthenticated, navigate, id]);

  if (!isAuthenticated) {
    return null;
  }

  const addRewardTier = () => {
    setRewardTiers([...rewardTiers, { amount: "", title: "", description: "" }]);
  };

  const removeRewardTier = (index: number) => {
    setRewardTiers(rewardTiers.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Project ${id} updated successfully! (Demo)`);
    navigate(`/projects/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Edit Your Project</h1>
          <p className="text-muted-foreground">
            Make changes to your campaign details, rewards, and more.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select required value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="art">Art</SelectItem>
                      <SelectItem value="games">Games</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funding Details */}
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>Funding Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Funding Goal (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="goal"
                      type="number"
                      value={fundingGoal}
                      onChange={(e) => setFundingGoal(Number(e.target.value))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Campaign End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reward Tiers */}
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>Reward Tiers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rewardTiers.map((tier, index) => (
                <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                  {/* ... existing reward tier form fields ... */}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addRewardTier}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Reward Tier
              </Button>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" size="lg" onClick={() => navigate(`/projects/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" size="lg" className="bg-accent hover:bg-accent-hover">
              Update Project
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default EditProject;
