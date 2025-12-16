import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import UpdateCard from "@/components/UpdateCard";
import { useToast } from "@/hooks/use-toast";

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
  ownerEmail?: string;  // Project owner's email
};

const Updates = ({ projectId, currentUser, ownerEmail }: UpdatesProps) => {
  const { toast } = useToast();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ title: "", body: "" });

  const canPostUpdate = currentUser?.email === ownerEmail;

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

  return (
    <section className="pt-4 pb-8">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-left">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Updates
            </span>
            {" "} of the Project
          </h2>

          {/* Post Update Button */}
          {canPostUpdate && !showForm && (
            <Button onClick={() => setShowForm(true)} size="sm">
              Add Update
            </Button>
          )}
        </div>

        {/* Update Form */}
        {canPostUpdate && showForm && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold">Add a Project Update</h3>
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
              <Button onClick={handleAddUpdate}>
                Post Update
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
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
                onUpvote={() => {}}
                onDelete={currentUser?.id === update.user_id ? () => {} : undefined}
                isOwner={currentUser?.id === update.user_id}
                updateNumber={updates.length - index}
              />
            ))
          ) : (
            <p className="text-gray-500 text-base">No updates yet.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Updates;
