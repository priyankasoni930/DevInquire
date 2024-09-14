const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createAnswer,
  getAnswers,
  updateAnswer,
  deleteAnswer,
  voteAnswer,
  acceptAnswer,
  flagAnswer,
} = require("../controllers/answerController");

router.route("/:questionId").post(protect, createAnswer).get(getAnswers);

router.route("/:id").put(protect, updateAnswer).delete(protect, deleteAnswer);

router.post("/:id/vote", protect, voteAnswer);
router.post("/:id/accept", protect, acceptAnswer);
router.post("/:id/flag", protect, flagAnswer);

module.exports = router;
