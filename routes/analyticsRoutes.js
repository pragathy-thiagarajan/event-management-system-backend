const express = require("express");

const router = express.Router();

const {
  getOrganizerAnalytics,
} = require(
  "../controllers/analyticsController"
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

router.get(
  "/organizer",
  protect,
  authorize("organizer"),
  getOrganizerAnalytics
);

module.exports = router;