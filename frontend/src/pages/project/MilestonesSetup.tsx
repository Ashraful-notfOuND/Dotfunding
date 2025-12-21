import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { 
  Target, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Loader2 
} from "lucide-react";

interface Milestone {
  title: string;
  description: string;
  deadline: string;
}

/**
 * Milestones Setup Page
 * Mandatory page for successful projects
 * Creator must define exactly 3 milestones before proceeding
 */
export default function MilestonesSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const project = location.state?.project;

  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: "", description: "", deadline: "" },
    { title: "", description: "", deadline: "" },
    { title: "", description: "", deadline: "" }
  ]);

  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Redirect if no project data or not authenticated
  if (!project || !isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleChange = (index: number, field: keyof Milestone, value: string) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
    setErrors([]); // Clear errors on change
  };

  const validate = () => {
    const newErrors: string[] = [];

    milestones.forEach((milestone, index) => {
      if (!milestone.title.trim()) {
        newErrors.push(`Milestone ${index + 1}: Title is required`);
      }
      if (!milestone.description.trim()) {
        newErrors.push(`Milestone ${index + 1}: Description is required`);
      }
      if (!milestone.deadline) {
        newErrors.push(`Milestone ${index + 1}: Deadline is required`);
      } else {
        // Check if deadline is in the future
        const deadlineDate = new Date(milestone.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (deadlineDate < today) {
          newErrors.push(`Milestone ${index + 1}: Deadline must be in the future`);
        }
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      let authToken = null;
      
      // Try to get Supabase session token if available (OAuth users)
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          authToken = session.access_token;
        }
      }
      
      // If no token, this is a traditional login - send user ID in body
      const requestBody = authToken 
        ? { milestones }
        : { milestones, userId: user?.id };
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const res = await fetch(`http://localhost:5000/api/projects/${project.id}/milestones`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit milestones');
      }

      // Success - redirect to project page
      navigate(`/project/${project.id}`, {
        state: { message: 'Milestones submitted successfully!' }
      });

    } catch (error: any) {
      console.error('Error submitting milestones:', error);
      setErrors([error.message || 'Failed to submit milestones']);
    } finally {
      setLoading(false);
    }
  };

  const isValid = milestones.every(m => 
    m.title.trim() && m.description.trim() && m.deadline
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Define Your Milestones</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Before you can access your funds, please outline your fulfillment plan.
            This helps backers track your progress and builds trust.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Project: <span className="font-semibold">{project.title}</span>
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/30">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <strong>Important:</strong> You must define exactly 3 milestones. Once submitted, 
            milestones can only be modified by platform admins to ensure backer trust.
          </AlertDescription>
        </Alert>

        {/* Main Card */}
        <Card className="shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              Your 3 Milestones
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Define clear, achievable goals with realistic deadlines
            </p>
          </CardHeader>
          
          <CardContent className="pt-6 pb-8">
            {/* Milestones Form */}
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className="p-6 border-2 border-border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold">Milestone {index + 1}</h3>
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <Label htmlFor={`title-${index}`} className="text-base font-medium mb-2">
                      Title *
                    </Label>
                    <Input
                      id={`title-${index}`}
                      placeholder="e.g., Complete product design and prototyping"
                      value={milestone.title}
                      onChange={(e) => handleChange(index, 'title', e.target.value)}
                      className="mt-1"
                      maxLength={255}
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <Label htmlFor={`desc-${index}`} className="text-base font-medium mb-2">
                      Description *
                    </Label>
                    <Textarea
                      id={`desc-${index}`}
                      placeholder="Describe what you'll accomplish in this milestone..."
                      value={milestone.description}
                      onChange={(e) => handleChange(index, 'description', e.target.value)}
                      className="mt-1 min-h-[100px]"
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {milestone.description.length}/1000 characters
                    </p>
                  </div>

                  {/* Deadline */}
                  <div>
                    <Label htmlFor={`deadline-${index}`} className="text-base font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Target Deadline *
                    </Label>
                    <Input
                      id={`deadline-${index}`}
                      type="date"
                      min={today}
                      value={milestone.deadline}
                      onChange={(e) => handleChange(index, 'deadline', e.target.value)}
                      className="mt-1 max-w-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Please fix the following errors:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, idx) => (
                      <li key={idx} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!isValid || loading}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-white font-semibold px-12"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Submit Milestones
                  </>
                )}
              </Button>
            </div>

            {/* Footer Note */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                💡 <strong>Pro Tip:</strong> Be realistic with your deadlines. It's better to under-promise 
                and over-deliver than to miss deadlines and lose backer trust.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
