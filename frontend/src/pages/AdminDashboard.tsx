import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Pause, 
  Play, 
  Trash2, 
  BarChart3,
  Clock,
  Eye,
  MessageSquare,
  Target,
  Calendar,
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Project {
  id: string;
  title: string;
  tagline: string;
  image_url: string;
  category: string;
  funding_goal: number;
  created_at: string;
  approval_status: string;
  admin_message?: string;
  users: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface AdminStats {
  pending: number;
  approved: number;
  rejected: number;
  paused: number;
  removed: number;
  total: number;
}

interface Milestone {
  id: string;
  project_id: string;
  milestone_number: number;
  title: string;
  description: string;
  deadline: string;
  status: string;
  admin_approved: boolean;
  created_at: string;
  project: {
    title: string;
    users: {
      full_name: string;
    };
  };
  communications?: Communication[];
}

interface Communication {
  id: string;
  message: string;
  sender_role: string;
  created_at: string;
  sender: {
    full_name: string;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [adminReplyText, setAdminReplyText] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: "approve" | "reject" | "pause" | "resume" | "remove" | null;
    message: string;
  }>({
    open: false,
    action: null,
    message: "",
  });

  const userId = localStorage.getItem("user_id");
  const isAdmin = localStorage.getItem("is_admin") === "true";

  useEffect(() => {
    if (!userId || !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    fetchData();
  }, []);

  const fetchProjectsByStatus = async (status: string) => {
    try {
      const url = status === "all" 
        ? `http://localhost:5000/api/admin/projects?user_id=${userId}`
        : `http://localhost:5000/api/admin/projects?user_id=${userId}&status=${status}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFilteredProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch(`http://localhost:5000/api/admin/stats?user_id=${userId}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // Fetch pending projects
      const pendingRes = await fetch(`http://localhost:5000/api/admin/projects/pending?user_id=${userId}`);
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingProjects(pendingData.projects);
        setFilteredProjects(pendingData.projects); // Initialize with pending
      }

      // Fetch all projects
      const allRes = await fetch(`http://localhost:5000/api/admin/projects?user_id=${userId}&limit=100`);
      if (allRes.ok) {
        const allData = await allRes.json();
        setAllProjects(allData.projects);
      }

      // Fetch milestones
      fetchMilestones();
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async () => {
    setLoadingMilestones(true);
    try {
      // Fetch all milestones from successful projects (now includes communications)
      const res = await fetch(`http://localhost:5000/api/admin/milestones`);
      if (res.ok) {
        const data = await res.json();
        setMilestones(data.milestones || []);
      }
    } catch (error) {
      console.error("Error fetching milestones:", error);
    } finally {
      setLoadingMilestones(false);
    }
  };

  const approveMilestone = async (milestoneId: string) => {
    try {
      if (!userId) {
        toast({
          title: "Error",
          description: "Missing admin credentials",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch(`http://localhost:5000/api/projects/milestones/${milestoneId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to approve milestone');
      }

      toast({
        title: "Success",
        description: "Milestone approved successfully",
      });
      fetchMilestones();
    } catch (error) {
      console.error("Error approving milestone:", error);
      toast({
        title: "Error",
        description: "Failed to approve milestone",
        variant: "destructive",
      });
    }
  };

  const completeMilestone = async (milestoneId: string) => {
    try {
      if (!userId) {
        toast({
          title: "Error",
          description: "Missing admin credentials",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch(`http://localhost:5000/api/projects/milestones/${milestoneId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to complete milestone');
      }

      toast({
        title: "Success",
        description: "Milestone marked as completed",
      });
      fetchMilestones();
    } catch (error) {
      console.error("Error completing milestone:", error);
      toast({
        title: "Error",
        description: "Failed to complete milestone",
        variant: "destructive",
      });
    }
  };

  const sendAdminReply = async (milestoneId: string, projectId: string) => {
    const message = adminReplyText[milestoneId]?.trim();
    if (!message) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setSendingReply(milestoneId);
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message,
          relatedMilestoneId: milestoneId
        }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Feedback sent to creator",
        });
        setAdminReplyText({ ...adminReplyText, [milestoneId]: '' });
        fetchMilestones();
      } else {
        throw new Error('Failed to send reply');
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: "Failed to send feedback",
        variant: "destructive",
      });
    } finally {
      setSendingReply(null);
    }
  };

  const handleAction = async () => {
    if (!selectedProject || !actionDialog.action) return;

    const requiresMessage = ["reject", "remove"].includes(actionDialog.action);
    if (requiresMessage && !actionDialog.message.trim()) {
      toast({
        title: "Message Required",
        description: "Please provide a reason for this action.",
        variant: "destructive",
      });
      return;
    }

    await executeAction(selectedProject, actionDialog.action, actionDialog.message);
    setActionDialog({ open: false, action: null, message: "" });
    setSelectedProject(null);
  };

  const openActionDialog = (project: Project, action: "approve" | "reject" | "pause" | "resume" | "remove") => {
    setSelectedProject(project);
    // For approve, pause, resume - execute directly without dialog
    if (["approve", "pause", "resume"].includes(action)) {
      executeAction(project, action, "");
    } else {
      // For reject and remove - show message dialog
      setActionDialog({ open: true, action, message: "" });
    }
  };

  const executeAction = async (project: Project, action: string, message: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/projects/${project.id}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            admin_id: userId,
            message: message || undefined,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: `Project ${action}d successfully`,
        });
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Action failed");
      }
    } catch (error: any) {
      console.error("Error performing action:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to perform action",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: "bg-yellow-500", icon: <Clock className="h-3 w-3" /> },
      approved: { color: "bg-green-500", icon: <CheckCircle className="h-3 w-3" /> },
      rejected: { color: "bg-red-500", icon: <XCircle className="h-3 w-3" /> },
      paused: { color: "bg-orange-500", icon: <Pause className="h-3 w-3" /> },
      removed: { color: "bg-gray-500", icon: <Trash2 className="h-3 w-3" /> },
    };

    const variant = variants[status] || variants.pending;
    return (
      <Badge className={`${variant.color} text-white flex items-center gap-1`}>
        {variant.icon}
        {status}
      </Badge>
    );
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <CardDescription className="mt-1">{project.tagline}</CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{project.category}</Badge>
              {getStatusBadge(project.approval_status)}
            </div>
          </div>
          <img
            src={project.image_url}
            alt={project.title}
            className="w-24 h-24 object-cover rounded-lg ml-4"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            <p><strong>Creator:</strong> {project.users?.full_name || "Unknown"}</p>
            <p><strong>Email:</strong> {project.users?.email || "N/A"}</p>
            <p><strong>Goal:</strong> ৳{project.funding_goal?.toLocaleString()}</p>
            <p><strong>Created:</strong> {new Date(project.created_at).toLocaleDateString()}</p>
          </div>

          {project.admin_message && (
            <div className="bg-gray-100 p-2 rounded text-sm">
              <p className="font-semibold flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                Admin Message:
              </p>
              <p className="text-gray-700 mt-1">{project.admin_message}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {project.approval_status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => openActionDialog(project, "approve")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openActionDialog(project, "reject")}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}

            {project.approval_status === "approved" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openActionDialog(project, "pause")}
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}

            {project.approval_status === "paused" && (
              <Button
                size="sm"
                onClick={() => openActionDialog(project, "resume")}
              >
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            )}

            {!["removed"].includes(project.approval_status) && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => openActionDialog(project, "remove")}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/project/${project.id}`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage and moderate all projects</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setActiveTab("pending");
                fetchProjectsByStatus("pending");
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setActiveTab("approved");
                fetchProjectsByStatus("approved");
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setActiveTab("rejected");
                fetchProjectsByStatus("rejected");
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setActiveTab("paused");
                fetchProjectsByStatus("paused");
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Paused</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">{stats.paused}</p>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setActiveTab("all");
                fetchProjectsByStatus("all");
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Milestones Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  Milestones Management
                </CardTitle>
                <CardDescription>Review and approve creator milestones for successful projects</CardDescription>
              </div>
              <Badge variant="outline" className="text-lg">
                {milestones.filter(m => !m.admin_approved).length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loadingMilestones ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading milestones...</p>
              </div>
            ) : milestones.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No milestones submitted yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group by project */}
                {Object.entries(
                  milestones.reduce((acc, milestone) => {
                    if (!acc[milestone.project_id]) acc[milestone.project_id] = [];
                    acc[milestone.project_id].push(milestone);
                    return acc;
                  }, {} as Record<string, Milestone[]>)
                ).map(([projectId, projectMilestones]) => {
                  const firstMilestone = projectMilestones[0];
                  const allApproved = projectMilestones.every(m => m.admin_approved);
                  const completedCount = projectMilestones.filter(m => m.status === 'completed').length;
                  
                  return (
                    <Card key={projectId} className={allApproved ? "border-green-200" : "border-yellow-200"}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{firstMilestone.project.title}</CardTitle>
                            <CardDescription>
                              Creator: {firstMilestone.project.users.full_name} • 
                              {completedCount}/3 Complete
                            </CardDescription>
                          </div>
                          {allApproved ? (
                            <Badge className="bg-green-500 text-white">All Approved</Badge>
                          ) : (
                            <Badge className="bg-yellow-500 text-white">Needs Review</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {projectMilestones
                          .sort((a, b) => a.milestone_number - b.milestone_number)
                          .map((milestone) => (
                            <div 
                              key={milestone.id} 
                              className={`p-4 rounded-lg border ${
                                milestone.status === 'completed' ? 'bg-green-50 border-green-200' :
                                milestone.admin_approved ? 'bg-blue-50 border-blue-200' : 
                                'bg-yellow-50 border-yellow-200'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline">Milestone {milestone.milestone_number}</Badge>
                                    {milestone.status === 'completed' && (
                                      <Badge className="bg-green-600 text-white">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Completed
                                      </Badge>
                                    )}
                                    {milestone.admin_approved && milestone.status !== 'completed' && (
                                      <Badge className="bg-blue-600 text-white">Approved</Badge>
                                    )}
                                  </div>
                                  <h4 className="font-semibold">{milestone.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                  <div className="flex items-center gap-4 mt-2 text-sm">
                                    <span className="flex items-center gap-1 text-gray-700">
                                      <Calendar className="h-4 w-4" />
                                      Due: {new Date(milestone.deadline).toLocaleDateString()}
                                    </span>
                                    {new Date(milestone.deadline) < new Date() && milestone.status !== 'completed' && (
                                      <span className="flex items-center gap-1 text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        Overdue
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Creator proof/communications */}
                                  {milestone.communications && milestone.communications.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      {milestone.communications.map((comm) => (
                                        <div key={comm.id} className={`rounded p-3 ${
                                          comm.sender_role === 'admin' 
                                            ? 'bg-purple-50 border border-purple-200' 
                                            : 'bg-blue-50 border border-blue-200'
                                        }`}>
                                          <div className="flex items-start gap-2">
                                            <MessageSquare className={`h-4 w-4 mt-0.5 ${
                                              comm.sender_role === 'admin' ? 'text-purple-600' : 'text-blue-600'
                                            }`} />
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-medium ${
                                                  comm.sender_role === 'admin' ? 'text-purple-800' : 'text-blue-800'
                                                }`}>
                                                  {comm.sender.full_name} ({comm.sender_role})
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  {new Date(comm.created_at).toLocaleDateString()}
                                                </span>
                                              </div>
                                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comm.message}</p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Admin Reply Form */}
                                  <div className="mt-3 space-y-2 p-3 bg-purple-50 border border-purple-200 rounded">
                                    <h5 className="text-sm font-semibold flex items-center gap-2">
                                      <MessageSquare className="h-4 w-4" />
                                      Send Feedback to Creator
                                    </h5>
                                    <Textarea
                                      placeholder="Provide feedback, request more proof, or acknowledge completion..."
                                      value={adminReplyText[milestone.id] || ''}
                                      onChange={(e) => setAdminReplyText({ ...adminReplyText, [milestone.id]: e.target.value })}
                                      rows={2}
                                      className="resize-none bg-white"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => sendAdminReply(milestone.id, milestone.project_id)}
                                      disabled={sendingReply === milestone.id}
                                      className="bg-purple-600 hover:bg-purple-700"
                                    >
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      {sendingReply === milestone.id ? 'Sending...' : 'Send Feedback'}
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  {!milestone.admin_approved && (
                                    <Button
                                      size="sm"
                                      onClick={() => approveMilestone(milestone.id)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                  )}
                                  {milestone.admin_approved && milestone.status !== 'completed' && (
                                    <Button
                                      size="sm"
                                      onClick={() => completeMilestone(milestone.id)}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Mark Complete
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">
              {activeTab === "pending" && "Pending Review"}
              {activeTab === "approved" && "Approved Projects"}
              {activeTab === "rejected" && "Rejected Projects"}
              {activeTab === "paused" && "Paused Projects"}
              {activeTab === "all" && "All Projects"}
              <span className="text-gray-500 ml-2">({filteredProjects.length})</span>
            </CardTitle>
            <CardDescription>
              {activeTab === "pending" && "Review and moderate pending projects"}
              {activeTab === "approved" && "Currently live and active projects"}
              {activeTab === "rejected" && "Projects that were not approved"}
              {activeTab === "paused" && "Temporarily paused projects"}
              {activeTab === "all" && "View all projects across all statuses"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  No {activeTab === "all" ? "" : activeTab} projects found
                </p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === "reject" && "Reject Project"}
              {actionDialog.action === "remove" && "Remove Project"}
            </DialogTitle>
            <DialogDescription>
              {selectedProject?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Please provide a reason (required)"
              value={actionDialog.message}
              onChange={(e) => setActionDialog({ ...actionDialog, message: e.target.value })}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, action: null, message: "" })}
            >
              Cancel
            </Button>
            <Button onClick={handleAction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
