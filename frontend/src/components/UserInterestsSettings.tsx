import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { recommendationService } from "@/services/recommendationService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Check } from "lucide-react";

const AVAILABLE_CATEGORIES = [
  "Technology",
  "Art",
  "Games",
  "Design",
  "Film",
  "Music",
  "Food",
  "Fashion",
  "Photography",
  "Comics",
  "Crafts",
  "Publishing",
  "Theater",
  "Dance",
  "Education",
  "Health",
  "Environment",
];

const UserInterestsSettings = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserInterests();
    }
  }, [isAuthenticated, user]);

  const loadUserInterests = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const categories = await recommendationService.getUserInterests(user.id);
      setSelectedCategories(categories);
    } catch (error) {
      console.error('Failed to load interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await recommendationService.updateUserInterests(user.id, selectedCategories);
      toast({
        title: "Interests Updated",
        description: `You selected ${selectedCategories.length} categories. We'll use this to recommend projects for you.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update interests. Please try again.",
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
          <CardTitle>User Interests</CardTitle>
          <CardDescription>Please log in to set your interests</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle>Your Interests</CardTitle>
        </div>
        <CardDescription>
          Select categories you're interested in to get personalized project recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {AVAILABLE_CATEGORIES.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <Button
                    key={category}
                    variant={isSelected ? "default" : "outline"}
                    className={`justify-between ${isSelected ? "bg-primary" : ""}`}
                    onClick={() => toggleCategory(category)}
                  >
                    <span>{category}</span>
                    {isSelected && <Check className="w-4 h-4" />}
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
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Interests"}
              </Button>
            </div>

            {selectedCategories.length > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Selected Categories:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserInterestsSettings;
