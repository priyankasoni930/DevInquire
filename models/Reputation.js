const mongoose = require("mongoose");

const reputationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "question_upvote",
        "question_downvote",
        "answer_upvote",
        "answer_downvote",
        "answer_accepted",
      ],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
    answerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
    },
  },
  {
    timestamps: true,
  }
);

const Reputation = mongoose.model("Reputation", reputationSchema);

module.exports = Reputation;
