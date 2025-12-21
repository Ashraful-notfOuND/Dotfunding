import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Project Outcome Router
 * Determines if project was successful or unsuccessful and routes accordingly
 * Checks if outcome already acknowledged to prevent showing it multiple times
 */
export default function ProjectOutcome() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.log('ProjectOutcome - location.state:', location.state);
    
    // Check if outcome was already acknowledged
    checkOutcomeStatus();
  }, [id]);

  const checkOutcomeStatus = async () => {
    try {
      // First check if outcome already acknowledged
      const statusRes = await fetch(`http://localhost:5000/api/projects/${id}/outcome-status`);
      
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        console.log('Outcome status:', statusData);
        
        // If already acknowledged, skip to appropriate page
        if (statusData.acknowledged) {
          console.log('Outcome already acknowledged, redirecting...');
          
          if (statusData.status === 'ENDED_SUCCESS') {
            // Success - check if milestones exist
            if (statusData.fulfillmentStatus === 'awaiting_milestones') {
              // Need to set up milestones
              const project = await fetchProjectData();
              navigate(`/project/${id}/milestones/setup`, { 
                replace: true,
                state: { project }
              });
            } else {
              // Already has milestones, go to project page
              navigate(`/project/${id}`, { replace: true });
            }
          } else {
            // Unsuccessful - go to project page
            navigate(`/project/${id}`, { replace: true });
          }
          return;
        }
      }
      
      // Outcome not yet acknowledged, proceed with normal flow
      if (location.state?.project) {
        console.log('ProjectOutcome - Using passed project data:', location.state.project);
        checkProjectOutcome(location.state.project);
      } else {
        console.log('ProjectOutcome - Fetching project data for id:', id);
        fetchAndCheckOutcome();
      }
    } catch (error) {
      console.error('Error checking outcome status:', error);
      // On error, continue with normal flow
      fetchAndCheckOutcome();
    }
  };

  const fetchProjectData = async () => {
    const response = await fetch(`http://localhost:5000/api/projects/${id}`);
    if (!response.ok) throw new Error('Failed to fetch project');
    const data = await response.json();
    return data.project || data;
  };

  const fetchAndCheckOutcome = async () => {
    try {
      const project = await fetchProjectData();
      checkProjectOutcome(project);
    } catch (error) {
      console.error('Error checking project outcome:', error);
      navigate('/', { replace: true });
    }
  };

  const checkProjectOutcome = (project: any) => {
    console.log('ProjectOutcome - Checking project:', project);
    const fundingCurrent = project.fundingCurrent || 0;
    const fundingGoal = project.fundingGoal || 1;
    const fundingPercentage = (fundingCurrent / fundingGoal) * 100;
    const isSuccessful = fundingPercentage >= 100;

    console.log(`ProjectOutcome - Funding: ${fundingCurrent}/${fundingGoal} = ${fundingPercentage}%, Success: ${isSuccessful}`);

    // Route to appropriate workflow after brief loading
    setTimeout(() => {
      if (isSuccessful) {
        // Project was successfully funded - pass project data
        console.log('ProjectOutcome - Navigating to success with project:', project);
        navigate('/project/outcome/success', { 
          replace: true,
          state: { project }
        });
      } else {
        // Project didn't reach its goal - pass project data
        console.log('ProjectOutcome - Navigating to unsuccessful with project:', project);
        navigate('/campaign/unsuccessful', { 
          replace: true,
          state: { project }
        });
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <Card className="max-w-md w-full shadow-xl border-2">
        <CardContent className="pt-12 pb-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Analyzing Campaign Results</h2>
          <p className="text-muted-foreground">
            Please wait while we review your campaign outcome...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
