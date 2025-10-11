import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Reward {
  amount: number;
  title: string;
  description: string;
  delivery: string;
  backers: number;
  available: number;
}

interface Update {
  title: string;
  description: string;
  date: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const CreateProject = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    tagline: "",
    image: "",
    images: [] as string[],
    videoUrl: "",
    fundingGoal: 0,
    category: "",
    location: "",
    staffPick: false,
    description: "",
    rewards: [] as Reward[],
    faqs: [] as FAQ[],
    updates: [] as Update[],
    createdDate: new Date(),
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.tagline.trim()) newErrors.tagline = "Tagline is required.";
    if (form.fundingGoal <= 0) newErrors.fundingGoal = "Funding goal must be greater than 0.";
    if (form.rewards.length === 0) newErrors.rewards = "At least one reward is required.";
    if (!form.category) newErrors.category = "Category is required.";
    if (!form.location.trim()) newErrors.location = "Location is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addReward = () =>
    setForm((prev) => ({
      ...prev,
      rewards: [...prev.rewards, { amount: 0, title: "", description: "", delivery: "", backers: 0, available: 0 }],
    }));

  const removeReward = (index: number) =>
    setForm((prev) => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index),
    }));

  const handleRewardChange = (index: number, field: keyof Reward, value: string | number) => {
    const updated = [...form.rewards];
    (updated[index] as any)[field] = value;
    setForm({ ...form, rewards: updated });
  };

  const addFAQ = () =>
    setForm((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));

  const removeFAQ = (index: number) =>
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));

  const handleFAQChange = (index: number, field: keyof FAQ, value: string) => {
    const updated = [...form.faqs];
    updated[index][field] = value;
    setForm({ ...form, faqs: updated });
  };

  const addUpdate = () =>
    setForm((prev) => ({
      ...prev,
      updates: [...prev.updates, { title: "", description: "", date: new Date().toISOString() }],
    }));

  const removeUpdate = (index: number) =>
    setForm((prev) => ({
      ...prev,
      updates: prev.updates.filter((_, i) => i !== index),
    }));

  const handleUpdateChange = (index: number, field: keyof Update, value: string) => {
    const updated = [...form.updates];
    updated[index][field] = value;
    setForm({ ...form, updates: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    console.log("Project Created:", form);
  };

  return (
    <Card className="max-w-4xl mx-auto my-10">
      <CardContent className="pt-6 space-y-6">
        <h2 className="text-3xl font-bold mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input placeholder="Enter project title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
            </div>
            <div>
              <Label>Tagline</Label>
              <Input placeholder="Short project tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
              {errors.tagline && <p className="text-red-600 text-sm">{errors.tagline}</p>}
            </div>
          </div>

          {/* Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Main Image URL</Label>
              <Input placeholder="https://example.com/image.jpg" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </div>
            <div>
              <Label>Video URL</Label>
              <Input placeholder="YouTube or Vimeo URL" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Gallery Images (comma-separated URLs)</Label>
            <Input placeholder="https://img1.jpg, https://img2.jpg" value={form.images.join(", ")} onChange={(e) => setForm({ ...form, images: e.target.value.split(",").map(s => s.trim()) })} />
          </div>

          {/* Category & Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })} required>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
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
              {errors.category && <p className="text-red-600 text-sm">{errors.category}</p>}
            </div>
            <div>
              <Label>Location</Label>
              <Input placeholder="City, Country" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              {errors.location && <p className="text-red-600 text-sm">{errors.location}</p>}
            </div>
          </div>

          {/* Funding */}
          <div>
            <Label>Funding Goal ($)</Label>
            <Input placeholder="1000" type="number" value={form.fundingGoal} onChange={(e) => setForm({ ...form, fundingGoal: Number(e.target.value) })} />
            {errors.fundingGoal && <p className="text-red-600 text-sm">{errors.fundingGoal}</p>}
          </div>

          {/* Description */}
          <div>
            <Label>Description / Story</Label>
            <Textarea placeholder="Write about your campaign story" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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

          {/* Submit & Cancel */}
          <div className="flex gap-3">
            <Button type="submit" className="w-full bg-primary">Create Project</Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/explore")}>
              Cancel
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
};

export default CreateProject;
