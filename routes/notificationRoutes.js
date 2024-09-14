const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

router
  .route("/")
  .post(protect, createNotification)
  .get(protect, getNotifications);

router
  .route("/:id")
  .put(protect, markAsRead)
  .delete(protect, deleteNotification);

module.exports = router;
