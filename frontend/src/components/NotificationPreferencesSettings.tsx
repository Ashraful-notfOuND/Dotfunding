import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { recommendationService, NotificationPreferences } from "@/services/recommendationService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Bell, Mail, Smartphone, MessageSquare } from "lucide-react";

const NotificationPreferencesSettings = () => {
  const { user, isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    channels: ["in-app"],
    frequency: "instant",
    quiet_hours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
  });
  const [saving, setSaving] = useState(false);

  const channelOptions = [
    { id: "in-app", label: "In-App Notifications", icon: Bell },
    { id: "email", label: "Email Notifications", icon: Mail },
    { id: "sms", label: "SMS Notifications", icon: Smartphone },
    { id: "push", label: "Push Notifications", icon: MessageSquare },
  ];

  const toggleChannel = (channelId: string) => {
    setPreferences((prev) => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter((c) => c !== channelId)
        : [...prev.channels, channelId],
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await recommendationService.updateNotificationPreferences(user.id, preferences);
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Please log in to manage your notification settings</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <CardTitle>Notification Preferences</CardTitle>
        </div>
        <CardDescription>
          Choose how and when you want to receive notifications about projects you follow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Channels */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Notification Channels</h3>
          <div className="space-y-3">
            {channelOptions.map((channel) => {
              const Icon = channel.icon;
              const isEnabled = preferences.channels.includes(channel.id);
              return (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <Label htmlFor={channel.id} className="cursor-pointer">
                      {channel.label}
                    </Label>
                  </div>
                  <Switch
                    id={channel.id}
                    checked={isEnabled}
                    onCheckedChange={() => toggleChannel(channel.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Notification Frequency */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Notification Frequency</h3>
          <RadioGroup
            value={preferences.frequency}
            onValueChange={(value) =>
              setPreferences((prev) => ({
                ...prev,
                frequency: value as "instant" | "daily" | "weekly",
              }))
            }
          >
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="instant" id="instant" />
              <Label htmlFor="instant" className="cursor-pointer flex-1">
                <div className="font-medium">Instant</div>
                <div className="text-sm text-muted-foreground">
                  Get notified immediately when something happens
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily" className="cursor-pointer flex-1">
                <div className="font-medium">Daily Digest</div>
                <div className="text-sm text-muted-foreground">
                  Receive a summary once per day
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly" className="cursor-pointer flex-1">
                <div className="font-medium">Weekly Digest</div>
                <div className="text-sm text-muted-foreground">
                  Receive a summary once per week
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Quiet Hours */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Quiet Hours</h3>
            <Switch
              checked={preferences.quiet_hours?.enabled || false}
              onCheckedChange={(enabled) =>
                setPreferences((prev) => ({
                  ...prev,
                  quiet_hours: { ...prev.quiet_hours!, enabled },
                }))
              }
            />
          </div>
          {preferences.quiet_hours?.enabled && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-3">
                No notifications will be sent during these hours
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time" className="text-xs">
                    Start Time
                  </Label>
                  <input
                    type="time"
                    id="start-time"
                    value={preferences.quiet_hours.start}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        quiet_hours: {
                          ...prev.quiet_hours!,
                          start: e.target.value,
                        },
                      }))
                    }
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <Label htmlFor="end-time" className="text-xs">
                    End Time
                  </Label>
                  <input
                    type="time"
                    id="end-time"
                    value={preferences.quiet_hours.end}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        quiet_hours: {
                          ...prev.quiet_hours!,
                          end: e.target.value,
                        },
                      }))
                    }
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferencesSettings;
