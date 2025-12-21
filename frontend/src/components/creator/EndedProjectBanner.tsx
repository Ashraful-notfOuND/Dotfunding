import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PartyPopper, TrendingDown, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const EndedProjectBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [endedProjects, setEndedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchEndedProjects = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/projects/user/${user.id}`);
        if (!res.ok) throw new Error('Failed to fetch projects');
        
        const data = await res.json();
        const ended = (data.projects || []).filter((p: any) => 
          p.status === 'ENDED_SUCCESS' || p.status === 'ENDED_FAILED'
        );
        setEndedProjects(ended);
      } catch (err) {
        console.error('Failed to fetch ended projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEndedProjects();
  }, [user]);

  if (loading || endedProjects.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {endedProjects.map((project) => {
        const isSuccess = project.status === 'ENDED_SUCCESS';
        const Icon = isSuccess ? PartyPopper : TrendingDown;
        
        return (
          <Alert 
            key={project.id}
            className={`border-l-4 ${
              isSuccess 
                ? 'border-l-green-500 bg-green-50/50' 
                : 'border-l-orange-500 bg-orange-50/50'
            }`}
          >
            <Icon className={`h-5 w-5 ${isSuccess ? 'text-green-600' : 'text-orange-600'}`} />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-1">
                  {isSuccess 
                    ? `🎉 "${project.title}" reached its funding goal!` 
                    : `"${project.title}" campaign has ended`
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {isSuccess 
                    ? 'View payment breakdown and next steps to receive your funds.' 
                    : 'Review campaign insights and explore options to relaunch.'
                  }
                </p>
              </div>
              <Button
                variant={isSuccess ? "default" : "outline"}
                size="sm"
                onClick={() => navigate(
                  isSuccess 
                    ? `/project/${project.id}/outcome` 
                    : `/campaign/unsuccessful`
                )}
                className="ml-4 whitespace-nowrap"
              >
                View Details
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
};
