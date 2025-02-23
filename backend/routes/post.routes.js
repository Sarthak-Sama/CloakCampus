const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const multerConfig = require("../config/multer.config");

router.use(authMiddleware.isAuthenticated);

router.get("/", postController.getPosts);
router.get("/search", postController.searchPosts);
router.get("/:postId", postController.getPostById);
router.get("/:postId/comments", postController.getPostComments);

router.post(
  "/create-post",
  multerConfig.upload,
  multerConfig.multerErrorHandler,
  postController.createPost
);

router.delete("/delete-post/:postId", postController.deletePost);
router.post("/:postId/comment", postController.createComment);
router.post("/:commentId/reply", postController.replyComment);
router.get("/:commentId/replies", postController.getCommentReplies);
router.post("/report/:postId", postController.reportPost);
router.patch("/upvote/:postId", postController.upvotePost);
router.patch("/downvote/:postId", postController.downvotePost);
router.delete("/upvote/:postId", postController.removeUpvote);
router.delete("/downvote/:postId", postController.removeDownvote);

module.exports = router;
