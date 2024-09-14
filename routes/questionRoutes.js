const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  voteQuestion,
  closeQuestion,
  reopenQuestion,
  flagQuestion,
  getQuestionTimeline,
  searchQuestions,
} = require("../controllers/questionController");

router.route("/").post(protect, createQuestion).get(getQuestions);

router
  .route("/:id")
  .get(getQuestionById)
  .put(protect, updateQuestion)
  .delete(protect, deleteQuestion);

router.post("/:id/vote", protect, voteQuestion);
router.post("/:id/close", protect, closeQuestion);
router.post("/:id/reopen", protect, reopenQuestion);
router.post("/:id/flag", protect, flagQuestion);
router.get("/:id/timeline", getQuestionTimeline);
router.get("/search", searchQuestions);

module.exports = router;
