const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
    parentAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
