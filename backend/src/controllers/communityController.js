import { supabase } from "../config/supabaseClient.js";

/**
 * Community Controller
 * Handles project-specific community posts, polls, comments, and reactions
 */

// ==========================================
// HELPER: Check if user is a backer
// ==========================================
const isUserBacker = async (userId, projectId) => {
  const { data, error } = await supabase.rpc('is_project_backer', {
    user_uuid: userId,
    project_uuid: projectId
  });
  
  if (error) {
    console.error('Error checking backer status:', error);
    return false;
  }
  
  return data === true;
};

// ==========================================
// HELPER: Check if user is project creator
// ==========================================
const isProjectCreator = async (userId, projectId) => {
  const { data: project } = await supabase
    .from('main_projects')
    .select('user_id')
    .eq('id', projectId)
    .single();
  
  return project && project.user_id === userId;
};

// ==========================================
// POSTS
// ==========================================

/**
 * Get all community posts for a project
 * GET /api/community/:projectId/posts
 */
export const getCommunityPosts = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sort = 'recent' } = req.query; // 'recent' or 'popular'
    
    let query = supabase
      .from('community_posts')
      .select(`
        *,
        users:user_id (id, full_name, email, profile_pic),
        reaction_count:community_reactions(count),
        comment_count:community_comments(count)
      `)
      .eq('project_id', projectId);
    
    // Sort: pinned first, then by criteria
    if (sort === 'popular') {
      query = query.order('is_pinned', { ascending: false })
                   .order('created_at', { ascending: false }); // TODO: order by reaction count
    } else {
      query = query.order('is_pinned', { ascending: false })
                   .order('created_at', { ascending: false });
    }
    
    const { data: posts, error } = await query;
    
    if (error) throw error;
    
    // Format posts with counts
    const formattedPosts = posts.map(post => ({
      ...post,
      reaction_count: post.reaction_count?.[0]?.count || 0,
      comment_count: post.comment_count?.[0]?.count || 0,
      author: post.users
    }));
    
    return res.status(200).json({ posts: formattedPosts });
  } catch (err) {
    console.error('Error fetching community posts:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch posts' });
  }
};

/**
 * Create a new community post or poll
 * POST /api/community/:projectId/posts
 */
export const createCommunityPost = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user_id, type, title, content, poll_options, poll_multiple_choice, poll_ends_at } = req.body;
    
    if (!user_id) return res.status(401).json({ error: 'User ID required' });
    if (!title) return res.status(400).json({ error: 'Title is required' });
    
    // Check if user is a backer (or creator)
    const isBacker = await isUserBacker(user_id, projectId);
    const isCreator = await isProjectCreator(user_id, projectId);
    
    if (!isBacker && !isCreator) {
      return res.status(403).json({ error: 'Only backers can create posts' });
    }
    
    const postData = {
      project_id: projectId,
      user_id,
      type: type || 'post',
      title,
      content,
      poll_options,
      poll_multiple_choice,
      poll_ends_at
    };
    
    const { data: post, error } = await supabase
      .from('community_posts')
      .insert([postData])
      .select(`
        *,
        users:user_id (id, full_name, email, profile_pic)
      `)
      .single();
    
    if (error) throw error;
    
    // Send notification to project creator for all new posts
    try {
      console.log('🔍 Attempting to send notification...');
      console.log('Project ID:', projectId);
      console.log('Post author ID:', user_id);
      
      // Get project creator
      const { data: project, error: projectError } = await supabase
        .from('main_projects')
        .select('user_id, title')
        .eq('id', projectId)
        .single();
      
      if (projectError) {
        console.error('❌ Error fetching project:', projectError);
        throw projectError;
      }
      
      console.log('📦 Project creator ID:', project?.user_id);
      console.log('🤔 Is self-post?', project?.user_id === user_id);
      
      if (project && project.user_id !== user_id) {
        // Determine notification type and message based on post type
        let notificationType, notificationTitle, notificationMessage;
        
        if (type === 'question') {
          notificationType = 'question_asked';
          notificationTitle = 'New Question on Your Project';
          notificationMessage = `${post.users.full_name} asked: "${title}"`;
        } else if (type === 'poll') {
          notificationType = 'community_poll';
          notificationTitle = 'New Poll in Community';
          notificationMessage = `${post.users.full_name} created a poll: "${title}"`;
        } else {
          notificationType = 'community_post';
          notificationTitle = 'New Community Post';
          notificationMessage = `${post.users.full_name} posted: "${title}"`;
        }
        
        console.log('📧 Inserting notification:', {
          user_id: project.user_id,
          type: notificationType,
          title: notificationTitle
        });
        
        // Create notification for creator
        const { data: notification, error: notifError } = await supabase.from('notifications').insert({
          user_id: project.user_id,
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          link: `/projects/${projectId}?tab=community&post=${post.id}`,
          metadata: {
            project_id: projectId,
            post_id: post.id,
            post_type: type,
            author_id: user_id,
            author_name: post.users.full_name
          }
        }).select();
        
        if (notifError) {
          console.error('❌ Error inserting notification:', notifError);
          throw notifError;
        }
        
        console.log(`✅ Notification sent successfully to creator for new ${type}:`, notification);
      } else {
        console.log('⏭️  Skipping notification (creator posted on own project)');
      }
    } catch (notifError) {
      console.error('❌ Error in notification flow:', notifError);
      console.error('Full error:', JSON.stringify(notifError, null, 2));
      // Don't fail the request if notification fails
    }
    
    return res.status(201).json({ post: { ...post, author: post.users } });
  } catch (err) {
    console.error('Error creating post:', err);
    return res.status(500).json({ error: err.message || 'Failed to create post' });
  }
};

/**
 * Delete a post (creator or post author only)
 * DELETE /api/community/posts/:postId
 */
export const deleteCommunityPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) return res.status(401).json({ error: 'User ID required' });
    
    // Get post to check ownership and project
    const { data: post } = await supabase
      .from('community_posts')
      .select('user_id, project_id')
      .eq('id', postId)
      .single();
    
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Check if user is post author or project creator
    const isAuthor = post.user_id === user_id;
    const isCreator = await isProjectCreator(user_id, post.project_id);
    
    if (!isAuthor && !isCreator) {
      return res.status(403).json({ error: 'Only post author or project creator can delete' });
    }
    
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    
    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete post' });
  }
};

/**
 * Pin/unpin a post (creator only)
 * PATCH /api/community/posts/:postId/pin
 */
export const togglePinPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user_id, is_pinned } = req.body;
    
    if (!user_id) return res.status(401).json({ error: 'User ID required' });
    
    // Get post project
    const { data: post } = await supabase
      .from('community_posts')
      .select('project_id')
      .eq('id', postId)
      .single();
    
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Check if user is project creator
    const isCreator = await isProjectCreator(user_id, post.project_id);
    
    if (!isCreator) {
      return res.status(403).json({ error: 'Only project creator can pin posts' });
    }
    
    const { data, error } = await supabase
      .from('community_posts')
      .update({ is_pinned })
      .eq('id', postId)
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(200).json({ post: data });
  } catch (err) {
    console.error('Error toggling pin:', err);
    return res.status(500).json({ error: err.message || 'Failed to toggle pin' });
  }
};

/**
 * Lock/unlock a post (creator only)
 * PATCH /api/community/posts/:postId/lock
 */
export const toggleLockPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user_id, is_locked } = req.body;
    
    if (!user_id) return res.status(401).json({ error: 'User ID required' });
    
    // Get post project
    const { data: post } = await supabase
      .from('community_posts')
      .select('project_id')
      .eq('id', postId)
      .single();
    
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Check if user is project creator
    const isCreator = await isProjectCreator(user_id, post.project_id);
    
    if (!isCreator) {
      return res.status(403).json({ error: 'Only project creator can lock posts' });
    }
    
    const { data, error } = await supabase
      .from('community_posts')
      .update({ is_locked })
      .eq('id', postId)
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(200).json({ post: data });
  } catch (err) {
    console.error('Error toggling lock:', err);
    return res.status(500).json({ error: err.message || 'Failed to toggle lock' });
  }
};

// ==========================================
// COMMENTS
// ==========================================

/**
 * Get comments for a post
 * GET /api/community/posts/:postId/comments
 */
export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const { data: comments, error } = await supabase
      .from('community_comments')
      .select(`
        *,
        users:user_id (id, full_name, email, profile_pic),
        reaction_count:community_reactions(count),
        replies:community_comments!parent_comment_id (
          *,
          users:user_id (id, full_name, email, profile_pic)
        )
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null) // Only top-level comments
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    const formattedComments = comments.map(comment => ({
      ...comment,
      author: comment.users,
      reaction_count: comment.reaction_count?.[0]?.count || 0,
      replies: comment.replies?.map(reply => ({
        ...reply,
        author: reply.users
      })) || []
    }));
    
    return res.status(200).json({ comments: formattedComments });
  } catch (err) {
    console.error('Error fetching comments:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch comments' });
  }
};

/**
 * Create a comment or reply
 * POST /api/community/posts/:postId/comments
 */
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user_id, content, parent_comment_id } = req.body;
    
    if (!user_id) return res.status(401).json({ error: 'User ID required' });
    if (!content) return res.status(400).json({ error: 'Content is required' });
    
    // Get post to check if locked and get project_id
    const { data: post } = await supabase
      .from('community_posts')
      .select('is_locked, project_id')
      .eq('id', postId)
      .single();
    
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.is_locked) return res.status(403).json({ error: 'This post is locked' });
    
    // Check if user is a backer (or creator)
    const isBacker = await isUserBacker(user_id, post.project_id);
    const isCreator = await isProjectCreator(user_id, post.project_id);
    
    if (!isBacker && !isCreator) {
      return res.status(403).json({ error: 'Only backers can comment' });
    }
    
    const commentData = {
      post_id: postId,
      user_id,
      content,
      parent_comment_id
    };
    
    const { data: comment, error } = await supabase
      .from('community_comments')
      .insert([commentData])
      .select(`
        *,
        users:user_id (id, full_name, email, profile_pic)
      `)
      .single();
    
    if (error) throw error;
    
    return res.status(201).json({ comment: { ...comment, author: comment.users } });
  } catch (err) {
    console.error('Error creating comment:', err);
    return res.status(500).json({ error: err.message || 'Failed to create comment' });
  }
};

/**
 * Delete a comment (creator or comment author only)
 * DELETE /api/community/comments/:commentId
 */
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) return res.status(401).json({ error: 'User ID required' });
    
    // Get comment and post info
    const { data: comment } = await supabase
      .from('community_comments')
      .select(`
        user_id,
        community_posts!inner(project_id)
      `)
      .eq('id', commentId)
      .single();
    
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    
    const projectId = comment.community_posts.project_id;
    const isAuthor = comment.user_id === user_id;
    const isCreator = await isProjectCreator(user_id, projectId);
    
    if (!isAuthor && !isCreator) {
      return res.status(403).json({ error: 'Only comment author or project creator can delete' });
    }
    
    const { error } = await supabase
      .from('community_comments')
      .delete()
      .eq('id', commentId);
    
    if (error) throw error;
    
    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete comment' });
  }
};

// ==========================================
// REACTIONS
// ==========================================

/**
 * Toggle reaction on post or comment
 * POST /api/community/reactions
 */
export const toggleReaction = async (req, res) => {
  try {
    const { user_id, post_id, comment_id, reaction_type = 'like' } = req.body;
    
    if (!user_id) return res.status(401).json({ error: 'User ID required' });
    if (!post_id && !comment_id) {
      return res.status(400).json({ error: 'Either post_id or comment_id required' });
    }
    
    // Check for existing reaction
    let query = supabase
      .from('community_reactions')
      .select('id')
      .eq('user_id', user_id);
    
    if (post_id) query = query.eq('post_id', post_id);
    if (comment_id) query = query.eq('comment_id', comment_id);
    
    const { data: existing } = await query.single();
    
    if (existing) {
      // Remove reaction
      const { error } = await supabase
        .from('community_reactions')
        .delete()
        .eq('id', existing.id);
      
      if (error) throw error;
      
      return res.status(200).json({ action: 'removed' });
    } else {
      // Add reaction
      const { data, error } = await supabase
        .from('community_reactions')
        .insert([{
          user_id,
          post_id,
          comment_id,
          reaction_type
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return res.status(201).json({ action: 'added', reaction: data });
    }
  } catch (err) {
    console.error('Error toggling reaction:', err);
    return res.status(500).json({ error: err.message || 'Failed to toggle reaction' });
  }
};

// ==========================================
// POLLS
// ==========================================

/**
 * Vote in a poll
 * POST /api/community/polls/:postId/vote
 */
export const voteInPoll = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user_id, option_id } = req.body;
    
    if (!user_id) return res.status(401).json({ error: 'User ID required' });
    if (option_id === undefined) return res.status(400).json({ error: 'Option ID required' });
    
    // Get poll post
    const { data: post } = await supabase
      .from('community_posts')
      .select('type, poll_ends_at, poll_multiple_choice, project_id')
      .eq('id', postId)
      .single();
    
    if (!post) return res.status(404).json({ error: 'Poll not found' });
    if (post.type !== 'poll') return res.status(400).json({ error: 'Not a poll post' });
    
    // Check if poll has ended
    if (post.poll_ends_at && new Date(post.poll_ends_at) < new Date()) {
      return res.status(403).json({ error: 'Poll has ended' });
    }
    
    // Check if user is a backer
    const isBacker = await isUserBacker(user_id, post.project_id);
    const isCreator = await isProjectCreator(user_id, post.project_id);
    
    if (!isBacker && !isCreator) {
      return res.status(403).json({ error: 'Only backers can vote' });
    }
    
    // Check for existing vote
    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user_id)
      .eq('option_id', option_id)
      .single();
    
    if (existingVote) {
      // Remove vote
      const { error } = await supabase
        .from('poll_votes')
        .delete()
        .eq('id', existingVote.id);
      
      if (error) throw error;
      
      return res.status(200).json({ action: 'removed' });
    } else {
      // Add vote
      const { data, error } = await supabase
        .from('poll_votes')
        .insert([{
          post_id: postId,
          user_id,
          option_id
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return res.status(201).json({ action: 'added', vote: data });
    }
  } catch (err) {
    console.error('Error voting in poll:', err);
    return res.status(500).json({ error: err.message || 'Failed to vote' });
  }
};

/**
 * Get poll results
 * GET /api/community/polls/:postId/results
 */
export const getPollResults = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const { data: votes, error } = await supabase
      .from('poll_votes')
      .select('option_id')
      .eq('post_id', postId);
    
    if (error) throw error;
    
    // Count votes per option
    const results = {};
    votes.forEach(vote => {
      results[vote.option_id] = (results[vote.option_id] || 0) + 1;
    });
    
    return res.status(200).json({ results, total_votes: votes.length });
  } catch (err) {
    console.error('Error getting poll results:', err);
    return res.status(500).json({ error: err.message || 'Failed to get poll results' });
  }
};

// ==========================================
// Q&A
// ==========================================

/**
 * Mark a question as answered (creator only)
 * PATCH /api/community/posts/:postId/answer
 */
export const markQuestionAnswered = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user_id, is_answered } = req.body;
    
    if (!user_id) return res.status(401).json({ error: 'User ID required' });
    
    // Get post to verify it's a question
    const { data: post } = await supabase
      .from('community_posts')
      .select('type, project_id, user_id, title')
      .eq('id', postId)
      .single();
    
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.type !== 'question') {
      return res.status(400).json({ error: 'This is not a question post' });
    }
    
    // Check if user is project creator
    const isCreator = await isProjectCreator(user_id, post.project_id);
    
    if (!isCreator) {
      return res.status(403).json({ error: 'Only project creator can mark questions as answered' });
    }
    
    const { data, error } = await supabase
      .from('community_posts')
      .update({ is_answered })
      .eq('id', postId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Notify the person who asked the question
    if (is_answered && post.user_id !== user_id) {
      try {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          type: 'question_answered',
          title: 'Your Question Was Answered',
          message: `The creator answered your question: "${post.title}"`,
          link: `/projects/${post.project_id}?tab=community&post=${postId}`,
          metadata: {
            project_id: post.project_id,
            post_id: postId
          }
        });
      } catch (notifError) {
        console.error('Error sending answer notification:', notifError);
      }
    }
    
    return res.status(200).json({ post: data });
  } catch (err) {
    console.error('Error marking question as answered:', err);
    return res.status(500).json({ error: err.message || 'Failed to mark as answered' });
  }
};
