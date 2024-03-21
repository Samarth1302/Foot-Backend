const Comment = require("../models/Comment");
const Reply = require("../models/Reply");
const User = require("../models/User");

const createComment = async (req, res) => {
  const { pageIdentifier, text } = req.body;
  const userId = req.user.user_id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const commentCount = await Comment.countDocuments({
      userId: userId,
      createdAt: { $gte: today },
    });
    if (commentCount >= 3) {
      return res
        .status(400)
        .json({ error: "You have reached the daily comment limit" });
    }

    const username = user.username;
    const comment = new Comment({ userId, username, pageIdentifier, text });
    await comment.save();

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create comment" });
  }
};
const getCommentsByPageIdentifier = async (req, res) => {
  const pageIdentifier = req.query.page;

  try {
    const comments = await Comment.find({ pageIdentifier }).sort({
      editedAt: -1,
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to get comments" });
  }
};
const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;
  const userId = req.user.user_id;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (userId !== comment.userId.toString()) {
      return res.status(401).json({ error: "Cannot edit comment" });
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
  const userId = req.user.user_id;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (userId !== comment.userId.toString()) {
      return res.status(401).json({ error: "Cannot delete comment" });
    }
    await Reply.deleteMany({ commentId: comment._id });
    await comment.deleteOne();
    return res.status(200).json({ message: "Comment deleted successfully" });
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
