const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    voteType: {
      type: String,
      enum: ["upvote", "downvote"],
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

const Vote = mongoose.model("Vote", voteSchema);

module.exports = Vote;
