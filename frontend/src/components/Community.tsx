import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  ThumbsUp, 
  Pin, 
  Lock, 
  Trash2,
  BarChart3,
  Plus,
  Send,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface CommunityProps {
  projectId: string;
  projectCreatorId: string;
}

interface Post {
  id: string;
  type: 'post' | 'poll' | 'question';
  title: string;
  content?: string;
  poll_options?: Array<{ id: number; text: string }>;
  poll_multiple_choice?: boolean;
  poll_ends_at?: string;
  is_answered?: boolean;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  user_id: string;
  author: {
    id: string;
    full_name: string;
    profile_pic?: string;
  };
  reaction_count: number;
  comment_count: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author: {
    id: string;
    full_name: string;
    profile_pic?: string;
  };
  replies?: Comment[];
  reaction_count: number;
}

export function Community({ projectId, projectCreatorId }: CommunityProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState<'post' | 'poll' | 'question'>('post');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState('');
  const [pollResults, setPollResults] = useState<Record<string, any>>({});
  const [userVotes, setUserVotes] = useState<Record<string, number[]>>({});
  const [filterType, setFilterType] = useState<'all' | 'post' | 'question' | 'poll'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const isCreator = user?.id === projectCreatorId;
  
  // Check if user is a backer
  const [isBacker, setIsBacker] = useState(false);
  
  useEffect(() => {
    checkBackerStatus();
    fetchPosts();
  }, [projectId]);

  const checkBackerStatus = async () => {
    if (!user?.id) {
      setIsBacker(false);
      return;
    }
    
    try {
      // Check if user has backed this project
      const response = await fetch(`http://localhost:5000/api/payments/user/${user.id}/backed`);
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Backed projects:', data);
        // Check if user has backed this specific project
        const hasBackedProject = data.backedProjects?.some(
          (backedProject: any) => 
            backedProject.project_id === projectId || 
            backedProject.project?.id === projectId
        );
        console.log('✅ Is backer of this project?', hasBackedProject);
        setIsBacker(hasBackedProject);
      } else {
        setIsBacker(false);
      }
    } catch (error) {
      console.error('Error checking backer status:', error);
      setIsBacker(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/community/${projectId}/posts`);
      const data = await response.json();
      console.log('📬 Fetched posts:', data);
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}/comments`);
      const data = await response.json();
      setComments(prev => ({ ...prev, [postId]: data.comments || [] }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchPollResults = async (postId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/community/polls/${postId}/results`);
      const data = await response.json();
      setPollResults(prev => ({ ...prev, [postId]: data }));
    } catch (error) {
      console.error('Error fetching poll results:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!user?.id || !newPostTitle.trim()) return;
    
    try {
      const payload: any = {
        user_id: user.id,
        type: postType,
        title: newPostTitle,
        content: newPostContent
      };
      
      if (postType === 'poll') {
        payload.poll_options = pollOptions
          .filter(opt => opt.trim())
          .map((text, index) => ({ id: index, text }));
      }
      
      const response = await fetch(`http://localhost:5000/api/community/${projectId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to create post');
        return;
      }
      
      // Reset form
      setNewPostTitle('');
      setNewPostContent('');
      setPollOptions(['', '']);
      setPostType('post');
      setShowCreatePost(false);
      
      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user?.id || !confirm('Delete this post?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      
      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleTogglePin = async (postId: string, currentPinned: boolean) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, is_pinned: !currentPinned })
      });
      
      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleToggleLock = async (postId: string, currentLocked: boolean) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}/lock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, is_locked: !currentLocked })
      });
      
      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  const handleReactToPost = async (postId: string) => {
    if (!user?.id) return;
    
    try {
      await fetch(`http://localhost:5000/api/community/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, post_id: postId, reaction_type: 'like' })
      });
      
      fetchPosts();
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  const handleAddComment = async (postId: string, parentCommentId?: string) => {
    if (!user?.id || !newComment.trim()) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          content: newComment,
          parent_comment_id: parentCommentId
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to add comment');
        return;
      }
      
      setNewComment('');
      fetchComments(postId);
      fetchPosts(); // Refresh to update comment count
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleVotePoll = async (postId: string, optionId: number) => {
    if (!user?.id) return;
    
    try {
      await fetch(`http://localhost:5000/api/community/polls/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, option_id: optionId })
      });
      
      // Update local state
      setUserVotes(prev => {
        const votes = prev[postId] || [];
        if (votes.includes(optionId)) {
          return { ...prev, [postId]: votes.filter(v => v !== optionId) };
        }
        return { ...prev, [postId]: [...votes, optionId] };
      });
      
      fetchPollResults(postId);
    } catch (error) {
      console.error('Error voting in poll:', error);
    }
  };

  const handleMarkAsAnswered = async (postId: string, currentAnswered: boolean) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}/answer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, is_answered: !currentAnswered })
      });
      
      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error marking as answered:', error);
    }
  };

  const toggleComments = (postId: string) => {
    if (selectedPost === postId) {
      setSelectedPost(null);
    } else {
      setSelectedPost(postId);
      if (!comments[postId]) {
        fetchComments(postId);
      }
    }
  };

  if (loading) {
    return <div className="py-8 text-center">Loading community...</div>;
  }

  const canPost = isBacker || isCreator;

  // Debug logging
  console.log('🔍 Community Debug:', {
    userId: user?.id,
    projectCreatorId,
    isCreator,
    isBacker,
    canPost
  });

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (filterType === 'all') return true;
    return post.type === filterType;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[1200px]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b pb-4 space-y-4">
        {/* Title and Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Community</h2>
            <p className="text-sm text-muted-foreground">
              {!user ? 'Log in to join the discussion' : canPost 
                ? 'Discuss with other backers and the creator' 
                : 'Back this project to join the discussion'}
            </p>
          </div>
          
          {canPost && (
            <Button onClick={() => setShowCreatePost(!showCreatePost)}>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filterType === 'post' ? 'default' : 'outline'}
              onClick={() => setFilterType('post')}
            >
              Discussions
            </Button>
            <Button
              size="sm"
              variant={filterType === 'question' ? 'default' : 'outline'}
              onClick={() => setFilterType('question')}
            >
              Questions
            </Button>
            <Button
              size="sm"
              variant={filterType === 'poll' ? 'default' : 'outline'}
              onClick={() => setFilterType('poll')}
            >
              Polls
            </Button>
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant={sortBy === 'recent' ? 'default' : 'ghost'}
              onClick={() => setSortBy('recent')}
            >
              Recent
            </Button>
            <Button
              size="sm"
              variant={sortBy === 'popular' ? 'default' : 'ghost'}
              onClick={() => setSortBy('popular')}
            >
              Popular
            </Button>
          </div>
        </div>
      </div>

      {/* Create Post Form */}
      {showCreatePost && (
        <Card>
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={postType === 'post' ? 'default' : 'outline'}
                onClick={() => setPostType('post')}
              >
                Discussion
              </Button>
              <Button
                variant={postType === 'question' ? 'default' : 'outline'}
                onClick={() => setPostType('question')}
              >
                Ask Creator
              </Button>
              <Button
                variant={postType === 'poll' ? 'default' : 'outline'}
                onClick={() => setPostType('poll')}
              >
                Poll
              </Button>
            </div>
            
            <Input
              placeholder="Title"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
            />
            
            {postType === 'post' || postType === 'question' ? (
              <Textarea
                placeholder={postType === 'question' ? 'Ask your question...' : "What's on your mind?"}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
              />
            ) : (
              <div className="space-y-2">
                {pollOptions.map((option, index) => (
                  <Input
                    key={index}
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...pollOptions];
                      newOptions[index] = e.target.value;
                      setPollOptions(newOptions);
                    }}
                  />
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPollOptions([...pollOptions, ''])}
                >
                  Add Option
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={handleCreatePost}>Post</Button>
              <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scrollable Posts List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth">
        <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No posts yet. {canPost && 'Be the first to start a discussion!'}
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => {
            const isCreatorPost = post.user_id === projectCreatorId;
            return (
            <Card 
              key={post.id} 
              className={`${post.is_pinned ? 'border-primary border-2' : ''} ${isCreatorPost ? 'bg-accent/5 border-l-4 border-l-primary' : ''}`}
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold">
                      {post.author.full_name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Author Info */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{post.author.full_name}</span>
                      {isCreatorPost && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          Creator
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-2">
                      {post.is_pinned && (
                        <Badge variant="secondary" className="text-xs">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                      {post.is_locked && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                      {post.type === 'poll' && (
                        <Badge variant="outline" className="text-xs">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Poll
                        </Badge>
                      )}
                      {post.type === 'question' && (
                        <Badge variant="outline" className={`text-xs ${post.is_answered ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {post.is_answered ? '✓ Answered' : 'Question'}
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  </div>
                  
                  {/* Creator Controls */}
                  {isCreator && (
                    <div className="flex gap-1 flex-shrink-0">
                      {post.type === 'question' && (
                        <Button
                          size="sm"
                          variant={post.is_answered ? 'ghost' : 'default'}
                          onClick={() => handleMarkAsAnswered(post.id, post.is_answered || false)}
                          title={post.is_answered ? 'Mark as unanswered' : 'Mark as answered'}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePin(post.id, post.is_pinned)}
                      >
                        <Pin className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleLock(post.id, post.is_locked)}
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-0">
                {(post.type === 'post' || post.type === 'question') && post.content && (
                  <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                )}
                
                {post.type === 'poll' && post.poll_options && (
                  <div className="space-y-2">
                    {post.poll_options.map((option) => {
                      const results = pollResults[post.id];
                      const votes = results?.results?.[option.id] || 0;
                      const totalVotes = results?.total_votes || 0;
                      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                      const hasVoted = userVotes[post.id]?.includes(option.id);
                      
                      return (
                        <button
                          key={option.id}
                          onClick={() => canPost && handleVotePoll(post.id, option.id)}
                          disabled={!canPost}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            hasVoted ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                          } ${!canPost && 'cursor-not-allowed opacity-60'}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{option.text}</span>
                            {results && (
                              <span className="text-sm text-muted-foreground">
                                {votes} ({percentage.toFixed(0)}%)
                              </span>
                            )}
                          </div>
                          {results && (
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}
                    {!pollResults[post.id] && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchPollResults(post.id)}
                      >
                        View Results
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center gap-4 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => canPost && handleReactToPost(post.id)}
                    disabled={!canPost}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {post.reaction_count || 0}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {post.comment_count || 0}
                  </Button>
                </div>
                
                {/* Comments Section */}
                {selectedPost === post.id && (
                  <div className="space-y-3 pt-3 border-t">
                    {comments[post.id]?.map((comment) => {
                      const isCreatorComment = comment.user_id === projectCreatorId;
                      return (
                      <div key={comment.id} className="space-y-2">
                        <div className={`rounded-lg p-3 ${isCreatorComment ? 'bg-primary/5 border-l-2 border-l-primary' : 'bg-muted/50'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xs font-semibold">
                              {comment.author.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">
                              {comment.author.full_name}
                            </span>
                            {isCreatorComment && (
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                                Creator
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                        
                        {comment.replies?.map((reply) => {
                          const isCreatorReply = reply.user_id === projectCreatorId;
                          return (
                          <div key={reply.id} className={`ml-6 rounded-lg p-3 ${isCreatorReply ? 'bg-primary/5 border-l-2 border-l-primary' : 'bg-muted/30'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xs font-semibold">
                                {reply.author.full_name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium">
                                {reply.author.full_name}
                              </span>
                              {isCreatorReply && (
                                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                                  Creator
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(reply.created_at), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm">{reply.content}</p>
                          </div>
                        );})}
                      </div>
                    );})}
                    
                    {canPost && !post.is_locked && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {post.is_locked && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        This post is locked. No new comments allowed.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
          })
        )}
        </div>
      </div>
    </div>
  );
}
