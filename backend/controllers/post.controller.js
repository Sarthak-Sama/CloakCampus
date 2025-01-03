const userModel = require("../models/user.model");
const postModel = require("../models/post.model");
const voteModel = require("../models/vote.model");
const notificationModel = require("../models/notification.model");
const commentModel = require("../models/comment.model");
const cloudinary = require("../config/cloudinary.config");
const reportModel = require("../models/report.model");
const fs = require("fs");
const path = require("path");
// const nsfwDetector = require("../config/nsfwDetector.config");

const createNotification = async (
  userId,
  type,
  postId = null,
  postImage = [],
  commentId = null,
  parentCommentMessage = null,
  message
) => {
  try {
    await notificationModel.create({
      user: userId, // User who will receive the notification
      type: type, // Type of notification: "like", "comment", or "reply"
      post: postId, // Post being liked (if applicable)
      postImage: postImage, // Image urls of the post (if existing)
      comment: commentId, // Comment being replied to (if applicable)
      parentCommentMessage: parentCommentMessage, //(if applicable)
      message: message, // The message to display in the notification
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// Function to create a new post
module.exports.createPost = async (req, res, next) => {
  try {
    const { title, textContent, category } = req.body;
    const media = []; // Array to hold media information

    // Check if image exists and handle it
    if (req.files && req.files.image && req.files.image.length > 0) {
      for (const imageFile of req.files.image) {
        const imagePath = imageFile.path;

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
    const user = await userModel.findById(req.user._id).populate("university"); // Populate the university field

    const post = await postModel.create({
      title,
      textContent,
      author: req.user._id,
      authorUsername: req.user.username,
      university: user.university.universityName, // Access the universityName after populating
      category,
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
    // Find the post by its ID
    const post = await postModel.findOne({ _id: req.params.postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user is the author or an admin
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this post" });
    }

    // Delete the post
    await postModel.findOneAndDelete({ _id: req.params.postId });

    // Delete all comments associated with the post
    await commentModel.deleteMany({ postId: req.params.postId });

    // Delete all votes associated with the post
    await voteModel.deleteMany({ postId: req.params.postId });

    // Respond with success message
    res.status(200).json({
      message: "Post, associated comments, and votes deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    next(error); // Pass the error to the error-handling middleware
  }
};

// Function to get posts by university
module.exports.getPosts = async (req, res, next) => {
  try {
    // Get pagination parameters from the request query
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 20; // Default to 10 posts per page

    // Calculate the number of posts to skip
    const skip = (page - 1) * limit;

    const user = await userModel.findById(req.user._id).populate("university");

    // Fetch posts with pagination and filter by university
    const posts = await postModel
      .find({ university: user.university.universityName })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by latest posts

    // Fetch the user's votes for the loaded posts
    const postIds = posts.map((post) => post._id); // Get IDs of the posts
    const userVotes = await voteModel.find({
      userId: req.user._id,
      postId: { $in: postIds },
    });

    // Map votes to their respective posts
    const voteMap = userVotes.reduce((map, vote) => {
      map[vote.postId.toString()] = vote.voteType; // "upvote" or "downvote"
      return map;
    }, {});

    // Attach the user's vote information to the posts
    const postsWithUserVote = posts.map((post) => ({
      ...post.toObject(),
      userVote: voteMap[post._id.toString()] || null,
    }));

    // Optionally: Get total count of posts for pagination
    const totalPosts = await postModel.countDocuments({
      university: req.user.university.universityName,
    });

    // Send paginated response
    res.status(200).json({
      posts: postsWithUserVote,
      totalPosts, // Total number of posts (for frontend)
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};

module.exports.getPostById = async (req, res, next) => {
  try {
    const postId = req.params.postId;

    // Fetch the post and its comments
    const post = await postModel.findById(postId).populate({
      path: "comments",
      options: { sort: { createdAt: -1 } }, // Sort comments by latest
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has voted on the post
    const userVote = await voteModel.findOne({
      userId: req.user._id,
      postId: postId,
    });

    // Add the userVote attribute to the post object
    const postWithUserVote = {
      ...post.toObject(),
      userVote: userVote ? userVote.voteType : null, // Add voteType or null
    };

    res.status(200).json({ post: postWithUserVote });
  } catch (err) {
    next(err);
  }
};

module.exports.searchPosts = async (req, res, next) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    // Search condition based on the query
    const searchConditions = {
      title: { $regex: query || "", $options: "i" }, // Case-insensitive search by title
    };

    // Fetch posts matching the search query with pagination
    const posts = await postModel
      .find(searchConditions)
      .skip(skip)
      .limit(limit);

    // Get the IDs of the fetched posts
    const postIds = posts.map((post) => post._id);

    // Fetch the user's votes for the loaded posts
    const userVotes = await voteModel.find({
      userId: req.user._id,
      postId: { $in: postIds },
    });

    // Map the votes to their respective posts
    const voteMap = userVotes.reduce((map, vote) => {
      map[vote.postId.toString()] = vote.voteType; // "upvote" or "downvote"
      return map;
    }, {});

    // Attach the user's vote information to the posts
    const postsWithUserVote = posts.map((post) => ({
      ...post.toObject(),
      userVote: voteMap[post._id.toString()] || null, // Add the user's vote (if available) or null
    }));

    // Optionally, you can count the total number of search results for pagination
    const totalPosts = await postModel.countDocuments(searchConditions);

    // Send the response with the posts and pagination details
    res.status(200).json({
      posts: postsWithUserVote,
      totalPosts, // Total number of search results
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (err) {
    next(err); // Pass errors to the error-handling middleware
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

    // Notify the post author about the new comment
    const message = `${req.user.username} commented on your post: "${content}"`;
    // Check if the commenter is not the post author
    if (post.author.toString() !== req.user._id.toString()) {
      createNotification(
        post.author,
        "comment",
        post._id,
        post.media,
        comment._id,
        null,
        message
      );
    }

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

    // Create a notification for the original comment's author
    const message = `${req.user.username} replied to your comment: ${content}`;
    // Check if the replier is not the parent comment's author
    if (parentComment.author.toString() !== req.user._id.toString()) {
      createNotification(
        parentComment.author,
        "reply",
        parentComment.post,
        [],
        reply._id,
        parentComment.message,
        message
      );
    }

    // Respond with success message and the created reply
    res.status(200).json({
      message: "Reply Created",
      reply,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getCommentReplies = async (req, res, next) => {
  try {
    const parentCommentId = req.params.commentId;
    const replies = await commentModel
      .find({ parentComment: parentCommentId })
      .sort({ createdAt: -1 }); // Sort replies by latest

    res.status(200).json({ replies });
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
    const { postId } = req.params;

    // Validate post existence
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Check if the user has already upvoted this post
    const existingVote = await voteModel.findOne({
      postId,
      userId: req.user._id,
    });

    if (existingVote) {
      if (existingVote.voteType === "upvote") {
        return res
          .status(409)
          .json({ message: "You have already upvoted this post." });
      }

      // Switch downvote to upvote
      existingVote.voteType = "upvote";
      await existingVote.save();
    } else {
      // Create a new vote
      await voteModel.create({
        userId: req.user._id,
        postId,
        voteType: "upvote",
      });
    }

    // Update the post's upvote and downvote counts
    const upvoteCount = await voteModel.countDocuments({
      postId,
      voteType: "upvote",
    });
    const downvoteCount = await voteModel.countDocuments({
      postId,
      voteType: "downvote",
    });

    const updatedPost = await postModel.findByIdAndUpdate(
      postId,
      { upvoteCount, downvoteCount },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Failed to update post counts." });
    }

    // Create a notification for the post's author only if the user is not the author
    if (post.author.toString() !== req.user._id.toString()) {
      try {
        const message = `${req.user.username} liked your post`;
        createNotification(
          post.author,
          "like",
          postId,
          post.media,
          null,
          null,
          message
        );
      } catch (err) {
        console.error("Notification creation failed:", err);
      }
    }

    res.status(200).json({ message: "Post upvoted successfully." });
  } catch (error) {
    console.error("Error upvoting post:", error);
    next(error);
  }
};

module.exports.downvotePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    // Check if the user has already downvoted this post
    const existingVote = await voteModel.findOne({
      postId,
      userId: req.user._id,
    });

    if (existingVote) {
      if (existingVote.voteType === "downvote") {
        return res
          .status(409)
          .json({ message: "You have already downvoted this post." });
      }

      // Switch upvote to downvote
      existingVote.voteType = "downvote";
      await existingVote.save();
    } else {
      // Create a new vote
      await voteModel.create({
        userId: req.user._id,
        postId,
        voteType: "downvote",
      });
    }

    // Update the post's upvote and downvote counts
    const upvoteCount = await voteModel.countDocuments({
      postId,
      voteType: "upvote",
    });
    const downvoteCount = await voteModel.countDocuments({
      postId,
      voteType: "downvote",
    });

    await postModel.findByIdAndUpdate(postId, { upvoteCount, downvoteCount });

    // // Check if the user is not the author of the post before creating a notification
    // const post = await postModel.findById(postId);
    // if (post.author.toString() !== req.user._id.toString()) {
    //   const message = `${req.user.username} disliked your post`;
    //   createNotification(post.author, "dislike", postId, message); // Adjust notification type if needed
    // } // this needs to be updated before use.

    res.status(200).json({ message: "Post downvoted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports.removeUpvote = async (req, res, next) => {
  try {
    const { postId } = req.params;

    // Remove the upvote
    const deletedVote = await voteModel.findOneAndDelete({
      postId,
      userId: req.user._id,
      voteType: "upvote",
    });

    if (!deletedVote) {
      return res
        .status(409)
        .json({ message: "You have not upvoted this post." });
    }

    // Update the post's vote counts
    const upvoteCount = await voteModel.countDocuments({
      postId,
      voteType: "upvote",
    });
    const downvoteCount = await voteModel.countDocuments({
      postId,
      voteType: "downvote",
    });

    await postModel.findByIdAndUpdate(postId, { upvoteCount, downvoteCount });

    res.status(200).json({ message: "Upvote removed successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports.removeDownvote = async (req, res, next) => {
  try {
    const { postId } = req.params;

    // Remove the downvote
    const deletedVote = await voteModel.findOneAndDelete({
      postId,
      userId: req.user._id,
      voteType: "downvote",
    });

    if (!deletedVote) {
      return res
        .status(409)
        .json({ message: "You have not downvoted this post." });
    }

    // Update the post's vote counts
    const upvoteCount = await voteModel.countDocuments({
      postId,
      voteType: "upvote",
    });
    const downvoteCount = await voteModel.countDocuments({
      postId,
      voteType: "downvote",
    });

    await postModel.findByIdAndUpdate(postId, { upvoteCount, downvoteCount });

    res.status(200).json({ message: "Downvote removed successfully." });
  } catch (error) {
    next(error);
  }
};
