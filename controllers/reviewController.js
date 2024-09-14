const Review = require("../models/Review");
const Question = require("../models/Question");

exports.getReviewTasks = async (req, res) => {
  try {
    const reviews = await Review.find({ completed: false })
      .populate("reviewer", "username")
      .populate("question", "title");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.completeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const question = await Question.findById(review.question);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (req.user.reputation < 3000) {
      return res
        .status(403)
        .json({ message: "Not enough reputation to complete reviews" });
    }

    review.completed = true;
    await review.save();

    if (review.reviewType === "close" && !question.isClosed) {
      question.isClosed = true;
      question.closedDate = Date.now();
      question.closedBy = req.user._id;
    } else if (review.reviewType === "reopen" && question.isClosed) {
      question.isClosed = false;
      question.closedDate = null;
      question.closedBy = null;
    }

    await question.save();

    res.json({ message: "Review completed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
