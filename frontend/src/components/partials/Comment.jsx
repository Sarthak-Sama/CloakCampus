import React, { useState, useEffect } from "react";
import { RiReplyLine } from "@remixicon/react";
import axios from "../../utils/axios";

function Comment({ comment, setComments, updateNestedComments }) {
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [repliesVisible, setRepliesVisible] = useState(false);
  const [replies, setReplies] = useState([]);
  const [repliesFetched, setRepliesFetched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const createdAt = new Date(timestamp);
    const difference = now - createdAt;

    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
    if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  };

  useEffect(() => {
    if (!comment.parentComment) {
      setRepliesVisible(true);
    }
  }, [comment.parentComment]);

  useEffect(() => {
    const fetchReplies = async () => {
      if (!repliesFetched && repliesVisible && comment.replies?.length > 0) {
        try {
          const response = await axios.get(`posts/${comment._id}/replies`);
          setReplies(response.data.replies);
          setRepliesFetched(true);
          setComments((prevComments) =>
            updateNestedComments(
              prevComments,
              comment._id,
              response.data.replies
            )
          );
        } catch (error) {
          console.error("Error fetching replies: ", error);
        }
      }
    };

    fetchReplies();
  }, [repliesVisible, repliesFetched, comment._id]);

  const handleReplySubmit = async (parentId) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const { data } = await axios.post(`/posts/${parentId}/reply`, {
        content: replyText,
      });

      // Update local replies state
      setReplies((prevReplies) => [...prevReplies, data.reply]);

      // Update parent comments state
      setComments((prevComments) =>
        updateNestedComments(prevComments, parentId, data.reply)
      );

      setReplyText("");
      setIsReplying(false);
      setRepliesVisible(true); // Keep replies visible
      setRepliesFetched(true); // Mark replies as fetched
    } catch (err) {
      console.error("Error while replying: ", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRepliesVisibility = () => {
    if (!repliesVisible && !repliesFetched) {
      setRepliesVisible(true); // Fetch replies only on the first click of "Show Replies"
    } else {
      setRepliesVisible(!repliesVisible); // Just toggle visibility afterward
    }
  };

  return (
    <div
      id={`comment-${comment._id}`}
      key={comment._id}
      className="comment my-4 pb-4"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          style={{
            backgroundImage: `url("/media/profileIcon.jpg")`,
          }}
          className="avatar w-10 h-10 bg-gray-300 bg-cover bg-center overflow-hidden rounded-full flex-shrink-0"
        >
          {/* Optionally, you can add an img element inside the div for fallback */}
          <img
            src={comment.authorPfp}
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Comment content */}
        <div className="flex-1">
          {/* Header */}
          <div className="comment-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{comment.authorUsername}</p>
              <span className="text-xs text-zinc-200">
                {getTimeAgo(comment.createdAt)}
              </span>
            </div>
          </div>

          {/* Comment Body */}
          <p className="mt-2 text-zinc-800 dark:text-zinc-200 text-sm">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="comment-actions mt-3 flex items-center gap-6 text-xs text-gray-500">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="hover:text-blue-500 transition-colors duration-200 flex items-center gap-1"
            >
              <RiReplyLine size={18} /> Reply
            </button>
            <button
              onClick={toggleRepliesVisibility}
              className="hover:text-blue-500 transition-colors duration-200 flex items-center gap-1"
            >
              {comment.replies && comment.replies.length > 0
                ? repliesVisible
                  ? "Hide Replies"
                  : "Show Replies"
                : null}
            </button>
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="reply-input mt-3 p-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 text-black dark:text-white bg-transparent focus:outline-none resize-none"
                rows="2"
                disabled={isSubmitting}
              />
              <button
                onClick={() => handleReplySubmit(comment._id)}
                disabled={isSubmitting}
                className={`mt-2 ${
                  isSubmitting
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[rgba(234,81,111,0.8)] hover:bg-[rgba(234,81,111,1)]"
                } transition-color duration-300 ease-in-out text-white px-4 py-2 rounded-lg`}
              >
                {isSubmitting ? "Replying..." : "Reply"}
              </button>
            </div>
          )}

          {/* Nested comments */}

          {repliesVisible && replies.length > 0 && (
            <div className="nested-comments ml-6 mt-4 pl-4">
              {replies.map((reply) => (
                <Comment
                  key={reply._id}
                  comment={reply}
                  setComments={setComments}
                  updateNestedComments={updateNestedComments}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comment;
