import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Bell, Mail, MessageSquare, DollarSign, Heart, TrendingUp, 
  Sparkles, Check, Smartphone, Users, History, Zap, Save, 
  Clock, Target, Lightbulb 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  newPledge: boolean;
  projectUpdate: boolean;
  newComment: boolean;
  projectRecommendation: boolean;
  milestoneReached: boolean;
  campaignEnding: boolean;
}

interface RecommendationPreferences {
  enabled: boolean;
  strategy: 'interest' | 'trending' | 'collaborative' | 'past-pledge' | 'auto';
  frequency: 'instant' | 'daily' | 'weekly';
  channels: string[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface UserInterest {
  category: string;
  weight: number;
}

const AVAILABLE_CATEGORIES = [
  "Technology", "Art", "Games", "Design", "Film", "Music",
  "Food", "Fashion", "Photography", "Comics", "Crafts",
  "Publishing", "Theater", "Dance", "Education", "Health", "Environment",
];

const NotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newPledge: true,
    projectUpdate: true,
    newComment: true,
    projectRecommendation: true,
    milestoneReached: true,
    campaignEnding: true,
  });
  
  const [recommendationPrefs, setRecommendationPrefs] = useState<RecommendationPreferences>({
    enabled: true,
    strategy: 'auto',
    frequency: 'daily',
    channels: ['in-app', 'email'],
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications");

  useEffect(() => {
    if (user?.id) {
      loadAllSettings();
    }
  }, [user?.id]);

  const loadAllSettings = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const notifResponse = await fetch(`http://localhost:5000/api/notifications/preferences/${user.id}`);
      if (notifResponse.ok) {
        const data = await notifResponse.json();
        setPreferences({
          emailNotifications: data.email_enabled ?? true,
          pushNotifications: data.push_enabled ?? true,
          smsNotifications: data.sms_enabled ?? false,
          newPledge: data.pledge_notifications ?? true,
          projectUpdate: data.update_notifications ?? true,
          newComment: data.comment_notifications ?? true,
          projectRecommendation: data.recommendation_notifications ?? true,
          milestoneReached: data.milestone_notifications ?? true,
          campaignEnding: data.campaign_ending_notifications ?? true,
        });
      }

      const interestsResponse = await fetch(`http://localhost:5000/api/recommendations/interests/${user.id}`);
      if (interestsResponse.ok) {
        const data = await interestsResponse.json();
        const categories = data.categories || data.interests?.map((i: UserInterest) => i.category) || [];
        setSelectedCategories(categories);
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleRecommendationChannel = (channel: string) => {
    setRecommendationPrefs(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const handleSaveAll = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const notifPayload = {
        userId: user.id,
        email_enabled: preferences.emailNotifications,
        push_enabled: preferences.pushNotifications,
        sms_enabled: preferences.smsNotifications,
        pledge_notifications: preferences.newPledge,
        comment_notifications: preferences.newComment,
        update_notifications: preferences.projectUpdate,
        recommendation_notifications: preferences.projectRecommendation,
        milestone_notifications: preferences.milestoneReached,
        campaign_ending_notifications: preferences.campaignEnding,
      };

      await fetch('http://localhost:5000/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifPayload),
      });

      if (selectedCategories.length > 0) {
        await fetch(`http://localhost:5000/api/recommendations/interests/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categories: selectedCategories,
          }),
        });
      }

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error("Save preferences error:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Settings & Preferences</h2>
          <p className="text-muted-foreground">
            Customize how you receive notifications and discover projects
          </p>
        </div>
        <Button 
          onClick={handleSaveAll} 
          disabled={saving || loading}
          size="lg"
          className="gap-2 w-full sm:w-auto"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded w-2/3 mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Recommendations</span>
            </TabsTrigger>
            <TabsTrigger value="interests" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Interests</span>
            </TabsTrigger>
          </TabsList>

          {/* NOTIFICATIONS TAB */}
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5 text-primary" />
                    Notification Channels
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to receive updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { id: 'emailNotifications', icon: Mail, label: 'Email', desc: 'Get updates via email' },
                    { id: 'pushNotifications', icon: Bell, label: 'Push', desc: 'Browser notifications' },
                    { id: 'smsNotifications', icon: Smartphone, label: 'SMS', desc: 'Text message alerts' },
                  ].map(({ id, icon: Icon, label, desc }) => (
                    <div key={id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label htmlFor={id} className="font-medium cursor-pointer">{label}</Label>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                      <Switch
                        id={id}
                        checked={preferences[id as keyof NotificationPreferences] as boolean}
                        onCheckedChange={() => handleToggle(id as keyof NotificationPreferences)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Activity Alerts
                  </CardTitle>
                  <CardDescription>
                    Events you want to be notified about
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { id: 'newPledge', icon: DollarSign, label: 'New Pledge', desc: 'Someone backs your project', color: 'text-green-600' },
                    { id: 'newComment', icon: MessageSquare, label: 'Comments', desc: 'New comments on projects', color: 'text-blue-600' },
                    { id: 'projectUpdate', icon: Bell, label: 'Project Updates', desc: 'Creator posts an update', color: 'text-purple-600' },
                  ].map(({ id, icon: Icon, label, desc, color }) => (
                    <div key={id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${color}`} />
                        <div>
                          <Label htmlFor={id} className="font-medium cursor-pointer">{label}</Label>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                      <Switch
                        id={id}
                        checked={preferences[id as keyof NotificationPreferences] as boolean}
                        onCheckedChange={() => handleToggle(id as keyof NotificationPreferences)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-primary" />
                    Campaign Milestones
                  </CardTitle>
                  <CardDescription>
                    Important project events and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'milestoneReached', icon: Target, label: 'Milestones', desc: 'Funding goals reached', color: 'text-yellow-600' },
                      { id: 'campaignEnding', icon: Clock, label: 'Campaign Ending', desc: 'Projects closing soon', color: 'text-red-600' },
                      { id: 'projectRecommendation', icon: Sparkles, label: 'Recommendations', desc: 'Project suggestions', color: 'text-primary' },
                    ].map(({ id, icon: Icon, label, desc, color }) => (
                      <div key={id} className="flex flex-col gap-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <Icon className={`h-6 w-6 ${color}`} />
                          <Switch
                            id={id}
                            checked={preferences[id as keyof NotificationPreferences] as boolean}
                            onCheckedChange={() => handleToggle(id as keyof NotificationPreferences)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={id} className="font-medium cursor-pointer">{label}</Label>
                          <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* RECOMMENDATIONS TAB */}
          <TabsContent value="recommendations" className="space-y-6 mt-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Recommendation Strategy
                </CardTitle>
                <CardDescription>
                  Choose how we suggest projects to you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <div>
                      <Label htmlFor="rec-enabled" className="font-semibold cursor-pointer">
                        Enable Personalized Recommendations
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get project suggestions tailored to your interests
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="rec-enabled"
                    checked={recommendationPrefs.enabled}
                    onCheckedChange={(checked) =>
                      setRecommendationPrefs(prev => ({ ...prev, enabled: checked }))
                    }
                  />
                </div>

                {recommendationPrefs.enabled && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Recommendation Algorithm
                      </h4>
                      <RadioGroup
                        value={recommendationPrefs.strategy}
                        onValueChange={(value: any) =>
                          setRecommendationPrefs(prev => ({ ...prev, strategy: value }))
                        }
                        className="space-y-3"
                      >
                        {[
                          { value: 'auto', icon: Zap, label: 'Auto (Smart Mix)', desc: 'Combines all strategies for best results' },
                          { value: 'interest', icon: Heart, label: 'Interest-Based', desc: 'Projects matching your selected interests' },
                          { value: 'trending', icon: TrendingUp, label: 'Trending', desc: 'Popular projects with high activity' },
                          { value: 'collaborative', icon: Users, label: 'Collaborative', desc: 'What similar users are backing' },
                          { value: 'past-pledge', icon: History, label: 'Past Pledges', desc: 'Similar to projects you backed' },
                        ].map(({ value, icon: Icon, label, desc }) => (
                          <div key={value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                            <RadioGroupItem value={value} id={value} className="mt-1" />
                            <Label htmlFor={value} className="cursor-pointer flex-1">
                              <div className="flex items-center gap-2 font-medium mb-1">
                                <Icon className="h-4 w-4" />
                                {label}
                              </div>
                              <div className="text-sm text-muted-foreground">{desc}</div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Notification Frequency
                      </h4>
                      <RadioGroup
                        value={recommendationPrefs.frequency}
                        onValueChange={(value: any) =>
                          setRecommendationPrefs(prev => ({ ...prev, frequency: value }))
                        }
                        className="space-y-3"
                      >
                        {[
                          { value: 'instant', label: 'Instant', desc: 'Get notified as soon as we find a match' },
                          { value: 'daily', label: 'Daily Digest', desc: 'Receive a curated list once per day' },
                          { value: 'weekly', label: 'Weekly Summary', desc: 'Get a weekly roundup of recommendations' },
                        ].map(({ value, label, desc }) => (
                          <div key={value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                            <RadioGroupItem value={value} id={`freq-${value}`} className="mt-1" />
                            <Label htmlFor={`freq-${value}`} className="cursor-pointer flex-1">
                              <div className="font-medium mb-1">{label}</div>
                              <div className="text-sm text-muted-foreground">{desc}</div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notification Channels for Recommendations
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'in-app', label: 'In-App' },
                          { id: 'email', label: 'Email' },
                          { id: 'push', label: 'Push' },
                          { id: 'sms', label: 'SMS' },
                        ].map(({ id, label }) => (
                          <div
                            key={id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              recommendationPrefs.channels.includes(id)
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => toggleRecommendationChannel(id)}
                          >
                            <div className="flex items-center justify-between">
                              <Label className="cursor-pointer font-medium">{label}</Label>
                              {recommendationPrefs.channels.includes(id) && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Quiet Hours
                        </h4>
                        <Switch
                          checked={recommendationPrefs.quietHours.enabled}
                          onCheckedChange={(checked) =>
                            setRecommendationPrefs(prev => ({
                              ...prev,
                              quietHours: { ...prev.quietHours, enabled: checked },
                            }))
                          }
                        />
                      </div>
                      {recommendationPrefs.quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Start Time</Label>
                            <input
                              type="time"
                              value={recommendationPrefs.quietHours.start}
                              onChange={(e) =>
                                setRecommendationPrefs(prev => ({
                                  ...prev,
                                  quietHours: { ...prev.quietHours, start: e.target.value },
                                }))
                              }
                              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">End Time</Label>
                            <input
                              type="time"
                              value={recommendationPrefs.quietHours.end}
                              onChange={(e) =>
                                setRecommendationPrefs(prev => ({
                                  ...prev,
                                  quietHours: { ...prev.quietHours, end: e.target.value },
                                }))
                              }
                              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* INTERESTS TAB */}
          <TabsContent value="interests" className="space-y-6 mt-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Your Interests
                </CardTitle>
                <CardDescription>
                  Select categories you're interested in to get personalized project recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {AVAILABLE_CATEGORIES.map((category) => {
                    const isSelected = selectedCategories.includes(category);
                    return (
                      <Button
                        key={category}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-auto py-3 px-4 justify-start ${
                          isSelected ? "bg-primary shadow-md" : ""
                        }`}
                        onClick={() => toggleCategory(category)}
                      >
                        <span className="flex-1 text-left">{category}</span>
                        {isSelected && <Check className="w-4 h-4 ml-2" />}
                      </Button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {selectedCategories.length === 0
                      ? "No categories selected"
                      : `${selectedCategories.length} ${
                          selectedCategories.length === 1 ? "category" : "categories"
                        } selected`}
                  </div>
                </div>

                {selectedCategories.length > 0 && (
                  <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Your Selected Interests:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map((category) => (
                        <Badge key={category} variant="secondary" className="text-sm py-1 px-3">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default NotificationSettings;
