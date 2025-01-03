const notificationModel = require("../models/notification.model");

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: `Error fetching notifications: ${error}` });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id; // Accessing the userId from the req. (set by the middleware)

    const result = await notificationModel.updateMany(
      { user: userId, isRead: false }, // Match unread notifications for the user
      { isRead: true, readAt: new Date() } // Update them to "read"
    );

    res.status(200).json({
      message: "All notifications marked as read",
      updatedCount: result.nModified, // Number of documents modified
    });
  } catch (error) {
    console.error("Error updating notifications:", error);
    res.status(500).json({ error: `Error updating notifications: ${error}` });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await notificationModel.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting notification" });
  }
};
