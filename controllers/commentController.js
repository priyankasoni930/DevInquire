const Comment = require("../models/Comment");
const Question = require("../models/Question");
const Answer = require("../models/Answer");

exports.addComment = async (req, res) => {
  try {
    const { body, parentType, parentId } = req.body;

    let parent;
    if (parentType === "Question") {
      parent = await Question.findById(parentId);
    } else if (parentType === "Answer") {
      parent = await Answer.findById(parentId);
    }

    if (!parent) {
      return res.status(404).json({ message: `${parentType} not found` });
    }

    const comment = new Comment({
      body,
      author: req.user._id,
      parentType,
      parent: parentId,
    });

    await comment.save();

    parent.comments.push(comment._id);
    await parent.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { parentType, parentId } = req.params;
    const comments = await Comment.find({ parentType, parent: parentId })
      .populate("author", "username")
      .sort("createdAt");
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "User not authorized to update this comment" });
    }

    comment.body = req.body.body || comment.body;
    await comment.save();

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (
      comment.author.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(403)
        .json({ message: "User not authorized to delete this comment" });
    }

    let parent;
    if (comment.parentType === "Question") {
      parent = await Question.findById(comment.parent);
    } else if (comment.parentType === "Answer") {
      parent = await Answer.findById(comment.parent);
    }

    if (parent) {
      parent.comments = parent.comments.filter(
        (c) => c.toString() !== comment._id.toString()
      );
      await parent.save();
    }

    await comment.remove();

    res.json({ message: "Comment removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.flagComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.flags.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You have already flagged this comment" });
    }

    comment.flags.push(req.user._id);
    await comment.save();

    res.json({ message: "Comment flagged" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
