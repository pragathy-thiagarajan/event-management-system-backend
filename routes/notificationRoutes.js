const express = require("express");

const router = express.Router();

const {
  notifyScheduleChange,
} = require(
  "../controllers/notificationController"
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
  "/events/:eventId/schedule",
  protect,
  authorize("organizer", "admin"),
  notifyScheduleChange
);

module.exports = router;