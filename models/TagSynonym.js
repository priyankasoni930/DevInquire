const mongoose = require("mongoose");

const tagSynonymSchema = new mongoose.Schema(
  {
    sourceTag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
      required: true,
    },
    targetTag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TagSynonym = mongoose.model("TagSynonym", tagSynonymSchema);

module.exports = TagSynonym;
