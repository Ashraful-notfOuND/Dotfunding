import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Trash2, Edit2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  users: {
    id: string;
    full_name: string;
    profile_picture: string | null;
  };
}

interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ProjectReviewsProps {
  projectId: string;
}

const ProjectReviews = ({ projectId }: ProjectReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
    if (user?.id) {
      fetchUserReview();
    }
  }, [projectId, user?.id]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/project/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  const fetchUserReview = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/project/${projectId}/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.review) {
          setUserReview(data.review);
          setRating(data.review.rating);
          setReviewText(data.review.review_text || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch user review:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to leave a review",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          userId: user.id,
          rating,
          reviewText: reviewText.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Review submitted",
          description: userReview ? "Your review has been updated" : "Thank you for your review!",
        });
        setUserReview(data.review);
        setIsEditing(false);
        fetchReviews();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit review",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview || !user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${userReview.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        toast({
          title: "Review deleted",
          description: "Your review has been removed",
        });
        setUserReview(null);
        setRating(0);
        setReviewText("");
        setIsEditing(false);
        fetchReviews();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to delete review",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (count: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= (interactive ? (hoverRating || rating) : count)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer" : ""}`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (stars: number, count: number) => {
    const percentage = statistics ? (count / statistics.totalReviews) * 100 : 0;
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm w-12">{stars} star</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 w-8">{count}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      {statistics && statistics.totalReviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center justify-center">
                <div className="text-5xl font-bold mb-2">
                  {statistics.averageRating}
                </div>
                <div className="mb-2">{renderStars(Math.round(statistics.averageRating))}</div>
                <div className="text-sm text-gray-600">
                  {statistics.totalReviews} {statistics.totalReviews === 1 ? "review" : "reviews"}
                </div>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars}>
                    {renderRatingBar(stars, statistics.ratingDistribution[stars as keyof typeof statistics.ratingDistribution])}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User's Review Form */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{userReview && !isEditing ? "Your Review" : "Write a Review"}</span>
              {userReview && !isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteReview}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!userReview || isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Rating</label>
                  {renderStars(rating, true)}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Your Review (Optional)
                  </label>
                  <Textarea
                    placeholder="Share your experience with this project..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmitReview} disabled={loading}>
                    {loading ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
                  </Button>
                  {isEditing && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        if (userReview) {
                          setRating(userReview.rating);
                          setReviewText(userReview.review_text || "");
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {renderStars(userReview.rating)}
                {userReview.review_text && (
                  <p className="text-gray-700">{userReview.review_text}</p>
                )}
                <p className="text-sm text-gray-500">
                  {new Date(userReview.updated_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>All Reviews ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No reviews yet. Be the first to review this project!
            </p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-start gap-4">
                    <Link to={`/creator/${review.user_id}`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold cursor-pointer hover:scale-110 transition-transform">
                        {review.users.full_name.charAt(0).toUpperCase()}
                      </div>
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Link to={`/creator/${review.user_id}`}>
                            <h4 className="font-semibold hover:text-purple-600 cursor-pointer">
                              {review.users.full_name}
                            </h4>
                          </Link>
                          <p className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      {review.review_text && (
                        <p className="text-gray-700 mt-2">{review.review_text}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectReviews;
