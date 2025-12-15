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
