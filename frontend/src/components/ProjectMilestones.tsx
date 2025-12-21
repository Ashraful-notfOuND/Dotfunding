import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Target, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Send,
  MessageSquare,
  AlertCircle 
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
  proof_messages?: Array<{
    id: string;
    message: string;
    created_at: string;
    sender_role?: string;
  }>;
}

interface Communication {
  id: string;
  sender_role: string;
  message: string;
  created_at: string;
  related_milestone_id: string;
  sender: {
    full_name: string;
  };
}

interface ProjectMilestonesProps {
  projectId: string;
  isCreator: boolean;
}

export default function ProjectMilestones({ projectId, isCreator }: ProjectMilestonesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState<string | null>(null);
  const [messageText, setMessageText] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMilestones();
    if (isCreator) {
      fetchCommunications();
    }
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

  const fetchCommunications = async () => {
    try {
      // Get userId from auth or localStorage
      const userId = user?.id || localStorage.getItem('userId');
      
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/communications?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCommunications(data.communications || []);
      } else {
        console.error("Failed to fetch communications:", await res.text());
      }
    } catch (error) {
      console.error("Error fetching communications:", error);
    }
  };

  const sendMessage = async (milestoneId: string) => {
    if (!messageText[milestoneId]?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setSendingMessage(milestoneId);
    try {
      // Get userId from auth or localStorage
      const userId = user?.id || localStorage.getItem('userId');
      
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to send updates",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/communications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message: messageText[milestoneId],
          relatedMilestoneId: milestoneId
        }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Update sent to admin successfully",
        });
        setMessageText({ ...messageText, [milestoneId]: '' });
        fetchCommunications();
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send update",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(null);
    }
  };

  const getMilestoneMessages = (milestoneId: string) => {
    return communications
      .filter(c => c.related_milestone_id === milestoneId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading milestones...</p>
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">
          {isCreator 
            ? "No milestones have been submitted yet"
            : "Milestones will appear here once approved by admin"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isCreator && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Communication with Admin
            </CardTitle>
            <CardDescription>
              Use the message boxes below each milestone to send updates and proof of completion to the admin
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {milestones
        .sort((a, b) => a.milestone_number - b.milestone_number)
        .map((milestone) => {
          const creatorMessages = isCreator ? getMilestoneMessages(milestone.id) : [];
          const proofMessages = !isCreator ? (milestone.proof_messages || []) : [];
          const isOverdue = new Date(milestone.deadline) < new Date() && milestone.status !== 'completed';
          
          return (
            <Card 
              key={milestone.id}
              className={`${
                milestone.status === 'completed' ? 'border-green-300 bg-green-50/50' :
                milestone.admin_approved ? 'border-blue-300 bg-blue-50/50' : 
                'border-yellow-300 bg-yellow-50/50'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Milestone {milestone.milestone_number}</Badge>
                      {milestone.status === 'completed' && (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {milestone.admin_approved && milestone.status !== 'completed' && (
                        <Badge className="bg-blue-600 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      )}
                      {!milestone.admin_approved && (
                        <Badge className="bg-yellow-600 text-white">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Review
                        </Badge>
                      )}
                      {isOverdue && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <CardTitle>{milestone.title}</CardTitle>
                    <CardDescription className="mt-2">{milestone.description}</CardDescription>
                    <div className="flex items-center gap-1 mt-3 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Due: {new Date(milestone.deadline).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </CardHeader>

              {isCreator && (
                <CardContent className="space-y-4">
                  {/* Messages Thread */}
                  {creatorMessages.length > 0 && (
                    <div className="space-y-3 p-4 bg-white rounded-lg border">
                      <h4 className="font-semibold flex items-center gap-2 text-sm">
                        <MessageSquare className="h-4 w-4" />
                        Communication History
                      </h4>
                      {creatorMessages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`p-3 rounded ${
                            msg.sender_role === 'admin' 
                              ? 'bg-purple-50 border border-purple-200' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={msg.sender_role === 'admin' ? 'default' : 'outline'}>
                              {msg.sender_role === 'admin' ? 'Admin' : 'You'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Send Update Form - Available for all milestones except completed */}
                  {milestone.status !== 'completed' && (
                    <div className="space-y-3 p-4 bg-white rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-sm">Send Progress Update to Admin</h4>
                      <Textarea
                        placeholder="Share your progress, upload links to proof of work, or let the admin know this milestone is complete..."
                        value={messageText[milestone.id] || ''}
                        onChange={(e) => setMessageText({ ...messageText, [milestone.id]: e.target.value })}
                        rows={3}
                        className="resize-none"
                      />
                      <Button
                        onClick={() => sendMessage(milestone.id)}
                        disabled={sendingMessage === milestone.id}
                        className="w-full"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {sendingMessage === milestone.id ? 'Sending...' : 'Send Update'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}

              {!isCreator && (
                <CardContent className="space-y-3">
                  {(() => {
                    const hasProof = proofMessages.length > 0;
                    let statusText = '';
                    if (milestone.status === 'completed') {
                      statusText = 'Milestone completed and verified by Dotfunding.';
                    } else if (milestone.admin_approved) {
                      statusText = 'Milestone approved by Dotfunding and currently in fulfillment.';
                    } else if (hasProof) {
                      statusText = 'Creator has submitted proof and Dotfunding is reviewing it.';
                    } else {
                      statusText = 'Creator has not submitted proof for this milestone yet.';
                    }

                    return (
                      <div className="p-3 bg-white rounded border">
                        <h4 className="text-sm font-semibold text-gray-800">Status Update</h4>
                        <p className="text-sm text-gray-600 mt-1">{statusText}</p>
                      </div>
                    );
                  })()}

                  {milestone.admin_approved ? (
                    proofMessages.length > 0 ? (
                      <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded">
                        <h5 className="text-sm font-semibold flex items-center gap-2 text-blue-900">
                          <MessageSquare className="h-4 w-4" />
                          Creator Proof
                        </h5>
                        {proofMessages.map((msg) => (
                          <div key={msg.id} className="bg-white border border-blue-200 rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-blue-700">From the creator</span>
                              <span className="text-xs text-gray-500">
                                {new Date(msg.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
                        No proofs submitted by the creator yet.
                      </div>
                    )
                  ) : (
                    (() => {
                      const hasProof = proofMessages.length > 0;
                      return hasProof ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                          Proof submitted and waiting for Dotfunding approval.
                        </div>
                      ) : (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                          No proofs submitted by the creator yet.
                        </div>
                      );
                    })()
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
    </div>
  );
}
