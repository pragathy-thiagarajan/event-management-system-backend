const Feedback = require("../models/Feedback");
const Booking = require("../models/Booking");
const Event = require("../models/Event");

// User submits feedback
const createFeedback = async (req, res) => {
  try {
    const {
      eventId,
      rating,
      comment,
    } = req.body;

    if (!eventId || !rating) {
      return res.status(400).json({
        success: false,
        message:
          "Event and rating are required",
      });
    }

    if (
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be between 1 and 5",
      });
    }

    const event =
      await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Only registered paid attendees
    const booking =
      await Booking.findOne({
        user: req.user._id,
        event: eventId,
        bookingStatus: "confirmed",
        paymentStatus: "paid",
      });

    if (!booking) {
      return res.status(403).json({
        success: false,
        message:
          "Only registered attendees can submit feedback",
      });
    }

    const existing =
      await Feedback.findOne({
        user: req.user._id,
        event: eventId,
      });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          "You have already submitted feedback for this event",
      });
    }

    const feedback =
      await Feedback.create({
        user: req.user._id,
        event: eventId,
        rating: Number(rating),
        comment,
      });

    return res.status(201).json({
      success: true,
      message:
        "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin gets feedback report
const getFeedbackReport = async (
  req,
  res
) => {
  try {
    const feedback =
      await Feedback.find()
        .populate(
          "user",
          "name email"
        )
        .populate(
          "event",
          "title eventDate location"
        )
        .sort({
          createdAt: -1,
        });

    const totalFeedback =
      feedback.length;

    const averageRating =
      totalFeedback > 0
        ? Number(
            (
              feedback.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  item.rating,
                0
              ) / totalFeedback
            ).toFixed(1)
          )
        : 0;

    const ratingBreakdown = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    feedback.forEach((item) => {
      ratingBreakdown[item.rating]++;
    });

    return res.status(200).json({
      success: true,

      summary: {
        totalFeedback,
        averageRating,
        ratingBreakdown,
      },

      feedback,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createFeedback,
  getFeedbackReport,
};