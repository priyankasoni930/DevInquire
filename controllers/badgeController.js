const Badge = require("../models/Badge");
const User = require("../models/User");

exports.createBadge = async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const badge = new Badge({ name, description, type });
    await badge.save();
    res.status(201).json(badge);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getBadges = async (req, res) => {
  try {
    const badges = await Badge.find();
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.awardBadge = async (req, res) => {
  try {
    const { userId, badgeId } = req.body;
    const user = await User.findById(userId);
    const badge = await Badge.findById(badgeId);

    if (!user || !badge) {
      return res.status(404).json({ message: "User or Badge not found" });
    }

    if (!badge.awardedTo.includes(userId)) {
      badge.awardedTo.push(userId);
      await badge.save();

      if (badge.type === "gold") {
        user.gold_badges += 1;
      } else if (badge.type === "silver") {
        user.silver_badges += 1;
      } else if (badge.type === "bronze") {
        user.bronze_badges += 1;
      }
      await user.save();

      res.json({ message: "Badge awarded successfully" });
    } else {
      res.status(400).json({ message: "User already has this badge" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
