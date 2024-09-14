const Question = require("../models/Question");
const Tag = require("../models/Tag");
const User = require("../models/User");
const Vote = require("../models/Vote");
const Reputation = require("../models/Reputation");
const Review = require("../models/Review");

exports.createQuestion = async (req, res) => {
  const { title, body, tags } = req.body;

  try {
    const question = new Question({
      title,
      body,
      author: req.user._id,
    });

    for (let tagName of tags) {
      let tag = await Tag.findOne({ name: tagName });
      if (!tag) {
        tag = await Tag.create({ name: tagName });
      }
      question.tags.push(tag._id);
      tag.questions.push(question._id);
      tag.count += 1;
      await tag.save();
    }

    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate("author", "username")
      .populate("tags", "name")
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("author", "username")
      .populate("tags", "name")
      .populate({
        path: "answers",
        populate: { path: "author", select: "username" },
      })
      .populate({
        path: "comments",
        populate: { path: "author", select: "username" },
      });

    if (question) {
      question.views += 1;
      await question.save();
      res.json(question);
    } else {
      res.status(404).json({ message: "Question not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  const { title, body, tags } = req.body;

  try {
    const question = await Question.findById(req.params.id);

    if (question.author.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: "User not authorized" });
      return;
    }

    question.title = title || question.title;
    question.body = body || question.body;

    // Update tags
    if (tags) {
      // Remove question from old tags
      for (let tagId of question.tags) {
        let tag = await Tag.findById(tagId);
        tag.questions = tag.questions.filter(
          (q) => q.toString() !== question._id.toString()
        );
        tag.count -= 1;
        await tag.save();
      }

      // Add question to new tags
      question.tags = [];
      for (let tagName of tags) {
        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
          tag = await Tag.create({ name: tagName });
        }
        question.tags.push(tag._id);
        tag.questions.push(question._id);
        tag.count += 1;
        await tag.save();
      }
    }

    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (question.author.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: "User not authorized" });
      return;
    }

    await question.remove();
    res.json({ message: "Question removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.closeQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (req.user.reputation < 3000) {
      return res
        .status(403)
        .json({ message: "Not enough reputation to close questions" });
    }

    const review = new Review({
      reviewer: req.user._id,
      question: question._id,
      reviewType: "close",
    });
    await review.save();

    res.json({ message: "Close vote submitted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reopenQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (req.user.reputation < 3000) {
      return res
        .status(403)
        .json({ message: "Not enough reputation to reopen questions" });
    }

    const review = new Review({
      reviewer: req.user._id,
      question: question._id,
      reviewType: "reopen",
    });
    await review.save();

    res.json({ message: "Reopen vote submitted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.flagQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.flags.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You have already flagged this question" });
    }

    question.flags.push(req.user._id);
    await question.save();

    res.json({ message: "Question flagged" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.voteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const existingVote = await Vote.findOne({
      user: req.user._id,
      questionId: question._id,
    });

    if (existingVote) {
      if (existingVote.voteType === req.body.voteType) {
        await existingVote.remove();
        question.voteCount -= req.body.voteType === "upvote" ? 1 : -1;
      } else {
        existingVote.voteType = req.body.voteType;
        await existingVote.save();
        question.voteCount += req.body.voteType === "upvote" ? 2 : -2;
      }
    } else {
      const newVote = new Vote({
        user: req.user._id,
        questionId: question._id,
        voteType: req.body.voteType,
      });
      await newVote.save();
      question.voteCount += req.body.voteType === "upvote" ? 1 : -1;
    }

    await question.save();

    // Update reputation
    const reputation = new Reputation({
      user: question.author,
      action:
        req.body.voteType === "upvote"
          ? "question_upvote"
          : "question_downvote",
      value: req.body.voteType === "upvote" ? 5 : -2,
      questionId: question._id,
    });
    await reputation.save();

    const author = await User.findById(question.author);
    author.reputation += req.body.voteType === "upvote" ? 5 : -2;
    await author.save();

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getQuestionTimeline = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const timeline = await Promise.all([
      Vote.find({ questionId: question._id }).populate("user", "username"),
      Review.find({ question: question._id }).populate("reviewer", "username"),
      Reputation.find({ questionId: question._id }).populate(
        "user",
        "username"
      ),
    ]);

    const flattenedTimeline = timeline
      .flat()
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json(flattenedTimeline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchQuestions = async (req, res) => {
  try {
    const { query, tags, user, answered, sortBy } = req.query;
    let searchCriteria = {};

    if (query) {
      searchCriteria.$or = [
        { title: { $regex: query, $options: "i" } },
        { body: { $regex: query, $options: "i" } },
      ];
    }

    if (tags) {
      const tagArray = tags.split(",");
      searchCriteria.tags = { $in: tagArray };
    }

    if (user) {
      searchCriteria.author = user;
    }

    if (answered === "true") {
      searchCriteria.answers = { $exists: true, $ne: [] };
    } else if (answered === "false") {
      searchCriteria.answers = { $exists: true, $eq: [] };
    }

    let sort = {};
    if (sortBy === "newest") {
      sort = { createdAt: -1 };
    } else if (sortBy === "votes") {
      sort = { voteCount: -1 };
    }

    const questions = await Question.find(searchCriteria)
      .sort(sort)
      .populate("author", "username")
      .populate("tags", "name");

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
