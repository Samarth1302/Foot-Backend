const Comment = require("../models/Comment");
const User = require("../models/User");

const createComment = async (req, res) => {
  const { userId, pageIdentifier, text } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const comment = new Comment({ userId, pageIdentifier, text });
    await comment.save();

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create comment" });
  }
};
const getCommentsByPageIdentifier = async (req, res) => {
const { pageIdentifier } = req.params;

  try {
    const comments = await Comment.find({ pageIdentifier });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to get comments" });
  }
};
const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    comment.text = text;
    comment.editedAt = Date.now();
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update comment" });
  }
};

const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    await comment.deleteOne();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};

module.exports = {
  createComment,
  getCommentsByPageIdentifier,
  updateComment,
  deleteComment,
};
