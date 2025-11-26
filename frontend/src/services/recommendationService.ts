const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ========================
// Types
// ========================

export interface UserInterest {
  id: string;
  user_id: string;
  category: string;
  created_at: string;
}

export interface ProjectSubscription {
  id: string;
  project_id: string;
  user_id: string;
  notify_on_update: boolean;
  notify_on_milestone: boolean;
  notify_on_comment: boolean;
  channels: string[];
  created_at: string;
}

export interface NotificationPreferences {
  channels: string[];
  frequency: 'instant' | 'daily' | 'weekly';
  quiet_hours?: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface RecommendedProject {
  id: string;
  title: string;
  tagline: string;
  category: string;
  image_url: string;
  funding_goal: number;
  current_funding?: number;
  funding_deadline: string;
  user_id: string;
  score?: number;
  strategy?: string;
}

// ========================
// Recommendation APIs
// ========================

export const recommendationService = {
  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(
    userId: string,
    strategy: 'interest' | 'trending' | 'collaborative' | 'past-pledge' = 'interest',
    limit: number = 10
  ): Promise<RecommendedProject[]> {
    const response = await fetch(
      `${API_BASE_URL}/recommendations/${userId}?strategy=${strategy}&limit=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    const data = await response.json();
    const recommendations: RecommendedProject[] = data.recommendations || [];

    // If backend returned lightweight items (or only ids), fetch full project records
    const enriched: RecommendedProject[] = await Promise.all(
      recommendations.map(async (r) => {
        if (r && r.title && r.tagline) return r; // already full
        try {
          const proj = await recommendationService.getProjectById(r.id);
          return proj as RecommendedProject;
        } catch (e) {
          return r;
        }
      })
    );

    return enriched;
  },

  /**
   * Get combined recommendations from all strategies
   */
  async getCombinedRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<RecommendedProject[]> {
    const response = await fetch(
      `${API_BASE_URL}/recommendations/${userId}/combined?limit=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch combined recommendations');
    const data = await response.json();
    const recommendations: RecommendedProject[] = data.recommendations || [];
    const enriched: RecommendedProject[] = await Promise.all(
      recommendations.map(async (r) => {
        if (r && r.title && r.tagline) return r;
        try {
          const proj = await recommendationService.getProjectById(r.id);
          return proj as RecommendedProject;
        } catch (e) {
          return r;
        }
      })
    );

    return enriched;
  },

  // Helper: fetch project by id from projects API
  async getProjectById(id: string): Promise<RecommendedProject | null> {
    const resp = await fetch(`${API_BASE_URL.replace(/\/api$/, '')}/api/projects/${id}`);
    if (!resp.ok) {
      throw new Error('Failed to fetch project');
    }
    const body = await resp.json();
    // backend returns { project: {...} } or { data: {...} }
    const proj = body.project || body.data || body;
    if (!proj) return null;
    return {
      id: proj.id,
      title: proj.title || proj.name || '',
      tagline: proj.tagline || proj.description || '',
      category: proj.category || '',
      image_url: proj.image_url || proj.image_urls || (proj.images && proj.images[0]) || '',
      funding_goal: proj.funding_goal || proj.goal || 0,
      current_funding: proj.current_funding || proj.raised || 0,
      funding_deadline: proj.funding_deadline || proj.deadline || '',
      user_id: proj.user_id || proj.creator_id || proj.owner_id || '',
      score: (proj.score as number) || undefined,
      strategy: (proj.strategy as string) || undefined,
    };
  },

  // ========================
  // Subscription APIs
  // ========================

  /**
   * Subscribe to project updates
   */
  async subscribeToProject(
    projectId: string,
    userId: string,
    preferences: {
      onUpdate?: boolean;
      onMilestone?: boolean;
      onComment?: boolean;
      channels?: string[];
    } = {}
  ): Promise<{ success: boolean; subscription: ProjectSubscription }> {
    const response = await fetch(
      `${API_BASE_URL}/recommendations/subscriptions/${projectId}/${userId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onUpdate: preferences.onUpdate ?? true,
          onMilestone: preferences.onMilestone ?? true,
          onComment: preferences.onComment ?? false,
          channels: preferences.channels ?? ['in-app', 'email'],
        }),
      }
    );
    if (!response.ok) throw new Error('Failed to subscribe to project');
    return response.json();
  },

  /**
   * Unsubscribe from project updates
   */
  async unsubscribeFromProject(
    projectId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/recommendations/subscriptions/${projectId}/${userId}`,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) throw new Error('Failed to unsubscribe from project');
    return response.json();
  },

  /**
   * Get user's subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<ProjectSubscription[]> {
    const response = await fetch(
      `${API_BASE_URL}/recommendations/subscriptions/user/${userId}`
    );
    if (!response.ok) throw new Error('Failed to fetch subscriptions');
    const data = await response.json();
    return data.subscriptions || [];
  },

  /**
   * Check if user is subscribed to a project
   */
  async isSubscribed(projectId: string, userId: string): Promise<boolean> {
    try {
      const subscriptions = await this.getUserSubscriptions(userId);
      return subscriptions.some((sub) => sub.project_id === projectId);
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  },

  // ========================
  // User Interests APIs
  // ========================

  /**
   * Get user's interests
   */
  async getUserInterests(userId: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/recommendations/interests/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch interests');
    const data = await response.json();
    return data.categories || [];
  },

  /**
   * Update user's interests
   */
  async updateUserInterests(
    userId: string,
    categories: string[]
  ): Promise<{ success: boolean; interests: UserInterest[] }> {
    const response = await fetch(`${API_BASE_URL}/recommendations/interests/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories }),
    });
    if (!response.ok) throw new Error('Failed to update interests');
    return response.json();
  },

  // ========================
  // Notification Preferences APIs
  // ========================

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: NotificationPreferences
  ): Promise<{ success: boolean; preferences: NotificationPreferences }> {
    const response = await fetch(`${API_BASE_URL}/recommendations/preferences/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    });
    if (!response.ok) throw new Error('Failed to update preferences');
    return response.json();
  },
};
