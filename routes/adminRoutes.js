const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
  getPendingEvents,
  updateEventStatus,
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAllBookings,
  getBookingDetails,
} = require("../controllers/adminController");

router.get(
  "/bookings",
  protect,
  authorize("admin"),
  getAllBookings
);

router.get(
  "/bookings/:id",
  protect,
  authorize("admin"),
  getBookingDetails
);

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

router.get(
  "/users",
  protect,
  authorize("admin"),
  getUsers
);

router.patch(
  "/users/:id/role",
  protect,
  authorize("admin"),
  updateUserRole
);

router.patch(
  "/users/:id/status",
  protect,
  authorize("admin"),
  updateUserStatus
);

router.delete(
  "/users/:id",
  protect,
  authorize("admin"),
  deleteUser
);

module.exports = router;