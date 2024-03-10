const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

const commentController = require("../controllers/commentController");
const replyController = require("../controllers/replyController");

router.post("/comments", authenticateToken, commentController.createComment);
router.get(
  "/comments/page",
  authenticateToken,
  commentController.getCommentsByPageIdentifier
);
router.put(
  "/comments/:commentId",
  authenticateToken,
  commentController.updateComment
);
router.delete(
  "/comments/:commentId",
  authenticateToken,
  commentController.deleteComment
);

router.post("/replies", authenticateToken, replyController.createReply);
router.put("/replies/:replyId", authenticateToken, replyController.updateReply);
router.delete(
  "/replies/:replyId",
  authenticateToken,
  replyController.deleteReply
);

module.exports = router;
