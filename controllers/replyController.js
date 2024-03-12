const Reply = require("../models/Reply");
const Comment = require("../models/Comment");
const User = require("../models/User");

const createReply = async (req, res) => {
  const { userId, text } = req.body;
  const {commentId} = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(400).json({ error: "Comment not found" });
    }
    const reply = new Reply({ userId, text });
    await reply.save();

    comment.replies.push(reply);
    await comment.save();

    res.status(201).json(reply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create reply" });
  }
};

const getReplies = async (req, res) => {
  const {  commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(400).json({ error: "Comment not found" });
    }
    const replies = [];
    for (const replyId of comment.replies) {
      const reply = await Reply.findById(replyId);
      if (reply) {
        replies.push(reply);
      }
    }
    res.json(replies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve replies for this comment" });
  }
};

const updateReply = async (req, res) => {
  const { replyId } = req.params;
  const { text } = req.body;

  try {
    const reply = await Reply.findById(replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    reply.text = text;
    reply.editedAt = Date.now();
    await reply.save();

    res.status(200).json(reply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update reply" });
  }
};

const deleteReply = async (req, res) => {
  const { replyId } = req.params;

  try {
    const reply = await Reply.findById(replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    await reply.deleteOne();

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete reply" });
  }
};

module.exports = { createReply, updateReply, getReplies, deleteReply };
