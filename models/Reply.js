const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  editedAt: { type: Date },
});

const Reply = mongoose.model("Reply", replySchema);

module.exports = Reply;
