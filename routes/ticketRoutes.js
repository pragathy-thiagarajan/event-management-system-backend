const express = require("express");

const router = express.Router();

const {
  generateTicketQR,
  downloadTicket
} = require("../controllers/ticketController");

const { protect } = require("../middleware/authMiddleware");

router.get("/:id/qr", protect, generateTicketQR);
router.get("/:id/download", protect, downloadTicket);

module.exports = router;