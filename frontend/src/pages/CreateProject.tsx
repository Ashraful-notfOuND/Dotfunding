import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, DollarSign, Image, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const CreateProject = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to create a project");
      navigate("/login", { state: { from: location } });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [rewardTiers, setRewardTiers] = useState([
    { amount: "", title: "", description: "" },
  ]);

  const addRewardTier = () => {
    setRewardTiers([...rewardTiers, { amount: "", title: "", description: "" }]);
  };

  const removeRewardTier = (index: number) => {
    setRewardTiers(rewardTiers.filter((_, i) => i !== index));
  };

  const handleRewardChange = (index: number, field: string, value: string) => {
    const updatedTiers = [...rewardTiers];
    updatedTiers[index][field] = value;
    setRewardTiers(updatedTiers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error("Please upload a project image.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", user?.id);
    formData.append("title", (document.getElementById("title") as HTMLInputElement).value);
    formData.append("description", (document.getElementById("description") as HTMLTextAreaElement).value);
    formData.append("category", category);
    formData.append("location", (document.getElementById("location") as HTMLInputElement).value);
    formData.append("funding_goal", (document.getElementById("goal") as HTMLInputElement).value);
    formData.append("deadline", (document.getElementById("deadline") as HTMLInputElement).value);
    formData.append("video_url", (document.getElementById("video") as HTMLInputElement)?.value || "");
    formData.append("image", imageFile);
    formData.append("reward_tiers", JSON.stringify(rewardTiers));

    try {
      const res = await fetch("http://localhost:5000/api/projects/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Project created successfully!");
        navigate("/");
      } else {
        toast.error(data.error || "Failed to create project");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again later.");
    }
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
                  <Select onValueChange={(val) => setCategory(val)} required>
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
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Funding Goal (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="goal" type="number" placeholder="0" className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Campaign End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="deadline" type="date" className="pl-10" required />
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
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video">Project Video (Optional)</Label>
                <Input id="video" type="url" placeholder="https://youtube.com/watch?v=..." />
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
                          value={tier.amount}
                          onChange={(e) => handleRewardChange(index, "amount", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Reward Title</Label>
                      <Input
                        placeholder="e.g., Early Bird Special"
                        value={tier.title}
                        onChange={(e) => handleRewardChange(index, "title", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Reward Description</Label>
                    <Textarea
                      placeholder="Describe what backers will receive"
                      rows={3}
                      value={tier.description}
                      onChange={(e) =>
                        handleRewardChange(index, "description", e.target.value)
                      }
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
