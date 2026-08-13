const crypto = require("crypto");

const Booking = require("../models/Booking");
const Event = require("../models/Event");

const createBooking = async (req, res) => {
  try {
    const { eventId, ticketType, quantity } = req.body;

    if (!eventId || !ticketType || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Event, ticket type and quantity are required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "This event is not available for booking",
      });
    }

    const selectedTicket = event.ticketTypes.find(
      (ticket) => ticket.name === ticketType,
    );

    if (!selectedTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket type not found",
      });
    }

    if (selectedTicket.availableQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough tickets available",
      });
    }

    const totalAmount = selectedTicket.price * quantity;

    const ticketCode = `EVT-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    selectedTicket.availableQuantity -= quantity;

    await event.save();

    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      ticketType,
      quantity,
      totalAmount,
      ticketCode,
      bookingStatus: "pending",
      paymentStatus: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate("event", "title eventDate startTime location bannerImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("event")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Only booking owner or admin can view it
    if (
      req.user.role !== "admin" &&
      booking.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this booking",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own booking",
      });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

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

    booking.bookingStatus = "cancelled";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getEventAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Only event organizer or admin can view attendees
    if (
      req.user.role !== "admin" &&
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view these attendees",
      });
    }

    const bookings = await Booking.find({
      event: req.params.eventId,
      bookingStatus: "confirmed",
      paymentStatus: "paid",
    })
      .populate("user", "name email")
      .populate("event", "title eventDate location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      attendees: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getEventAttendees,
};
