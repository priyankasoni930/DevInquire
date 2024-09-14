const Answer = require("../models/Answer");
const Question = require("../models/Question");
const Vote = require("../models/Vote");
const Reputation = require("../models/Reputation");
const User = require("../models/User");

exports.createAnswer = async (req, res) => {
  const { body } = req.body;
  const questionId = req.params.questionId;

  try {
    const answer = new Answer({
      body,
      author: req.user._id,
      question: questionId,
    });

    const savedAnswer = await answer.save();

    await Question.findByIdAndUpdate(questionId, {
      $push: { answers: savedAnswer._id },
    });

    res.status(201).json(savedAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAnswers = async (req, res) => {
  try {
    const answers = await Answer.find({ question: req.params.questionId })
      .populate("author", "username")
      .sort({ createdAt: -1 });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAnswer = async (req, res) => {
  const { body } = req.body;

  try {
    const answer = await Answer.findById(req.params.id);

    if (answer.author.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: "User not authorized" });
      return;
    }

    answer.body = body || answer.body;

    const updatedAnswer = await answer.save();
    res.json(updatedAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (answer.author.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: "User not authorized" });
      return;
    }

    await answer.remove();

    await Question.findByIdAndUpdate(answer.question, {
      $pull: { answers: answer._id },
    });

    res.json({ message: "Answer removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    const question = await Question.findById(answer.question);

    if (question.author.toString() !== req.user._id.toString()) {
      res
        .status(401)
        .json({ message: "Only the question author can accept an answer" });
      return;
    }

    if (question.acceptedAnswer) {
      await Answer.findByIdAndUpdate(question.acceptedAnswer, {
        isAccepted: false,
      });
    }

    answer.isAccepted = true;
    question.acceptedAnswer = answer._id;

    await answer.save();
    await question.save();

    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.flagAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    if (answer.flags.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You have already flagged this answer" });
    }

    answer.flags.push(req.user._id);
    await answer.save();

    res.json({ message: "Answer flagged" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.voteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const existingVote = await Vote.findOne({
      user: req.user._id,
      answerId: answer._id,
    });

    if (existingVote) {
      if (existingVote.voteType === req.body.voteType) {
        await existingVote.remove();
        answer.voteCount -= req.body.voteType === "upvote" ? 1 : -1;
      } else {
        existingVote.voteType = req.body.voteType;
        await existingVote.save();
        answer.voteCount += req.body.voteType === "upvote" ? 2 : -2;
      }
    } else {
      const newVote = new Vote({
        user: req.user._id,
        answerId: answer._id,
        voteType: req.body.voteType,
      });
      await newVote.save();
      answer.voteCount += req.body.voteType === "upvote" ? 1 : -1;
    }

    await answer.save();

    // Update reputation
    const reputation = new Reputation({
      user: answer.author,
      action:
        req.body.voteType === "upvote" ? "answer_upvote" : "answer_downvote",
      value: req.body.voteType === "upvote" ? 10 : -2,
      answerId: answer._id,
    });
    await reputation.save();

    const author = await User.findById(answer.author);
    author.reputation += req.body.voteType === "upvote" ? 10 : -2;
    await author.save();

    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const question = await Question.findById(answer.question);
    if (question.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the question author can accept an answer" });
    }

    if (question.acceptedAnswer) {
      const previousAcceptedAnswer = await Answer.findById(
        question.acceptedAnswer
      );
      previousAcceptedAnswer.isAccepted = false;
      await previousAcceptedAnswer.save();

      // Remove reputation from previous accepted answer author
      const previousAuthor = await User.findById(previousAcceptedAnswer.author);
      previousAuthor.reputation -= 15;
      await previousAuthor.save();
    }

    answer.isAccepted = true;
    await answer.save();

    question.acceptedAnswer = answer._id;
    await question.save();

    // Add reputation to answer author
    const reputation = new Reputation({
      user: answer.author,
      action: "answer_accepted",
      value: 15,
      answerId: answer._id,
    });
    await reputation.save();

    const author = await User.findById(answer.author);
    author.reputation += 15;
    await author.save();

    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
