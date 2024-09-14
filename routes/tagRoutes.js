const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
  getQuestionsByTag,
  createTagSynonym,
  getTagSynonyms,
} = require("../controllers/tagController");

router.route("/").post(protect, admin, createTag).get(getTags);
router.post("/synonyms", protect, createTagSynonym);
router.get("/synonyms", getTagSynonyms);
router
  .route("/:id")
  .get(getTagById)
  .put(protect, admin, updateTag)
  .delete(protect, admin, deleteTag);

router.get("/:tagName/questions", getQuestionsByTag);

module.exports = router;
