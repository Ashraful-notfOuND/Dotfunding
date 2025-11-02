import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
// Reward now uses string for amount
interface Reward {
  amount: string;
  title: string;
  description: string;
  delivery: Date | null; 
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

// util to format date as dd/mm/yyyy
function formatDate_dd_mm_yyyy(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const dd = day < 10 ? `0${day}` : `${day}`;
  const mm = month < 10 ? `0${month}` : `${month}`;
  return `${dd}/${mm}/${year}`;
}

const CreateProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  console.log("current user:", user?.id, user?.email);

  const [form, setForm] = useState({
    title: "",
    tagline: "",
    image: "",
    images: [] as string[],
    videoUrl: "",
    fundingGoal: "", // string type now
    fundingDeadline: null as Date | null,
    category: "",
    location: "",
    staffPick: false,
    description: "",
    rewards: [] as Reward[],
    faqs: [] as FAQ[],
    updates: [] as Update[],
    createdDate: new Date(),
  });

  // ✅ ADD THIS: Store actual File objects for gallery images
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);


  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.tagline.trim()) newErrors.tagline = "Tagline is required.";

    // Validate fundingGoal: must be non-empty string, numeric, > 0
    const goalNum = Number(form.fundingGoal);
    if (
      form.fundingGoal.trim() === "" ||
      isNaN(goalNum) ||
      goalNum <= 0
    ) {
      newErrors.fundingGoal = "Funding goal must be greater than 0.";
    }

    if (!form.fundingDeadline) newErrors.fundingDeadline = "Funding deadline is required.";

    if (form.rewards.length === 0) {
      newErrors.rewards = "At least one reward is required.";
    } else {
      // Validate each reward amount
      form.rewards.forEach((r, i) => {
        const amt = Number(r.amount);
        if (r.amount.trim() === "" || isNaN(amt) || amt < 0) {
          newErrors[`reward_amount_${i}`] = `Reward #${i + 1} amount must be >= 0.`;
        }
        if (!r.title.trim()) {
          newErrors[`reward_title_${i}`] = `Reward #${i + 1} title is required.`;
        }
      });
    }

    if (!form.category) newErrors.category = "Category is required.";
    if (!form.location.trim()) newErrors.location = "Location is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addReward = () =>
    setForm((prev) => ({
      ...prev,
      rewards: [
        ...prev.rewards,
        {
          amount: "", // blank by default
          title: "",
          description: "",
          delivery: null, // ✅ null by default
          backers: 0,
          available: 0,
        },
      ],
    }));

  const removeReward = (index: number) =>
    setForm((prev) => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index),
    }));

  const handleRewardChange = (
    index: number,
    field: keyof Reward,
    value: string | Date | null
  ) => {
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

  const handleFAQChange = (
    index: number,
    field: keyof FAQ,
    value: string
  ) => {
    const updated = [...form.faqs];
    updated[index][field] = value;
    setForm({ ...form, faqs: updated });
  };

  const addUpdate = () =>
    setForm((prev) => ({
      ...prev,
      updates: [
        ...prev.updates,
        { title: "", description: "", date: new Date().toISOString() },
      ],
    }));

  const removeUpdate = (index: number) =>
    setForm((prev) => ({
      ...prev,
      updates: prev.updates.filter((_, i) => i !== index),
    }));

  const handleUpdateChange = (
    index: number,
    field: keyof Update,
    value: string
  ) => {
    const updated = [...form.updates];
    updated[index][field] = value;
    setForm({ ...form, updates: updated });
  };

  // ✅ UPDATED: Store both File objects and preview URLs
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      
      // Store actual File objects
      setGalleryFiles(prev => [...prev, ...filesArray]);
      
      // Create preview URLs for display
      const newImages = filesArray.map((file) =>
        URL.createObjectURL(file)
      );
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    }
  };

  // ✅ UPDATED: Remove from both arrays
  const handleImageRemove = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (submitting) return; // prevent multiple clicks
  setSubmitting(true);

  if (!form.image) {
    toast({ description: "Please upload a main project image!" });
    setSubmitting(false);
    return;
  }
  if(!form.images || form.images.length === 0) {
    toast({ description: "Please upload at least one gallery image!" });
    setSubmitting(false);
    return;
  }

  if (!validateForm()) {
    setSubmitting(false);
    return;
  }

  if (!user) {
    console.error("No logged-in user found");
    return;
  }

  const goalNum = Number(form.fundingGoal);
  const deadlineStr = form.fundingDeadline
    ? form.fundingDeadline.toISOString().split("T")[0]
    : "";

  const formData = new FormData();
  const formDataCampaign = new FormData();
  formData.append("user_id", user.id); // 👈 send user id
  formData.append("title", form.title);
  formData.append("tagline", form.tagline);
  formData.append("funding_goal", goalNum.toString());
  formData.append("funding_deadline", deadlineStr);
  formData.append("video_url", form.videoUrl || "");
  formData.append("location", form.location);
  formData.append("category", form.category);
  

  // Append image
  const fileInput = document.querySelector<HTMLInputElement>('input[name="mainImage"]');
  if (fileInput?.files && fileInput.files[0]) {
    formData.append("image", fileInput.files[0]);
  }
  


  try {

    // Main project data
    const response = await fetch("http://localhost:5000/api/projects/create", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error creating project:", error);
      return;
    }


    // Campaign data (description, gallery)

    const data = await response.json();
    // Access the ID here:
    const project_id = data.id;

    formDataCampaign.append("project_id", project_id.toString());
    formDataCampaign.append("description", form.description);
    
    // ✅ UPDATED: Use stored File objects instead of querying DOM
    console.log(`Uploading ${galleryFiles.length} gallery images`);
    if (galleryFiles.length > 0) {
      for (let i = 0; i < galleryFiles.length; i++) {
        formDataCampaign.append("images", galleryFiles[i]);
        console.log(`Added image ${i + 1}: ${galleryFiles[i].name}`);
      }
    } else {
      console.log("No gallery images to upload");
    }
    
    const responseCampaign = await fetch("http://localhost:5000/api/projects/campaign", {
      method: "POST",
      body: formDataCampaign,
    });
    if (!responseCampaign.ok) {
      const error = await responseCampaign.json();
      console.error("Error creating campaign:", error);
      return;
    }
     // Send FAQs
  if (form.faqs.length > 0) {
    const faqsPayload = {
      project_id,
      faqs: form.faqs.map(f => ({
        question: f.question,
        answer: f.answer,
      })),
    };

  const responseFaqs = await fetch("http://localhost:5000/api/projects/faqs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(faqsPayload),
  });

  if (!responseFaqs.ok) {
    const errData = await responseFaqs.json();
    console.error("Error uploading FAQs:", errData);
  } else {
    console.log("FAQs uploaded successfully");
  }
}

    // ✅ Send rewards (if any) as JSON to backend rewards endpoint
    if (form.rewards && form.rewards.length > 0) {
      try {
       const rewardsPayload = form.rewards.map((r) => ({
          title: r.title,
          description: r.description,
          amount: r.amount,
          delivery: r.delivery ? new Date(r.delivery).toISOString().split("T")[0] : "",
          backers: r.backers ?? 0,
          available: r.available ?? 0,
        }));


        const responseRewards = await fetch("http://localhost:5000/api/projects/rewards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project_id, rewards: rewardsPayload }),
        });

        if (!responseRewards.ok) {
          const errBody = await responseRewards.json().catch(() => ({}));
          console.error("Failed to save rewards:", errBody);
          // don't block the user, but log the error
        }
      } catch (err) {
        console.error("Network error saving rewards:", err);
      }
    }
    console.log("Project created successfully:", data);
    toast({
           description: "Project created successfully!"
         });
    navigate("/");
  } catch (err) {
    console.error("Network error:", err);
  }
  
};

// Determine where to go back based on how user reached the page
const handleCancel = () => {
  // If a "from" state exists (set when navigating), go back there
  if (location.state?.from === "profile") {
    navigate("/profile");
  } else {
    navigate("/explore");
  }
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
              <Input
                placeholder="Enter project title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              {errors.title && (
                <p className="text-red-600 text-sm">{errors.title}</p>
              )}
            </div>
            <div>
              <Label>Tagline</Label>
              <Input
                placeholder="Short project tagline"
                value={form.tagline}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tagline: e.target.value }))
                }
              />
              {errors.tagline && (
                <p className="text-red-600 text-sm">{errors.tagline}</p>
              )}
            </div>
          </div>

          {/* Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Main Image of Your Project</Label>
              <input
                type="file"
                accept="image/*"
                name="mainImage"
                onChange={(e) => {
                  if (e.target.files) {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setForm((prev) => ({
                          ...prev,
                          image: reader.result as string,
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }
                }}
                className="block w-full text-sm text-gray-500"
              />
              {form.image && (
                <div className="mt-2">
                  <img
                    src={form.image}
                    alt="Main project"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            <div>
              <Label>Video URL</Label>
              <Input
                placeholder="YouTube or Vimeo URL"
                value={form.videoUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, videoUrl: e.target.value }))
                }
              />
            </div>
          </div>


          <div>
            <Label>Gallery Images</Label>
            <input
              type="file"
              accept="image/*"
              name="images"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500"
            />
            <div className="mt-2 grid grid-cols-3 gap-2">
              {form.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Category & Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, category: value }))
                }
                required
              >
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
              {errors.category && (
                <p className="text-red-600 text-sm">{errors.category}</p>
              )}
            </div>
            <div>
              <Label>Location</Label>
              <Input
                placeholder="City, Country"
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
              />
              {errors.location && (
                <p className="text-red-600 text-sm">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Funding */}
          <div>
            <Label>Funding Goal ($)</Label>
            <Input
              placeholder="Enter funding goal"
              type="number"
              value={form.fundingGoal}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  fundingGoal: e.target.value,
                }))
              }
            />
            {errors.fundingGoal && (
              <p className="text-red-600 text-sm">{errors.fundingGoal}</p>
            )}
          </div>

          {/* Funding Deadline */}
          <div>
            <Label>Funding Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.fundingDeadline
                    ? formatDate_dd_mm_yyyy(form.fundingDeadline)
                    : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.fundingDeadline ?? undefined}
                  onSelect={(date) =>
                    setForm((prev) => ({
                      ...prev,
                      fundingDeadline: date ?? null,
                    }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.fundingDeadline && (
              <p className="text-red-600 text-sm">{errors.fundingDeadline}</p>
            )}
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
              <Button type="button" variant="outline" onClick={addReward}>
                Add Reward
              </Button>
            </div>
            {errors.rewards && (
              <p className="text-red-600 text-sm">{errors.rewards}</p>
            )}
            {form.rewards.map((reward, i) => (
              <div key={i} className="border p-3 rounded-md space-y-2">
                <div className="flex justify-between items-center">
                  <strong>Reward #{i + 1}</strong>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeReward(i)}
                  >
                    Remove
                  </Button>
                </div>
                <Input
                  placeholder="Reward Title"
                  value={reward.title}
                  onChange={(e) =>
                    handleRewardChange(i, "title", e.target.value)
                  }
                />
                {errors[`reward_title_${i}`] && (
                  <p className="text-red-600 text-sm">
                    {errors[`reward_title_${i}`]}
                  </p>
                )}
                <Input
                  placeholder="Amount"
                  type="number"
                  value={reward.amount}
                  onChange={(e) =>
                    handleRewardChange(i, "amount", e.target.value)
                  }
                />
                {errors[`reward_amount_${i}`] && (
                  <p className="text-red-600 text-sm">
                    {errors[`reward_amount_${i}`]}
                  </p>
                )}
                <div>
                  <Label>Delivery Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reward.delivery
                          ? formatDate_dd_mm_yyyy(reward.delivery)
                          : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={reward.delivery ?? undefined}
                        onSelect={(date) => {
                          handleRewardChange(i, "delivery", date ?? null);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Textarea
                  placeholder="Reward Description"
                  value={reward.description}
                  onChange={(e) =>
                    handleRewardChange(i, "description", e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">FAQs</h3>
              <Button type="button" variant="outline" onClick={addFAQ}>
                Add FAQ
              </Button>
            </div>
            {form.faqs.map((faq, i) => (
              <div key={i} className="border p-3 rounded-md space-y-2">
                <div className="flex justify-between items-center">
                  <strong>FAQ #{i + 1}</strong>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeFAQ(i)}
                  >
                    Remove
                  </Button>
                </div>
                <Input
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) =>
                    handleFAQChange(i, "question", e.target.value)
                  }
                />
                <Textarea
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(e) =>
                    handleFAQChange(i, "answer", e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          {/* Submit & Cancel */}
        <div className="flex gap-3">
          <Button type="submit" className="w-full bg-primary" disabled={submitting}>
            {submitting ? "Creating..." : "Create Project"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateProject;
