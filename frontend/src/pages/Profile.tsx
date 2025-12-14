// import { useState, useEffect } from "react";
// import { useAuth } from "@/hooks/useAuth";
// import { useNavigate, Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import ProjectCard from "@/components/ProjectCard";
// import { User, Settings, Heart } from "lucide-react";
// import defaultAvatar from "@/assets/default-avatar.png";


// interface Project {
//   id: string;
//   title: string;
//   tagline?: string;
//   image_urls: string;
//   fundingGoal: number;
//   fundingDeadline: string;
//   videoUrl?: string;
//   location?: string;
//   category: string;
//   creatorName: string | null;
//   // you can include other fields as needed (e.g. current funding, etc)
// }

// const Profile = () => {
//   const { user, isAuthenticated} = useAuth();  
//   const navigate = useNavigate();

//   // state to hold fetched projects
//   const [myProjects, setMyProjects] = useState<Project[]>([]);
//   const [loadingProjects, setLoadingProjects] = useState<boolean>(false);
//   const [errorProjects, setErrorProjects] = useState<string | null>(null);

//   // redirect if not logged in
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate("/login");
//     }
//   }, [isAuthenticated, navigate]);

//   // once user is available, fetch their projects
//   useEffect(() => {
//     if (!isAuthenticated || !user) return;

//     const fetchProjects = async () => {
//       try {
//         setLoadingProjects(true);
//         setErrorProjects(null);

//         // call your backend route
//         const resp = await fetch(`http://localhost:5000/api/projects/userProjects/${user.id}`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });

//         if (!resp.ok) {
//           // e.g. 404, 500 etc
//           const errBody = await resp.json().catch(() => ({}));
//           const errMsg = errBody.error || resp.statusText;
//           throw new Error(errMsg);
//         }
        
//         const body = await resp.json();
        
//         const apiProjects = Array.isArray(body.projects) ? body.projects : [];
//         if (apiProjects.length > 0) {
//           console.log("Frontend: first project response:", apiProjects[0]);
//         } else {
//           console.log("Frontend: no projects returned from API");
//         }

//         // Normalize backend shape to frontend Project interface
//         const projects: Project[] = apiProjects.map((p: any) => ({
//           id: p.id,
//           title: p.title,
//           tagline: p.tagline,
//           // backend returns imageUrl (camelCase) while this page expects image_urls
//           image_urls: p.imageUrl || p.image_urls || "",
//           fundingGoal: p.fundingGoal ?? p.funding_goal ?? 0,
//           fundingDeadline: p.fundingDeadline ?? p.funding_deadline ?? "",
//           videoUrl: p.videoUrl ?? p.video_url ?? undefined,
//           location: p.location,
//           category: p.category,
//           creatorName: p.creator || null,
//         }));

//         setMyProjects(projects);
//       } catch (err: any) {
//         console.error("Error fetching user’s projects:", err);
//         setErrorProjects(err.message || "Error fetching projects");
//       } finally {
//         setLoadingProjects(false);
//       }
//     };

//     fetchProjects();
//   }, [isAuthenticated, user]);

//   // helper to compute days left
//   const getDaysLeft = (deadline: string): number => {
//     const now = new Date();
//     const d = new Date(deadline);
//     const diffMs = d.getTime() - now.getTime();
//     const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
//     return diffDays > 0 ? diffDays : 0;
//   };

//   if (!isAuthenticated || !user) {
//     return null;
//   }
//   const profileData = {
//     name: user.name,
//     email: user.email,
//     // avatar: user.name
//     //   .split(" ")
//     //   .map((n) => n[0])
//     //   .join(""),
//     joinedDate: "January 2024",  // you can fetch real date if you have
//     projectsCreated: myProjects.length,
//     projectsBacked: 0,
//     totalBacked: 0,
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Navbar />

//       <div className="container mx-auto px-4 py-12">
//         <div className="mb-8 animate-fade-in">
//           <Card>
//             <CardContent className="pt-6">
//               <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
//                 <div className="w-24 h-24 rounded-full overflow-hidden">
//                  <img
//                     src={user.profilePic || defaultAvatar}
//                     alt="Profile"
//                     onError={(e) => (e.currentTarget.src = defaultAvatar)}
//                     className="w-full h-full object-cover"
//                   />
//                   </div>
//                 <div className="flex-1">
//                   <h1 className="text-3xl font-bold mb-2">{profileData.name}</h1>
//                   <p className="text-muted-foreground mb-4">{profileData.email}</p>
//                   <div className="flex flex-wrap gap-6 text-sm">
//                     <div>
//                       <span className="font-semibold text-foreground">
//                         {profileData.projectsCreated}
//                       </span>{" "}
//                       <span className="text-muted-foreground">project(s) created</span>
//                     </div>
//                     <div>
//                       <span className="font-semibold text-foreground">
//                         {profileData.projectsBacked}
//                       </span>{" "}
//                       <span className="text-muted-foreground">projects backed</span>
//                     </div>
//                     <div>
//                       <span className="font-semibold text-foreground">
//                         ${profileData.totalBacked}
//                       </span>{" "}
//                       <span className="text-muted-foreground">total backed</span>
//                     </div>
//                     <div>
//                       <span className="text-muted-foreground">
//                         Member since {profileData.joinedDate}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <Link to="/profile/edit">
//                   <Button variant="outline">
//                     <Settings className="h-4 w-4 mr-2" />
//                     Edit Profile
//                   </Button>
//                 </Link>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <Tabs defaultValue="created" className="w-full">
//           <TabsList className="mb-8">
//             <TabsTrigger value="created" className="flex items-center gap-2">
//               <User className="h-4 w-4" />
//               My Projects
//             </TabsTrigger>
//             <TabsTrigger value="backed" className="flex items-center gap-2">
//               <Heart className="h-4 w-4" />
//               Backed Projects
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="created">
//             <div className="mb-6 flex items-center justify-between">
//               <div>
//                 <h2 className="text-2xl font-bold mb-1">Projects I've Created</h2>
//                 <p className="text-muted-foreground">
//                   Campaigns you've launched on DotFunding
//                 </p>
//               </div>
//             </div>

//             {loadingProjects && <p>Loading projects...</p>}
//             {errorProjects && <p className="text-red-500">Error: {errorProjects}</p>}

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {myProjects.map((project) => (
//                 <div key={project.id} className="flex flex-col gap-2">
//                   <ProjectCard
//                     id={project.id}
//                     title={project.title}
//                     creator={user.name ?? ""}
//                     image={project.image_urls}
//                     fundingGoal={project.fundingGoal}
//                     fundingCurrent={0}
//                     daysLeft={getDaysLeft(project.fundingDeadline)}
//                     category={project.category}
//                   />
//                   <Link to={`/project/${project.id}/edit`}>
//                     <Button variant="outline" className="w-full">
//                       Edit Project
//                     </Button>
//                   </Link>
//                 </div>
//               ))}
//             </div>

//             {myProjects.length === 0 && !loadingProjects && (
//               <Card className="py-12">
//                 <CardContent className="text-center">
//                   <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
//                   <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
//                   <p className="text-muted-foreground mb-6">
//                     Start your crowdfunding journey by creating your first project
//                   </p>
                  
//                   <Button
//                     onClick={() => navigate("/create-project", { state: { from: "profile" } })}
//                     className="bg-accent hover:bg-accent-hover"
//                   >
//                     Create your first project
//                   </Button>
//                 </CardContent>
//               </Card>
//             )}
//           </TabsContent>

//           <TabsContent value="backed">
//             {/* You can implement the “backed projects” tab similarly */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {/* placeholder or actual backed data */}
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default Profile;



import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { User, Settings, Heart, Bell, Gift, MessageSquare, Clock, CheckCircle, DollarSign } from "lucide-react";
import defaultAvatar from "@/assets/default-avatar.png";
import NotificationDetailsModal from "@/components/NotificationDetailsModal";
import NotificationSettings from "@/components/NotificationSettings";


interface Project {
  id: string;
  title: string;
  tagline?: string;
  image_urls: string;
  fundingGoal: number;
  fundingDeadline: string;
  videoUrl?: string;
  location?: string;
  category: string;
  creatorName: string | null;
}

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(false);
  const [errorProjects, setErrorProjects] = useState<string | null>(null);

  // Backed projects state
  const [backedProjects, setBackedProjects] = useState<any[]>([]);
  const [loadingBacked, setLoadingBacked] = useState<boolean>(false);
  const [errorBacked, setErrorBacked] = useState<string | null>(null);

  // === added: notifications state ===
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("created");
  // === end added ===

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Check for tab query parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        setErrorProjects(null);

        const resp = await fetch(`http://localhost:5000/api/projects/userProjects/${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!resp.ok) {
          const errBody = await resp.json().catch(() => ({}));
          const errMsg = errBody.error || resp.statusText;
          throw new Error(errMsg);
        }

        const body = await resp.json();

        const apiProjects = Array.isArray(body.projects) ? body.projects : [];

        const projects: Project[] = apiProjects.map((p: any) => ({
          id: p.id,
          title: p.title,
          tagline: p.tagline,
          image_urls: p.imageUrl || p.image_urls || "",
          fundingGoal: p.fundingGoal ?? p.funding_goal ?? 0,
          fundingDeadline: p.fundingDeadline ?? p.funding_deadline ?? "",
          videoUrl: p.videoUrl ?? p.video_url ?? undefined,
          location: p.location,
          category: p.category,
          creatorName: p.creator || null,
        }));

        setMyProjects(projects);
      } catch (err: any) {
        console.error("Error fetching user’s projects:", err);
        setErrorProjects(err.message || "Error fetching projects");
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated, user]);

  // Fetch backed projects (from payments/donations)
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchBackedProjects = async () => {
      try {
        setLoadingBacked(true);
        setErrorBacked(null);

        const resp = await fetch(`http://localhost:5000/api/payments/user/${user.id}/backed`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!resp.ok) {
          const errBody = await resp.json().catch(() => ({}));
          const errMsg = errBody.error || resp.statusText;
          throw new Error(errMsg);
        }

        const body = await resp.json();
        setBackedProjects(body.backedProjects || body.payments || []);
      } catch (err: any) {
        console.error("Error fetching backed projects:", err);
        setErrorBacked(err.message || "Error fetching backed projects");
      } finally {
        setLoadingBacked(false);
      }
    };

    fetchBackedProjects();
  }, [isAuthenticated, user]);

  // // === added: fetch notifications ===
  // useEffect(() => {
  //   if (!isAuthenticated || !user) return;

  //   const fetchNotifications = async () => {
  //     try {
  //       setLoadingNotifications(true);
  //       setErrorNotifications(null);

  //       const resp = await fetch(`http://localhost:5000/api/notifications/${user.id}`, {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });

  //       if (!resp.ok) {
  //         const body = await resp.json().catch(() => ({}));
  //         throw new Error(body.error || resp.statusText);
  //       }

  //       const data = await resp.json();
  //       setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
  //     } catch (err: any) {
  //       console.error("Error fetching notifications:", err);
  //       setErrorNotifications(err.message || "Error fetching notifications");
  //     } finally {
  //       setLoadingNotifications(false);
  //     }
  //   };

  //   fetchNotifications();
  // }, [isAuthenticated, user]);
  // // === end added ===


  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        setErrorNotifications(null);

        const resp = await fetch(`http://localhost:5000/api/notifications/${user.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          throw new Error(body.error || resp.statusText);
        }

        const data = await resp.json();
        const notifs = Array.isArray(data.notifications) ? data.notifications : [];
        setNotifications(notifs);
      } catch (err: any) {
        console.error("Error fetching notifications:", err);
        setErrorNotifications(err.message || "Error fetching notifications");
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, user]);


  const getDaysLeft = (deadline: string): number => {
    const now = new Date();
    const d = new Date(deadline);
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Helper function to check if a project is live (deadline hasn't passed)
  const isProjectLive = (deadline: string): boolean => {
    const now = new Date();
    const d = new Date(deadline);
    return d.getTime() > now.getTime();
  };

  // Separate projects into live and past categories
  const liveProjects = myProjects.filter(project => isProjectLive(project.fundingDeadline));
  const pastProjects = myProjects.filter(project => !isProjectLive(project.fundingDeadline));

  if (!isAuthenticated || !user) {
    return null;
  }
  const profileData = {
    name: user.name,
    email: user.email,
    joinedDate: "January 2024",
    projectsCreated: myProjects.length,
    projectsBacked: backedProjects.length,
    totalBacked: backedProjects.reduce((sum, backing) => sum + (backing.amount || 0), 0),
  };
  return (
    <div className="min-h-screen flex flex-col">
      <NotificationDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
      />
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 animate-fade-in">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  <img
                    src={user.profilePic || defaultAvatar}
                    alt="Profile"
                    onError={(e) => (e.currentTarget.src = defaultAvatar)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{profileData.name}</h1>
                  <p className="text-muted-foreground mb-4">{profileData.email}</p>
                  {user.phone && (
                    <p className="text-muted-foreground mb-4">📱 {user.phone}</p>
                  )}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <span className="font-semibold text-foreground">
                        {profileData.projectsCreated}
                      </span>{" "}
                      <span className="text-muted-foreground">project(s) created</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">
                        {profileData.projectsBacked}
                      </span>{" "}
                      <span className="text-muted-foreground">projects backed</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">
                        ${profileData.totalBacked.toLocaleString()}
                      </span>{" "}
                      <span className="text-muted-foreground">total backed</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Member since {profileData.joinedDate}
                      </span>
                    </div>
                  </div>
                </div>
                <Link to="/profile/edit">
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="created" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Projects
            </TabsTrigger>
            <TabsTrigger value="backed" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Backed Projects
            </TabsTrigger>

            {/* === added notifications tab === */}
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-semibold">
                  {notifications.filter(n => !n.is_read).length > 9 ? '9+' : notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </TabsTrigger>
            {/* === end added === */}

            {/* === added settings tab === */}
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            {/* === end added === */}
          </TabsList>

          <TabsContent value="created">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">Projects I've Created</h2>
                <p className="text-muted-foreground">
                  Campaigns you've launched on DotFunding
                </p>
              </div>
            </div>

            {loadingProjects && <p>Loading projects...</p>}
            {errorProjects && <p className="text-red-500">Error: {errorProjects}</p>}

            {/* Live Projects Section */}
            {!loadingProjects && liveProjects.length > 0 && (
              <div className="mb-10">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="text-xl font-semibold">Live Projects ({liveProjects.length})</h3>
                  <Badge variant="default" className="bg-green-500 text-white">Collecting Funds</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveProjects.map((project) => (
                    <div key={project.id} className="flex flex-col gap-2">
                      <ProjectCard
                        id={project.id}
                        title={project.title}
                        creator={user.name ?? ""}
                        image={project.image_urls}
                        fundingGoal={project.fundingGoal}
                        fundingCurrent={0}
                        daysLeft={getDaysLeft(project.fundingDeadline)}
                        category={project.category}
                      />
                      <Link to={`/project/${project.id}/edit`}>
                        <Button variant="outline" className="w-full">
                          Edit Project
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Projects Section */}
            {!loadingProjects && pastProjects.length > 0 && (
              <div className="mb-6">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-xl font-semibold">Past Projects ({pastProjects.length})</h3>
                  <Badge variant="secondary">Funding Ended</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastProjects.map((project) => (
                    <div key={project.id} className="flex flex-col gap-2 opacity-75">
                      <ProjectCard
                        id={project.id}
                        title={project.title}
                        creator={user.name ?? ""}
                        image={project.image_urls}
                        fundingGoal={project.fundingGoal}
                        fundingCurrent={0}
                        daysLeft={getDaysLeft(project.fundingDeadline)}
                        category={project.category}
                      />
                      <Link to={`/project/${project.id}/edit`}>
                        <Button variant="outline" className="w-full">
                          Edit Project
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {myProjects.length === 0 && !loadingProjects && (
              <Card className="py-12">
                <CardContent className="text-center">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start your crowdfunding journey by creating your first project
                  </p>

                  <Button
                    onClick={() => navigate("/create-project", { state: { from: "profile" } })}
                    className="bg-accent hover:bg-accent-hover"
                  >
                    Create your first project
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="backed">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">Projects I've Backed</h2>
              <p className="text-muted-foreground">
                Projects you've supported on DotFunding
              </p>
            </div>

            {loadingBacked && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {errorBacked && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-950 mb-6">
                <CardContent className="py-4">
                  <p className="text-red-600 dark:text-red-400">Error: {errorBacked}</p>
                </CardContent>
              </Card>
            )}

            {!loadingBacked && !errorBacked && backedProjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {backedProjects.map((backing: any) => (
                  <Card key={backing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={backing.project?.image_url || "https://via.placeholder.com/400x250"}
                        alt={backing.project?.title || "Project"}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 text-white">
                          Backed
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {backing.project?.title || "Untitled Project"}
                      </h3>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium text-foreground">
                            ${(backing.amount || 0).toLocaleString()}
                          </span>
                          <span>pledged</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(backing.created_at || backing.payment_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>

                        {backing.backer_message && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p className="line-clamp-2 italic">"{backing.backer_message}"</p>
                          </div>
                        )}

                        {backing.payment_status && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className={`h-4 w-4 ${
                              backing.payment_status === 'paid' 
                                ? 'text-green-500' 
                                : backing.payment_status === 'pending'
                                ? 'text-yellow-500'
                                : 'text-gray-500'
                            }`} />
                            <span className="capitalize">{backing.payment_status}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => navigate(`/project/${backing.project_id}`)}
                        className="w-full"
                        variant="outline"
                      >
                        View Project
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loadingBacked && !errorBacked && backedProjects.length === 0 && (
              <Card className="py-12">
                <CardContent className="text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No backed projects yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start supporting creative projects and help bring ideas to life
                  </p>
                  
                  <Button
                    onClick={() => navigate("/")}
                    className="bg-accent hover:bg-accent-hover"
                  >
                    Explore Projects
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notifications">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">Notifications</h2>
              <p className="text-muted-foreground">Updates about activity on your projects</p>
            </div>

            {loadingNotifications && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            
            {errorNotifications && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-950">
                <CardContent className="py-4">
                  <p className="text-red-600 dark:text-red-400">Error: {errorNotifications}</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {notifications.map((notif) => {
                const isUnread = !notif.is_read;
                const notifDate = new Date(notif.created_at);
                const isRecent = Date.now() - notifDate.getTime() < 24 * 60 * 60 * 1000;

                return (
                  <Card
                    key={notif.id}
                    onClick={async () => {
                      // Mark as read first
                      if (!notif.is_read) {
                        try {
                          const response = await fetch(`http://localhost:5000/api/notifications/${notif.id}/read`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                          });
                          
                          if (response.ok) {
                            // Update local state
                            setNotifications(prev => 
                              prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
                            );
                          }
                        } catch (err) {
                          console.error("Error marking notification as read:", err);
                        }
                      }
                      
                      // For recommendation/project notifications, navigate directly to project
                      if (notif.type === 'recommendation' || 
                          notif.type === 'interest_match' ||
                          notif.type === 'project_update') {
                        if (notif.metadata?.projectId) {
                          navigate(`/project/${notif.metadata.projectId}`);
                        }
                        return;
                      }
                      
                      // For payment/donation notifications, show modal
                      if (notif.type === 'donation' || 
                          notif.type === 'payment' ||
                          notif.metadata?.amount) {
                        setSelectedNotification(notif);
                        setIsModalOpen(true);
                        return;
                      }
                      
                      // For other notifications with projectId, go to project
                      if (notif.metadata?.projectId) {
                        navigate(`/project/${notif.metadata.projectId}`);
                      } else {
                        // Fallback to modal if no projectId
                        setSelectedNotification(notif);
                        setIsModalOpen(true);
                      }
                    }}
                    className={`transition-all duration-300 hover:shadow-md cursor-pointer ${
                      isUnread 
                        ? "border-l-4 border-l-primary bg-primary/5 dark:bg-primary/10" 
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        {/* Icon based on notification type */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          isUnread ? "bg-primary/20" : "bg-muted"
                        }`}>
                          {notif.amount ? (
                            <DollarSign className={`h-5 w-5 ${isUnread ? "text-primary" : "text-muted-foreground"}`} />
                          ) : (
                            <Bell className={`h-5 w-5 ${isUnread ? "text-primary" : "text-muted-foreground"}`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className={`text-sm leading-relaxed ${
                              isUnread ? "font-semibold text-foreground" : "text-muted-foreground"
                            }`}>
                              {notif.message}
                            </p>
                            {isUnread && (
                              <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                New
                              </span>
                            )}
                          </div>

                          {/* Amount display if present */}
                          {notif.amount && (
                            <div className="inline-flex items-center gap-1 mb-2 text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded">
                              <DollarSign className="h-3 w-3" />
                              {notif.amount}
                            </div>
                          )}

                          {/* Footer with timestamp and status */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {notifDate.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: notifDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
                              })}
                              {' at '}
                              {notifDate.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </div>
                            {isRecent && (
                              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <Clock className="h-3 w-3" />
                                Recent
                              </span>
                            )}
                            {!isUnread && (
                              <span className="inline-flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Read
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {notifications.length === 0 && !loadingNotifications && (
                <Card className="py-16 border-dashed">
                  <CardContent className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Bell className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      You'll see updates here when someone backs your project or interacts with your campaigns.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <NotificationSettings />
          </TabsContent>

        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;

