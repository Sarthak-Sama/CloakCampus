const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  authorUsername: {
    type: String,
    required: true,
  },
  textContent: {
    type: String,
    required: true,
  },
  media: [
    {
      type: {
        type: String,
        enum: ["image", "video"], // restrict to either 'image' or 'video'
        required: true,
      },
      url: {
        type: String, // stores the URL or path to the media file
        required: true,
      },
    },
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  upvoteCount: { type: Number, default: 0, min: 0 }, // Field to store the count of likes
  downvoteCount: { type: Number, default: 0, min: 0 }, // Field to store the count of likes
  university: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
