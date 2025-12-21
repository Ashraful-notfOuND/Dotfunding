import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CreatorTimeline } from '@/components/creator/CreatorTimeline';
import { useAuth } from '@/hooks/useAuth';
import { useProjectRole } from '@/hooks/useProjectRole';

const ProjectTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch project to verify ownership and get title
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/projects/${id}`);
        if (res.ok) {
          const data = await res.json();
          const project = data.project || data;
          setProjectTitle(project.title || 'Project Timeline');
          setOwnerId(project.user_id || null);
        }
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProject();
  }, [id]);

  const projectRole = useProjectRole(ownerId, false);

  // Redirect if not creator
  useEffect(() => {
    if (!loading && !projectRole.isCreator) {
      navigate(`/project/${id}`);
    }
  }, [loading, projectRole.isCreator, id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(`/project/${id}`)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Project Timeline</h1>
          <p className="text-muted-foreground">{projectTitle}</p>
        </div>

        {/* Timeline Component */}
        <CreatorTimeline projectId={id || ''} />
      </div>

      <Footer />
    </div>
  );
};

export default ProjectTimeline;
