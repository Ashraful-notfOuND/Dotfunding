import React, { useState, useEffect } from "react";
import CommentCard from "./CommentCard";
import { useAuth } from "../hooks/useAuth";

interface Reply {
  id: string;
  user: string;
  text: string;
  likes: number;
  timestamp: string;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  likes: number;
  timestamp: string;
  replies: Reply[];
}

// 1. Define the props to accept projectId from the parent component
interface CommentsProps {
  projectId: string;
}

const timeAgo = (timestamp: string) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const Comments: React.FC<CommentsProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
  const [liking, setLiking] = useState<Record<string, boolean>>({});

  if (!user) return <p className="p-4 text-gray-500">Please login to comment</p>;
  const currentUser = { id: user.id, full_name: user.name };

  // -------------------- Fetch comments --------------------
  const fetchComments = async () => {
    try {
      // 2. Pass projectId as a query string so the backend can filter
      const res = await fetch(`http://localhost:5000/api/comments?projectId=${projectId}`);
      const data = await res.json();

      setComments(
        data.comments.map((c: any) => ({
          ...c,
          user: c.users?.full_name || "Unknown User",
          timestamp: c.created_at,
          replies: (c.replies || []).map((r: any) => ({
            ...r,
            user: r.users?.full_name || "Unknown User",
            timestamp: r.created_at,
          })),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  // 3. Re-run fetch whenever the projectId changes
  useEffect(() => {
    fetchComments();
  }, [projectId]);

  // -------------------- Add comment --------------------
  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 4. Include project_id in the body for the backend to save
        body: JSON.stringify({ 
            user_id: currentUser.id, 
            text: newComment, 
            parent_id: null, 
            project_id: projectId 
        }),
      });
      const data = await res.json();

      setComments(prev => [
        { ...data.comment, user: currentUser.full_name, timestamp: data.comment.created_at, replies: [] },
        ...prev,
      ]);
      setNewComment("");
      setIsWriting(false);
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  // -------------------- Add reply --------------------
  const addReply = async (commentId: string, replyText: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 5. Also include project_id for replies
        body: JSON.stringify({ 
            user_id: currentUser.id, 
            text: replyText, 
            parent_id: commentId, 
            project_id: projectId 
        }),
      });
      const data = await res.json();

      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? {
                ...c,
                replies: [
                  ...c.replies,
                  { ...data.comment, user: currentUser.full_name, timestamp: data.comment.created_at },
                ],
              }
            : c
        )
      );
      setOpenReplies(prev => ({ ...prev, [commentId]: true }));
    } catch (err) {
      console.error("Failed to add reply", err);
    }
  };

  const likeCommentOrReply = async (commentId: string, replyId?: string) => {
    const targetId = replyId || commentId;
    if (liking[targetId]) return;
    setLiking(prev => ({ ...prev, [targetId]: true }));

    try {
      const res = await fetch("http://localhost:5000/api/comments/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id: targetId, user_id: currentUser.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      if (replyId) {
        setComments(prev =>
          prev.map(c =>
            c.id === commentId
              ? {
                  ...c,
                  replies: c.replies.map(r =>
                    r.id === replyId ? { ...r, likes: data.likes } : r
                  ),
                }
              : c
          )
        );
      } else {
        setComments(prev =>
          prev.map(c => (c.id === commentId ? { ...c, likes: data.likes } : c))
        );
      }
    } catch (err) {
      console.error("Failed to like comment", err);
    } finally {
      setLiking(prev => ({ ...prev, [targetId]: false }));
    }
  };

  const toggleReplies = (id: string) => {
    setOpenReplies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comments</h2>

      {/* Write Comment Box */}
      {!isWriting ? (
        <div
          onClick={() => setIsWriting(true)}
          className="border rounded-xl p-3 text-gray-600 bg-gray-50 cursor-pointer hover:bg-gray-100"
        >
          Add a comment…
        </div>
      ) : (
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            className="w-full border p-2 rounded focus:ring"
            rows={3}
          />
          <div className="flex justify-end gap-3 mt-2">
            <button
              className="px-4 py-1 rounded text-gray-600 hover:bg-gray-100"
              onClick={() => {
                setIsWriting(false);
                setNewComment("");
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={addComment}
            >
              Comment
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      {comments.map(comment => (
        <div key={comment.id} className="space-y-2">
          <CommentCard
            comment={comment}
            onLike={() => likeCommentOrReply(comment.id)}
            onReply={text => addReply(comment.id, text)}
            users={[currentUser.full_name]}
            timeAgo={timeAgo(comment.timestamp)}
          />

          {comment.replies.length > 0 && (
            <div className="ml-12">
              <button
                className="text-blue-600 text-sm font-medium"
                onClick={() => toggleReplies(comment.id)}
              >
                {openReplies[comment.id]
                  ? "Hide Replies"
                  : `Show Replies (${comment.replies.length})`}
              </button>
            </div>
          )}

          {openReplies[comment.id] &&
            comment.replies.map(reply => (
              <div
                key={reply.id}
                className="ml-14 flex items-start gap-3 bg-gray-50 p-3 rounded-lg border"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${reply.user}`}
                  className="w-9 h-9 rounded-full"
                  alt="avatar"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {reply.user} •{" "}
                    <span className="text-gray-500 font-normal">{timeAgo(reply.timestamp)}</span>
                  </p>
                  <p className="text-gray-800">{reply.text}</p>
                  <button
                    className="text-sm text-blue-600 mt-1"
                    onClick={() => likeCommentOrReply(comment.id, reply.id)}
                  >
                    👍 {reply.likes}
                  </button>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default Comments;