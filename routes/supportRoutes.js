const express = require("express");

const router = express.Router();

const {
  createInquiry,
  getMyInquiries,
  getAllInquiries,
  updateInquiry,
} = require(
  "../controllers/supportController"
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

// User routes
router.post(
  "/",
  protect,
  createInquiry
);

router.get(
  "/my",
  protect,
  getMyInquiries
);

// Admin routes
router.get(
  "/admin",
  protect,
  authorize("admin"),
  getAllInquiries
);

router.patch(
  "/admin/:id",
  protect,
  authorize("admin"),
  updateInquiry
);

module.exports = router;