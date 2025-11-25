import { supabase } from "../config/supabaseClient.js";

/**
 * Create or update a review for a project
 */
export const createOrUpdateReview = async (req, res) => {
  try {
    const { projectId, userId, rating, reviewText } = req.body;

    // Validate input
    if (!projectId || !userId || !rating) {
      return res.status(400).json({ error: "Project ID, User ID, and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if user has backed this project
    const { data: pledge, error: pledgeError } = await supabase
      .from("pledges")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .eq("status", "paid")
      .limit(1);

    if (pledgeError) {
      console.error("Error checking pledge:", pledgeError);
    }

    if (!pledge || pledge.length === 0) {
      return res.status(403).json({ error: "You must back this project to leave a review" });
    }

    // Upsert review (create or update if already exists)
    const { data, error } = await supabase
      .from("reviews")
      .upsert({
        project_id: projectId,
        user_id: userId,
        rating: rating,
        review_text: reviewText || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'project_id,user_id'
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving review:", error);
      return res.status(500).json({ error: "Failed to save review", details: error.message });
    }

    return res.status(200).json({ message: "Review saved successfully", review: data });
  } catch (err) {
    console.error("createOrUpdateReview error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all reviews for a project with user details
 */
export const getProjectReviews = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    // Fetch reviews
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ error: "Failed to fetch reviews" });
    }

    // Fetch user details for each review
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const { data: user } = await supabase
          .from("users")
          .select("id, full_name, profile_picture")
          .eq("id", review.user_id)
          .single();
        
        return {
          ...review,
          users: user || { id: review.user_id, full_name: "Anonymous", profile_picture: null }
        };
      })
    );

    // Calculate average rating and rating distribution
    const totalReviews = reviewsWithUsers.length;
    const averageRating = totalReviews > 0 
      ? reviewsWithUsers.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution = {
      5: reviewsWithUsers.filter(r => r.rating === 5).length,
      4: reviewsWithUsers.filter(r => r.rating === 4).length,
      3: reviewsWithUsers.filter(r => r.rating === 3).length,
      2: reviewsWithUsers.filter(r => r.rating === 2).length,
      1: reviewsWithUsers.filter(r => r.rating === 1).length,
    };

    return res.status(200).json({
      reviews: reviewsWithUsers,
      statistics: {
        totalReviews,
        averageRating: parseFloat(averageRating.toFixed(1)),
        ratingDistribution,
      }
    });
  } catch (err) {
    console.error("getProjectReviews error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get user's review for a specific project
 */
export const getUserReview = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    
    if (!projectId || !userId) {
      return res.status(400).json({ error: "Project ID and User ID are required" });
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user review:", error);
      return res.status(500).json({ error: "Failed to fetch review" });
    }

    return res.status(200).json({ review: data || null });
  } catch (err) {
    console.error("getUserReview error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body;

    if (!reviewId || !userId) {
      return res.status(400).json({ error: "Review ID and User ID are required" });
    }

    // Verify the review belongs to the user
    const { data: review } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", reviewId)
      .single();

    if (!review || review.user_id !== userId) {
      return res.status(403).json({ error: "You can only delete your own reviews" });
    }

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      console.error("Error deleting review:", error);
      return res.status(500).json({ error: "Failed to delete review" });
    }

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("deleteReview error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
