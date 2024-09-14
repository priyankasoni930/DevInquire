const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createBadge,
  getBadges,
  awardBadge,
} = require("../controllers/badgeController");

router.route("/").post(protect, admin, createBadge).get(getBadges);

router.post("/award", protect, admin, awardBadge);

module.exports = router;
