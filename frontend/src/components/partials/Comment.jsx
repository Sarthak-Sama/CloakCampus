import React, { useState } from "react";
import { RiReplyLine } from "@remixicon/react";

function Comment({ comment, setReplyingTo, replyingTo, handleReplySubmit }) {
  const [replyText, setReplyText] = useState("");

  return (
    <div key={comment._id} className="comment my-4 pb-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="avatar w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>

        {/* Comment content */}
        <div className="flex-1">
          {/* Header */}
          <div className="comment-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{comment.authorUsername}</p>
              <span className="text-xs text-zinc-200">{comment.createdAt}</span>
            </div>
          </div>

          {/* Comment Body */}
          <p className="mt-2 text-zinc-200 text-sm">{comment.content}</p>

          {/* Actions */}
          <div className="comment-actions mt-3 flex items-center gap-6 text-xs text-gray-500">
            <button
              onClick={() => setReplyingTo(comment._id)}
              className="hover:text-blue-500 transition-colors duration-200 flex items-center gap-1"
            >
              <RiReplyLine size={18} /> Reply
            </button>
          </div>

          {/* Reply Form */}
          {replyingTo === comment._id && (
            <div className="reply-input mt-3 p-4 border rounded-lg bg-gray-50">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="2"
              />
              <button
                onClick={() => handleReplySubmit(comment._id)}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Send
              </button>
            </div>
          )}

          {/* Nested comments */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="nested-comments ml-6 mt-4 pl-4">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply._id}
                  comment={reply}
                  setReplyingTo={setReplyingTo}
                  replyingTo={replyingTo}
                  handleReplySubmit={handleReplySubmit}
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
