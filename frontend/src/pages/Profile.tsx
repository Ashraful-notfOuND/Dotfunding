import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { User, Settings, Heart } from "lucide-react";
import projectTech from "@/assets/project-tech.jpg";
import projectArt from "@/assets/project-art.jpg";
import projectGame from "@/assets/project-game.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const profileData = {
    name: user.name,
    email: user.email,
    avatar: user.name.split(' ').map(n => n[0]).join(''),
    joinedDate: "January 2024",
    projectsCreated: 2,
    projectsBacked: 12,
    totalBacked: 1840,
  };

  const myProjects = [
    {
      id: "1",
      title: "Revolutionary Smart Watch with Health Monitoring",
      creator: "TechInnovate",
      image: projectTech,
      fundingGoal: 50000,
      fundingCurrent: 42350,
      daysLeft: 12,
      category: "Technology",
    },
    {
      id: "2",
      title: "Art Book: Journey Through Modern Abstract Painting",
      creator: "Sarah Mitchell",
      image: projectArt,
      fundingGoal: 15000,
      fundingCurrent: 18200,
      daysLeft: 8,
      category: "Art",
    },
  ];

  const backedProjects = [
    {
      id: "3",
      title: "Epic Fantasy Board Game: Dragon's Quest",
      creator: "GameCraft Studios",
      image: projectGame,
      fundingGoal: 35000,
      fundingCurrent: 28500,
      daysLeft: 15,
      category: "Games",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="mb-8 animate-fade-in">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">
                  {profileData.avatar}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{profileData.name}</h1>
                  <p className="text-muted-foreground mb-4">{profileData.email}</p>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <span className="font-semibold text-foreground">
                        {profileData.projectsCreated}
                      </span>{" "}
                      <span className="text-muted-foreground">projects created</span>
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
                      <span className="text-muted-foreground">Member since {profileData.joinedDate}</span>
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

        {/* Tabs */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map((project) => (
                <div key={project.id} className="flex flex-col gap-2">
                  <ProjectCard {...project} />
                  <Link to={`/project/${project.id}/edit`}>
                    <Button variant="outline" className="w-full">Edit Project</Button>
                  </Link>
                </div>
              ))}
            </div>

            {myProjects.length === 0 && (
              <Card className="py-12">
                <CardContent className="text-center">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start your crowdfunding journey by creating your first project
                  </p>
                  <Button className="bg-accent hover:bg-accent-hover">
                    Create Your First Project
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="backed">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">Projects I've Backed</h2>
              <p className="text-muted-foreground">
                Campaigns you've supported with your pledges
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {backedProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>

            {backedProjects.length === 0 && (
              <Card className="py-12">
                <CardContent className="text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No backed projects yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Discover amazing projects and support creators you believe in
                  </p>
                  <Button>Explore Projects</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
