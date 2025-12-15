import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import UpdateCard from "@/components/UpdateCard";

type Update = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  upvotes: number;
  user_id: string;
  users?: { id: string; full_name?: string; profile_pic?: string };
};

type UpdatesProps = {
  projectId: string;
  currentUser: { id?: string; email?: string } | null;
  ownerEmail?: string;
  ownerId?: string;
};

const Updates = ({ projectId, currentUser, ownerEmail, ownerId }: UpdatesProps) => {
  const { toast } = useToast();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ title: "", body: "" });

  const isOwner = currentUser?.email === ownerEmail;

  // Fetch updates
  const fetchUpdates = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/updates/${projectId}`);
      const data = await res.json();
      setUpdates(data.updates || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [projectId]);

  // Add new update
  const handleAddUpdate = async () => {
    if (!newUpdate.title || !newUpdate.body) return;

    try {
      const res = await fetch(`http://localhost:5000/api/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          user_id: currentUser?.id,
          title: newUpdate.title,
          body: newUpdate.body,
        }),
      });

      if (!res.ok) throw new Error("Failed to post update");

      const data = await res.json();
      setUpdates((prev) => [data.update, ...prev]);
      setNewUpdate({ title: "", body: "" });
      setShowForm(false);

      toast({
        title: "Update posted",
        description: "Your project update has been posted successfully!",
        variant: "default",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to post",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Upvote
  const handleUpvote = async (updateId: string) => {
    if (!currentUser?.id) return;

    try {
      const res = await fetch(`http://localhost:5000/api/updates/upvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ update_id: updateId, user_id: currentUser.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Upvote failed",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Upvoted!",
        description: "Your upvote has been counted",
        variant: "default",
      });

      setUpdates((prev) =>
        prev.map((u) => (u.id === updateId ? { ...u, upvotes: data.upvotes } : u))
      );
    } catch (err) {
      console.error(err);
      toast({
        title: "Upvote failed",
        description: "Failed to upvote. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Post Update Button */}
      {isOwner && !showForm && (
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          onClick={() => setShowForm(true)}
        >
          Post Update
        </button>
      )}

      {/* Update Form */}
      {isOwner && showForm && (
        <div className="border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm bg-white">
          <input
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
            placeholder="Title"
            value={newUpdate.title}
            onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
          />
          <textarea
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
            placeholder="Update details"
            value={newUpdate.body}
            onChange={(e) => setNewUpdate({ ...newUpdate, body: e.target.value })}
            rows={5}
          />
          <div className="flex gap-3">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              onClick={handleAddUpdate}
            >
              Post
            </button>
            <button
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Updates List */}
      <div className="space-y-4">
        {updates.length > 0 ? (
          updates.map((update, index) => (
            <UpdateCard 
              key={update.id} 
              {...update} 
              onUpvote={handleUpvote}
              isOwner={update.user_id === ownerId}
              updateNumber={updates.length - index}
            />
          ))
        ) : (
          <p className="text-gray-500 text-base">No updates yet.</p>
        )}
      </div>
    </div>
  );
};

export default Updates;