const userModel = require("../models/user.model");
const postModel = require("../models/post.model");
const commentModel = require("../models/comment.model");
const cloudinary = require("../config/cloudinary.config");
const reportModel = require("../models/report.model");
const fs = require("fs");
const path = require("path");
// const nsfwDetector = require("../config/nsfwDetector.config");

// Function to create a new post
module.exports.createPost = async (req, res, next) => {
  try {
    const { title, textContent } = req.body;
    const media = []; // Array to hold media information

    // Check if image exists and handle it
    if (req.files && req.files.image && req.files.image.length > 0) {
      const imagePath = req.files.image[0].path;

      // Check if the image is NSFW using the imported function
      // const isNSFW = await nsfwDetector.isImageNSFW(imagePath);
      // if (isNSFW) {
      //     fs.unlinkSync(imagePath); // Remove the image file
      //     return res.status(400).json({ message: "NSFW content detected in the image. Upload rejected." });
      // }

      // If the image is safe, upload to Cloudinary
      const imageUpload = await cloudinary.uploader.upload(imagePath, {
        resource_type: "image",
      });
      media.push({ type: "image", url: imageUpload.secure_url });
      fs.unlinkSync(imagePath); // Remove local image file after upload
    }

    // Handle video (you can similarly integrate a video detection API here)
    if (req.files && req.files.video && req.files.video.length > 0) {
      const videoPath = req.files.video[0].path;

      // Here you would call a function like isVideoNSFW if implemented (currently not shown)
      // const isVideoNSFW = await nsfwDetector.isVideoNSFW(videoPath);

      // if (isVideoNSFW) {
      //     fs.unlinkSync(videoPath); // Remove the video file
      //     return res.status(400).json({ message: "NSFW content detected in the video. Upload rejected." });
      // }

      const videoUpload = await cloudinary.uploader.upload(videoPath, {
        resource_type: "video",
      });
      media.push({ type: "video", url: videoUpload.secure_url });
      fs.unlinkSync(videoPath); // Remove local video file after upload
    }

    // Create the post with clean media
    const post = await postModel.create({
      title,
      textContent,
      author: req.user._id,
      authorUsername: req.user.username,
      university: req.user.university,
      media, // Save media information
    });

    // Respond with success
    res.status(201).json({
      message: "Post successfully created",
      post,
    });
  } catch (error) {
    console.error("Error in createPost:", error); // Log the error for debugging
    next(error);
  }
};

module.exports.deletePost = async (req, res, next) => {
  try {
    // Check if the user is the author of the post or an admin
    const post = await postModel.findOne({ _id: req.params.postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Allow deletion if the user is the author or an admin
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this post" });
    }

    // Proceed to delete the post
    await postModel.findOneAndDelete({ _id: req.params.postId });

    // Delete all comments associated with the post
    await commentModel.deleteMany({ postId: post._id });

    // Respond with success message
    res
      .status(200)
      .json({ message: "Post and its comments deleted successfully" });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};

// Function to get posts by university
module.exports.getPosts = async (req, res, next) => {
  try {
    // Fetch posts from the database for the user's university
    const posts = await postModel.find({ university: req.user.university });
    // Respond with the retrieved posts
    res.status(200).json({ posts });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};

module.exports.createComment = async (req, res, next) => {
  try {
    const { content } = req.body; // Extract content from the request body
    const post = await postModel.findOne({ _id: req.params.postId }); // Find the post by ID
    const comment = await commentModel.create({
      content,
      author: req.user._id,
      authorUsername: req.user.username,
      postId: post._id,
    });

    // Add the new comment's ID to the post's comments array
    post.comments.push(comment._id);
    await post.save(); // Save the updated post

    // Respond with success message and the created comment
    res.status(200).json({
      message: "Comment Created",
      comment,
    });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};

module.exports.replyComment = async (req, res, next) => {
  try {
    const { content } = req.body; // Extract content from the request body
    const parentCommentId = req.params.commentId; // Get the parent comment ID from the request params

    // Find the parent comment
    const parentComment = await commentModel.findById(parentCommentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    // Create the reply comment
    const reply = await commentModel.create({
      content,
      author: req.user._id,
      authorUsername: req.user.username,
      postId: parentComment.postId, // Inherit the postId from the parent comment
      parentComment: parentCommentId, // Link to the parent comment
    });

    // Add the reply ID to the parent comment's replies array
    parentComment.replies.push(reply._id);
    await parentComment.save();

    // Respond with success message and the created reply
    res.status(200).json({
      message: "Reply Created",
      reply,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.reportPost = async (req, res, next) => {
  try {
    const { category, reason } = req.body; // Extract category and reason from the request body
    const postId = req.params.postId; // Get the post ID from the request parameters

    // Await the alreadyReported check
    const alreadyReported = await reportModel.findOne({
      post: postId,
      reporter: req.user._id,
    });
    if (alreadyReported) {
      return res.status(409).json({
        message: "You have already reported this post.",
      });
    }

    // Create a new report for the post
    const report = await reportModel.create({
      post: postId,
      reporter: req.user._id,
      category,
      reason,
    });

    // Respond with success message and the created report
    res.status(200).json({
      message: "Report successfully created",
      report,
    });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};

module.exports.upvotePost = async (req, res, next) => {
  try {
    const postId = req.params.postId; // Get the post ID from the request parameters
    const post = await postModel.findById(postId); // Find the post by ID

    // Check if the post exists
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check if the user has already downvoted the post
    if (post.downvotedBy && post.downvotedBy.includes(req.user._id)) {
      // Remove the user's ID from downvotedBy array
      post.downvotedBy = post.downvotedBy.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      post.downvoteCount = (post.downvoteCount || 0) - 1; // Decrement downvote count
    }

    // Check if the user has already liked the post
    if (post.upvotedBy && post.upvotedBy.includes(req.user._id)) {
      return res.status(409).json({
        message: "You have already liked this post.",
      });
    }

    // Initialize likedBy array if it doesn't exist
    if (!post.upvotedBy) {
      post.upvotedBy = [];
    }

    // Add the user's ID to the post's likedBy array and increment likeCount
    post.upvotedBy.push(req.user._id);
    post.upvoteCount = (post.upvoteCount || 0) + 1; // Increment like count
    await post.save(); // Save the updated post

    // Respond with success message and the updated post
    res.status(200).json({
      message: "Post upvoted successfully",
      post,
    });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};

module.exports.downvotePost = async (req, res, next) => {
  try {
    const postId = req.params.postId; // Get the post ID from the request parameters
    const post = await postModel.findById(postId); // Find the post by ID

    // Check if the post exists
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check if the user has already upvoted the post
    if (post.upvotedBy && post.upvotedBy.includes(req.user._id)) {
      // Remove the user's ID from upvotedBy array
      post.upvotedBy = post.upvotedBy.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      post.upvoteCount = (post.upvoteCount || 0) - 1; // Decrement like count
    }

    // Check if the user has already downvoted the post
    if (post.downvotedBy && post.downvotedBy.includes(req.user._id)) {
      return res.status(409).json({
        message: "You have already downvoted this post.",
      });
    }

    // Initialize downvotedBy array if it doesn't exist
    if (!post.downvotedBy) {
      post.downvotedBy = []; // Corrected from downvotedby to downvotedBy
    }

    // Add the user's ID to the post's downvotedBy array and decrement downvoteCount
    post.downvotedBy.push(req.user._id);
    post.downvoteCount = (post.downvoteCount || 0) + 1; // Increment downvote count
    await post.save(); // Save the updated post

    // Respond with success message and the updated post
    res.status(200).json({
      message: "Post downvoted successfully",
      post,
    });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};

module.exports.removeUpvote = async (req, res, next) => {
  try {
    const postId = req.params.postId; // Get the post ID from the request parameters
    const post = await postModel.findById(postId); // Find the post by ID

    // Check if the post exists
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check if the user has upvoted the post
    if (post.upvotedBy && post.upvotedBy.includes(req.user._id)) {
      // Remove the user's ID from upvotedBy array
      post.upvotedBy = post.upvotedBy.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      post.upvoteCount = (post.upvoteCount || 0) - 1; // Decrement upvote count
    } else {
      return res.status(409).json({
        message: "You have not upvoted this post.",
      });
    }

    await post.save(); // Save the updated post

    // Respond with success message and the updated post
    res.status(200).json({
      message: "Upvote removed successfully",
      post,
    });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};

module.exports.removeDownvote = async (req, res, next) => {
  try {
    const postId = req.params.postId; // Get the post ID from the request parameters
    const post = await postModel.findById(postId); // Find the post by ID

    // Check if the post exists
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check if the user has downvoted the post
    if (post.downvotedBy && post.downvotedBy.includes(req.user._id)) {
      // Remove the user's ID from downvotedBy array
      post.downvotedBy = post.downvotedBy.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      post.downvoteCount = (post.downvoteCount || 0) - 1; // Decrement downvote count
    } else {
      return res.status(409).json({
        message: "You have not downvoted this post.",
      });
    }

    await post.save(); // Save the updated post

    // Respond with success message and the updated post
    res.status(200).json({
      message: "Downvote removed successfully",
      post,
    });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};
