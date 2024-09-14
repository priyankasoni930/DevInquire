const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile_photo: String,
    bio: String,
    location: String,
    website_link: String,
    twitter_link: String,
    github_link: String,
    topTags: [String],
    reputation: {
      type: Number,
      default: 0,
    },
    gold_badges: {
      type: Number,
      default: 0,
    },
    silver_badges: {
      type: Number,
      default: 0,
    },
    bronze_badges: {
      type: Number,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      displayName: {
        type: String,
        default: "username",
      },
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
