const express = require("express");

const router = express.Router();

const {
  processPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require(
  "../controllers/paymentController"
);
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, processPayment);
router.post(
  "/create-order",
  protect,
  createRazorpayOrder
);

router.post(
  "/verify",
  protect,
  verifyRazorpayPayment
);

module.exports = router;