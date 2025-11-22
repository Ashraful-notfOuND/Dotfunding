import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare, DollarSign, Heart, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newPledge: boolean;
  projectUpdate: boolean;
  newComment: boolean;
  projectRecommendation: boolean;
  milestoneReached: boolean;
  campaignEnding: boolean;
}

const NotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    newPledge: true,
    projectUpdate: true,
    newComment: true,
    projectRecommendation: false,
    milestoneReached: true,
    campaignEnding: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/notifications/preferences/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          // Map backend field names to frontend state
          setPreferences({
            emailNotifications: data.email_enabled,
            pushNotifications: data.push_enabled,
            newPledge: data.pledge_notifications,
            projectUpdate: data.update_notifications,
            newComment: data.comment_notifications,
            projectRecommendation: data.recommendation_notifications,
            milestoneReached: data.milestone_notifications,
            campaignEnding: data.campaign_ending_notifications,
          });
        }
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
      }
    };

    fetchPreferences();
  }, [user?.id]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Map frontend field names to backend schema
      const backendPrefs = {
        userId: user.id,
        email_enabled: preferences.emailNotifications,
        push_enabled: preferences.pushNotifications,
        pledge_notifications: preferences.newPledge,
        comment_notifications: preferences.newComment,
        update_notifications: preferences.projectUpdate,
        recommendation_notifications: preferences.projectRecommendation,
        milestone_notifications: preferences.milestoneReached,
        campaign_ending_notifications: preferences.campaignEnding,
      };

      console.log('🔧 Frontend preferences state:', preferences);
      console.log('📤 Sending to backend:', backendPrefs);

      const response = await fetch('http://localhost:5000/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPrefs),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error("Save preferences error:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Notification Settings</h2>
        <p className="text-muted-foreground">
          Manage how you receive updates and alerts
        </p>
      </div>

      {/* Channel Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="email" className="font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
            </div>
            <Switch
              id="email"
              checked={preferences.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="push" className="font-medium">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Get browser notifications</p>
              </div>
            </div>
            <Switch
              id="push"
              checked={preferences.pushNotifications}
              onCheckedChange={() => handleToggle("pushNotifications")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Activity Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Activity Notifications
          </CardTitle>
          <CardDescription>
            Get notified about important project activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <Label htmlFor="pledge" className="font-medium">New Pledge</Label>
                <p className="text-sm text-muted-foreground">
                  When someone backs your project
                </p>
              </div>
            </div>
            <Switch
              id="pledge"
              checked={preferences.newPledge}
              onCheckedChange={() => handleToggle("newPledge")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <Label htmlFor="comment" className="font-medium">New Comment</Label>
                <p className="text-sm text-muted-foreground">
                  When someone comments on your project
                </p>
              </div>
            </div>
            <Switch
              id="comment"
              checked={preferences.newComment}
              onCheckedChange={() => handleToggle("newComment")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-purple-600" />
              <div>
                <Label htmlFor="update" className="font-medium">Project Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Updates from projects you're backing
                </p>
              </div>
            </div>
            <Switch
              id="update"
              checked={preferences.projectUpdate}
              onCheckedChange={() => handleToggle("projectUpdate")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-pink-600" />
              <div>
                <Label htmlFor="recommendation" className="font-medium">
                  Project Recommendations
                </Label>
                <p className="text-sm text-muted-foreground">
                  Discover projects you might like
                </p>
              </div>
            </div>
            <Switch
              id="recommendation"
              checked={preferences.projectRecommendation}
              onCheckedChange={() => handleToggle("projectRecommendation")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <div>
                <Label htmlFor="milestone" className="font-medium">Milestone Reached</Label>
                <p className="text-sm text-muted-foreground">
                  When your project hits funding goals
                </p>
              </div>
            </div>
            <Switch
              id="milestone"
              checked={preferences.milestoneReached}
              onCheckedChange={() => handleToggle("milestoneReached")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-600" />
              <div>
                <Label htmlFor="ending" className="font-medium">Campaign Ending Soon</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders for campaigns ending within 48 hours
                </p>
              </div>
            </div>
            <Switch
              id="ending"
              checked={preferences.campaignEnding}
              onCheckedChange={() => handleToggle("campaignEnding")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
