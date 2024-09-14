const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  getUserReputationHistory,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/preferences", protect, updateUserPreferences);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.get("/:userId/reputation", getUserReputationHistory);

module.exports = router;
