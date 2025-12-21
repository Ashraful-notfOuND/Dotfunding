import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

/**
 * Project Outcome Router
 * Determines if project was successful or unsuccessful and routes accordingly
 * This would connect to real project data in production
 */
export default function ProjectOutcome() {
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // In production, fetch actual project data here
    checkProjectOutcome();
  }, [id]);

  const checkProjectOutcome = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`http://localhost:5000/api/projects/${id}/outcome`);
      // const data = await response.json();
      
      // For demo purposes, simulate checking project outcome
      // In production, check actual funding vs goal
      const demoProject = {
        fundingGoal: 10000,
        fundingCurrent: 2847, // Example: unsuccessful
        // fundingCurrent: 12000, // Example: successful
      };

      const fundingPercentage = (demoProject.fundingCurrent / demoProject.fundingGoal) * 100;
      const isSuccessful = fundingPercentage >= 100;

      // Route to appropriate workflow after brief loading
      setTimeout(() => {
        if (isSuccessful) {
          // Project was successfully funded
          navigate('/project/outcome/success', { replace: true });
        } else {
          // Project didn't reach its goal
          navigate('/campaign/unsuccessful', { replace: true });
        }
      }, 1500);

    } catch (error) {
      console.error('Error checking project outcome:', error);
      // Default to unsuccessful workflow on error
      navigate('/campaign/unsuccessful', { replace: true });
    }
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
