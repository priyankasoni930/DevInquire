const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getReviewTasks,
  completeReview,
} = require("../controllers/reviewController");

router.get("/", protect, getReviewTasks);
router.post("/:id/complete", protect, completeReview);

module.exports = router;
