const express = require("express");
const { authorize } = require("../middleware/roleMiddleware");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getEventAttendees,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createBooking);

router.get("/my-bookings", protect, getMyBookings);

router.get(
  "/event/:eventId/attendees",
  protect,
  authorize("organizer", "admin"),
  getEventAttendees
);

router.get("/:id", protect, getBooking);

router.patch("/:id/cancel", protect, cancelBooking);

module.exports = router;