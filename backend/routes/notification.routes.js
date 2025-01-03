const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware.isAuthenticated);

// Get all notifications for a user
router.get("/", notificationController.getNotifications);

// Mark a notification as read
router.patch("/mark-as-read", notificationController.markAsRead);

// Delete a notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
