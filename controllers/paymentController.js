const Booking = require("../models/Booking");

const processPayment = async (req, res) => {
  try {
    const { bookingId, paymentSuccess } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to pay for this booking",
      });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking has been cancelled",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Booking is already paid",
      });
    }
    if (!paymentSuccess) {
      const event = await Event.findById(booking.event);

      if (event) {
        const ticket = event.ticketTypes.find(
          (ticket) => ticket.name === booking.ticketType,
        );

        if (ticket) {
          ticket.availableQuantity += booking.quantity;
          await event.save();
        }
      }

      booking.paymentStatus = "failed";
      booking.bookingStatus = "cancelled";
    }
    if (paymentSuccess) {
      booking.paymentStatus = "paid";
      booking.bookingStatus = "confirmed";
      booking.paymentId = `PAY-${Date.now()}`;
    } else {
      booking.paymentStatus = "failed";
      booking.bookingStatus = "cancelled";
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: paymentSuccess ? "Payment successful" : "Payment failed",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  processPayment,
};
