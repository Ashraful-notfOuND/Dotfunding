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
import { useNavigate } from "react-router-dom";

const CreateProject = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to create a project");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }
  const [rewardTiers, setRewardTiers] = useState([
    { amount: "", title: "", description: "" },
  ]);

  const addRewardTier = () => {
    setRewardTiers([...rewardTiers, { amount: "", title: "", description: "" }]);
  };

  const removeRewardTier = (index: number) => {
    setRewardTiers(rewardTiers.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Project created successfully! (Demo)");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Start Your Project</h1>
          <p className="text-muted-foreground">
            Turn your creative idea into reality with community support
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  placeholder="Give your project a clear, memorable title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you're creating and why it matters"
                  rows={6}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="art">Art</SelectItem>
                      <SelectItem value="games">Games</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="film">Film & Video</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="publishing">Publishing</SelectItem>
                      <SelectItem value="food">Food & Craft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="City, Country" required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funding Details */}
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>Funding Details</CardTitle>
              <CardDescription>Set your funding goal and timeline</CardDescription>
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
                      placeholder="0"
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    How much do you need to bring this project to life?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Campaign End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="deadline"
                      type="date"
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Campaigns typically run for 30-60 days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Media */}
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>Project Media</CardTitle>
              <CardDescription>Add images and videos to showcase your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Project Image</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-smooth cursor-pointer">
                  <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drop your main project image here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1920x1080px, JPG or PNG
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video">Project Video (Optional)</Label>
                <Input
                  id="video"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground">
                  Projects with videos raise 4x more funds on average
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Reward Tiers */}
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>Reward Tiers</CardTitle>
              <CardDescription>
                Create rewards for your backers at different pledge levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rewardTiers.map((tier, index) => (
                <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Reward Tier {index + 1}</h4>
                    {rewardTiers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRewardTier(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Pledge Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Reward Title</Label>
                      <Input placeholder="e.g., Early Bird Special" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Reward Description</Label>
                    <Textarea
                      placeholder="Describe what backers will receive"
                      rows={3}
                    />
                  </div>
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
            <Button type="button" variant="outline" size="lg">
              Save Draft
            </Button>
            <Button type="submit" size="lg" className="bg-accent hover:bg-accent-hover">
              Launch Project
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default CreateProject;
