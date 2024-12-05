const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["like", "comment", "reply"], // Type of notification
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post", // Reference to the post (if applicable)
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment", // Reference to the comment (if applicable)
  },
  message: {
    type: String, // Customizable notification message
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  readAt: {
    type: Date,
    default: null, // Only set when marked as read
  },
});

// TTL Index to delete read notifications after 7 days
notificationSchema.index(
  { readAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 }
);

const notificationModel = mongoose.model("Notification", notificationSchema);
module.exports = notificationModel;
