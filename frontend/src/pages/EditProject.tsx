import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

interface Reward {
  amount: string | number;
  title: string;
  description: string;
  delivery?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface Update {
  title: string;
  description: string;
  date: string;
}

// Mock project data
const mockProject = {
  title: "Revolutionary Smart Watch with Health Monitoring",
  tagline: "Track your health in real-time with AI-powered analytics",
  description: "Our device combines technology with elegant design to help you track health metrics.",
  category: "technology",
  location: "San Francisco, CA",
  fundingGoal: 50000,
  image: "https://example.com/image.jpg",
  videoUrl: "https://youtube.com/example",
  images: ["https://img1.jpg", "https://img2.jpg"],
  rewards: [
    { amount: 50, title: "Early Bird Special", description: "Get 40% off the retail price." },
    { amount: 99, title: "Super Early Bird", description: "Get 30% off the retail price." },
  ],
  faqs: [{ question: "Shipping?", answer: "Ships worldwide." }],
  updates: [{ title: "Prototype Ready", description: "Our prototype is ready for testing.", date: "2025-10-10" }],
};

const EditProject = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    tagline: "",
    description: "",
    category: "",
    location: "",
    fundingGoal: 0,
    image: "",
    videoUrl: "",
    images: [] as string[],
    rewards: [] as Reward[],
    faqs: [] as FAQ[],
    updates: [] as Update[],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to edit a project");
      navigate("/login");
      return;
    }
    // Load mock data
    setForm({
      title: mockProject.title,
      tagline: mockProject.tagline,
      description: mockProject.description,
      category: mockProject.category,
      location: mockProject.location,
      fundingGoal: mockProject.fundingGoal,
      image: mockProject.image,
      videoUrl: mockProject.videoUrl,
      images: mockProject.images,
      rewards: mockProject.rewards.map(r => ({ ...r, amount: r.amount.toString() })),
      faqs: mockProject.faqs,
      updates: mockProject.updates,
    });
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.tagline.trim()) newErrors.tagline = "Tagline is required.";
    if (!form.category) newErrors.category = "Category is required.";
    if (!form.location.trim()) newErrors.location = "Location is required.";
    if (form.fundingGoal <= 0) newErrors.fundingGoal = "Funding goal must be greater than 0.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reward handlers
  const addReward = () => setForm(prev => ({ ...prev, rewards: [...prev.rewards, { amount: "", title: "", description: "" }] }));
  const removeReward = (index: number) => setForm(prev => ({ ...prev, rewards: prev.rewards.filter((_, i) => i !== index) }));
  const handleRewardChange = (index: number, field: keyof Reward, value: string | number) => {
    const updated = [...form.rewards];
    (updated[index] as any)[field] = value;
    setForm({ ...form, rewards: updated });
  };

  // FAQ handlers
  const addFAQ = () => setForm(prev => ({ ...prev, faqs: [...prev.faqs, { question: "", answer: "" }] }));
  const removeFAQ = (index: number) => setForm(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }));
  const handleFAQChange = (index: number, field: keyof FAQ, value: string) => {
    const updated = [...form.faqs];
    updated[index][field] = value;
    setForm({ ...form, faqs: updated });
  };

  // Update handlers
  const addUpdate = () => setForm(prev => ({ ...prev, updates: [...prev.updates, { title: "", description: "", date: new Date().toISOString() }] }));
  const removeUpdate = (index: number) => setForm(prev => ({ ...prev, updates: prev.updates.filter((_, i) => i !== index) }));
  const handleUpdateChange = (index: number, field: keyof Update, value: string) => {
    const updated = [...form.updates];
    updated[index][field] = value;
    setForm({ ...form, updates: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    toast.success(`Project ${id} updated successfully!`);
    navigate(`/projects/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Edit Your Project</h1>
        <p className="text-muted-foreground mb-8">Update your campaign details, rewards, FAQs, and updates.</p>

        <form onSubmit={handleSubmit}>
          <Card className="space-y-6">
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input placeholder="Enter project title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                  {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input placeholder="Short project tagline" value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} />
                  {errors.tagline && <p className="text-red-600 text-sm">{errors.tagline}</p>}
                </div>
              </div>


              {/* Media */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Main Image URL</Label>
                  <Input placeholder="https://example.com/image.jpg" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
                </div>
                <div>
                  <Label>Video URL</Label>
                  <Input placeholder="YouTube or Vimeo URL" value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Gallery Images (comma-separated URLs)</Label>
                <Input placeholder="https://img1.jpg, https://img2.jpg" value={form.images.join(", ")} onChange={e => setForm({ ...form, images: e.target.value.split(",").map(s => s.trim()) })} />
              </div>

              {/* Category & Location */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                        <SelectItem value="Games">Games</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Film & Video">Film & Video</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Publishing">Publishing</SelectItem>
                        <SelectItem value="Food & Craft">Food & Craft</SelectItem>
                      </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-600 text-sm">{errors.category}</p>}
                </div>

                <div>
                  <Label>Location</Label>
                  <Input placeholder="City, Country" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                  {errors.location && <p className="text-red-600 text-sm">{errors.location}</p>}
                </div>
              </div>

              {/* Funding */}
              <div>
                <Label>Funding Goal ($)</Label>
                <Input type="number" placeholder="1000" value={form.fundingGoal} onChange={e => setForm({ ...form, fundingGoal: Number(e.target.value) })} />
                {errors.fundingGoal && <p className="text-red-600 text-sm">{errors.fundingGoal}</p>}
              </div>
              
              {/*Description*/}
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Describe your project" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

               {/* Rewards */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Rewards</h3>
                <Button type="button" variant="outline" onClick={addReward}>Add Reward</Button>
              </div>
              {errors.rewards && <p className="text-red-600 text-sm">{errors.rewards}</p>}
              {form.rewards.map((reward, i) => (
                <div key={i} className="border p-3 rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <strong>Reward #{i + 1}</strong>
                    <Button type="button" variant="destructive" onClick={() => removeReward(i)}>Remove</Button>
                  </div>
                  <Input placeholder="Reward Title" value={reward.title} onChange={(e) => handleRewardChange(i, "title", e.target.value)} />
                  <Input placeholder="Amount" type="number" value={reward.amount} onChange={(e) => handleRewardChange(i, "amount", Number(e.target.value))} />
                  <Input placeholder="Delivery Date" value={reward.delivery} onChange={(e) => handleRewardChange(i, "delivery", e.target.value)} />
                  <Textarea placeholder="Reward Description" value={reward.description} onChange={(e) => handleRewardChange(i, "description", e.target.value)} />
                </div>
              ))}
            </div>


               {/* FAQs */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">FAQs</h3>
                  <Button type="button" variant="outline" onClick={addFAQ}>Add FAQ</Button>
                </div>
                {form.faqs.map((faq, i) => (
                  <div key={i} className="border p-3 rounded-md space-y-2">
                    <div className="flex justify-between items-center">
                      <strong>FAQ #{i + 1}</strong>
                      <Button type="button" variant="destructive" onClick={() => removeFAQ(i)}>Remove</Button>
                    </div>
                    <Input placeholder="Question" value={faq.question} onChange={(e) => handleFAQChange(i, "question", e.target.value)} />
                    <Textarea placeholder="Answer" value={faq.answer} onChange={(e) => handleFAQChange(i, "answer", e.target.value)} />
                  </div>
                ))}
              </div>
    
              {/* Updates */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Updates</h3>
                  <Button type="button" variant="outline" onClick={addUpdate}>Add Update</Button>
                </div>
                {form.updates.map((update, i) => (
                  <div key={i} className="border p-3 rounded-md space-y-2">
                    <div className="flex justify-between items-center">
                      <strong>Update #{i + 1}</strong>
                      <Button type="button" variant="destructive" onClick={() => removeUpdate(i)}>Remove</Button>
                    </div>
                    <Input placeholder="Update Title" value={update.title} onChange={(e) => handleUpdateChange(i, "title", e.target.value)} />
                    <Textarea placeholder="Update Description" value={update.description} onChange={(e) => handleUpdateChange(i, "description", e.target.value)} />
                    <Input type="date" value={update.date.split("T")[0]} onChange={(e) => handleUpdateChange(i, "date", e.target.value)} />
                  </div>
                ))}
              </div>

              {/* Submit & Cancel */}
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate(`/projects/${id}`)}>Cancel</Button>
                <Button type="submit" className="bg-accent hover:bg-accent-hover">Update Project</Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditProject;
