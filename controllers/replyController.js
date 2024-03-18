const Reply = require("../models/Reply");
const Comment = require("../models/Comment");
const User = require("../models/User");

const createReply = async (req, res) => {
  const { text } = req.body;
  const { commentId } = req.params;
  const userId = req.user.user_id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const username = user.username;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(400).json({ error: "Comment not found" });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const replyCount = await Reply.countDocuments({
      userId: userId,
      createdAt: { $gte: today },
    });
    if (replyCount >= 3) {
      return res
        .status(400)
        .json({ error: "You have reached the daily reply limit" });
    }
    const reply = new Reply({ userId, username, text });
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
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(400).json({ error: "Comment not found" });
    }
    const replies = await Reply.find({ _id: { $in: comment.replies } }).sort({
      editedAt: -1,
    });

    res.json(replies);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to retrieve replies for this comment" });
  }
};

const updateReply = async (req, res) => {
  const { replyId } = req.params;
  const { text } = req.body;
  const userId = req.user.user_id;

  try {
    const reply = await Reply.findById(replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }
    if (userId !== reply.userId.toString()) {
      return res.status(401).json({ error: "Cannot edit reply" });
    }
    reply.text = text;
    reply.editedAt = Date.now();
    await reply.save();

    await Comment.findOneAndUpdate(
      { replies: replyId },
      {
        $set: { "replies.$.text": text, "replies.$.editedAt": reply.editedAt },
      },
      { new: true }
    );

    res.status(200).json(reply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update reply" });
  }
};

const deleteReply = async (req, res) => {
  const { replyId } = req.params;
  const userId = req.user.user_id;

  try {
    const reply = await Reply.findById(replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }
    if (userId !== reply.userId.toString()) {
      return res.status(401).json({ error: "Cannot delete reply" });
    }
    await Comment.findOneAndUpdate(
      { replies: replyId },
      { $pull: { replies: replyId } },
      { new: true }
    );
    await reply.deleteOne();

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete reply" });
  }
};

module.exports = { createReply, updateReply, getReplies, deleteReply };
