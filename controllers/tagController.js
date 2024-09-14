const Tag = require("../models/Tag");
const Question = require("../models/Question");
const TagSynonym = require("../models/TagSynonym");

exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    const tag = new Tag({ name, description });
    await tag.save();
    res.status(201).json(tag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort("-count");
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (tag) {
      res.json(tag);
    } else {
      res.status(404).json({ message: "Tag not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    const tag = await Tag.findById(req.params.id);
    if (tag) {
      tag.name = name || tag.name;
      tag.description = description || tag.description;
      const updatedTag = await tag.save();
      res.json(updatedTag);
    } else {
      res.status(404).json({ message: "Tag not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (tag) {
      await tag.remove();
      res.json({ message: "Tag removed" });
    } else {
      res.status(404).json({ message: "Tag not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getQuestionsByTag = async (req, res) => {
  try {
    const tag = await Tag.findOne({ name: req.params.tagName });
    if (tag) {
      const questions = await Question.find({ tags: tag._id })
        .populate("author", "username")
        .populate("tags", "name")
        .sort("-createdAt");
      res.json(questions);
    } else {
      res.status(404).json({ message: "Tag not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTagSynonym = async (req, res) => {
  try {
    const { sourceTagId, targetTagId } = req.body;

    const existingSynonym = await TagSynonym.findOne({
      $or: [
        { sourceTag: sourceTagId, targetTag: targetTagId },
        { sourceTag: targetTagId, targetTag: sourceTagId },
      ],
    });

    if (existingSynonym) {
      return res.status(400).json({ message: "This synonym already exists" });
    }

    const newSynonym = new TagSynonym({
      sourceTag: sourceTagId,
      targetTag: targetTagId,
      createdBy: req.user._id,
    });

    await newSynonym.save();

    res.status(201).json(newSynonym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTagSynonyms = async (req, res) => {
  try {
    const synonyms = await TagSynonym.find()
      .populate("sourceTag", "name")
      .populate("targetTag", "name")
      .populate("createdBy", "username");

    res.json(synonyms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
