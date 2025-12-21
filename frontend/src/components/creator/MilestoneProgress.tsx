import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Target, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Send,
  Loader2
} from "lucide-react";

interface Milestone {
  id: string;
  milestone_number: number;
  title: string;
  description: string;
  deadline: string;
  status: string;
  admin_approved: boolean;
  created_at: string;
}

interface MilestoneProgressProps {
  projectId: string;
}

export function MilestoneProgress({ projectId }: MilestoneProgressProps) {
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofDialog, setProofDialog] = useState<{
    open: boolean;
    milestone: Milestone | null;
    message: string;
    submitting: boolean;
  }>({
    open: false,
    milestone: null,
    message: "",
    submitting: false
  });

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const fetchMilestones = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/milestones`);
      if (res.ok) {
        const data = await res.json();
        setMilestones(data.milestones || []);
      }
    } catch (error) {
      console.error("Error fetching milestones:", error);
    } finally {
      setLoading(false);
    }
  };

  const openProofDialog = (milestone: Milestone) => {
    setProofDialog({
      open: true,
      milestone,
      message: "",
      submitting: false
    });
  };

  const submitProof = async () => {
    if (!proofDialog.milestone || !proofDialog.message.trim()) {
      toast({
        title: "Message Required",
        description: "Please provide details about milestone completion",
        variant: "destructive"
      });
      return;
    }

    setProofDialog(prev => ({ ...prev, submitting: true }));

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[Milestone ${proofDialog.milestone.milestone_number} Completion]\n\n${proofDialog.message}`,
          related_milestone_id: proofDialog.milestone.id
        })
      });

      if (res.ok) {
        toast({
          title: "Proof Submitted",
          description: "Admin has been notified of milestone completion"
        });
        setProofDialog({
          open: false,
          milestone: null,
          message: "",
          submitting: false
        });
      } else {
        throw new Error("Failed to submit proof");
      }
    } catch (error) {
      console.error("Error submitting proof:", error);
      toast({
        title: "Error",
        description: "Failed to submit proof. Please try again.",
        variant: "destructive"
      });
      setProofDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  const getStatusBadge = (milestone: Milestone) => {
    if (milestone.status === 'completed') {
      return <Badge className="bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
    }
    if (!milestone.admin_approved) {
      return <Badge className="bg-yellow-600 text-white"><Clock className="h-3 w-3 mr-1" />Pending Approval</Badge>;
    }
    if (milestone.status === 'in_progress') {
      return <Badge className="bg-blue-600 text-white"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
    }
    return <Badge className="bg-gray-600 text-white"><Clock className="h-3 w-3 mr-1" />{milestone.status}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Milestones
          </CardTitle>
          <CardDescription>
            No milestones have been set up yet for this project
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const completedCount = milestones.filter(m => m.status === 'completed').length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Project Milestones
              </CardTitle>
              <CardDescription>
                Track your fulfillment progress
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg">
              {completedCount} / {milestones.length} Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {milestones
            .sort((a, b) => a.milestone_number - b.milestone_number)
            .map((milestone) => {
              const isOverdue = new Date(milestone.deadline) < new Date() && milestone.status !== 'completed';
              const canSubmitProof = milestone.admin_approved && milestone.status !== 'completed';

              return (
                <div 
                  key={milestone.id}
                  className={`p-4 rounded-lg border ${
                    milestone.status === 'completed' ? 'bg-green-50 border-green-200' :
                    milestone.admin_approved ? 'bg-blue-50 border-blue-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Milestone {milestone.milestone_number}</Badge>
                        {getStatusBadge(milestone)}
                      </div>
                      <h4 className="font-semibold text-lg">{milestone.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1 text-gray-700">
                          <Calendar className="h-4 w-4" />
                          Deadline: {new Date(milestone.deadline).toLocaleDateString()}
                        </span>
                        {isOverdue && (
                          <span className="flex items-center gap-1 text-red-600 font-medium">
                            <AlertCircle className="h-4 w-4" />
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                    {canSubmitProof && (
                      <Button
                        onClick={() => openProofDialog(milestone)}
                        className="ml-4"
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Submit Proof
                      </Button>
                    )}
                  </div>

                  {!milestone.admin_approved && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mt-3">
                      <p className="text-sm text-yellow-800">
                        ⏳ Waiting for admin approval before you can start working on this milestone
                      </p>
                    </div>
                  )}

                  {milestone.status === 'completed' && (
                    <div className="bg-green-100 border border-green-300 rounded p-3 mt-3">
                      <p className="text-sm text-green-800">
                        ✅ Milestone completed and verified by admin
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
        </CardContent>
      </Card>

      {/* Proof Submission Dialog */}
      <Dialog open={proofDialog.open} onOpenChange={(open) => !proofDialog.submitting && setProofDialog({ ...proofDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Milestone Completion Proof</DialogTitle>
            <DialogDescription>
              Milestone {proofDialog.milestone?.milestone_number}: {proofDialog.milestone?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="proof">
                Provide proof of completion (photos, links, description, etc.)
              </Label>
              <Textarea
                id="proof"
                placeholder="Example: I have completed the manufacturing process. Here are the photos: [link], and the quality test results: [link]. All units passed inspection."
                value={proofDialog.message}
                onChange={(e) => setProofDialog({ ...proofDialog, message: e.target.value })}
                rows={6}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                This message will be sent to the admin for review. Be as detailed as possible.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProofDialog({ open: false, milestone: null, message: "", submitting: false })}
              disabled={proofDialog.submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitProof}
              disabled={proofDialog.submitting || !proofDialog.message.trim()}
            >
              {proofDialog.submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit to Admin
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
