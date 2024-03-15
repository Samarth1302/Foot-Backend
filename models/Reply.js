const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: {type: String},
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  text: { type: String },
  createdAt: { type: Date, default: Date.now },
  editedAt: { type: Date },
});

const Reply = mongoose.model("Reply", replySchema);

module.exports = Reply;
