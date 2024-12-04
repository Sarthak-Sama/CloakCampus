const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  voteType: { type: String, enum: ["upvote", "downvote"], equired: true },
});

const Vote = mongoose.model("Vote", voteSchema);
module.exports = Vote;
