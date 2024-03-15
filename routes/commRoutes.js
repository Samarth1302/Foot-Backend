const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

const commentController = require("../controllers/commentController");
const replyController = require("../controllers/replyController");

router.post("/comments", authenticateToken, commentController.createComment);
router.get(
  "/comments",
  authenticateToken,
  commentController.getCommentsByPageIdentifier
);
router.put(
  "/editComm/:commentId",
  authenticateToken,
  commentController.updateComment
);
router.delete(
  "/delComm/:commentId",
  authenticateToken,
  commentController.deleteComment
);

router.post("/replies/:commentId", authenticateToken, replyController.createReply);
router.get("/getReplies/:commentId", authenticateToken, replyController.getReplies);
router.put("/editReply/:replyId", authenticateToken, replyController.updateReply);
router.delete(
  "/delReply/:replyId",
  authenticateToken,
  replyController.deleteReply
);

module.exports = router;
