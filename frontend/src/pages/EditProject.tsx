import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Reward {
  amount: string;
  title: string;
  description: string;
  delivery: Date | null;
  backers: number;
  available: number;
}

const formatDate_dd_mm_yyyy = (date: Date) => {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${d < 10 ? "0" + d : d}/${m < 10 ? "0" + m : m}/${y}`;
};

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [form, setForm] = useState<any>({
    title: "",
    tagline: "",
    image: "",
    images: [] as string[],
    fundingGoal: "",
    fundingDeadline: null as Date | null,
    category: "",
    location: "",
    description: "",
    rewards: [] as Reward[],
  });

  const [existingImages, setExistingImages] = useState<string[]>([]); // backend images
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]); // new images
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      navigate("/login", { replace: true });
      return;
    }

    fetch(`http://localhost:5000/api/projects/getEditProjectInfo/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          title: data.project.title,
          tagline: data.project.tagline,
          category: data.project.category,
          location: data.project.location,
          fundingGoal: data.project.funding_goal,
          fundingDeadline: data.project.funding_deadline ? new Date(data.project.funding_deadline) : null,
          image: data.project.image_url,
          images: data.campaignImages || [],
          description: data.campaignDescription || "",
          rewards: data.rewards || [],
        });
        setExistingImages(data.campaignImages || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, isAuthenticated, user, navigate]);

  if (loading) return <p>Loading...</p>;

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleRewardChange = (index: number, field: keyof Reward, value: any) => {
    const updated = [...(form.rewards || [])];
    updated[index][field] = value;
    setForm({ ...form, rewards: updated });
  };

  const handleAddReward = () => {
    setForm({
      ...form,
      rewards: [...(form.rewards || []), { amount: "", title: "", description: "", delivery: null, backers: 0, available: 0 }],
    });
  };

  const handleRemoveReward = (index: number) => {
    setForm({
      ...form,
      rewards: form.rewards.filter((_: any, i: number) => i !== index),
    });
  };

  const handleImageRemove = (index: number) => {
    const totalImages = [...existingImages, ...newGalleryFiles.map(f => URL.createObjectURL(f))];
    const removedImage = totalImages[index];

    // Remove from existingImages if present
    setExistingImages(prev => prev.filter(img => img !== removedImage));

    // Remove from newGalleryFiles if present
    setNewGalleryFiles(prev => prev.filter(f => URL.createObjectURL(f) !== removedImage));

    // Update form images
    handleChange("images", totalImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    if (!form.title.trim()) {
      toast({ description: "Title is required" });
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("tagline", form.tagline);
      formData.append("category", form.category);
      formData.append("location", form.location);
      formData.append("campaignDescription", form.description);
      formData.append("funding_deadline", form.fundingDeadline?.toISOString() || "");

      // Add newly uploaded files
      if (newGalleryFiles.length > 0) {
        newGalleryFiles.forEach(file => formData.append("gallery", file));
      }

      // Send existing images so backend preserves them
      formData.append("existingImages", JSON.stringify(existingImages));

      // Add rewards as JSON
      formData.append("rewards", JSON.stringify(form.rewards));

      const response = await fetch(`http://localhost:5000/api/projects/edit/${id}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        console.error(err);
        toast({ description: "Failed to update project" });
      } else {
        toast({ description: "Project updated successfully!" });
        navigate("/profile");
      }
    } catch (err) {
      console.error(err);
      toast({ description: "Network error" });
    }

    setSubmitting(false);
  };

  return (
    <Card className="max-w-4xl mx-auto my-10">
      <CardContent className="pt-6 space-y-6">
        <h2 className="text-3xl font-bold mb-4">Edit Project</h2>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title & Tagline */}
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input 
                value={form.title} 
                onChange={(e) => handleChange("title", e.target.value)} 
                disabled
              />
            </div>

            <div>
              <Label>Tagline</Label>
              <Input value={form.tagline} onChange={(e) => handleChange("tagline", e.target.value)} />
            </div>
          </div>

          {/* Main Image */}
          <div>
            <Label>Main Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onloadend = () => handleChange("image", reader.result);
                  reader.readAsDataURL(file);
                }
              }}
            />
            {form.image && <img src={form.image} alt="Main" className="w-full h-32 object-cover mt-2 rounded-md" />}
          </div>

          {/* Gallery */}
          <div>
            <Label>Gallery</Label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) {
                  const files = Array.from(e.target.files);
                  setNewGalleryFiles(prev => [...prev, ...files]);
                  const urls = files.map(f => URL.createObjectURL(f));
                  handleChange("images", [...form.images, ...urls]);
                }
              }}
            />
            <div className="grid grid-cols-3 gap-2 mt-2">
              {form.images.map((img: string, i: number) => (
                <div key={i} className="relative">
                  <img src={img} alt={`preview ${i}`} className="w-full h-32 object-cover rounded-md" />
                  <button type="button" onClick={() => handleImageRemove(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1">&times;</button>
                </div>
              ))}
            </div>
          </div>

          {/* Category & Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
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
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => handleChange("location", e.target.value)} />
            </div>
          </div>

          {/* Funding Goal */}
          <div>
            <Label>Funding Goal</Label>
            <Input
              value={form.fundingGoal}
              onChange={(e) => handleChange("fundingGoal", e.target.value)}
              disabled
            />
          </div>

          {/* Funding Deadline */}
          <div>
            <Label>Funding Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left font-normal"
                  disabled
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.fundingDeadline ? formatDate_dd_mm_yyyy(form.fundingDeadline) : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.fundingDeadline ?? undefined}
                  onSelect={(date) => handleChange("fundingDeadline", date ?? null)}
                  initialFocus
                  disabled
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div>
            <Label>Description / Story</Label>
            <Textarea rows={4} value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
          </div>

          {/* Rewards */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Rewards</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddReward}>Add Reward</Button>
            </div>
            {(form.rewards || []).map((reward: Reward, i: number) => (
              <div key={i} className="border p-3 rounded-md space-y-2">
                <div className="flex gap-2">
                  <Input placeholder="Title" value={reward.title} onChange={(e) => handleRewardChange(i, "title", e.target.value)} />
                  <Input placeholder="Amount" type="number" value={reward.amount} onChange={(e) => handleRewardChange(i, "amount", e.target.value)} />
                </div>
                <Textarea placeholder="Description" value={reward.description} onChange={(e) => handleRewardChange(i, "description", e.target.value)} />
                <div className="flex justify-between items-center">
                  <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveReward(i)}>Remove</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="w-full bg-primary" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/profile")}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditProject;
