const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    type: {
      type: String,
      enum: ["gold", "silver", "bronze"],
      required: true,
    },
    awardedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Badge = mongoose.model("Badge", badgeSchema);

module.exports = Badge;
