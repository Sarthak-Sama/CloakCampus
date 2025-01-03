const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware.isAuthenticated);

// Get all notifications for a user
router.get("/", notificationController.getNotifications);

// Mark a notification as read
router.put("/mark-as-read/:id", notificationController.markAsRead);

// Delete a notification
router.delete("/:id", notificationController.deleteNotification);

// (Optional) Create a notification
router.post("/", notificationController.createNotification);

module.exports = router;
