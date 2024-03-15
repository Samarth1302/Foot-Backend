const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: {type: String},
  text: { type: String },
  createdAt: { type: Date, default: Date.now },
  pageIdentifier: { type: String, required: true },
  editedAt: { type: Date },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reply" }],
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
