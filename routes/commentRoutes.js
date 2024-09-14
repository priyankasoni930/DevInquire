const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  flagComment,
} = require("../controllers/commentController");

router.post("/", protect, addComment);
router.get("/:parentType/:parentId", getComments);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);
router.post("/:id/flag", protect, flagComment);

module.exports = router;
