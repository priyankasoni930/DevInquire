const User = require("../models/User");
const generateToken = require("../utils/generateToken");

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { username }] });

  if (userExists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      bio: user.bio,
      location: user.location,
      website_link: user.website_link,
      twitter_link: user.twitter_link,
      github_link: user.github_link,
      reputation: user.reputation,
      gold_badges: user.gold_badges,
      silver_badges: user.silver_badges,
      bronze_badges: user.bronze_badges,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

exports.updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    user.location = req.body.location || user.location;
    user.website_link = req.body.website_link || user.website_link;
    user.twitter_link = req.body.twitter_link || user.twitter_link;
    user.github_link = req.body.github_link || user.github_link;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      bio: updatedUser.bio,
      location: updatedUser.location,
      website_link: updatedUser.website_link,
      twitter_link: updatedUser.twitter_link,
      github_link: updatedUser.github_link,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

exports.getUserReputationHistory = async (req, res) => {
  try {
    const reputationHistory = await Reputation.find({ user: req.params.userId })
      .sort("-createdAt")
      .populate("questionId", "title")
      .populate("answerId", "body");

    res.json(reputationHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.preferences.emailNotifications =
        req.body.emailNotifications ?? user.preferences.emailNotifications;
      user.preferences.displayName =
        req.body.displayName ?? user.preferences.displayName;
      user.preferences.theme = req.body.theme ?? user.preferences.theme;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        preferences: updatedUser.preferences,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
