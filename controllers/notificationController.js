const Notification = require("../models/Notification");

exports.createNotification = async (req, res) => {
  try {
    const { recipient, content, link } = req.body;
    const notification = new Notification({ recipient, content, link });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    }).sort("-createdAt");
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (
      notification &&
      notification.recipient.toString() === req.user._id.toString()
    ) {
      notification.isRead = true;
      await notification.save();
      res.json(notification);
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (
      notification &&
      notification.recipient.toString() === req.user._id.toString()
    ) {
      await notification.remove();
      res.json({ message: "Notification removed" });
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
