const express = require("express");

const router = express.Router();

const {
  createEvent,
  getEvents,
  getEvent,
  getMyEvents,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Public
router.get("/", getEvents);

// Organizer/Admin
router.get(
  "/my-events",
  protect,
  authorize("organizer", "admin"),
  getMyEvents
);

// Public
router.get("/:id", getEvent);

// Organizer/Admin
router.post(
  "/",
  protect,
  authorize("organizer", "admin"),
  createEvent
);

router.put(
  "/:id",
  protect,
  authorize("organizer", "admin"),
  updateEvent
);

router.delete(
  "/:id",
  protect,
  authorize("organizer", "admin"),
  deleteEvent
);

module.exports = router;