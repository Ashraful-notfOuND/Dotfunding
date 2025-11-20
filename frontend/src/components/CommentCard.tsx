import React, { useState } from "react";

interface Comment {
  id: string;
  user: string;
  text: string;
  likes: number;
  replies: { id: string; user: string; text: string }[];
}

interface Props {
  comment: Comment;
  onLike: () => void;
  onReply: (replyText: string) => void;
  users: string[];
  timeAgo: string;
}

const CommentCard: React.FC<Props> = ({ comment, onLike, onReply, users, timeAgo }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setReplyText(value);

    const match = value.match(/@(\w*)$/);
    if (match) {
      const q = match[1].toLowerCase();
      setSuggestions(users.filter(u => u.toLowerCase().startsWith(q)));
    } else {
      setSuggestions([]);
    }
  };

  const selectUser = (username: string) => {
    setReplyText(prev => prev.replace(/@\w*$/, `@${username} `));
    setSuggestions([]);
  };

  return (
    <div className="flex items-start gap-3">
      <img
        src={`https://ui-avatars.com/api/?name=${comment.user}`}
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1 border p-4 rounded-lg bg-white shadow-sm">
        <p className="font-bold text-sm">
          {comment.user} • <span className="text-gray-500">{timeAgo}</span>
        </p>
        <p className="text-gray-800 mt-1">{comment.text}</p>

        <div className="flex items-center gap-4 mt-2 text-sm">
          <button className="text-blue-600" onClick={onLike}>
            👍 Like ({comment.likes})
          </button>
          <button
            className="text-gray-600"
            onClick={() => setShowReplyBox(prev => !prev)}
          >
            💬 Reply
          </button>
        </div>

        {showReplyBox && (
          <div className="mt-3">
            <textarea
              className="w-full border p-2 rounded"
              rows={2}
              placeholder="Write a reply..."
              value={replyText}
              onChange={handleChange}
            />
            {suggestions.length > 0 && (
              <div className="border bg-white shadow rounded mt-1">
                {suggestions.map(u => (
                  <div
                    key={u}
                    onClick={() => selectUser(u)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    @{u}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  if (replyText.trim()) {
                    onReply(replyText);
                    setReplyText("");
                    setShowReplyBox(false);
                  }
                }}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Reply
              </button>
              <button
                onClick={() => {
                  setShowReplyBox(false);
                  setReplyText("");
                }}
                className="border px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentCard;
