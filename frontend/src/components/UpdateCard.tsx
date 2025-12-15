import React, { useState } from "react";

type UpdateCardProps = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  upvotes: number;
  users?: { id: string; full_name?: string; profile_pic?: string };
  onUpvote: (id: string) => void;
  isOwner?: boolean;
  updateNumber?: number;
};

const getRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};

const UpdateCard = ({
  id,
  title,
  body,
  created_at,
  upvotes,
  users,
  onUpvote,
  isOwner = false,
  updateNumber = 1,
}: UpdateCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const truncatedBody =
    body.length > 200 ? body.substring(0, 200) + "..." : body;
  const shouldShowReadMore = body.length > 200;

  const handleUpvote = () => {
    if (!hasLiked) {
      onUpvote(id);
      setHasLiked(true);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="text-sm text-gray-500 font-medium">
          Update #{updateNumber}
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
      </div>

      {/* Author Info */}
      <div className="flex items-start gap-3">
        {users?.profile_pic ? (
          <img
            src={users.profile_pic}
            alt={users.full_name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
            {users?.full_name?.charAt(0) || "U"}
          </div>
        )}

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {users?.full_name || "Unknown"}
            </span>
            {isOwner && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                Creator
              </span>
            )}
          </div>
          <span className="text-gray-500 text-sm mt-1">
            {getRelativeTime(created_at)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="text-gray-700 text-base leading-relaxed">
        {isExpanded ? body : truncatedBody}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          className="flex items-center gap-1 text-red-500 transition hover:text-red-600"
          onClick={handleUpvote}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          {upvotes || 0}
        </button>

        {shouldShowReadMore && (
          <button
            className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show less" : "Read more"}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default UpdateCard;
