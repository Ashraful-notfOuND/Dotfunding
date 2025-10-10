import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Calendar, DollarSign, Plus, X } from "lucide-react";

// TipTap imports
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Node } from "@tiptap/core";

// Video Node (not used for preview, just kept if you want to embed later)
const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return { src: { default: null } };
  },
  parseHTML() {
    return [{ tag: "iframe[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      {
        ...HTMLAttributes,
        width: "100%",
        height: "315",
        frameBorder: "0",
        allow:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowFullScreen: "true",
      },
    ];
  },
});

// TipTap Editor
const CampaignDetailsEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit.configure({ codeBlock: true }), Link, Image, VideoEmbed],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return <EditorContent editor={editor} className="border rounded-lg p-3 min-h-[200px]" />;
};

const CreateProject = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form state
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("");
  const [locationField, setLocationField] = useState("");
  const [fundingGoal, setFundingGoal] = useState<number | "">("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [campaignDetails, setCampaignDetails] = useState("");
  const [rewardTiers, setRewardTiers] = useState([{ amount: "", title: "", description: "", delivery: "", backers: 0, available: 0 }]);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [updates, setUpdates] = useState([{ title: "", description: "", date: "" }]);
  const [additionalLink, setAdditionalLink] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to create a project");
      navigate("/login", { state: { from: location } });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  // Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImageFiles([...imageFiles, ...Array.from(e.target.files)]);
  };
  const handleRewardChange = (index: number, field: string, value: string | number) => {
    const updated = [...rewardTiers];
    updated[index][field] = value;
    setRewardTiers(updated);
  };
  const addRewardTier = () =>
    setRewardTiers([...rewardTiers, { amount: "", title: "", description: "", delivery: "", backers: 0, available: 0 }]);
  const removeRewardTier = (index: number) => setRewardTiers(rewardTiers.filter((_, i) => i !== index));

  const handleFaqChange = (index: number, field: string, value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };
  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));

  const handleUpdateChange = (index: number, field: string, value: string) => {
    const updated = [...updates];
    updated[index][field] = value;
    setUpdates(updated);
  };
  const addUpdate = () => setUpdates([...updates, { title: "", description: "", date: "" }]);
  const removeUpdate = (index: number) => setUpdates(updates.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }
    const formData = new FormData();
    formData.append("user_id", user?.id);
    formData.append("title", title);
    formData.append("tagline", tagline);
    formData.append("category", category);
    formData.append("location", locationField);
    formData.append("fundingGoal", fundingGoal.toString());
    formData.append("deadline", deadline);
    formData.append("description", description);
    formData.append("campaignDetails", campaignDetails);
    formData.append("rewardTiers", JSON.stringify(rewardTiers));
    formData.append("faqs", JSON.stringify(faqs));
    formData.append("updates", JSON.stringify(updates));
    imageFiles.forEach((file) => formData.append("images", file));
    if (mainImage) formData.append("image", mainImage);

    try {
      const res = await fetch("http://localhost:5000/api/projects/create", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        toast.success("Project created successfully!");
        navigate("/");
      } else toast.error(data.error || "Failed to create project");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Start Your Project</h1>
        <p className="text-muted-foreground mb-6">Turn your creative idea into reality with community support</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Project Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Input placeholder="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} required />
              <Textarea placeholder="Short Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <div className="grid md:grid-cols-2 gap-4">
                <Select onValueChange={setCategory} required>
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
                <Input placeholder="Location" value={locationField} onChange={(e) => setLocationField(e.target.value)} required />
              </div>
            </CardContent>
          </Card>

          {/* Funding */}
          <Card>
            <CardHeader><CardTitle>Funding Details</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="number" className="pl-10" placeholder="Funding Goal" value={fundingGoal} onChange={(e) => setFundingGoal(Number(e.target.value))} required />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="date" className="pl-10" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader><CardTitle>Project Media</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input type="file" accept="image/*" onChange={(e) => setMainImage(e.target.files?.[0] || null)} required />
              <Input type="file" accept="image/*" multiple onChange={handleImageChange} />
            </CardContent>
          </Card>

          {/* Reward Tiers */}
          <Card>
            <CardHeader><CardTitle>Reward Tiers</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {rewardTiers.map((tier, idx) => (
                <div key={idx} className="p-4 border rounded space-y-2">
                  <div className="flex justify-between items-center">
                    <h4>Reward {idx + 1}</h4>
                    {rewardTiers.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeRewardTier(idx)}><X className="h-4 w-4" /></Button>}
                  </div>
                  <Input placeholder="Title" value={tier.title} onChange={(e) => handleRewardChange(idx, "title", e.target.value)} />
                  <Input placeholder="Amount" type="number" value={tier.amount} onChange={(e) => handleRewardChange(idx, "amount", Number(e.target.value))} />
                  <Input placeholder="Delivery Info" value={tier.delivery} onChange={(e) => handleRewardChange(idx, "delivery", e.target.value)} />
                  <Textarea placeholder="Description" rows={2} value={tier.description} onChange={(e) => handleRewardChange(idx, "description", e.target.value)} />
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={addRewardTier}><Plus className="mr-2" />Add Reward Tier</Button>
            </CardContent>
          </Card>

          {/* Campaign Details */}
          <Card>
            <CardHeader><CardTitle>Campaign Details / Story</CardTitle></CardHeader>
            <CardContent>
              <CampaignDetailsEditor value={campaignDetails} onChange={setCampaignDetails} />
            </CardContent>
          </Card>

          {/* Additional Hyperlink */}
          <Card>
            <CardHeader><CardTitle>Additional Hyperlink</CardTitle></CardHeader>
            <CardContent>
              <Input
                placeholder="Additional Hyperlink"
                value={additionalLink}
                onChange={(e) => setAdditionalLink(e.target.value)}
              />
              {isValidUrl(additionalLink) && (
                <a
                  href={additionalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline mt-2 block"
                >
                  {additionalLink}
                </a>
              )}
            </CardContent>
          </Card>

          {/* FAQs */}
          <Card>
            <CardHeader><CardTitle>FAQs</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-4 border rounded space-y-2">
                  <div className="flex justify-between items-center">
                    <h4>FAQ {idx + 1}</h4>
                    {faqs.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeFaq(idx)}><X className="h-4 w-4" /></Button>}
                  </div>
                  <Input placeholder="Question" value={faq.question} onChange={(e) => handleFaqChange(idx, "question", e.target.value)} />
                  <Textarea placeholder="Answer" rows={2} value={faq.answer} onChange={(e) => handleFaqChange(idx, "answer", e.target.value)} />
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={addFaq}><Plus className="mr-2" />Add FAQ</Button>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {updates.map((update, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <h4>Update {index + 1}</h4>
                    {updates.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeUpdate(index)}><X className="h-4 w-4" /></Button>}
                  </div>
                  <Input placeholder="Title" value={update.title} onChange={e => handleUpdateChange(index, "title", e.target.value)} />
                  <Textarea placeholder="Description" rows={2} value={update.description} onChange={e => handleUpdateChange(index, "description", e.target.value)} />
                  <Input type="date" value={update.date} onChange={e => handleUpdateChange(index, "date", e.target.value)} />
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={addUpdate}><Plus className="h-4 w-4 mr-2" /> Add Update</Button>
            </CardContent>
          </Card>

          {/* Submit / Cancel */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" size="lg" onClick={() => navigate("/")}>
              Cancel
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
