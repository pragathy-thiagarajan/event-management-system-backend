const express = require("express");

const router = express.Router();

const {
  createFeedback,
  getFeedbackReport,
} = require(
  "../controllers/feedbackController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);

const {
  authorize,
} = require(
  "../middleware/roleMiddleware"
);

router.post(
  "/",
  protect,
  createFeedback
);

router.get(
  "/admin",
  protect,
  authorize("admin"),
  getFeedbackReport
);

module.exports = router;