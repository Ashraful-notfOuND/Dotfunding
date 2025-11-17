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
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { User, Settings, Heart } from "lucide-react";
import defaultAvatar from "@/assets/default-avatar.png";


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

  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(false);
  const [errorProjects, setErrorProjects] = useState<string | null>(null);

  // === added: notifications state ===
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState<string | null>(null);
  // === end added ===

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

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

        // Mark as read
        await fetch(`http://localhost:5000/api/notifications/mark-read/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        });
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

  if (!isAuthenticated || !user) {
    return null;
  }
  const profileData = {
    name: user.name,
    email: user.email,
    joinedDate: "January 2024",
    projectsCreated: myProjects.length,
    projectsBacked: 0,
    totalBacked: 0,
  };

  return (
    <div className="min-h-screen flex flex-col">
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
                        ${profileData.totalBacked}
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

        <Tabs defaultValue="created" className="w-full">
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
              🔔 Notifications
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map((project) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* placeholder */}
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">Notifications</h2>
              <p className="text-muted-foreground">Updates about activity on your projects</p>
            </div>

            {loadingNotifications && <p>Loading notifications...</p>}
            {errorNotifications && (
              <p className="text-red-500">Error: {errorNotifications}</p>
            )}

            <div className="flex flex-col gap-4">
              {notifications.map((notif) => (
                <Card
                  key={notif.id}
                  className={`transition-colors duration-200 ${notif.is_read ? "" : "bg-yellow-50 dark:bg-yellow-900"
                    }`}
                >
                  <CardContent className="py-4">
                    <div className="flex justify-between items-start">
                      <p className="text-foreground font-medium">{notif.message}</p>
                      {!notif.is_read && (
                        <span className="text-xs text-white bg-accent px-2 py-0.5 rounded">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {notifications.length === 0 && !loadingNotifications && (
                <Card className="py-12">
                  <CardContent className="text-center">
                    <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
                    <p className="text-muted-foreground">
                      You'll see updates here when someone backs your project.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;

