const express = require("express");

const router = express.Router();

const {
  getPendingEvents,
  updateEventStatus,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get(
  "/events/pending",
  protect,
  authorize("admin"),
  getPendingEvents
);

router.patch(
  "/events/:id/status",
  protect,
  authorize("admin"),
  updateEventStatus
);

module.exports = router;